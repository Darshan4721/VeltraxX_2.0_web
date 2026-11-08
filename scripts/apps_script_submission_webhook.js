/**
 * ==============================================================================
 * VELTRAXX 2.0 · GOOGLE APPS SCRIPT WEBHOOK BRIDGE & AUTOMATION
 * Deployed as a Web App to store pitch PDFs in the coordinator's 5TB Google Drive
 * and log submissions into a Master Google Sheet for single-shot AI scoring.
 * 
 * Compliant with docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md (Patches 1 to 5).
 * ==============================================================================
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open https://script.google.com
 * 2. Paste this entire code into `Code.gs`.
 * 3. Click "Deploy" -> "New deployment" -> Select type "Web app".
 * 4. Execute as: "Me" (your Google account).
 * 5. Who has access: "Anyone".
 * 6. Copy the Web App URL and set in your .env as:
 *    VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/..."
 * ==============================================================================
 */

var DRIVE_FOLDER_NAME = "veltraxx_2.0";
var MASTER_SHEET_NAME = "All_Pitches_Master";

/**
 * Handles incoming POST requests from the /submit-ppt portal.
 */
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var teamId = data.team_id || "UNKNOWN_TEAM";
    var trackId = data.track_id || "UNKNOWN_TRACK";
    var problemCode = data.problem_code || "VTX-T1-01";
    var teamName = data.team_name || teamId;
    var fileName = data.file_name || (teamId + "_Pitch_Blueprint.pdf");
    var fileBase64 = data.file_base64 || "";
    var extractedText = data.extracted_text || "";

    if (!fileBase64) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "NO_FILE_PAYLOAD: Missing base64 file data."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Locate or create destination folder in Drive
    var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);

    // 2. Decode base64 and create PDF file
    var decodedBytes = Utilities.base64Decode(fileBase64);
    var blob = Utilities.newBlob(decodedBytes, "application/pdf", fileName);
    var driveFile = folder.createFile(blob);

    // Set file sharing to anyone with link can view (required for iframe embed)
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = driveFile.getId();

    // The ONLY iframe-embeddable Drive link format that bypasses X-Frame-Options: SAMEORIGIN
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var directViewUrl = driveFile.getUrl();

    // 3. Log into Master Google Sheet
    logToMasterSheet(teamId, teamName, trackId, problemCode, previewUrl, directViewUrl, extractedText);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      file_id: fileId,
      preview_url: previewUrl,
      direct_url: directViewUrl,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles GET requests for health check.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "HEALTHY",
    service: "VELTRAXX 2.0 Webhook Bridge",
    institution: "Sri Shakthi Institute of Engineering and Technology, Coimbatore",
    department: "Dept of EE (VLSI Design & Technology)"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility: Gets or creates a top-level Drive folder.
 */
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

/**
 * Appends row to Master Google Sheet for single-shot AI scoring.
 */
function logToMasterSheet(teamId, teamName, trackId, problemCode, previewUrl, directViewUrl, extractedText) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss ? ss.getSheetByName(MASTER_SHEET_NAME) : null;

  if (!sheet) {
    if (!ss) {
      // Find or create sheet in Drive folder
      var folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
      var files = folder.getFilesByName(MASTER_SHEET_NAME);
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create(MASTER_SHEET_NAME);
        var ssFile = DriveApp.getFileById(ss.getId());
        folder.addFile(ssFile);
        DriveApp.getRootFolder().removeFile(ssFile);
      }
    }
    sheet = ss.getSheetByName(MASTER_SHEET_NAME) || ss.insertSheet(MASTER_SHEET_NAME);

    // Add header if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Team ID",
        "Team Name",
        "Track ID",
        "Problem Code",
        "Drive Preview Embed URL",
        "Direct View URL",
        "Extracted Text Content (AI Scoring Prompt)",
        "Jury Score (1-100)",
        "Status"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#FFE500");
    }
  }

  sheet.appendRow([
    new Date(),
    teamId,
    teamName,
    trackId,
    problemCode,
    previewUrl,
    directViewUrl,
    extractedText.substring(0, 5000), // Cap for cell limit
    "",
    "PENDING_EVALUATION"
  ]);
}

/**
 * Automated Confirmation Email (Optional Helper)
 * Call this from external trigger or registration hook.
 */
function sendTeamConfirmationEmail(leaderEmail, teamId, secretPasscode, teamName) {
  var subject = "VELTRAXX 2.0: Official Team Registration Confirmed (" + teamId + ")";
  var body = 
    "Dear " + teamName + " Team,\n\n" +
    "Welcome to VELTRAXX 2.0, organized by the Department of Electrical & Electronics Engineering " +
    "(VLSI Design & Technology) at Sri Shakthi Institute of Engineering and Technology, Coimbatore.\n\n" +
    "YOUR REGISTRATION CREDENTIALS:\n" +
    "---------------------------------------------------\n" +
    "Team ID: " + teamId + "\n" +
    "Secret Passcode: " + secretPasscode + "\n" +
    "Registration Fee: Rs. 0 (100% Free Round 1 Entry)\n" +
    "---------------------------------------------------\n\n" +
    "IMPORTANT: Keep your Secret Passcode safe. You will need it to unlock your " +
    "Round 2 seat confirmation if your team is shortlisted for the 24-hour offline finale.\n\n" +
    "NEXT MILESTONE:\n" +
    "1. Download the official 6-slide PPT template from the portal: https://veltraxx.com\n" +
    "2. Prepare your architecture and block diagrams.\n" +
    "3. Submit your completed PPT as a PDF on Dec 02-03, 2026.\n\n" +
    "Best regards,\n" +
    "Organizing Committee, VELTRAXX 2.0\n" +
    "SIET Tech Park, Coimbatore\n";

  MailApp.sendEmail(leaderEmail, subject, body);
}

