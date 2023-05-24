const ExcelJS = require("exceljs");
const { buildingKeywords, floorKeywords, roomKeywords } = require("./keywords");

function extractData(text, apartmentPattern, floorRange, existingData = {}) {
  const buildingKeywordPattern = /\bTALO\s[A-Z]\b/gi;
  const floorKeywordPattern = /\d+\.\sKERROS/gi;
  const apartmentKeywordPattern = /AS\s\d+/gi;
  const roomKeywordPattern = /\b(OH|AH|KT|WC|KH|PARVEKE|MH|ET)\b/gi;

  let buildingMatches;
  while ((buildingMatches = buildingKeywordPattern.exec(text)) !== null) {
    const building = buildingMatches[0];

    if (!existingData[building]) {
      existingData[building] = {};
    }

    let floorMatches;
    while ((floorMatches = floorKeywordPattern.exec(text)) !== null) {
      const floor = floorMatches[0];

      if (!existingData[building][floor]) {
        existingData[building][floor] = {};
      }

      let apartmentMatches;
      while ((apartmentMatches = apartmentKeywordPattern.exec(text)) !== null) {
        const apartment = apartmentMatches[0];

        if (!existingData[building][floor][apartment]) {
          existingData[building][floor][apartment] = [];
        }

        const roomTypes = new Set();

        let roomMatches;
        while ((roomMatches = roomKeywordPattern.exec(text)) !== null) {
          console.log(roomMatches);
          const roomType = roomMatches[1];
          roomTypes.add(roomType);
        }
        existingData[building][floor][apartment] = Array.from(roomTypes);
      }
    }
  }

  return existingData;
}

function writeDataToExcel(data, outputFilePath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  let row = 1;

  for (const building in data) {
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
