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

  const bloodTypes = [
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

  const shdks = ["Istri", "Anak", "Lainnya"] as const; // Kepala Keluarga assigned manually

  const generateNIK = (i: number) =>
    `3204${(100000000000 + i).toString().slice(1)}`;
  const generateKK = (i: number) =>
    `3210${(1000000000 + i).toString().slice(1)}`;
  const generateName = (index: number) => `Warga ${index + 1}`;

  const families = 2000; // Number of KK
  const residents: Resident[] = [];

  for (let i = 0; i < families; i++) {
    const kk = generateKK(i);
    const familySize = Math.floor(Math.random() * 5) + 2; // 2–6 members

    for (let j = 0; j < familySize; j++) {
      const gender = randomFromArray(genders);
      const birthDate = randomDate(new Date(1950, 0, 1), new Date(2020, 0, 1))
        .toISOString()
        .slice(0, 10);
      const age = new Date().getFullYear() - new Date(birthDate).getFullYear();

      const isHead = j === 0;
      const shdk = isHead ? "Kepala Keluarga" : randomFromArray(shdks);

      residents.push({
        kk,
        nik: generateNIK(idCounter),
        ktpEl: Math.random() < 0.8,
        name: generateName(idCounter),
        birthPlace: "Banyumas",
        birthDate,
        age,
        gender,
        address: "Jalan Mawar No. " + idCounter,
        rt: String(1 + (i % 5)).padStart(3, "0"),
        rw: String(1 + (i % 3)).padStart(3, "0"),
        shdk,
        maritalStatus: randomFromArray(maritalStatuses),
        marriageCertificate: Math.random() > 0.4,
        marriageCertificateNumber: "MCN" + idCounter,
        divorceCertificate: false,
        divorceCertificateNumber: undefined,
        birthCertificate: Math.random() > 0.2,
        birthCertificateNumber: "BCN" + idCounter,
        education: randomFromArray(educations),
        religion: randomFromArray(religions),
        bloodType: randomFromArray(bloodTypes),
        occupation: randomFromArray(pekerjaan),
        physicalDisability: "Tidak ada",
        fatherName: "Ayah " + generateName(i),
        motherName: "Ibu " + generateName(i),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      idCounter++;
    }
  }

  await db.residents.bulkAdd(residents);
  console.log("✅ Seeding selesai. Total:", residents.length);
};
