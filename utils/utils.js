const ExcelJS = require("exceljs");
const { buildingKeywords, floorKeywords, roomKeywords } = require("./keywords");

function extractData(text, apartmentPattern, floorRange) {
  console.log("apartmentPattern", apartmentPattern, "floorRange", floorRange);
  const buildingsData = {};

  const buildingKeywordPattern = /\bTALO\s[A-Z]\b/gi;
  const floorKeywordPattern = /\d+\.\sKERROS/gi;
  const apartmentKeywordPattern = /AS\s\d+/gi;
  const roomKeywordPattern = /\b(OH|AH|KT|MH|ET|PARVEKE)\b/gi;

  let buildingMatches;
  while ((buildingMatches = buildingKeywordPattern.exec(text)) !== null) {
    const building = buildingMatches[0];

    if (!buildingsData[building]) {
      buildingsData[building] = {};
    }

    let floorMatches;
    while ((floorMatches = floorKeywordPattern.exec(text)) !== null) {
      const floor = floorMatches[0];

      if (!buildingsData[building][floor]) {
        buildingsData[building][floor] = {};
      }

      let apartmentMatches;
      while ((apartmentMatches = apartmentKeywordPattern.exec(text)) !== null) {
        const apartment = apartmentMatches[0];

        if (!buildingsData[building][floor][apartment]) {
          buildingsData[building][floor][apartment] = {};
        }

        let roomMatches;
        while ((roomMatches = roomKeywordPattern.exec(text)) !== null) {
          const roomType = roomMatches[0];

          if (!buildingsData[building][floor][apartment][roomType]) {
            buildingsData[building][floor][apartment][roomType] = "";
          }
        }
      }
    }
  }

  console.log("buildingsData", buildingsData);
  return buildingsData;
}

function writeDataToExcel(data, outputFilePath) {
  //   console.log("data", data);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  let row = 1;

  // Loop over each building in the data
  for (const building in data) {
    // Write the building information to the sheet
    sheet.getCell(row, 1).value = "Rakennus";
    sheet.getCell(row, 2).value = building;
    row += 1;

    const floors = data[building];
    for (const floor in floors) {
      sheet.getCell(row, 1).value = "Kerros";
      sheet.getCell(row, 3).value = `Kerros ${floor}`;
      row += 1;

      const apartments = floors[floor];
      for (const apartment in apartments) {
        sheet.getCell(row, 1).value = "Asunto";
        sheet.getCell(row, 4).value = apartment;
        row += 1;

        const rooms = apartments[apartment];
        for (const room in rooms) {
          sheet.getCell(row, 1).value = "Tila";
          sheet.getCell(row, 5).value = room;
          sheet.getCell(row, 6).value = rooms[room];
          row += 1;
        }
      }
    }
  }

  console.log("FINISHED");
  return workbook.xlsx.writeFile(outputFilePath);
}

module.exports = {
  extractData,
  writeDataToExcel,
};
