/**
 * ==============================================================================
 * VELTRAXX 2.0 - GOOGLE APPS SCRIPT WEBHOOK, DRIVE PROVISIONER & EMAIL DISPATCHER
 * File: google_apps_script/Code.gs
 * ==============================================================================
 * Security & Access Control Policy:
 * - EXECUTION: Deploy as Web App -> Execute as: "Me" (Coordinator), Who has access: "Anyone".
 * - PRIVACY: Root Folder & Sheet MUST remain strictly PRIVATE to owner (Darshan R.A)
 *   and authorized department coordinators (subiksha@veltraxx.in, dhilipkumar@siet.ac.in).
 * - NEVER enable "Anyone with the link can view/edit" on the Google Sheet or Drive folder.
 * - This ensures public registrants can submit registration and PPT assets securely
 *   without having read or browse access to other teams' records or submitted proposals.
 * ==============================================================================
 */

// Configure parent folder ID via Script Properties (File > Project Properties > Script Properties)
// Fallback ID for local script deployment reference
var PARENT_DRIVE_FOLDER_ID = PropertiesService.getScriptProperties().getProperty("PARENT_DRIVE_FOLDER_ID") || "YOUR_PRIVATE_PARENT_FOLDER_ID";

/**
 * Handle POST request from frontend / Supabase webhooks
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for concurrent write locks (avoids race condition row overwrites)
    lock.waitLock(10000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "LOCK_TIMEOUT: Server busy, please retry in 5 seconds."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("EMPTY_PAYLOAD: No POST data received.");
    }

    var body = JSON.parse(e.postData.contents);
    var payload = body.payload || body;
    var action = body.action || payload.action || 'register';

    // =========================================================================
    // ACTION 1: SEND SHORTLIST NOTIFICATION EMAIL TO SQUAD
    // =========================================================================
    if (action === 'send_shortlist_email') {
      var teamId = payload.teamId || payload.team_id;
      var teamName = payload.teamName || payload.team_name;
      var secretPasscode = payload.secretPasscode || payload.secret_passcode;
      var trackId = payload.trackId || payload.track_id || 'OPEN';
      var problemCode = payload.problemCode || payload.problem_code || 'OPEN-01';
      var recipients = payload.recipients || [];
      var leaderName = payload.leaderName || 'Team Leader';

      if (!teamId || !teamName || !secretPasscode) {
        throw new Error("MISSING_EMAIL_DATA: teamId, teamName, and secretPasscode are required.");
      }

      if (typeof recipients === 'string') {
        recipients = [recipients];
      }
      var cleanRecipients = recipients.filter(function(r) { return r && r.indexOf('@') > 0; });
      if (cleanRecipients.length === 0) {
        throw new Error("NO_VALID_RECIPIENTS: At least one valid member email address is required.");
      }

      var subject = "⚡ Shortlisted! Team " + teamId + " (" + teamName + ") - VELTRAXX 2.0 Finale Invitation";
      var confirmUrl = "https://veltrax-x-2-0-web.vercel.app/round2-confirm";

      var htmlBody = 
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F4F6; padding: 28px 12px; color: #111116;">' +
        '  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 3px solid #111116; border-radius: 20px; box-shadow: 6px 6px 0px #111116; overflow: hidden;">' +
        '    <!-- Header -->' +
        '    <div style="background-color: #111116; padding: 24px; text-align: center; border-bottom: 3px solid #111116;">' +
        '      <div style="display: inline-block; background-color: #FFE500; color: #111116; font-family: monospace; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">' +
        '        NATIONAL-LEVEL 2-STAGE HACKATHON' +
        '      </div>' +
        '      <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">' +
        '        VELTRAXX <span style="background-color: #FFE500; color: #111116; padding: 2px 8px; border-radius: 6px;">2.0</span>' +
        '      </h1>' +
        '      <p style="margin: 6px 0 0 0; color: #E0E0E6; font-size: 13px; font-weight: 500;">' +
        '        Department of EEE &amp; VLSI · Sri Shakthi Institute of Engineering and Technology (SIET)' +
        '      </p>' +
        '    </div>' +
        '    ' +
        '    <!-- Body Content -->' +
        '    <div style="padding: 28px 24px;">' +
        '      <div style="background-color: #B6FF00; color: #111116; font-family: monospace; font-size: 13px; font-weight: 900; padding: 10px 14px; border-radius: 10px; border: 2px solid #111116; box-shadow: 3px 3px 0px #111116; text-align: center; margin-bottom: 20px;">' +
        '        🎉 CONGRATULATIONS! YOUR TEAM HAS BEEN SHORTLISTED' +
        '      </div>' +
        '      ' +
        '      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">' +
        '        Dear <strong>' + leaderName + '</strong> and squad members of <strong>' + teamName + '</strong>,' +
        '      </p>' +
        '      ' +
        '      <p style="font-size: 14px; line-height: 1.6; color: #33333E; margin: 0 0 20px 0;">' +
        '        Our jury committee has evaluated your Round 1 pitch deck blueprint. Based on technical architecture, problem alignment, and innovation rigor, we are thrilled to formally invite <strong>' + teamName + '</strong> to the <strong>VELTRAXX 2.0 24-Hour Offline Arena Finale</strong> at Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore!' +
        '      </p>' +
        '      ' +
        '      <!-- Credentials Box -->' +
        '      <div style="background-color: #FBFBFB; border: 2px dashed #111116; border-radius: 14px; padding: 18px; margin-bottom: 22px;">' +
        '        <div style="font-family: monospace; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #6B6B78; margin-bottom: 10px;">' +
        '          OFFICIAL FINALE CREDENTIALS' +
        '        </div>' +
        '        <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px;">' +
        '          <tr>' +
        '            <td style="padding: 4px 0; color: #6B6B78; width: 140px;">Team ID:</td>' +
        '            <td style="padding: 4px 0; font-weight: 900; color: #0055FF; font-size: 15px;">' + teamId + '</td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td style="padding: 4px 0; color: #6B6B78;">Team Name:</td>' +
        '            <td style="padding: 4px 0; font-weight: 700; color: #111116;">' + teamName + '</td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td style="padding: 4px 0; color: #6B6B78;">Track / Problem:</td>' +
        '            <td style="padding: 4px 0; font-weight: 700; color: #111116;">' + trackId + ' (' + problemCode + ')</td>' +
        '          </tr>' +
        '          <tr>' +
        '            <td style="padding: 6px 0; color: #D8005A; font-weight: 900;">Secret Passcode:</td>' +
        '            <td style="padding: 6px 0;">' +
        '              <span style="background-color: #FFE500; color: #111116; font-weight: 900; font-size: 16px; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #111116; letter-spacing: 1.5px;">' +
        '                ' + secretPasscode +
        '              </span>' +
        '            </td>' +
        '          </tr>' +
        '        </table>' +
        '        <p style="margin: 10px 0 0 0; font-size: 11px; color: #6B6B78; line-height: 1.4;">' +
        '          ⚠️ <em>Keep this Secret Passcode safe. You will need both your Team ID and Passcode to claim your offline seat on the confirmation portal.</em>' +
        '        </p>' +
        '      </div>' +
        '      ' +
        '      <!-- Action Button -->' +
        '      <div style="text-align: center; margin: 26px 0;">' +
        '        <a href="' + confirmUrl + '" target="_blank" style="display: inline-block; background-color: #FFE500; color: #111116; font-family: -apple-system, BlinkMacSystemFont, monospace; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; border: 2.5px solid #111116; box-shadow: 4px 4px 0px #111116; text-transform: uppercase; letter-spacing: 0.5px;">' +
        '          Confirm Your Round 2 Seat Now →' +
        '        </a>' +
        '      </div>' +
        '      ' +
        '      <!-- Guidelines -->' +
        '      <div style="font-size: 12px; color: #555562; line-height: 1.5; border-top: 1px solid #E0E0E6; padding-top: 16px;">' +
        '        <strong>Next Steps:</strong><br/>' +
        '        1. Click the confirmation button above and sign in using Team ID: <code>' + teamId + '</code> and Passcode: <code>' + secretPasscode + '</code>.<br/>' +
        '        2. Submit your registration fee UTR number to lock in your workspace, food, and mentor slot.<br/>' +
        '        3. Join the official SIET WhatsApp coordinator announcements group linked inside the portal.' +
        '      </div>' +
        '    </div>' +
        '    ' +
        '    <!-- Footer -->' +
        '    <div style="background-color: #FBFBFB; padding: 16px 24px; border-top: 2px solid #111116; text-align: center; font-family: monospace; font-size: 11px; color: #6B6B78;">' +
        '      Department of Electrical and Electronics Engineering (EEE / VLSI)<br/>' +
        '      Sri Shakthi Institute of Engineering and Technology (Autonomous), Coimbatore - 641062<br/>' +
        '      Helpdesk: darshan@veltraxx.in | subiksha@veltraxx.in | dhilipkumar@siet.ac.in' +
        '    </div>' +
        '  </div>' +
        '</div>';

      MailApp.sendEmail({
        to: cleanRecipients.join(','),
        subject: subject,
        htmlBody: htmlBody
      });

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        sentTo: cleanRecipients,
        teamId: teamId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 2: VERTICALLY MERGED MANAGEMENT ROSTER WRITE TO GOOGLE SHEET
    // =========================================================================
    var teamId = payload.teamId || payload.team_id;
    var teamName = payload.teamName || payload.team_name;
    var trackId = payload.trackId || payload.track_id || 'OPEN';
    var problemCode = payload.problemCode || payload.problem_code || 'OPEN-01';
    var academicTier = payload.academicTier || payload.academic_tier;
    var members = payload.members || [];

    if (!teamId || !teamName) {
      throw new Error("INVALID_DATA: teamId and teamName are required.");
    }

    // 1. Google Sheets Audit Trail
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Live_Registrations") || ss.insertSheet("Live_Registrations");
    
    // Set headers on first row if sheet is fresh
    if (sheet.getLastRow() === 0) {
      var headers = [
        "S.No", "Team ID", "Team Name", "Problem Statement", "Role", 
        "Student Name", "Phone Number", "Email ID", "College", "Dept", 
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

      // Set explicit column widths in Google Sheets
      sheet.setColumnWidth(1, 55);   // S.No
      sheet.setColumnWidth(2, 95);   // Team ID
      sheet.setColumnWidth(3, 175);  // Team Name
      sheet.setColumnWidth(4, 155);  // Problem Statement
      sheet.setColumnWidth(5, 75);   // Role
      sheet.setColumnWidth(6, 180);  // Student Name
      sheet.setColumnWidth(7, 125);  // Phone Number
      sheet.setColumnWidth(8, 210);  // Email ID
      sheet.setColumnWidth(9, 230);  // College
      sheet.setColumnWidth(10, 110); // Dept
      sheet.setColumnWidth(11, 95);  // Year
      sheet.setColumnWidth(12, 125); // PPT Submitted
      sheet.setColumnWidth(13, 125); // Round 1 Status
    }

    // 2. Provision Private Team Folder in Google Drive
    var folderUrl = "FOLDER_CREATION_SKIPPED";
    try {
      if (PARENT_DRIVE_FOLDER_ID && PARENT_DRIVE_FOLDER_ID !== "YOUR_PRIVATE_PARENT_FOLDER_ID") {
        var parentFolder = DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID);
        var sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9_-]/g, "_");
        var teamFolder = parentFolder.createFolder(teamId + "_" + sanitizedTeamName);
        folderUrl = teamFolder.getUrl();
      }
    } catch (driveErr) {
      Logger.log("Drive folder provisioning warning: " + driveErr.toString());
    }

    // 3. Prepare Vertically Merged Team Block Rows
    var startRow = sheet.getLastRow() + 1;
    var memberList = (Array.isArray(members) && members.length > 0)
      ? members
      : [{ fullName: 'Leader', phone: '', email: '', collegeName: 'SIET', department: 'VLSI', yearOfStudy: '1st Year' }];
    var memberCount = memberList.length;

    // Calculate sequential S.No by scanning upwards in column 1
    var sNo = 1;
    if (startRow > 2) {
      for (var r = startRow - 1; r >= 2; r--) {
        var v = sheet.getRange(r, 1).getValue();
        if (v !== '' && v !== null && !isNaN(v)) {
          sNo = Number(v) + 1;
          break;
        }
      }
    }

    var problemStatement = problemCode 
      ? (trackId ? problemCode + " (" + trackId + ")" : problemCode)
      : (trackId || "OPEN");

    function formatYear(raw) {
      if (!raw) return '1st Year';
      var s = String(raw).trim();
      if (s.indexOf('1') >= 0) return '1st Year';
      if (s.indexOf('2') >= 0) return '2nd Year';
      if (s.indexOf('3') >= 0) return '3rd Year';
      if (s.indexOf('4') >= 0) return '4th Year';
      return s;
    }

    var rowsData = [];
    for (var i = 0; i < memberCount; i++) {
      var m = memberList[i] || {};
      var isLeader = (i === 0);
      var roleName = isLeader ? "Leader" : ("M" + i);
      var memberPhone = String(m.phone || '').replace(/[^0-9]/g, '');
      if (memberPhone.length >= 10) {
        memberPhone = memberPhone.slice(-10);
      }
      var phoneFormatted = "'" + memberPhone; // Prepend apostrophe to enforce text formatting
      var studentName = m.fullName || m.full_name || m.name || '';
      var email = (m.email || '').trim().toLowerCase();
      var college = m.collegeName || m.college_name || m.college || 'SIET';
      var dept = m.department || m.dept || 'VLSI';
      var year = formatYear(m.yearOfStudy || m.year_of_study || m.year);

      if (isLeader) {
        rowsData.push([
          sNo,
          teamId,
          teamName,
          problemStatement,
          roleName,
          studentName,
          phoneFormatted,
          email,
          college,
          dept,
          year,
          "PENDING",
          "PENDING"
        ]);
      } else {
        rowsData.push([
          "",
          "",
          "",
          "",
          roleName,
          studentName,
          phoneFormatted,
          email,
          college,
          dept,
          year,
          "",
          ""
        ]);
      }
    }

    // Write all member rows for this squad
    sheet.getRange(startRow, 1, memberCount, 13).setValues(rowsData);

    // Apply Vertical Merging for Team-Level Columns if memberCount > 1
    if (memberCount > 1) {
      var teamColsToMerge = [1, 2, 3, 4, 12, 13];
      teamColsToMerge.forEach(function(colIdx) {
        sheet.getRange(startRow, colIdx, memberCount, 1)
          .mergeVertically()
          .setVerticalAlignment("middle")
          .setHorizontalAlignment("center");
      });
    } else {
      // Single member team - center team columns
      [1, 2, 3, 4, 12, 13].forEach(function(colIdx) {
        sheet.getRange(startRow, colIdx, 1, 1)
          .setVerticalAlignment("middle")
          .setHorizontalAlignment("center");
      });
    }

    // Align member-level columns
    // Center: Role (col 5), Phone (col 7), Year (col 11)
    sheet.getRange(startRow, 5, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
    sheet.getRange(startRow, 7, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("center");
    sheet.getRange(startRow, 11, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("center");

    // Left align: Student Name (col 6), Email (col 8), College (col 9), Dept (col 10)
    sheet.getRange(startRow, 6, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("left");
    sheet.getRange(startRow, 8, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("left");
    sheet.getRange(startRow, 9, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("left");
    sheet.getRange(startRow, 10, memberCount, 1).setVerticalAlignment("middle").setHorizontalAlignment("left");

    // Apply medium bottom border on the last member row of this team block
    var lastRowOfTeam = startRow + memberCount - 1;
    sheet.getRange(lastRowOfTeam, 1, 1, 13).setBorder(
      null, null, true, null, null, null,
      "#111116",
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      teamId: teamId,
      driveFolderUrl: folderUrl,
      rowsAppended: memberCount
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
