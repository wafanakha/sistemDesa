import { db } from './db';
import { VillageInfo } from '../types';

export const villageService = {
  getVillageInfo: async () => {
    // There should only be one village info record
    const villageInfo = await db.villageInfo.toArray();
    return villageInfo[0] || null;
  },

  updateVillageInfo: async (info: Partial<VillageInfo>) => {
    const existingInfo = await db.villageInfo.toArray();
    
    if (existingInfo.length > 0) {
      const id = existingInfo[0].id!;
      await db.villageInfo.update(id, info);
      return db.villageInfo.get(id);
    } else {
      // If no village info exists yet, create a new one
      const id = await db.villageInfo.add({
        name: info.name || 'Desa Contoh',
        address: info.address || 'Jl. Desa No. 1',
        districtName: info.districtName || 'Kecamatan Contoh',
        regencyName: info.regencyName || 'Kabupaten Contoh',
        provinceName: info.provinceName || 'Provinsi Contoh',
        postalCode: info.postalCode || '12345',
        phoneNumber: info.phoneNumber || '021-1234567',
        email: info.email || 'desa.contoh@example.com',
        website: info.website || 'www.desacontoh.id',
        leaderName: info.leaderName || 'Bpk. Kepala Desa',
        leaderTitle: info.leaderTitle || 'Kepala Desa',
        ...info
      });
      return db.villageInfo.get(id);
    }
  },

  setVillageLogo: async (logoUrl: string) => {
    const existingInfo = await db.villageInfo.toArray();
    
    if (existingInfo.length > 0) {
      const id = existingInfo[0].id!;
      await db.villageInfo.update(id, { logoUrl });
      return db.villageInfo.get(id);
    } else {
      throw new Error('Informasi desa belum ada');
    }
  },

  setLeaderSignature: async (signatureUrl: string) => {
    const existingInfo = await db.villageInfo.toArray();
    
    if (existingInfo.length > 0) {
      const id = existingInfo[0].id!;
      await db.villageInfo.update(id, { signatureUrl });
      return db.villageInfo.get(id);
    } else {
      throw new Error('Informasi desa belum ada');
    }
  }
};