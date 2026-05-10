/**
 * Google Apps Script for syncing Daikin Connect Photos.
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code there and paste this entire file.
 * 4. Click the Save icon (floppy disk).
 * 5. Refresh your Spreadsheet. You will see a new menu "Daikin Connect" next to "Help".
 * 6. Click "Daikin Connect" > "Sync Photos".
 * 7. (Optional) It might ask for permissions the first time. Allow it.
 */

const API_URL = 'https://daikin-connect.com/api/v1/sync/photos?project_id=1';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Daikin Connect')
      .addItem('Sync Photos', 'syncPhotosFromAPI')
      .addToUi();
}

function syncPhotosFromAPI() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const ui = SpreadsheetApp.getUi();

  ui.alert('Sync Started', 'Fetching photos from database. Please wait...', ui.ButtonSet.OK);

  try {
    // 1. Fetch data from API
    const response = UrlFetchApp.fetch(API_URL);
    const result = JSON.parse(response.getContentText());
    
    if (!result.success || !result.data) {
      ui.alert('Error', 'Failed to fetch data from API.', ui.ButtonSet.OK);
      return;
    }

    const photosData = result.data;
    
    // Create a lookup dictionary by tenant and unit
    const photoLookup = {};
    photosData.forEach(item => {
      // Normalize function similar to our backend
      const normTenant = item.tenant.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const normUnit = item.unit_tag.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (normTenant) photoLookup[normTenant] = item.photos;
      if (normUnit) photoLookup[normUnit] = item.photos;
    });

    let updatedCount = 0;

    // 2. Iterate through spreadsheet (assuming headers are in row 1, data starts row 2)
    // Columns: A=No, B=Tenant/Unit, C... K=Dok 1, L=Dok 2, M=Dok 3
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const colB = String(row[1] || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); // Tenant/Unit
      
      // If we find a match in our dictionary
      if (colB && photoLookup[colB]) {
        const photos = photoLookup[colB];
        
        // Update Column K (index 10), L (index 11), M (index 12)
        if (photos[0] && !row[10]) { sheet.getRange(i + 1, 11).setValue(photos[0]); }
        if (photos[1] && !row[11]) { sheet.getRange(i + 1, 12).setValue(photos[1]); }
        if (photos[2] && !row[12]) { sheet.getRange(i + 1, 13).setValue(photos[2]); }
        
        updatedCount++;
      }
    }

    ui.alert('Sync Complete', `Successfully checked and updated photos for ${updatedCount} rows.`, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Error', `An error occurred: ${error.toString()}`, ui.ButtonSet.OK);
  }
}
