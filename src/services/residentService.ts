import { db } from "../database/db";
import { Resident, LetterHistory } from "../types"; // ganti sesuai path kamu

export const getAllResidents = async (): Promise<Resident[]> => {
  return await db.residents.toArray();
};

export const saveLetterHistory = async (
  history: LetterHistory
): Promise<void> => {
  await db.letterHistory.add(history);
};

export const getLetterHistory = async (): Promise<LetterHistory[]> => {
  return await db.letterHistory.toArray();
};

export const deleteLetterHistory = async (id: number): Promise<void> => {
  await db.letterHistory.delete(id);
};
