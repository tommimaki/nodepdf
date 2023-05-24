const { buildingKeywords, floorKeywords, roomKeywords } = require("./keywords");
const ExcelJS = require("exceljs");


function preprocessText(text) {
  // Replace sequences of '\r\n' with a single space
  let preprocessedText = text.replace(/(\\r\\n)+/g, ' ');

  // Replace 'n' or '\' immediately before or after the room type keywords
  preprocessedText = preprocessedText.replace(/(\\|n)?\b(OH|AH|KT|WC|KH|PARVEKE|MH|ET)\b(\\|n)?/gi, '$2');

  return preprocessedText;
}
function extractData(text, apartmentPattern, floorRange, existingData = {}) {
  const buildingKeywordPattern = /\bTALO\s[A-Z]\b/gi;
  const floorKeywordPattern = /\d+\.\sKERROS/gi;
  const apartmentKeywordPattern = /\bAS\s\d+\b/gi;
  const roomKeywordPattern = /\b(OH|AH|KT|WC|KH|PARVEKE|MH|ET)\b/gi;

  // Preprocess the text before extraction
  let preprocessedText = preprocessText(text);

  let buildingMatches;
  while ((buildingMatches = buildingKeywordPattern.exec(preprocessedText)) !== null) {
    const building = buildingMatches[0];

    if (!existingData[building]) {
      existingData[building] = {};
    }

    let floorMatches;
    while ((floorMatches = floorKeywordPattern.exec(preprocessedText)) !== null) {
      const floor = floorMatches[0];

      if (!existingData[building][floor]) {
        existingData[building][floor] = {};
      }

      let apartmentMatches;
      while ((apartmentMatches = apartmentKeywordPattern.exec(preprocessedText)) !== null) {
        const apartment = apartmentMatches[0].toUpperCase(); // convert all to uppercase


        if (!existingData[building][floor][apartment]) {
          existingData[building][floor][apartment] = [];
        }

        const roomTypes = new Set();

        let roomMatches;
        while ((roomMatches = roomKeywordPattern.exec(preprocessedText)) !== null) {
          const roomType = roomMatches[1];
          roomTypes.add(roomType);
        }
        existingData[building][floor][apartment] = Array.from(roomTypes);
      }
    }
  }

  return existingData;
}



// function extractData(text, existingData = {}) {
//   let preprocessedText = preprocessText(text);

//   console.log(preprocessedText)
//   // Then perform the data extraction on the cleaned up text
//   const buildings = preprocessedText.match(/\bTALO\s[A-Z]\b/gi) || [];
//   const floors = preprocessedText.match(/\d+\.\sKERROS/gi) || [];
//   const apartments = preprocessedText.match(/AS\s\d+/gi) || [];
//   const rooms = preprocessedText.match(/\b(OH|AH|KT|WC|KH|PARVEKE|MH|ET)\b/gi) || [];

//   for (const building of buildings) {
//     if (!existingData[building]) {
//       existingData[building] = {};
//     }
//     for (const floor of floors) {
//       if (!existingData[building][floor]) {
//         existingData[building][floor] = {};
//       }
//       for (const apartment of apartments) {
//         if (!existingData[building][floor][apartment]) {
//           existingData[building][floor][apartment] = [];
//         }
//         for (const room of rooms) {
//           if (!existingData[building][floor][apartment].includes(room)) {
//             existingData[building][floor][apartment].push(room);
//           }
//         }
//       }
//     }
//   }

//   return existingData;
// }




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
      sheet.getCell(row, 3).value = floor;
      row += 1;

      const apartments = floors[floor];
      for (const apartment in apartments) {
        sheet.getCell(row, 1).value = "Asunto";
        sheet.getCell(row, 4).value = apartment;
        row += 1;

        const rooms = apartments[apartment];
        for (const room of rooms) {
          sheet.getCell(row, 1).value = "Tila";
          sheet.getCell(row, 5).value = room;
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
