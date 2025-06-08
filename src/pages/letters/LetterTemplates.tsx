import React from 'react';

const LetterTemplates: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-4 text-teal-800">Manajemen Template Surat</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-6 text-yellow-900">
        <p className="mb-2">Sistem template dinamis sudah <b>tidak digunakan</b> lagi.</p>
        <p>Setiap jenis surat kini memiliki form dan tampilan sesuai format aslinya. Silakan gunakan menu <b>Buat Surat</b> untuk membuat surat sesuai kebutuhan.</p>
      </div>
    </div>
  );
};

export default LetterTemplates;