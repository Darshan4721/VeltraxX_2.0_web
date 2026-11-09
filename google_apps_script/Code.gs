/**
 * ==============================================================================
 * VELTRAXX 2.0 - GOOGLE APPS SCRIPT WEBHOOK & DRIVE PROVISIONER
 * File: google_apps_script/Code.gs
 * ==============================================================================
 * Security & Access Control Policy:
 * - EXECUTION: Deploy as Web App -> Execute as: "Me" (Coordinator), Who has access: "Anyone".
 * - PRIVACY: Root Folder & Sheet MUST remain strictly PRIVATE to owner (Darshan R.A)
 *   and authorized department coordinators (kavya@veltraxx.in, dhilipkumar@siet.ac.in).
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
    var teamId = payload.teamId || payload.team_id;
    var teamName = payload.teamName || payload.team_name;
    var trackId = payload.trackId || payload.track_id;
    var problemCode = payload.problemCode || payload.problem_code;
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
        "Timestamp", "Team ID", "Team Name", "Track ID", "Problem Code", 
        "Academic Tier", "Role", "Student Name", "Email", "Phone", 
        "Gender", "College Name", "Department", "Year of Study", "Drive Folder Link"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#FFE500");
      headerRange.setFontColor("#111116");
      sheet.setFrozenRows(1);
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

    // 3. Append Flat Rows (1 row per member, hardened text format for phones)
    members.forEach(function(m, idx) {
      var memberPhone = String(m.phone || '').replace(/[^0-9]/g, '');
      if (memberPhone.length >= 10) {
        memberPhone = memberPhone.slice(-10);
      }

      sheet.appendRow([
        new Date().toISOString(),
        teamId,
        teamName,
        trackId,
        problemCode,
        academicTier === 'tier_a' ? 'Tier A (Junior UG)' : 'Tier B (Senior / Research)',
        idx === 0 ? "Leader" : ("Member " + (idx + 1)),
        m.fullName || m.name || '',
        (m.email || '').trim().toLowerCase(),
        "'" + memberPhone, // Prepend apostrophe to enforce string representation in Sheets/Excel
        m.gender || 'Not Specified',
        m.collegeName || m.college_name || 'SIET',
        m.department || 'ECE',
        m.yearOfStudy || m.year_of_study || '1st Year',
        folderUrl
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      teamId: teamId,
      driveFolderUrl: folderUrl,
      rowsAppended: members.length
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

