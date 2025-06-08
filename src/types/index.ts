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
  maritalStatus: "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati";
  marriageCertificate: boolean;
  marriageCertificateNumber?: string;
  divorceCertificate: boolean;
  divorceCertificateNumber?: string;
  birthCertificate: boolean;
  birthCertificateNumber?: string;
  education:
    | "Tidak/belum sekolah"
    | "Belum Tamat SD/Sederajat"
    | "Tamat SD/Sederajat"
    | "SLTP/Sederajat"
    | "SLTA/Sederajat"
    | "Diploma IV/Strata1"
    | "Diploma I/II"
    | "Akademi/Diploma III/S. Muda"
    | "Strata II"
    | "Strata III";
  religion: "Islam" | "Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
  bloodType?:
    | "A"
    | "B"
    | "O"
    | "AB"
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | "TIDAK TAHU";
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
  | "keramaian" // Tambahkan tipe keramaian
  | "custom"
  | "wali-nikah"
  | "pengantar-numpang-nikah"
  | "belum-menikah" // Tambahkan tipe belum menikah
  | "kematian" // Tambahkan tipe kematian
  | "pengantar-nikah" // Tambahkan tipe pengantar nikah
  | "permohonan-kehendak-nikah" // Tambahkan tipe permohonan kehendak nikah
  | "persetujuan-calon-pengantin" // Tambahkan tipe persetujuan calon pengantin
  | "izin-orang-tua"; // Tambahkan tipe izin orang tua

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
