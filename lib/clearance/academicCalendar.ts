export type EthiopianSemester = "1st" | "2nd";

export const ETHIOPIAN_SEMESTERS = ["1st", "2nd"] as const;

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

export function isValidEthiopianSemester(value: string | null | undefined): value is EthiopianSemester {
  return value === "1st" || value === "2nd";
}

export function resolveAcademicContext(
  payload?: { academicYear?: string; semester?: string },
  date = new Date(),
) {
  const currentContext = getEthiopianAcademicContext(date);
  const semesterInput = payload?.semester?.trim();

  if (semesterInput && !isValidEthiopianSemester(semesterInput)) {
    throw new Error("Invalid semester selected");
  }

  return {
    academicYear: payload?.academicYear?.trim() || currentContext.academicYear,
    semester: (semesterInput as EthiopianSemester | undefined) ?? currentContext.semester,
  };
}

export function getEthiopianSemesterLabel(semester: EthiopianSemester) {
  return semester === "1st" ? "1st Semester" : "2nd Semester";
}
