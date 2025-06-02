import { db } from './db';
import { Resident, CustomField, ResidentCustomField } from '../types';

export const residentService = {
  getAllResidents: async () => {
    return db.residents.toArray();
  },

  getResidentById: async (id: number) => {
    return db.residents.get(id);
  },

  getResidentByNik: async (nik: string) => {
    return db.residents.where('nik').equals(nik).first();
  },

  searchResidents: async (query: string) => {
    // Convert query to lowercase for case-insensitive search
    const lowerQuery = query.toLowerCase();
    
    return db.residents
      .filter(resident => 
        resident.name.toLowerCase().includes(lowerQuery) || 
        resident.nik.includes(query) ||
        resident.address.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  },

  addResident: async (resident: Resident) => {
    const existingResident = await db.residents.where('nik').equals(resident.nik).first();
    if (existingResident) {
      throw new Error('NIK sudah terdaftar');
    }
    
    const now = new Date();
    return db.residents.add({
      ...resident,
      createdAt: now,
      updatedAt: now
    });
  },

  updateResident: async (id: number, resident: Partial<Resident>) => {
    // If NIK is being changed, check if the new NIK exists for another resident
    if (resident.nik) {
      const existingResident = await db.residents.where('nik').equals(resident.nik).first();
      if (existingResident && existingResident.id !== id) {
        throw new Error('NIK sudah terdaftar oleh warga lain');
      }
    }
    
    await db.residents.update(id, {
      ...resident,
      updatedAt: new Date()
    });
    
    return db.residents.get(id);
  },

  deleteResident: async (id: number) => {
    // Check if there are letters associated with this resident
    const associatedLetters = await db.letters.where('residentId').equals(id).count();
    if (associatedLetters > 0) {
      throw new Error('Tidak dapat menghapus warga karena masih memiliki dokumen surat terkait');
    }
    
    // Delete associated custom fields
    await db.residentCustomFields.where('residentId').equals(id).delete();
    
    // Delete resident
    return db.residents.delete(id);
  },

  // Custom fields management
  getCustomFields: async () => {
    return db.customFields.toArray();
  },

  addCustomField: async (field: CustomField) => {
    const existingField = await db.customFields.where('name').equals(field.name).first();
    if (existingField) {
      throw new Error('Nama field sudah ada');
    }
    
    return db.customFields.add(field);
  },

  updateCustomField: async (id: number, field: Partial<CustomField>) => {
    if (field.name) {
      const existingField = await db.customFields.where('name').equals(field.name).first();
      if (existingField && existingField.id !== id) {
        throw new Error('Nama field sudah ada');
      }
    }
    
    await db.customFields.update(id, field);
    return db.customFields.get(id);
  },

  deleteCustomField: async (id: number) => {
    // Delete all resident values for this field
    await db.residentCustomFields.where('customFieldId').equals(id).delete();
    
    // Delete the field itself
    return db.customFields.delete(id);
  },

  // Resident custom field values
  getResidentCustomFields: async (residentId: number) => {
    return db.residentCustomFields
      .where('residentId')
      .equals(residentId)
      .toArray();
  },

  setResidentCustomField: async (residentId: number, customFieldId: number, value: string) => {
    const existing = await db.residentCustomFields
      .where('residentId')
      .equals(residentId)
      .and(item => item.customFieldId === customFieldId)
      .first();
    
    if (existing) {
      await db.residentCustomFields.update(existing.id!, { value });
      return existing.id;
    } else {
      return db.residentCustomFields.add({
        residentId,
        customFieldId,
        value
      });
    }
  }
};