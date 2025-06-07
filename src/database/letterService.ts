import { db } from './db';
import { Letter, LetterTemplate, LetterType } from '../types';

export const letterService = {
  // Letter management
  getAllLetters: async () => {
    return db.letters.toArray();
  },

  getLetterById: async (id: number) => {
    return db.letters.get(id);
  },

  getLettersByResident: async (residentId: number) => {
    return db.letters.where('residentId').equals(residentId).toArray();
  },

  searchLetters: async (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    return db.letters
      .filter(letter => 
        letter.title.toLowerCase().includes(lowerQuery) || 
        letter.letterNumber.includes(query)
      )
      .toArray();
  },

  generateLetterNumber: async (letterType: LetterType) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Get count of letters of this type in the current year
    const count = await db.letters
      .filter(letter => {
        const letterYear = letter.issuedDate.getFullYear();
        return letter.letterType === letterType && letterYear === year;
      })
      .count();
    
    // Generate letter number format: 001/LTR-TYPE/MONTH/YEAR
    const typeCode = getLetterTypeCode(letterType);
    const formattedCount = String(count + 1).padStart(3, '0');
    const formattedMonth = String(month).padStart(2, '0');
    
    return `${formattedCount}/${typeCode}/${formattedMonth}/${year}`;
  },

  addLetter: async function (letter: Letter) { // Ubah ke function agar 'this' merujuk ke letterService
    if (!letter.letterNumber) {
      letter.letterNumber = await letterService.generateLetterNumber(letter.letterType);
    }
    const now = new Date();
    return db.letters.add({
      ...letter,
      createdAt: now,
      updatedAt: now
    });
  },

  updateLetter: async (id: number, letter: Partial<Letter>) => {
    await db.letters.update(id, {
      ...letter,
      updatedAt: new Date()
    });
    
    return db.letters.get(id);
  },

  deleteLetter: async (id: number) => {
    return db.letters.delete(id);
  },

  // Letter templates
  getAllTemplates: async () => {
    return db.letterTemplates.toArray();
  },

  getTemplatesByType: async (type: LetterType) => {
    return db.letterTemplates.where('type').equals(type).toArray();
  },

  getDefaultTemplateByType: async (type: LetterType) => {
    return db.letterTemplates
      .where('type')
      .equals(type)
      .and(template => template.isDefault === true)
      .first();
  },

  addTemplate: async (template: LetterTemplate) => {
    // If this is set as default, unset other defaults of the same type
    if (template.isDefault) {
      await db.letterTemplates
        .where('type')
        .equals(template.type)
        .and(t => t.isDefault === true)
        .modify({ isDefault: false });
    }
    
    const now = new Date();
    return db.letterTemplates.add({
      ...template,
      createdAt: now,
      updatedAt: now
    });
  },

  updateTemplate: async (id: number, template: Partial<LetterTemplate>) => {
    // If this is set as default, unset other defaults of the same type
    if (template.isDefault) {
      const currentTemplate = await db.letterTemplates.get(id);
      if (currentTemplate) {
        await db.letterTemplates
          .where('type')
          .equals(currentTemplate.type)
          .and(t => t.isDefault === true && t.id !== id)
          .modify({ isDefault: false });
      }
    }
    
    await db.letterTemplates.update(id, {
      ...template,
      updatedAt: new Date()
    });
    
    return db.letterTemplates.get(id);
  },

  deleteTemplate: async (id: number) => {
    const template = await db.letterTemplates.get(id);
    
    // Prevent deletion of the last template of a type
    if (template) {
      const countOfType = await db.letterTemplates
        .where('type')
        .equals(template.type)
        .count();
      
      if (countOfType <= 1) {
        throw new Error('Tidak dapat menghapus template terakhir untuk jenis surat ini');
      }
      
      // If this was the default template, make another one default
      if (template.isDefault) {
        const anotherTemplate = await db.letterTemplates
          .where('type')
          .equals(template.type)
          .and(t => t.id !== id)
          .first();
        
        if (anotherTemplate) {
          await db.letterTemplates.update(anotherTemplate.id!, { isDefault: true });
        }
      }
    }
    
    return db.letterTemplates.delete(id);
  }
};

// Helper function to get letter type code
function getLetterTypeCode(type: LetterType): string {
  switch (type) {
    case 'domicile': return 'KET-DOM';
    case 'poverty': return 'KET-TDK-MAMPU';
    case 'introduction': return 'PENGANTAR';
    case 'business': return 'KET-USAHA';
    case 'birth': return 'KET-LAHIR';
    case 'keramaian': return 'KERAMAIAN'; // Tambahkan kode untuk keramaian
    case 'custom': return 'CUSTOM';
    case 'wali-nikah': return 'WN';
    default: return 'SURAT';
  }
}