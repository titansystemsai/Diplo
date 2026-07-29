/**
 * DIPLO — Expression of Interest receiver
 * ---------------------------------------
 * Receives registrations from the DIPLO website form and appends them
 * to a Google Sheet, one row per registration.
 *
 * Setup instructions: see SETUP.md
 */


// ─────────────────────────────────────────────────────────────────────
//  THE ONLY TWO LINES YOU EVER NEED TO CHANGE
//
//  To send registrations to a different sheet, change SHEET_ID.
//  To send them to a different tab, change TAB_NAME.
//  Then: Deploy → Manage deployments → edit the existing one →
//        Version: "New version" → Deploy.  (The web app URL stays the
//        same, so the website never needs to be touched.)
// ─────────────────────────────────────────────────────────────────────

var SHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
var TAB_NAME = 'Registrations';

// ─────────────────────────────────────────────────────────────────────


var HEADERS = [
  'Timestamp',
  'Registering as',
  'Full name',
  'Email',
  'Phone',
  'University & degree',
  'Year level',
  'Organisation',
  'Role / job title',
  'Primary area of expertise',
  'Interests / involvement',
  'Message'
];


/**
 * Runs automatically whenever the website form is submitted.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      data.role || '',
      data.name || '',
      data.email || '',
      data.phone || '',
      data.degree || '',       // students only
      data.year || '',         // students only
      data.org || '',          // industry only
      data.title || '',        // industry only
      data.expertise || '',    // industry only
      data.interests || '',
      data.message || ''
    ]);

    return json_({ ok: true });

  } catch (err) {
    // Errors are logged rather than thrown, so a malformed submission
    // never takes the endpoint down for everyone else.
    console.error('EOI submission failed: ' + err + ' :: ' + (e && e.postData ? e.postData.contents : 'no body'));
    return json_({ ok: false, error: String(err) });
  }
}


/**
 * Run this once from the editor after deploying.
 * Creates the tab and header row if they don't exist yet, and confirms
 * the script can actually reach the spreadsheet.
 */
function setup() {
  if (SHEET_ID === 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('Set SHEET_ID at the top of this file first — see SETUP.md step 2.');
  }
  var sheet = getSheet_();
  Logger.log('OK — registrations will be written to the "%s" tab of "%s".',
             TAB_NAME, sheet.getParent().getName());
}


/** Opens the target tab, creating it with headers on first use. */
function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}


function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
