/**
 * BizFlow AtoZ — Google Apps Script Backend for Cloud State Persistence
 * 
 * [SECURITY / DEV NOTICE]
 * DEV_SINGLE_USER_MODE: This Web App is designed for single-developer MVP testing.
 * Do NOT store sensitive PII, SSN/Resident IDs, passwords, bank credentials, or secret API keys.
 *
 * Sheet: "app_state"
 * Columns: [key, json_value, updated_at]
 */

const SHEET_NAME = 'app_state';

/**
 * Initializes the spreadsheet with required sheet and headers.
 * Run this function once from the Apps Script editor after creating the sheet.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Set headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 3).setValues([['key', 'json_value', 'updated_at']]);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#E2E8F0');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 600);
    sheet.setColumnWidth(3, 200);
  }
  
  Logger.log('Setup completed successfully for sheet: ' + SHEET_NAME);
}

/**
 * Helper to get or auto-create the app_state sheet.
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  return sheet;
}

/**
 * Creates a JSON response with proper MIME type.
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Handles HTTP GET requests.
 * Supported actions:
 *  - HEALTH: Returns { status: 'ok', timestamp: ... }
 *  - GET_ALL_STATE: Returns all saved app state (projects, checklists, activeProjectId, etc.)
 *  - GET_STATE: Returns state for a specific key (?action=GET_STATE&key=projects)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'GET_ALL_STATE';

    if (action === 'HEALTH') {
      return createJsonResponse({
        success: true,
        status: 'ok',
        service: 'BizFlow AtoZ Cloud Storage',
        timestamp: new Date().toISOString(),
      });
    }

    const sheet = getSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      // Empty state
      return createJsonResponse({
        success: true,
        data: {
          projects: [],
          checklists: {},
          activeProjectId: '',
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const stateMap = {};
    let latestUpdate = '';

    for (var i = 0; i < data.length; i++) {
      var rowKey = String(data[i][0]).trim();
      var rawVal = data[i][1];
      var rowTime = String(data[i][2]);

      if (rowKey) {
        try {
          stateMap[rowKey] = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
        } catch (parseErr) {
          stateMap[rowKey] = rawVal;
        }
        if (rowTime && rowTime > latestUpdate) {
          latestUpdate = rowTime;
        }
      }
    }

    if (action === 'GET_STATE') {
      var targetKey = params.key || 'projects';
      return createJsonResponse({
        success: true,
        key: targetKey,
        data: stateMap[targetKey] !== undefined ? stateMap[targetKey] : null,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: GET_ALL_STATE
    var fullState = {
      projects: Array.isArray(stateMap['projects']) ? stateMap['projects'] : [],
      checklists: typeof stateMap['checklists'] === 'object' && stateMap['checklists'] !== null ? stateMap['checklists'] : {},
      activeProjectId: stateMap['activeProjectId'] || stateMap['active_project_id'] || '',
      updatedAt: latestUpdate || new Date().toISOString(),
      version: '1.0.0',
    };

    return createJsonResponse({
      success: true,
      data: fullState,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.message || String(err),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handles HTTP POST requests.
 * Uses text/plain body payload to avoid browser CORS preflight errors.
 * Supported actions:
 *  - SAVE_ALL_STATE: Saves full state object { projects, checklists, activeProjectId }
 *  - SAVE_PROJECTS: Saves projects array
 *  - SAVE_CHECKLIST: Saves checklist completions
 *  - SAVE_ACTIVE_ID: Saves active project ID
 */
function doPost(e) {
  try {
    var rawBody = '';
    if (e && e.postData && e.postData.contents) {
      rawBody = e.postData.contents;
    } else if (e && e.parameter && e.parameter.payload) {
      rawBody = e.parameter.payload;
    }

    if (!rawBody) {
      return createJsonResponse({
        success: false,
        error: '요청 본문(payload)이 비어있습니다.',
      });
    }

    var reqData;
    try {
      reqData = JSON.parse(rawBody);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: 'JSON 파싱 실패: ' + parseErr.message,
      });
    }

    var action = reqData.action || 'SAVE_ALL_STATE';
    var payload = reqData.payload !== undefined ? reqData.payload : reqData;
    var nowStr = new Date().toISOString();

    var sheet = getSheet();

    if (action === 'SAVE_ALL_STATE') {
      var state = payload;
      if (state.projects !== undefined) {
        upsertKey(sheet, 'projects', JSON.stringify(state.projects), nowStr);
      }
      if (state.checklists !== undefined) {
        upsertKey(sheet, 'checklists', JSON.stringify(state.checklists), nowStr);
      }
      if (state.activeProjectId !== undefined) {
        upsertKey(sheet, 'activeProjectId', JSON.stringify(state.activeProjectId), nowStr);
      }
      upsertKey(sheet, 'last_full_sync', JSON.stringify(nowStr), nowStr);

      return createJsonResponse({
        success: true,
        message: '전체 애플리케이션 상태가 클라우드에 성공적으로 저장되었습니다.',
        timestamp: nowStr,
      });
    }

    if (action === 'SAVE_PROJECTS') {
      upsertKey(sheet, 'projects', JSON.stringify(payload), nowStr);
      return createJsonResponse({
        success: true,
        message: '프로젝트 목록이 저장되었습니다.',
        timestamp: nowStr,
      });
    }

    if (action === 'SAVE_CHECKLIST') {
      var currentChecklists = {};
      var existingRow = findKeyRow(sheet, 'checklists');
      if (existingRow > 0) {
        var rawVal = sheet.getRange(existingRow, 2).getValue();
        try {
          currentChecklists = JSON.parse(rawVal) || {};
        } catch (_) {}
      }
      if (payload.projectId && payload.completions) {
        currentChecklists[payload.projectId] = payload.completions;
      } else if (typeof payload === 'object') {
        currentChecklists = payload;
      }
      upsertKey(sheet, 'checklists', JSON.stringify(currentChecklists), nowStr);
      return createJsonResponse({
        success: true,
        message: '체크리스트 상태가 저장되었습니다.',
        timestamp: nowStr,
      });
    }

    if (action === 'SAVE_ACTIVE_ID') {
      upsertKey(sheet, 'activeProjectId', JSON.stringify(payload), nowStr);
      return createJsonResponse({
        success: true,
        message: '활성 프로젝트 ID가 저장되었습니다.',
        timestamp: nowStr,
      });
    }

    return createJsonResponse({
      success: false,
      error: '알 수 없는 action: ' + action,
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.message || String(err),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Finds row number for a given key (1-indexed). Returns 0 if not found.
 */
function findKeyRow(sheet, key) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;
  var keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i][0]).trim() === String(key).trim()) {
      return i + 2;
    }
  }
  return 0;
}

/**
 * Inserts or updates a key-value row in app_state.
 */
function upsertKey(sheet, key, jsonValue, timestamp) {
  var row = findKeyRow(sheet, key);
  if (row > 0) {
    sheet.getRange(row, 2, 1, 2).setValues([[jsonValue, timestamp]]);
  } else {
    sheet.appendRow([key, jsonValue, timestamp]);
  }
}
