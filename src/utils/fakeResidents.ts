import { db } from "../database/db";
import { Resident } from "../types";

const randomFromArray = <T>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

let idCounter = 1;

export const seedResidents = async () => {
  const existing = await db.residents.count();
  if (existing > 0) return;

  const genders = ["Laki-laki", "Perempuan"] as const;
  const shdks = ["Kepala Keluarga", "Anak", "Istri", "Lainnya"] as const;
  const religions = [
    "Islam",
    "Protestan",
    "Katolik",
    "Hindu",
    "Buddha",
    "Konghucu",
  ] as const;
  const educations = [
    "Tidak/belum sekolah",
    "Belum Tamat SD/Sederajat",
    "Tamat SD/Sederajat",
    "SLTP/Sederajat",
    "SLTA/Sederajat",
    "Diploma IV/Strata1",
    "Diploma I/II",
    "Akademi/Diploma III/S. Muda",
    "Strata II",
    "Strata III",
  ] as const;
  const maritalStatuses = [
    "Belum Kawin",
    "Kawin",
    "Cerai Hidup",
    "Cerai Mati",
  ] as const;
  const pekerjaan = ["Petani", "Guru", "Pastor", "Swasta", "Pedagang"] as const;
  const bloodType = [
    ,
    "A",
    "B",
    "O",
    "AB",
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
    "TIDAK TAHU",
  ] as const;

  const generateNIK = (i: number) =>
    `3204${(100000000000 + i).toString().slice(1)}`;
  const generateKK = (i: number) =>
    `3210${(1000000000 + i).toString().slice(1)}`;
  const generateName = (index: number) => `Warga ${index + 1}`;
  const residents: Resident[] = Array.from({ length: 200 }).map((_, i) => {
    const gender = randomFromArray(genders);
    const birthDate = randomDate(new Date(1950, 0, 1), new Date(2020, 0, 1))
      .toISOString()
      .slice(0, 10);
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return {
      id: idCounter++,
      kk: generateKK(i),
      nik: generateNIK(i),
      ktpEl: Math.random() < 0.8,
      name: generateName(i),
      birthPlace: "Banyumas",
      birthDate: birthDate,
      age: age,
      gender,
      address: "Jalan Mawar No. " + (i + 1),
      rt: String(1 + (i % 5)).padStart(3, "0"),
      rw: String(1 + (Math.floor(i / 5) % 3)).padStart(3, "0"),
      shdk: randomFromArray(shdks),
      maritalStatus: randomFromArray(maritalStatuses),
      marriageCertificate: Math.random() > 0.4,
      marriageCertificateNumber: "MCN" + i,
      divorceCertificate: false,
      divorceCertificateNumber: undefined,
      birthCertificate: Math.random() > 0.2,
      birthCertificateNumber: "BCN" + i,
      education: randomFromArray(educations),
      religion: randomFromArray(religions),
      bloodType: randomFromArray(bloodType),
      occupation: randomFromArray(pekerjaan),
      physicalDisability: "Tidak ada",
      fatherName: "Ayah " + generateName(i),
      motherName: "Ibu " + generateName(i),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await db.residents.bulkAdd(residents);
  console.log("Seeding completed.");
};
