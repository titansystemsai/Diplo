/**
 * DIPLO — Expression of Interest receiver
 * ---------------------------------------
 * Receives registrations from the DIPLO website form and appends them
 * to a Google Sheet — students and industry professionals to separate
 * tabs, one row per registration.
 *
 * Setup instructions: see SETUP.md
 */


// ─────────────────────────────────────────────────────────────────────
//  THE ONLY LINES YOU EVER NEED TO CHANGE
//
//  To send registrations to a different sheet, change SHEET_ID.
//  To rename either tab, change STUDENT_TAB / INDUSTRY_TAB — the script
//  creates whatever tab name it finds here.
//  Then: Deploy → Manage deployments → edit the existing one →
//        Version: "New version" → Deploy.  (The web app URL stays the
//        same, so the website never needs to be touched.)
// ─────────────────────────────────────────────────────────────────────

var SHEET_ID     = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
var STUDENT_TAB  = 'Students';
var INDUSTRY_TAB = 'Industry';

// ─────────────────────────────────────────────────────────────────────


var STUDENT_HEADERS = [
  'Timestamp',
  'Full name',
  'Email',
  'Phone',
  'University & degree',
  'Year level',
  'Interests',
  'Message'
];

var INDUSTRY_HEADERS = [
  'Timestamp',
  'Full name',
  'Email',
  'Phone',
  'Organisation',
  'Role / job title',
  'Primary area of expertise',
  'How they want to be involved',
  'Message'
];


/**
 * Runs automatically whenever the website form is submitted.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (isStudent_(data.role)) {
      getSheet_(STUDENT_TAB, STUDENT_HEADERS).appendRow([
        new Date(),
        data.name   || '',
        data.email  || '',
        data.phone  || '',
        data.degree || '',
        data.year   || '',
        data.interests || '',
        data.message   || ''
      ]);

    } else {
      // Anything that isn't explicitly a student is treated as industry.
      // The form only ever sends the two known values, so an unexpected
      // one means something changed on the website — warn rather than
      // drop the registration on the floor.
      if (data.role !== 'Industry professional') {
        console.warn('Unrecognised role "' + data.role + '" — filed under ' + INDUSTRY_TAB + '.');
      }

      getSheet_(INDUSTRY_TAB, INDUSTRY_HEADERS).appendRow([
        new Date(),
        data.name  || '',
        data.email || '',
        data.phone || '',
        data.org   || '',
        data.title || '',
        data.expertise || '',
        data.interests || '',
        data.message   || ''
      ]);
    }

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
 * Creates both tabs and their header rows if they don't exist yet, and
 * confirms the script can actually reach the spreadsheet.
 */
function setup() {
  if (SHEET_ID === 'PASTE_YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('Set SHEET_ID at the top of this file first — see SETUP.md step 2.');
  }
  var students = getSheet_(STUDENT_TAB, STUDENT_HEADERS);
  getSheet_(INDUSTRY_TAB, INDUSTRY_HEADERS);

  Logger.log('OK — registrations will be written to the "%s" and "%s" tabs of "%s".',
             STUDENT_TAB, INDUSTRY_TAB, students.getParent().getName());
}


/** True for the value the website sends when the Student toggle is on. */
function isStudent_(role) {
  return String(role || '').toLowerCase().indexOf('student') === 0;
}


/** Opens a tab, creating it with its headers on first use. */
function getSheet_(tabName, headers) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}


function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
