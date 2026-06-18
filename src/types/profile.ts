// ─── Shared Profile Types ─────────────────────────────────────────────────────

export type Gender = "male" | "female";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Surgery = {
  _id?:          string;
  operationName: string;
  surgeonName:   string;
  date:          string;
  report:        string;
};

// ─── Section Form Values ──────────────────────────────────────────────────────

export type PersonalFormValues = {
  fullName:    string;
  phoneNumber: string;
  address:     string;
  age:         string; // string for input, convert to number on submit
  gender:      Gender | "";
};

export type MedicalHistoryFormValues = {
  bloodType: BloodType | "";
  allergies: string[];
  chronic:   string[];
  surgeries: Surgery[];
};

export type VitalsFormValues = {
  weight: string; // kg
  height: string; // cm
  pulse:  string; // bpm
};
