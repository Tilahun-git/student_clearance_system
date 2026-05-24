export type EthiopianSemester = "1st" | "2nd";

export function getEthiopianAcademicContext(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const academicYear = month >= 9
    ? `${year}/${year + 1}`
    : `${year - 1}/${year}`;

  const semester: EthiopianSemester = month >= 9 && month <= 12
    ? "1st"
    : "2nd";

  return {
    academicYear,
    semester,
  };
}

export function getEthiopianSemesterLabel(semester: EthiopianSemester) {
  return semester === "1st" ? "1st Semester" : "2nd Semester";
}
