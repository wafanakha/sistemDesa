export interface Resident {
  id?: number;
  nik: string;
  name: string;
  address: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  religion: string;
  occupation: string;
  maritalStatus: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomField {
  id?: number;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
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
  | 'domicile' 
  | 'poverty' 
  | 'introduction' 
  | 'business' 
  | 'birth' 
  | 'custom';

export type LetterStatus = 
  | 'draft' 
  | 'completed' 
  | 'signed';

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

export interface LetterTemplate {
  id?: number;
  name: string;
  type: LetterType;
  template: string;
  isDefault: boolean;
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