export type Faculty = {
  id: string;
  name: string;
};

export type School = {
  id: string;
  name: string;
  facultyId: string;
};

export type Department = {
  id: string;
  name: string;
  schoolId: string;
};

export type Reason = {
  id: string;
  name: string;
};

export type ClearanceDataResponse = {
  faculties: Faculty[];
  schools: School[];
  departments: Department[];
  reasons: Reason[];
};