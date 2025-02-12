/**
 * Google Apps Script to auto-fill an NxM range in Google Sheets
 * using OpenAI's GPT-4 API for contextual data generation.
 */

var API_KEY = "";  // Replace with your OpenAI API Key
var MODEL = "gpt-4";
var MAX_TOKENS = 20;
var TEMPERATURE = 0.3;

// Preface for structured responses
var preface = "I am an AI trained to answer questions about companies and their attributes. If I don't have an answer, I'll respond with 'Unknown'.\n\n";

/**
 * Adds a custom menu to Google Sheets for triggering the auto-fill function.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AI Tools')
    .addItem('Fill with GPT-4', 'gpt4Fill')
    .addToUi();
}

/**
 * Calls the OpenAI API to generate a response.
 */
function callOpenAI(prompt) {
  var data = {
    model: MODEL,
    messages: [{ role: "system", content: preface }, { role: "user", content: prompt }],
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    headers: {
      Authorization: 'Bearer ' + API_KEY,
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
  var jsonResponse = JSON.parse(response.getContentText());

  if (jsonResponse.choices && jsonResponse.choices.length > 0) {
    return jsonResponse.choices[0].message.content.trim();
  }
  return "Unknown";  // Default fallback
}

/**
 * Fills a selected range in Google Sheets with GPT-4-generated data.
 */
function gpt4Fill() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var numRows = range.getNumRows();
  var numCols = range.getNumColumns();

  for (var col = 2; col <= numCols; col++) {  // Skip first column (entity names)
    var propertyName = range.getCell(1, col).getValue();  // Header row value

    for (var row = 2; row <= numRows; row++) {  // Skip header row
      var entityName = range.getCell(row, 1).getValue();
      var cell = range.getCell(row, col);

      if (!entityName || !propertyName) continue;  // Skip empty cells

      var prompt = `Q: What is the ${propertyName} of ${entityName}?`;
      var response = callOpenAI(prompt);
      
      cell.setValue(response);
      Utilities.sleep(500);  // Prevent rate limit issues
    }
  }
}


