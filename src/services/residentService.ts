import { db } from "../database/db";
import { Resident } from "../types"; // ganti sesuai path kamu

export const getAllResidents = async (): Promise<Resident[]> => {
  return await db.residents.toArray();
};
