import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation, WidthType, BorderStyle, Table, TableRow, TableCell } from 'docx';
import { jsPDF } from 'jspdf';
import { db } from '../database/db';
import { villageService } from '../database/villageService';
import { residentService } from '../database/residentService';
import { Letter, Resident, VillageInfo } from '../types';

export const exportService = {
  // Database export/import
  exportDatabase: async () => {
    const data = await db.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `backup-administrasi-desa-${new Date().toISOString().slice(0, 10)}.json`);
  },

  importDatabase: async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (event.target?.result) {
            const data = JSON.parse(event.target.result as string);
            await db.importData(data);
            resolve(true);
          } else {
            reject(new Error('Failed to read file'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  },

  // Document exports
  exportLetterToPdf: async (letter: Letter, resident: Resident, villageInfo: VillageInfo) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add letterhead
      await addLetterheadToPdf(doc, villageInfo);
      
      // Add letter content
      const yPos = 60; // Start position after letterhead
      const lineHeight = 7;
      let currentY = yPos;
      
      // Title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(letter.title.toUpperCase(), 105, currentY, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(80, currentY + 3, 130, currentY + 3);
      doc.text(`Nomor: ${letter.letterNumber}`, 105, currentY + 10, { align: 'center' });
      
      currentY += 25;
      
      // Content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Split content into paragraphs and render
      const paragraphs = letter.content.split('\n\n');
      
      paragraphs.forEach(paragraph => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        // Handle paragraph that might be longer than one line
        const textLines = doc.splitTextToSize(paragraph, 180);
        doc.text(textLines, 15, currentY);
        currentY += textLines.length * lineHeight + 5;
      });
      
      // Add signature section
      currentY += 10;
      const dateString = `${villageInfo.name}, ${formatDate(letter.issuedDate)}`;
      doc.text(dateString, 140, currentY);
      currentY += lineHeight;
      doc.text(villageInfo.leaderTitle, 140, currentY);
      
      // Add space for signature
      currentY += 30;
      
      // Add signature image if available
      if (villageInfo.signatureUrl) {
        try {
          const img = new Image();
          img.src = villageInfo.signatureUrl;
          doc.addImage(img, 'PNG', 140, currentY - 25, 40, 20);
        } catch (e) {
          console.error('Error adding signature image:', e);
        }
      }
      
      // Add leader name
      doc.setFont('helvetica', 'bold');
      doc.text(villageInfo.leaderName, 140, currentY);
      doc.setLineWidth(0.5);
      doc.line(140, currentY + 2, 190, currentY + 2);
      
      // Save the PDF
      doc.save(`${letter.letterNumber.replace(/\//g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },

  exportLetterToDocx: async (letter: Letter, resident: Resident, villageInfo: VillageInfo) => {
    try {
      // Create header with village info
      const header = createLetterHeader(villageInfo);
      
      // Create document title
      const title = new Paragraph({
        text: letter.title.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      });
      
      const letterNumber = new Paragraph({
        text: `Nomor: ${letter.letterNumber}`,
        alignment: AlignmentType.CENTER
      });
      
      // Create content paragraphs
      const contentParagraphs = letter.content.split('\n\n').map(text => 
        new Paragraph({ text })
      );
      
      // Create signature section
      const dateString = `${villageInfo.name}, ${formatDate(letter.issuedDate)}`;
      const dateSection = new Paragraph({
        text: dateString,
        alignment: AlignmentType.RIGHT
      });
      
      const positionSection = new Paragraph({
        text: villageInfo.leaderTitle,
        alignment: AlignmentType.RIGHT
      });
      
      // Add space for signature
      const signatureSpace = [];
      for (let i = 0; i < 3; i++) {
        signatureSpace.push(new Paragraph({ text: "" }));
      }
      
      const nameSection = new Paragraph({
        children: [
          new TextRun({
            text: villageInfo.leaderName,
            bold: true
          })
        ],
        alignment: AlignmentType.RIGHT
      });
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1000,
                  right: 1000,
                  bottom: 1000,
                  left: 1000
                }
              }
            },
            children: [
              ...header,
              title,
              letterNumber,
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              ...contentParagraphs,
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              dateSection,
              positionSection,
              ...signatureSpace,
              nameSection
            ]
          }
        ]
      });
      
      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      saveAs(blob, `${letter.letterNumber.replace(/\//g, '-')}.docx`);
      
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      throw error;
    }
  }
};

// Helper function to add letterhead to PDF
async function addLetterheadToPdf(doc: jsPDF, villageInfo: VillageInfo) {
  // Add village logo if available
  if (villageInfo.logoUrl) {
    try {
      const img = new Image();
      img.src = villageInfo.logoUrl;
      doc.addImage(img, 'PNG', 15, 15, 20, 20);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }
  
  // Add village information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PEMERINTAH ' + villageInfo.regencyName.toUpperCase(), 105, 15, { align: 'center' });
  doc.text('KECAMATAN ' + villageInfo.districtName.toUpperCase(), 105, 22, { align: 'center' });
  doc.setFontSize(18);
  doc.text('DESA ' + villageInfo.name.toUpperCase(), 105, 30, { align: 'center' });
  
  // Add address
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const addressText = `${villageInfo.address}, Kode Pos ${villageInfo.postalCode}`;
  const contactText = `Telp: ${villageInfo.phoneNumber}`;
  const websiteText = villageInfo.website ? `Website: ${villageInfo.website}` : '';
  
  doc.text(addressText, 105, 38, { align: 'center' });
  doc.text(contactText + (websiteText ? ` - ${websiteText}` : ''), 105, 43, { align: 'center' });
  
  // Add line
  doc.setLineWidth(1);
  doc.line(15, 47, 195, 47);
  doc.setLineWidth(0.5);
  doc.line(15, 49, 195, 49);
}

// Helper function to create letterhead for DOCX
function createLetterHeader(villageInfo: VillageInfo): Paragraph[] {
  // Create village header text
  const headerParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'PEMERINTAH ' + villageInfo.regencyName.toUpperCase(),
          bold: true,
          size: 28
        })
      ],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'KECAMATAN ' + villageInfo.districtName.toUpperCase(),
          bold: true,
          size: 28
        })
      ],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'DESA ' + villageInfo.name.toUpperCase(),
          bold: true,
          size: 32
        })
      ],
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: `${villageInfo.address}, Kode Pos ${villageInfo.postalCode}`,
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: `Telp: ${villageInfo.phoneNumber}${villageInfo.website ? ` - Website: ${villageInfo.website}` : ''}`,
      alignment: AlignmentType.CENTER
    }),
  ];
  
  // Create horizontal line
  const table = new Table({
    rows: [
      new TableRow({
        cells: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [new Paragraph("")]
          })
        ]
      })
    ],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
  
  const secondLine = new Table({
    rows: [
      new TableRow({
        cells: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [new Paragraph("")]
          })
        ]
      })
    ],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
  
  return [
    ...headerParagraphs,
    new Paragraph({ children: [table] }),
    new Paragraph({ children: [secondLine] }),
    new Paragraph({ text: "" })
  ];
}

// Helper function to format dates
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('id-ID', options);
}