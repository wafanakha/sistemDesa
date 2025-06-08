import Dexie, { Table } from "dexie";
import {
  Resident,
  CustomField,
  ResidentCustomField,
  Letter,
  LetterTemplate,
  VillageInfo,
  LetterType,
  LetterHistory,
} from "../types";

class VillageAdministrationDB extends Dexie {
  residents!: Table<Resident, number>;
  customFields!: Table<CustomField, number>;
  residentCustomFields!: Table<ResidentCustomField, number>;
  letters!: Table<Letter, number>;
  letterTemplates!: Table<LetterTemplate, number>;
  villageInfo!: Table<VillageInfo, number>;
  letterHistory!: Table<LetterHistory, number>;

  constructor() {
    super("VillageAdministrationDB");

    this.version(1).stores({
      residents:
        "++id, kk, nik, name, birthDate, gender, address, rt, rw, religion, occupation, maritalStatus, createdAt, updatedAt",
      customFields: "++id, name, type, required",
      residentCustomFields: "++id, residentId, customFieldId, value",
      letters:
        "++id, letterNumber, letterType, residentId, title, issuedDate, status, createdAt, updatedAt",
      letterTemplates: "++id, name, type, isDefault, createdAt, updatedAt",
      villageInfo: "++id, name",
      letterHistory: "++id, name, letter, date, nik",
    });

    // Initialize default templates
    this.on("ready", async () => {
      const count = await this.letterTemplates.count();
      if (count === 0) {
        await this.initializeDefaultTemplates();
      }

      const villageCount = await this.villageInfo.count();
      if (villageCount === 0) {
        await this.initializeVillageInfo();
      }
    });
  }

  async initializeDefaultTemplates() {
    const now = new Date();
    const defaultTemplates = [
      {
        name: "Surat Keterangan Domisili",
        type: "domicile" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
        
Adalah benar warga yang berdomisili di [RESIDENT_ADDRESS], Desa [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Tidak Mampu",
        type: "poverty" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Berdasarkan pengamatan kami, yang bersangkutan adalah benar termasuk keluarga tidak mampu/prasejahtera di Desa [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Pengantar",
        type: "introduction" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini memberikan pengantar kepada:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Usaha",
        type: "business" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Adalah benar memiliki usaha [BUSINESS_TYPE] yang berlokasi di [BUSINESS_ADDRESS], Desa [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Kelahiran",
        type: "birth" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Telah lahir seorang anak:
        
Nama: [CHILD_NAME]
Tempat/Tanggal Lahir: [BIRTH_PLACE], [BIRTH_DATE]
Jenis Kelamin: [CHILD_GENDER]
        
Dari pasangan suami istri:
        
Nama Ayah: [FATHER_NAME]
NIK Ayah: [FATHER_NIK]
Nama Ibu: [MOTHER_NAME]
NIK Ibu: [MOTHER_NIK]
Alamat: [PARENTS_ADDRESS]
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await this.letterTemplates.bulkAdd(defaultTemplates);
  }

  async initializeVillageInfo() {
    const defaultVillageInfo: VillageInfo = {
      name: "Desa Contoh",
      address: "Jl. Desa No. 1",
      districtName: "Kecamatan Contoh",
      regencyName: "Kabupaten Contoh",
      provinceName: "Provinsi Contoh",
      postalCode: "12345",
      phoneNumber: "021-1234567",
      email: "desa.contoh@example.com",
      website: "www.desacontoh.id",
      leaderName: "Bpk. Kepala Desa",
      leaderTitle: "Kepala Desa",
    };

    await this.villageInfo.add(defaultVillageInfo);
  }

  async exportData() {
    return {
      residents: await this.residents.toArray(),
      customFields: await this.customFields.toArray(),
      residentCustomFields: await this.residentCustomFields.toArray(),
      letters: await this.letters.toArray(),
      letterTemplates: await this.letterTemplates.toArray(),
      villageInfo: await this.villageInfo.toArray(),
    };
  }

  async importData(data: any) {
    return this.transaction(
      "rw",
      this.residents,
      this.customFields,
      this.residentCustomFields,
      this.letters,
      this.letterTemplates,
      this.villageInfo,
      async () => {
        // Clear existing data
        await Promise.all([
          this.residents.clear(),
          this.customFields.clear(),
          this.residentCustomFields.clear(),
          this.letters.clear(),
          this.letterTemplates.clear(),
          this.villageInfo.clear(),
        ]);

        // Import new data
        if (data.villageInfo?.length)
          await this.villageInfo.bulkAdd(data.villageInfo);
        if (data.residents?.length)
          await this.residents.bulkAdd(data.residents);
        if (data.customFields?.length)
          await this.customFields.bulkAdd(data.customFields);
        if (data.residentCustomFields?.length)
          await this.residentCustomFields.bulkAdd(data.residentCustomFields);
        if (data.letterTemplates?.length)
          await this.letterTemplates.bulkAdd(data.letterTemplates);
        if (data.letters?.length) await this.letters.bulkAdd(data.letters);
      }
    );
  }
}

export const db = new VillageAdministrationDB();
