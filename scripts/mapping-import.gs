/**
 * chemlessons.xyz — Mapping-sheet resource importer (Google Apps Script)
 *
 * A container-bound script for the two mapping spreadsheets. It adds a
 * "chemlessons ▸ Import resources…" menu that opens a dialog where you drop in
 * files, assign each one's column values (title, kind, audience, …), and hit
 * Import. Each file is uploaded STRAIGHT INTO the final site-account Unit folder
 * (chemlessons.xyz — Public/<Course>/Unit NN — … or the Educators Only tree),
 * named `U## · Kind · Title`, shared, and a fully-populated row is appended.
 *
 * Because the file is born in its final home with its final id, there is NO copy
 * step afterward — the row carries the published ids (marked `direct-publish` in
 * Flags, id in the new `Published id` column). `/add-content` wires these rows
 * into js/data.js and seeds v1 without re-copying.
 *
 * This file also carries the existing "🚗 Drive Paths ▸ Get Breadcrumbs for
 * Selection" tool (getBatchDrivePaths, below), so it is the ONE script for the
 * sheet — replace the old script's contents with this whole file so there's a
 * single onOpen() building both menus.
 *
 * SETUP (once per sheet, run as the site account chemlessons.xyz@gmail.com):
 *   1. Open the mapping sheet →  Extensions ▸ Apps Script.
 *        Conceptual  sheet: 199nnfyJbGvmEIeDgPgW8IUBmKWsguwJ5NGwQPYQ12SI
 *        Mathematical sheet: 1bmrYDdO1TpK9Q8own-nggHhY6dlZBCEI9NGPByLdvmk
 *   2. Replace your existing code file's contents with this whole file (it
 *      already includes your Drive-breadcrumbs tool, so don't keep the old copy
 *      — two onOpen() functions would clobber each other). Add an HTML file
 *      named `mapping-import` with the contents of mapping-import.html.
 *   3. Set CONFIG.course below to "Conceptual" or "Mathematical" for THIS sheet.
 *   4. (Only if you'll convert Office files) Services ＋ → add "Drive API".
 *   5. Reload the sheet; run once from each menu to authorize.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Config — set `course` per sheet. Folder ids are the site-account roots.
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  course: 'Conceptual', // ← set to 'Conceptual' or 'Mathematical' for this sheet
  folders: {
    Conceptual:   { public: '13d6fnulTHe5LYlbFJNLAAvwD8BC0fFy5', educators: '1at7Fg2GQpmK-wXB7SfXxoc3Zbmkz7R0p' },
    Mathematical: { public: '1UUOHxNV9AfL4R7uB4QKscg-nV5o72R7m', educators: '15nCBoPgRLuKDdYnA1Oq3dvptdVR3f6tN' },
  },
};

const KINDS     = ['notebook', 'slides', 'assignment', 'lab', 'activity', 'assessment'];
const AUDIENCES = ['public', 'educators'];
const INCLUDES  = ['yes', 'no', 'REVIEW'];

// google.script.run caps parameter payloads; keep single files comfortably under.
const MAX_FILE_BYTES = 40 * 1024 * 1024;

// The two columns this tool adds so `/add-content` knows a row is already final.
const EXTRA_HEADERS = ['Published id', 'Published at (UTC)'];

const MIME_FORMAT = {
  'application/pdf': 'pdf',
  'application/vnd.google-apps.document': 'gdoc',
  'application/vnd.google-apps.presentation': 'gslides',
  'application/vnd.google-apps.spreadsheet': 'gsheet',
  'application/vnd.google-apps.form': 'gform',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
};

// Office source → Google target mime, for the per-file "convert" toggle.
const CONVERT_TARGET = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.google-apps.document',
  'application/msword': 'application/vnd.google-apps.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'application/vnd.google-apps.presentation',
  'application/vnd.ms-powerpoint': 'application/vnd.google-apps.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'application/vnd.google-apps.spreadsheet',
  'application/vnd.ms-excel': 'application/vnd.google-apps.spreadsheet',
};
const EXT_TARGET = {
  doc: 'application/vnd.google-apps.document',
  docx: 'application/vnd.google-apps.document',
  ppt: 'application/vnd.google-apps.presentation',
  pptx: 'application/vnd.google-apps.presentation',
  xls: 'application/vnd.google-apps.spreadsheet',
  xlsx: 'application/vnd.google-apps.spreadsheet',
};

// ─────────────────────────────────────────────────────────────────────────────
// Menu + dialog
// ─────────────────────────────────────────────────────────────────────────────
/** Single entry point — builds BOTH the importer and the Drive-paths menus. */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('chemlessons')
    .addItem('Import resources…', 'showImportDialog')
    .addToUi();
  ui.createMenu('🚗 Drive Paths')
    .addItem('Get Breadcrumbs for Selection', 'getBatchDrivePaths')
    .addToUi();
}

function showImportDialog() {
  const html = HtmlService.createHtmlOutputFromFile('mapping-import')
    .setWidth(760)
    .setHeight(660);
  SpreadsheetApp.getUi().showModalDialog(html, 'Import resources');
}

/** Config the dialog needs to render (course label + dropdown vocab). */
function getConfig() {
  const cfg = resolveConfig_();
  return { course: cfg.course, prefix: cfg.prefix, kinds: KINDS, audiences: AUDIENCES, includes: INCLUDES };
}

// ─────────────────────────────────────────────────────────────────────────────
// The one server call the dialog makes, once per file.
//   batch = { unit, unitName, seq }
//   file  = { name, mimeType, bytesBase64, title, kind, audience, include, convert, honors }
// Returns { ok, rowId, fileId, name, url, format, folder } or { ok:false, error, name }.
// ─────────────────────────────────────────────────────────────────────────────
function importOne(batch, file) {
  try {
    const cfg = resolveConfig_();
    const sheet = getMappingSheet_();

    const unit = String(batch.unit == null ? '' : batch.unit).trim();
    const unitName = String(batch.unitName || '').trim();
    if (unit === '') throw new Error('Unit is required.');
    if (unitName === '') throw new Error('Drive unit name is required.');
    if (!file || !file.bytesBase64) throw new Error('No file data received.');

    const title = String(file.title || '').trim();
    const kind = String(file.kind || '').trim();
    if (!title) throw new Error('Title is required.');
    if (KINDS.indexOf(kind) === -1) throw new Error('Kind "' + kind + '" is not one of: ' + KINDS.join(', '));

    const audience = AUDIENCES.indexOf(file.audience) !== -1 ? file.audience : 'public';
    const include = INCLUDES.indexOf(file.include) !== -1 ? file.include : 'yes';

    // Decode + rebuild the blob.
    const bytes = Utilities.base64Decode(file.bytesBase64);
    if (bytes.length > MAX_FILE_BYTES) {
      throw new Error('File is ' + Math.round(bytes.length / 1048576) + ' MB — over the ' +
        Math.round(MAX_FILE_BYTES / 1048576) + ' MB dialog-upload limit. Upload it to Drive manually and add its row by hand.');
    }
    const blob = Utilities.newBlob(bytes, file.mimeType || 'application/octet-stream', file.name || title);

    // Destination folder: the right course tree → the Unit NN folder (created if missing).
    const rootId = CONFIG.folders[cfg.course][audience === 'educators' ? 'educators' : 'public'];
    const folder = findOrCreateUnitFolder_(rootId, unit, unitName);
    const cleanName = buildName_(unit, kind, title);

    // Create the file — convert Office→Google when asked, else store as-is.
    let fileId, finalMime;
    const target = file.convert ? googleTargetMime_(file.mimeType, file.name) : null;
    if (target) {
      fileId = createConverted_(blob, cleanName, folder.getId(), target);
      finalMime = target;
    } else {
      const f = folder.createFile(blob);
      f.setName(cleanName);
      fileId = f.getId();
      finalMime = f.getMimeType();
    }

    const driveFile = DriveApp.getFileById(fileId);
    // Public resources are link-viewable (belt-and-suspenders with the shared root);
    // educators-only files stay restricted and are shared per-teacher after verification.
    if (audience !== 'educators') {
      try { driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* domain policy */ }
    }
    const url = driveFile.getUrl();
    const format = mimeToFormat_(finalMime);
    const rowId = nextRowId_(sheet, cfg.prefix);
    const nowUtc = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm'Z'");

    writeRow_(sheet, {
      'RowID': rowId,
      'Course': cfg.course,
      'Unit': unit,
      'Drive unit name': unitName,
      'Seq': String(batch.seq || ''),
      'Proposed title': title,
      'Kind': kind,
      'Audience': audience,
      'Honors variant': String(file.honors || ''),
      'Formats': format,
      'Include': include,
      'Flags': 'direct-publish',
      'Preview': url,
      'View file id': fileId,
      'Copy file id': fileId,
      'All ids': fileId,
      'Drive title': cleanName,
      'Published id': fileId,
      'Published at (UTC)': nowUtc,
    });

    return { ok: true, rowId: rowId, fileId: fileId, name: cleanName, url: url, format: format, folder: folder.getName() };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err), name: file && file.name };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function resolveConfig_() {
  const course = CONFIG.course;
  if (course !== 'Conceptual' && course !== 'Mathematical') {
    throw new Error('Set CONFIG.course to "Conceptual" or "Mathematical" at the top of the script.');
  }
  const folders = CONFIG.folders[course];
  if (!folders || !folders.public || !folders.educators) {
    throw new Error('CONFIG.folders is missing ids for ' + course + '.');
  }
  return { course: course, prefix: course === 'Conceptual' ? 'C' : 'M' };
}

/** The tab holding the mapping data — the first sheet whose row 1 has "RowID". */
function getMappingSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const cols = Math.max(1, sheets[i].getLastColumn());
    const header = sheets[i].getRange(1, 1, 1, cols).getValues()[0].map(String);
    if (header.indexOf('RowID') !== -1) return sheets[i];
  }
  return sheets[0];
}

/** Read row 1, append EXTRA_HEADERS if absent, return the full header array. */
function ensureHeaders_(sheet) {
  const cols = Math.max(1, sheet.getLastColumn());
  const headers = sheet.getRange(1, 1, 1, cols).getValues()[0].map(String);
  let changed = false;
  EXTRA_HEADERS.forEach(function (h) {
    if (headers.indexOf(h) === -1) { headers.push(h); changed = true; }
  });
  if (changed) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return headers;
}

/** Append one row, placing each value under its header by name (order-independent). */
function writeRow_(sheet, valuesByHeader) {
  const headers = ensureHeaders_(sheet);
  const row = new Array(headers.length).fill('');
  Object.keys(valuesByHeader).forEach(function (key) {
    const idx = headers.indexOf(key);
    if (idx >= 0) row[idx] = valuesByHeader[key];
  });
  sheet.appendRow(row);
}

/** Next `C####` / `M####`, scanning column A (so repeated calls stay unique). */
function nextRowId_(sheet, prefix) {
  const last = sheet.getLastRow();
  let max = 0;
  if (last >= 2) {
    const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    const re = new RegExp('^' + prefix + '(\\d+)$');
    for (let i = 0; i < ids.length; i++) {
      const m = re.exec(String(ids[i][0]).trim());
      if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
    }
  }
  return prefix + ('0000' + (max + 1)).slice(-4);
}

/** Reuse `Unit NN — …` in the course root (match by number), else create it. */
function findOrCreateUnitFolder_(rootId, unit, unitName) {
  const root = DriveApp.getFolderById(rootId);
  const re = new RegExp('^Unit\\s*0*' + Number(unit) + '(\\b|\\s|—|-)');
  const it = root.getFolders();
  while (it.hasNext()) {
    const f = it.next();
    if (re.test(f.getName())) return f;
  }
  return root.createFolder('Unit ' + pad2_(unit) + ' — ' + unitName);
}

function buildName_(unit, kind, title) {
  return 'U' + pad2_(unit) + ' · ' + capitalize_(kind) + ' · ' + title;
}

function pad2_(n) { return ('0' + String(parseInt(n, 10) || 0)).slice(-2); }
function capitalize_(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function mimeToFormat_(m) { return MIME_FORMAT[m] || (m ? String(m).split('/').pop() : ''); }
function ext_(name) { const m = /\.([^.]+)$/.exec(String(name || '')); return m ? m[1].toLowerCase() : ''; }

function googleTargetMime_(mimeType, name) {
  return CONVERT_TARGET[mimeType] || EXT_TARGET[ext_(name)] || null;
}

/** Convert an uploaded Office blob to a Google-native file via the Advanced Drive Service. */
function createConverted_(blob, name, folderId, targetMime) {
  if (typeof Drive === 'undefined' || !Drive.Files) {
    throw new Error('To convert Office files, enable the Advanced Drive Service: script editor → Services ＋ → add "Drive API", then retry.');
  }
  if (typeof Drive.Files.create === 'function') { // Drive API v3
    const created = Drive.Files.create({ name: name, parents: [folderId], mimeType: targetMime }, blob, { supportsAllDrives: true });
    return created.id;
  }
  if (typeof Drive.Files.insert === 'function') { // Drive API v2 fallback
    const created = Drive.Files.insert({ title: name, parents: [{ id: folderId }], mimeType: targetMime }, blob, { convert: true, supportsAllDrives: true });
    return created.id;
  }
  throw new Error('Drive advanced service is present but exposes neither create nor insert.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Drive breadcrumbs — reads the selected cells (Drive URL or file id) and writes
// each file's folder path into the column immediately to the right. (Kept from
// the original per-sheet script; wired into the merged onOpen above.)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Processes the selected cells, finds their Drive paths,
 * and writes them to the column immediately to the right.
 */
function getBatchDrivePaths() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getActiveRange();
  var values = range.getValues();

  var startRow = range.getRow();
  var startCol = range.getColumn();
  var numRows = range.getNumRows();

  // Create an array to hold the output paths
  var outputValues = [];

  for (var i = 0; i < values.length; i++) {
    var cellValue = values[i][0].toString().trim();

    if (!cellValue) {
      outputValues.push([""]);
      continue;
    }

    // Extract File ID if it's a URL
    var fileId = cellValue;
    if (cellValue.indexOf("/d/") > -1) {
      fileId = cellValue.split("/d/")[1].split("/")[0];
    } else if (cellValue.indexOf("id=") > -1) {
      fileId = cellValue.split("id=")[1].split("&")[0];
    }

    try {
      var file = DriveApp.getFileById(fileId);
      var path = [];
      var parents = file.getParents();

      while (parents.hasNext()) {
        var folder = parents.next();
        path.unshift(folder.getName());
        parents = folder.getParents();
      }

      outputValues.push([path.length > 0 ? path.join(" > ") : "My Drive (Root)"]);
    } catch (e) {
      outputValues.push(["Error: File not found/No permission"]);
    }
  }

  // Write the results to the column immediately to the right of the selection
  var targetRange = sheet.getRange(startRow, startCol + 1, numRows, 1);
  targetRange.setValues(outputValues);

  SpreadsheetApp.getUi().alert('Finished processing ' + numRows + ' rows!');
}
