export interface Resident {
  id?: number;
  kk: string;
  nik: string;
  ktpEl: boolean;
  name: string;
  birthPlace: string;
  birthDate: string;
  age?: number;
  gender: "Laki-laki" | "Perempuan";
  address: string;
  rt: string;
  rw: string;
  shdk: "Kepala Keluarga" | "Anak" | "Istri" | "Lainnya";
  photoUrl?: string;
  maritalStatus: "Belum Kawin" | "Kawin Tercatat";
  marriageCertificate: boolean;
  marriageCertificateNumber?: string;
  divorceCertificate: boolean;
  divorceCertificateNumber?: string;
  birthCertificate: boolean;
  birthCertificateNumber?: string;
  education:
    | "Tidak/belum sekolah"
    | "Belum Tamat SD/Sederajat"
    | "SLTP/Sederajat"
    | "Diploma IV/Strata1";
  religion: "Islam" | "Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
  bloodType?: "A" | "B" | "O" | "AB";
  occupation: string;
  physicalDisability?:
    | "Tidak ada"
    | "Tuna Netra"
    | "Tuna Rungu"
    | "Tuna Daksa"
    | "Tuna Wicara"
    | "Dwarfsime"
    | "Cerebral Palsy";
  fatherName: string;
  motherName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomField {
  id?: number;
  name: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
  required: boolean;
}

export interface ResidentCustomField {
  id?: number;
  residentId: number;
  customFieldId: number;
  value: string;
}

export type LetterType =
  | "domicile"
  | "poverty"
  | "introduction"
  | "business"
  | "birth"
  | "custom";

export type LetterStatus = "draft" | "completed" | "signed";

export interface Letter {
  id?: number;
  letterNumber: string;
  letterType: LetterType;
  residentId: number;
  title: string;
  content: string;
  purpose?: string;
  issuedDate: Date;
  status: LetterStatus;
  signedBy?: string;
  signatureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LetterTemplateField {
  name: string; // key, e.g. 'name', 'nik', 'purpose'
  label: string; // label untuk form
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[]; // untuk select
}

export interface LetterTemplateSigner {
  name: string;
  title: string;
}

export interface LetterTemplate {
  id?: number;
  name: string;
  type: LetterType;
  template: string; // legacy, bisa diabaikan untuk surat baru
  isDefault: boolean;
  fields?: LetterTemplateField[]; // <-- Tambahan untuk form dinamis
  signers?: LetterTemplateSigner[]; // <-- Tambahan untuk penandatangan
  createdAt: Date;
  updatedAt: Date;
}

export interface VillageInfo {
  id?: number;
  name: string;
  address: string;
  districtName: string;
  regencyName: string;
  provinceName: string;
  postalCode: string;
  phoneNumber: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  leaderName: string;
  leaderTitle: string;
  signatureUrl?: string;
}
