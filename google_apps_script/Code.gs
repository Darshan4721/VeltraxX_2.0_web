/**
 * ==============================================================================
 * VELTRAXX 2.0 - HARDENED GOOGLE APPS SCRIPT WEBHOOK (SINGLE-ROUND)
 * ==============================================================================
 * Changes from two-stage version:
 *  1. Completely removes MailApp / sendEmailSafe / automatic emails (cures
 *     production script.send_mail permission errors). All confirmation emails are
 *     sent manually from vlsireseachlab@siet.ac.in.
 *  2. Stops creating empty _Blueprints folders for new registrations.
 *  3. Keeps HMAC-SHA256 replay protection & 13-column Live_Registrations Sheet,
 *     repurposing Cols 12 & 13 to Payment Status & Participation Status via
 *     idempotent row updates (never duplicates team rows on retries).
 * ==============================================================================
 */

var PARENT_DRIVE_FOLDER_ID = "1IvyUEh1xtQEXdcQF0qr2gVtpP-9dzwzO";
var MASTER_SHEET_NAME = "Live_Registrations";

function verifySignedRequest(body) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("GAS_SHARED_SECRET");
  if (!secret) {
    throw new Error("SERVER_MISCONFIGURED: GAS_SHARED_SECRET is not set in Script Properties.");
  }

  var action = String(body.action || "");
  var timestamp = String(body.timestamp || "");
  var nonce = String(body.nonce || "");
  var signature = String(body.signature || "").toLowerCase();
  var payload = body.payload || {};
  var teamId = String(payload.teamId || payload.team_id || "GLOBAL");

  if (!action || !timestamp || !nonce || !signature) {
    throw new Error("UNAUTHORIZED: Missing HMAC signature envelope.");
  }

  var tsNum = Number(timestamp);
  var nowMs = Date.now();
  if (!tsNum || Math.abs(nowMs - tsNum) > 5 * 60 * 1000) {
    throw new Error("UNAUTHORIZED: Signature timestamp expired.");
  }

  var cache = CacheService.getScriptCache();
  var nonceKey = "vtx_nonce_" + nonce;
  if (cache.get(nonceKey)) {
    throw new Error("UNAUTHORIZED: Duplicate request nonce detected.");
  }

  var canonical = action + ":" + teamId + ":" + timestamp + ":" + nonce;
  var digestBytes = Utilities.computeHmacSha256Signature(canonical, secret);
  var expectedHex = digestBytes.map(function(b) {
    var v = b < 0 ? b + 256 : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("").toLowerCase();

  if (signature !== expectedHex) {
    throw new Error("UNAUTHORIZED: Invalid HMAC signature.");
  }

  cache.put(nonceKey, "1", 360);
}

function getOrCreateRegistrationSheet() {
  var ss;
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else {
    var parentFolder = DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID);
    var files = parentFolder.getFilesByName("Official_spread_sheet");
    ss = files.hasNext() ? SpreadsheetApp.openById(files.next().getId()) : SpreadsheetApp.getActiveSpreadsheet();
  }

  var sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_SHEET_NAME);
    var headers = [
      "S.No", "Team ID", "Team Name", "Problem Statement",
      "Role", "Student Name", "Phone Number", "Email ID",
      "College", "Degree & Dept", "Year", "Payment Status", "Participation Status"
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
    sheet.setColumnWidth(12, 185);
    sheet.setColumnWidth(13, 155);
  } else {
    // Ensure top header columns reflect single-round labels without disturbing existing rows
    sheet.getRange(1, 12).setValue("Payment Status");
    sheet.getRange(1, 13).setValue("Participation Status");
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

function deriveSheetStatuses(team) {
  var rawStatus = String(team.round1Status || team.round1_status || "pending").toLowerCase();
  var isPaidVerified = Boolean(team.isPaidVerified || team.is_paid_verified);
  var utr = String(team.utrNumber || team.utr_number || "").trim();

  if (rawStatus === "rejected") {
    return { paymentLabel: utr ? ("REJECTED (UTR " + utr + ")") : "REJECTED", participationLabel: "REJECTED" };
  }
  if (isPaidVerified) {
    return { paymentLabel: utr ? ("VERIFIED / PAID (UTR " + utr + ")") : "VERIFIED / PAID", participationLabel: "CONFIRMED" };
  }
  if (utr) {
    return { paymentLabel: "PENDING VERIFICATION (UTR " + utr + ")", participationLabel: "PENDING VERIFICATION" };
  }
  return { paymentLabel: "PENDING VERIFICATION", participationLabel: "PENDING VERIFICATION" };
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

    // Update payment & participation status idempotently on existing Sheet row
    if (action === "team_status_sync" || action === "ppt_submitted") {
      var stTeamId = payload.teamId || payload.team_id;
      if (!stTeamId) throw new Error("MISSING_TEAM_ID");

      var stSheet = getOrCreateRegistrationSheet();
      var existingRow = findTeamRowInSheet(stSheet, stTeamId);
      var labels = deriveSheetStatuses(payload);
      if (existingRow >= 2) {
        stSheet.getRange(existingRow, 12).setValue(labels.paymentLabel);
        stSheet.getRange(existingRow, 13).setValue(labels.participationLabel);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        teamId: stTeamId,
        sheetRowUpdated: existingRow >= 2
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default Action: Idempotent Registration Sheet Sync (Zero MailApp calls, Zero empty PPT folder creation)
    var regTeamId = payload.teamId || payload.team_id;
    var regTeamName = payload.teamName || payload.team_name;
    var regTrackId = payload.trackId || payload.track_id || "OPEN";
    var regProblemCode = payload.problemCode || payload.problem_code || "OPEN-01";
    var members = payload.members || [];

    if (!regTeamId || !regTeamName) {
      throw new Error("INVALID_DATA: teamId and teamName are required.");
    }

    var sheet = getOrCreateRegistrationSheet();
    var existingTeamRow = findTeamRowInSheet(sheet, regTeamId);
    var memberCount = Array.isArray(members) && members.length > 0 ? members.length : 1;
    var initLabels = deriveSheetStatuses(payload);

    if (existingTeamRow === -1) {
      var startRow = sheet.getLastRow() + 1;
      var memberList = (Array.isArray(members) && members.length > 0)
        ? members
        : [{ fullName: "Leader", phone: "", email: "", collegeName: "SIET", department: "EE-VDT", yearOfStudy: "1st Year" }];

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
        var roleName = isLeader ? "Leader" : ("M" + (i + 1));
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
          rowsData.push([sNo, regTeamId, regTeamName, problemStatement, roleName, studentName, phoneFormatted, email, college, dept, year, initLabels.paymentLabel, initLabels.participationLabel]);
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
    } else {
      sheet.getRange(existingTeamRow, 12).setValue(initLabels.paymentLabel);
      sheet.getRange(existingTeamRow, 13).setValue(initLabels.participationLabel);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      teamId: regTeamId,
      rowsAppended: existingTeamRow === -1 ? memberCount : 0
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
