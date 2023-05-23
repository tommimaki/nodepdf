const buildingKeywords = [
  "rakennus",
  "rakennus a",
  "rakennus b",
  "rakennus c",
  "rakennus d",
  "rakennus E",
  "talo",
  "talo a",
  "talo b",
  "talo c",
  "talo d",
  "talo e",
];
const floorKeywords = ["kerros", "kerrokset", "krs", "vesikatto", "kellari"];
const apartmentKeywords = ["as \\d+", "a \\d+", "b \\d+", "c \\d+"];
const roomKeywords = [
  "et",
  "ah",
  "kt",
  "mh",
  "oh",
  "kph",
  "kh",
  "wc",
  "eteinen",
  "aula",
  "keittiö",
  "makuuhuone",
  "olohuone",
  "kylpyhuone",
  "kodinhoitohuone",
  "vaatehuone",
  "terassi",
  "parveke",
];

module.exports = {
  buildingKeywords,
  floorKeywords,
  apartmentKeywords,
  roomKeywords,
};
