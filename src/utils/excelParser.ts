import XLSX from "xlsx";

/* Normalize header names */
const normalize = (key: string) =>
  key
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();

export const parseExcelBuffer = (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<any>(sheet, {
    defval: "",
    raw: false
  });

  if (!rawRows.length) {
    throw new Error("Excel sheet is empty");
  }

  // Normalize keys for every row
  const rows = rawRows.map((row) => {
    const normalizedRow: any = {};
    Object.keys(row).forEach((key) => {
      normalizedRow[normalize(key)] = row[key];
    });
    return normalizedRow;
  });

  const questions = rows.map((row, index) => {
    const rowNum = index + 2;
    const question = row["question"];
    const optionA = row["option a"];
    const optionB = row["option b"];
    const optionC = row["option c"];
    const optionD = row["option d"];
    const correct = row["correct answer"]?.toString().trim().toUpperCase();

    if (!question || !optionA || !optionB || !optionC || !optionD || !correct) {
      throw new Error(`Invalid or missing data at Excel row ${rowNum}`);
    }

    if (!["A", "B", "C", "D"].includes(correct)) {
      throw new Error(`Invalid correct answer at Excel row ${rowNum}`);
    }

    return {
      question: question.toString().trim(),
      options: [
        {key: "A", text: optionA.toString().trim()},
        {key: "B", text: optionB.toString().trim()},
        {key: "C", text: optionC.toString().trim()},
        {key: "D", text: optionD.toString().trim()}
      ],
      correctAnswer: correct,
      subject: row["subject"]?.toString().trim(),
      tags: row["tags"]
        ? row["tags"].toString().split(",").map((t: string) => t.trim())
        : [],
      explanation: row["explanation"]?.toString().trim(),
      difficulty: row["difficulty"]?.toString().trim(),
      type: row["type"]?.toString().trim(),
      source: row["source"]?.toString().trim(),
      year: Number(row["year"]) || 0
    };
  });
  return questions;
};
