## A Quick ToDo Application using Gsheet

 [https://dev-arindam-roy.github.io/gsheet-lineup/‌](https://dev-arindam-roy.github.io/gsheet-lineup/)

### Google Apps Script Code

```
const app = SpreadsheetApp;
const sheetUrl = "YOUR_GOOGLE_SHEET_URL";
const accessSheet = app.openByUrl(sheetUrl);
const todoSheet = accessSheet.getSheetByName("YOUR_SHEET_NAME");

function doGet(req) {
  let dataKey = req.parameter.dataKey;
  if(dataKey == "todos") {
    return ContentService.createTextOutput(getAllRows(todoSheet));
  }
  let obj = {data:[]}
  return ContentService.createTextOutput(JSON.stringify(obj));
}

function doPost(req) {
  let data = JSON.parse(req.postData.contents);
  if(data.actionkey == "SAVE") {
    return ContentService.createTextOutput(addSaveRow(todoSheet, data));
  }
  if(data.actionkey == "UPDATE") {
    return ContentService.createTextOutput(updateSaveRow(todoSheet, data));
  }
  if(data.actionkey == "DELETE") {
    return ContentService.createTextOutput(deleteRow(todoSheet, data));
  }
  if(data.actionkey == "CLEAR-ALL") {
    return ContentService.createTextOutput(clearSheet());
  }
}

function addSaveRow(sheetName, jsonObjData) {
  sheetName.appendRow([jsonObjData.id, jsonObjData.name, jsonObjData.status]);
  //sheetName.appendRow(Object.values(jsonObjData));
  return "SUCCESS";
}

function updateSaveRow(sheetName, jsonObjData) {
  let sheetRowNo = getRowId(sheetName, jsonObjData.id);
  if(sheetRowNo && sheetRowNo != '' && sheetRowNo != 0) {
    sheetName.getRange(sheetRowNo, 2).setValue(jsonObjData.name);
    sheetName.getRange(sheetRowNo, 3).setValue(jsonObjData.status);
    return "SUCCESS";
  }
  return "ERROR";
}

function getAllRows(sheetName) {
  let obj = {};
  let data = sheetName.getDataRange().getValues();
  //data.shift(); //discard the first row
  obj = {
    data: data
  }
  return JSON.stringify(obj);
}

function deleteRow(sheetName, jsonObjData) {
  let sheetRowNo = getRowId(sheetName, jsonObjData.id);
  if(sheetRowNo && sheetRowNo != '' && sheetRowNo != 0) {
    sheetName.deleteRow(sheetRowNo);
    return "SUCCESS";
  } else {
    return "ERROR";
  }
}

function getRowId(sheetName, textId) {
  let findData = sheetName.createTextFinder(textId).matchEntireCell(true).findNext();
  if(findData) {
    return findData.getRow();
  }
  return 0;
}

function clearSheet() {
  //Logger.log(todoSheet.clear({contentsOnly: true}));
  todoSheet.clear({contentsOnly: true});
  return "SUCCESS";
}

```