/**
 * ==============================================================================
 * VELTRAXX 2.0 - HARDENED GOOGLE APPS SCRIPT WEBHOOK, SHEET SYNC & EMAILER
 * File: google_apps_script/Code.gs
 * ==============================================================================
 * Required Script Properties (File > Project Settings > Script Properties):
 *   - GAS_SHARED_SECRET        : High-entropy secret matching Vercel env var GAS_SHARED_SECRET
 *   - PARENT_DRIVE_FOLDER_ID   : Private Google Drive root folder ID
 *
 * Security & Reliability Architecture:
 * - Browser clients NEVER call this Web App directly. Only authenticated Vercel
 *   serverless functions call it with HMAC-SHA256 signature + timestamp + nonce.
 * - Replay protection rejects reused nonces and timestamps older than 5 minutes.
 * - Sheet sync and Drive folder creation are strictly idempotent (zero duplicate
 *   team rows or duplicate Drive folders on retries).
 * - Checks MailApp.getRemainingDailyQuota() gracefully without breaking primary flow.
 * ==============================================================================
 */
var PARENT_DRIVE_FOLDER_ID = PropertiesService.getScriptProperties().getProperty("PARENT_DRIVE_FOLDER_ID") || "";

function bytesToHex(bytes) {
  return bytes.map(function(b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");
}

function constantTimeEquals(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function verifySignedRequest(body) {
  var secret = PropertiesService.getScriptProperties().getProperty("GAS_SHARED_SECRET");
  if (!secret) {
    throw new Error("SERVER_MISCONFIGURED: GAS_SHARED_SECRET not set in Script Properties.");
  }

  var action = String(body.action || "register");
  var payload = body.payload || {};
  var teamId = String(payload.teamId || payload.team_id || "GLOBAL");
  var timestamp = String(body.timestamp || "");
  var nonce = String(body.nonce || "");
  var signature = String(body.signature || "");

  if (!timestamp || !nonce || !signature) {
    throw new Error("UNAUTHORIZED: Missing signature headers.");
  }

  var tsMs = Number(timestamp);
  if (isNaN(tsMs) || Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
    throw new Error("UNAUTHORIZED: Request timestamp expired or invalid.");
  }

  // Replay protection via ScriptCache (6-minute TTL)
  var cache = CacheService.getScriptCache();
  var nonceKey = "vtx_nonce_" + nonce;
  if (cache.get(nonceKey)) {
    throw new Error("REPLAY_DETECTED: Duplicate request nonce.");
  }

  var message = action + ":" + teamId + ":" + timestamp + ":" + nonce;
  var expectedBytes = Utilities.computeHmacSha256Signature(message, secret);
  var expectedHex = bytesToHex(expectedBytes);

  if (!constantTimeEquals(signature.toLowerCase(), expectedHex.toLowerCase())) {
    throw new Error("UNAUTHORIZED: Invalid HMAC signature.");
  }

  cache.put(nonceKey, "1", 360);
}

function getOrCreateRegistrationSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Live_Registrations") || ss.insertSheet("Live_Registrations");

  if (sheet.getLastRow() === 0) {
    var headers = [
      "S.No", "Team ID", "Team Name", "Problem Statement", "Role",
      "Student Name", "Phone Number", "Email ID", "College", "Degree & Dept",
      "Year", "PPT Submitted", "Round 1 Status"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#FFE500");
    headerRange.setFontColor("#111116");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 55);
    sheet.setColumnWidth(2, 95);
    sheet.setColumnWidth(3, 175);
    sheet.setColumnWidth(4, 155);
    sheet.setColumnWidth(5, 75);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 125);
    sheet.setColumnWidth(8, 210);
    sheet.setColumnWidth(9, 230);
    sheet.setColumnWidth(10, 175);
    sheet.setColumnWidth(11, 95);
    sheet.setColumnWidth(12, 165);
    sheet.setColumnWidth(13, 125);
  }
  return sheet;
}

function findTeamRowInSheet(sheet, teamId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var vals = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  var target = String(teamId).trim().toUpperCase();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toUpperCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function sendEmailSafe(options) {
  var remaining = MailApp.getRemainingDailyQuota();
  var recipientsCount = String(options.to || "").split(",").filter(Boolean).length;
  if (remaining < recipientsCount) {
    Logger.log("Email quota low (" + remaining + " left, needed " + recipientsCount + "). Skipping email.");
    return { sent: false, reason: "QUOTA_EXCEEDED" };
  }
  try {
    options.from = "vlsireseachlab@siet.ac.in";
    MailApp.sendEmail(options);
  } catch (aliasErr) {
    delete options.from;
    MailApp.sendEmail(options);
  }
  return { sent: true };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "LOCK_TIMEOUT: Script busy, please retry."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("EMPTY_PAYLOAD: No POST data received.");
    }

    var body = JSON.parse(e.postData.contents);
    verifySignedRequest(body);

    var action = body.action || "register";
    var payload = body.payload || {};

    // =========================================================================
    // ACTION 1: PASSCODE RECOVERY EMAIL (TO VERIFIED TEAM LEADER ONLY)
    // =========================================================================
    if (action === "passcode_recovery_email") {
      var recEmail = String(payload.leaderEmail || "").trim().toLowerCase();
      var recTeamId = String(payload.teamId || "").trim();
      var recTeamName = String(payload.teamName || "").trim();
      var recLeaderName = String(payload.leaderName || "Team Leader");
      var newPasscode = String(payload.teamPasscode || "");

      if (!recEmail || !recTeamId || !newPasscode) {
        throw new Error("INVALID_RECOVERY_PAYLOAD");
      }

      var recHtml =
        '<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; background: #F4F4F6; color: #111116;">' +
        '  <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 3px solid #111116; border-radius: 18px; padding: 24px;">' +
        '    <h2 style="margin-top: 0;">VELTRAXX 2.0 - New Team Passcode</h2>' +
        '    <p>Dear <strong>' + recLeaderName + '</strong>,</p>' +
        '    <p>A new Round 1 submission passcode was generated for Team <strong>' + recTeamId + ' (' + recTeamName + ')</strong>.</p>' +
        '    <div style="background: #FFE500; border: 2px solid #111116; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 20px; font-weight: 900; text-align: center; letter-spacing: 2px;">' +
               newPasscode +
        '    </div>' +
        '    <p style="font-size: 12px; color: #555;">Use your Team ID and this passcode on the Submit PPT portal (Open now through 08 Dec 2026, 11:59 PM IST).</p>' +
        '  </div>' +
        '</div>';

      var mailOutcome = sendEmailSafe({
        to: recEmail,
        subject: "VELTRAXX 2.0: New Team Passcode for " + recTeamId,
        htmlBody: recHtml,
        name: "VELTRAXX 2.0 · SIET VLSI Research Lab",
        replyTo: "dhilipkumarece@siet.ac.in"
      });

      if (!mailOutcome.sent) {
        throw new Error("EMAIL_QUOTA_EXCEEDED");
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, teamId: recTeamId })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 2: SEND SHORTLIST NOTIFICATION EMAIL TO SQUAD
    // =========================================================================
    if (action === "send_shortlist_email") {
      var teamId = payload.teamId || payload.team_id;
      var teamName = payload.teamName || payload.team_name;
      var secretPasscode = payload.secretPasscode || payload.secret_passcode;
      var trackId = payload.trackId || payload.track_id || "OPEN";
      var problemCode = payload.problemCode || payload.problem_code || "OPEN-01";
      var recipients = payload.recipients || [];
      var leaderName = payload.leaderName || "Team Leader";

      if (!teamId || !teamName || !secretPasscode) {
        throw new Error("MISSING_EMAIL_DATA");
      }
      if (typeof recipients === "string") recipients = [recipients];
      var cleanRecipients = recipients.filter(function(r) { return r && r.indexOf("@") > 0; });
      if (cleanRecipients.length === 0) throw new Error("NO_VALID_RECIPIENTS");

      var subject = "Shortlisted! Team " + teamId + " (" + teamName + ") - VELTRAXX 2.0 Finale Invitation";
      var confirmUrl = "https://veltrax-x-2-0-web.vercel.app/round2-confirm";

      var htmlBody =
        '<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F4F4F6; padding: 28px 12px; color: #111116;">' +
        '  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 3px solid #111116; border-radius: 20px; overflow: hidden;">' +
        '    <div style="background-color: #111116; padding: 24px; text-align: center;">' +
        '      <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 900;">VELTRAXX 2.0</h1>' +
        '      <p style="margin: 6px 0 0 0; color: #E0E0E6; font-size: 13px;">Department of EE (VDT) · SIET Coimbatore</p>' +
        '    </div>' +
        '    <div style="padding: 28px 24px;">' +
        '      <div style="background-color: #B6FF00; font-family: monospace; font-size: 13px; font-weight: 900; padding: 10px; border-radius: 10px; border: 2px solid #111116; text-align: center; margin-bottom: 20px;">' +
        '        CONGRATULATIONS! YOUR TEAM HAS BEEN SHORTLISTED' +
        '      </div>' +
        '      <p>Dear <strong>' + leaderName + '</strong> and squad members of <strong>' + teamName + '</strong>,</p>' +
        '      <p>Your squad is invited to the <strong>VELTRAXX 2.0 24-Hour Offline Arena Finale</strong> on Dec 15-16 at SIET Coimbatore.</p>' +
        '      <div style="background-color: #FBFBFB; border: 2px dashed #111116; border-radius: 14px; padding: 18px; margin: 18px 0; font-family: monospace;">' +
        '        <div><strong>Team ID:</strong> ' + teamId + '</div>' +
        '        <div><strong>Track / Problem:</strong> ' + trackId + ' (' + problemCode + ')</div>' +
        '        <div style="margin-top: 8px;"><strong>Round 2 Passcode:</strong> <span style="background: #FFE500; padding: 3px 8px; border: 1.5px solid #111116;">' + secretPasscode + '</span></div>' +
        '      </div>' +
        '      <div style="text-align: center; margin: 22px 0;">' +
        '        <a href="' + confirmUrl + '" target="_blank" style="display: inline-block; background-color: #FFE500; color: #111116; font-family: monospace; font-weight: 900; text-decoration: none; padding: 14px 24px; border-radius: 12px; border: 2.5px solid #111116;">Confirm Round 2 Seat →</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      var shortlistResult = sendEmailSafe({
        to: cleanRecipients.join(","),
        subject: subject,
        htmlBody: htmlBody,
        name: "VELTRAXX 2.0 · SIET VLSI Research Lab",
        replyTo: "dhilipkumarece@siet.ac.in"
      });

      if (!shortlistResult.sent) {
        throw new Error("EMAIL_QUOTA_EXCEEDED");
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        sentTo: cleanRecipients,
        teamId: teamId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 3: UPDATE GOOGLE SHEET WHEN PPT IS CONFIRMED (IDEMPOTENT)
    // =========================================================================
    if (action === "ppt_submitted") {
      var pptTeamId = payload.teamId || payload.team_id;
      var ver = payload.version || 1;
      var rcpt = payload.receiptId || "";
      if (!pptTeamId) throw new Error("MISSING_TEAM_ID");

      var pptSheet = getOrCreateRegistrationSheet();
      var existingRow = findTeamRowInSheet(pptSheet, pptTeamId);
      if (existingRow >= 2) {
        pptSheet.getRange(existingRow, 12).setValue("YES (v" + ver + " - " + rcpt + ")");
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        teamId: pptTeamId,
        sheetRowUpdated: existingRow >= 2
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 4: IDEMPOTENT TEAM REGISTRATION SHEET SYNC + LEADER EMAIL
    // =========================================================================
    var regTeamId = payload.teamId || payload.team_id;
    var regTeamName = payload.teamName || payload.team_name;
    var regTrackId = payload.trackId || payload.track_id || "OPEN";
    var regProblemCode = payload.problemCode || payload.problem_code || "OPEN-01";
    var regTier = payload.academicTier || payload.academic_tier || "tier_a";
    var regPasscode = payload.teamPasscode || "";
    var members = payload.members || [];

    if (!regTeamId || !regTeamName) {
      throw new Error("INVALID_DATA: teamId and teamName are required.");
    }

    var sheet = getOrCreateRegistrationSheet();

    // Idempotent Drive Folder Provisioning (lookup before creating)
    var folderUrl = "FOLDER_CREATION_SKIPPED";
    try {
      if (PARENT_DRIVE_FOLDER_ID && PARENT_DRIVE_FOLDER_ID !== "YOUR_PRIVATE_PARENT_FOLDER_ID") {
        var parentFolder = DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID);
        var folderName = regTeamId + "_Blueprints";
        var existingFolders = parentFolder.getFoldersByName(folderName);
        var teamFolder = existingFolders.hasNext() ? existingFolders.next() : parentFolder.createFolder(folderName);
        folderUrl = teamFolder.getUrl();
      }
    } catch (driveErr) {
      Logger.log("Drive folder warning: " + driveErr.toString());
    }

    // Idempotent Sheet Check: Skip appending if Team ID already exists
    var existingTeamRow = findTeamRowInSheet(sheet, regTeamId);
    var memberCount = Array.isArray(members) && members.length > 0 ? members.length : 1;

    if (existingTeamRow === -1) {
      var startRow = sheet.getLastRow() + 1;
      var memberList = (Array.isArray(members) && members.length > 0)
        ? members
        : [{ fullName: "Leader", phone: "", email: "", collegeName: "SIET", department: "VLSI", yearOfStudy: "1st Year" }];

      var sNo = 1;
      if (startRow > 2) {
        for (var r = startRow - 1; r >= 2; r--) {
          var v = sheet.getRange(r, 1).getValue();
          if (v !== "" && v !== null && !isNaN(v)) {
            sNo = Number(v) + 1;
            break;
          }
        }
      }

      var problemStatement = regProblemCode
        ? (regTrackId ? regProblemCode + " (" + regTrackId + ")" : regProblemCode)
        : regTrackId;

      var rowsData = [];
      for (var i = 0; i < memberList.length; i++) {
        var m = memberList[i] || {};
        var isLeader = (i === 0);
        var roleName = isLeader ? "Leader" : ("M" + i);
        var memberPhone = String(m.phone || "").replace(/[^0-9]/g, "");
        if (memberPhone.length >= 10) memberPhone = memberPhone.slice(-10);
        var phoneFormatted = "'" + memberPhone;
        var studentName = m.fullName || m.full_name || m.name || "";
        var email = String(m.email || "").trim().toLowerCase();
        var level = m.level || "UG";
        var degree = m.degree || "";
        var college = level === "Working professional" ? (m.organisation || "Working Professional") : (m.collegeName || m.college_name || m.college || "SIET");
        var dept = level === "Working professional" ? (m.designation || "Industry") : (degree ? (degree + " - " + (m.department || m.dept || "")) : (m.department || m.dept || ""));
        var year = level === "Working professional" ? "Professional" : String(m.yearOfStudy || m.year_of_study || m.year || "1st Year");

        if (isLeader) {
          rowsData.push([sNo, regTeamId, regTeamName, problemStatement, roleName, studentName, phoneFormatted, email, college, dept, year, "PENDING", "PENDING"]);
        } else {
          rowsData.push(["", "", "", "", roleName, studentName, phoneFormatted, email, college, dept, year, "", ""]);
        }
      }

      sheet.getRange(startRow, 1, rowsData.length, 13).setValues(rowsData);

      if (rowsData.length > 1) {
        [1, 2, 3, 4, 12, 13].forEach(function(colIdx) {
          sheet.getRange(startRow, colIdx, rowsData.length, 1).mergeVertically().setVerticalAlignment("middle").setHorizontalAlignment("center");
        });
      }
      var lastRowOfTeam = startRow + rowsData.length - 1;
      sheet.getRange(lastRowOfTeam, 1, 1, 13).setBorder(null, null, true, null, null, null, "#111116", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }

    // Supplementary email to Team Leader ONLY (1 recipient per team preserves daily quota across 1,000 teams)
    var emailStatus = { sent: false };
    var leaderObj = (Array.isArray(members) && members[0]) ? members[0] : {};
    var leaderEmail = String(leaderObj.email || "").trim().toLowerCase();
    var leaderDisplayName = leaderObj.fullName || leaderObj.full_name || leaderObj.name || "Team Leader";

    if (leaderEmail && leaderEmail.indexOf("@") > 0 && existingTeamRow === -1) {
      var passcodeSection = regPasscode
        ? '<tr><td style="padding: 4px 0; color: #D8005A; font-weight: 900;">Team Passcode:</td><td style="padding: 4px 0; font-weight: 900; background: #FFE500; padding: 2px 8px;">' + regPasscode + '</td></tr>'
        : '';

      var regHtml =
        '<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F4F4F6; padding: 28px 12px; color: #111116;">' +
        '  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 3px solid #111116; border-radius: 20px; overflow: hidden;">' +
        '    <div style="background-color: #111116; padding: 24px; text-align: center;">' +
        '      <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 900;">VELTRAXX 2.0</h1>' +
        '      <p style="margin: 6px 0 0 0; color: #E0E0E6; font-size: 13px;">Department of EE (VDT) · SIET Coimbatore</p>' +
        '    </div>' +
        '    <div style="padding: 28px 24px;">' +
        '      <p>Dear <strong>' + leaderDisplayName + '</strong> and squad members of <strong>' + regTeamName + '</strong>,</p>' +
        '      <p>Your squad is registered for <strong>VELTRAXX 2.0</strong>. Keep your credentials below for PPT submission:</p>' +
        '      <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px; background: #FBFBFB; border: 2px dashed #111116; padding: 14px;">' +
        '        <tr><td style="padding: 4px 0; color: #6B6B78;">Team ID:</td><td style="padding: 4px 0; font-weight: 900; color: #0055FF;">' + regTeamId + '</td></tr>' +
                 passcodeSection +
        '        <tr><td style="padding: 4px 0; color: #6B6B78;">Team Name:</td><td style="padding: 4px 0; font-weight: 700;">' + regTeamName + '</td></tr>' +
        '        <tr><td style="padding: 4px 0; color: #6B6B78;">Track / Problem:</td><td style="padding: 4px 0; font-weight: 700;">' + regProblemCode + ' (' + regTrackId + ')</td></tr>' +
        '        <tr><td style="padding: 4px 0; color: #6B6B78;">Academic Tier:</td><td style="padding: 4px 0; font-weight: 700;">' + regTier + '</td></tr>' +
        '      </table>' +
        '      <div style="background-color: #F0FDFA; border: 2px solid #00E5FF; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 13px;">' +
        '        <strong>PPT Blueprint Submission:</strong> Open immediately through <strong>08 Dec 2026 (11:59 PM IST)</strong>. Upload as PDF (&lt; 3 MB, max 8 slides) at <a href="https://veltrax-x-2-0-web.vercel.app/submit-ppt">Submit PPT Portal</a>.' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      emailStatus = sendEmailSafe({
        to: leaderEmail,
        subject: "Registration Confirmed: Team " + regTeamId + " (" + regTeamName + ") - VELTRAXX 2.0",
        htmlBody: regHtml,
        name: "VELTRAXX 2.0 · SIET VLSI Research Lab",
        replyTo: "dhilipkumarece@siet.ac.in"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      teamId: regTeamId,
      driveFolderUrl: folderUrl,
      rowsAppended: existingTeamRow === -1 ? memberCount : 0,
      emailSent: emailStatus.sent
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
