import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText } from 'lucide-react';

const letterTypes = [
  {
    type: 'keramaian',
    label: 'Surat Keterangan Keramaian',
    description: 'Surat izin keramaian untuk acara atau kegiatan masyarakat.',
    path: '/letters/create/keramaian',
  },
  {
    type: 'usaha',
    label: 'Surat Keterangan Usaha',
    description: 'Surat keterangan untuk keperluan usaha atau UMKM.',
    path: '/letters/create/usaha',
  },
  {
    type: 'domisili',
    label: 'Surat Keterangan Domisili',
    description: 'Surat keterangan domisili tempat tinggal.',
    path: '/letters/create/domisili',
  },
  {
    type: 'tidak-mampu',
    label: 'Surat Keterangan Tidak Mampu',
    description: 'Surat keterangan untuk keperluan bantuan atau beasiswa.',
    path: '/letters/create/tidak-mampu',
  },
  {
    type: 'pengantar',
    label: 'Surat Pengantar',
    description: 'Surat pengantar untuk berbagai keperluan administrasi.',
    path: '/letters/create/pengantar',
  },
  {
    type: 'keterangan',
    label: 'Surat Keterangan',
    description: 'Surat keterangan umum untuk berbagai keperluan warga (bukan domisili, usaha, dsb).',
    path: '/letters/create/keterangan',
  },
  {
    type: 'domisili-usaha',
    label: 'Surat Keterangan Domisili Usaha',
    description: 'Surat keterangan domisili untuk keperluan usaha/perusahaan.',
    path: '/letters/create/domisili-usaha',
  },
  {
    type: 'skck',
    label: 'Surat Pengantar Catatan Kepolisian (SKCK)',
    description: 'Surat pengantar untuk keperluan SKCK di kepolisian.',
    path: '/letters/create/skck',
  },
  {
    type: 'ahli-waris',
    label: 'Surat Keterangan Ahli Waris',
    description: 'Surat keterangan untuk penetapan ahli waris dari anggota keluarga.',
    path: '/letters/create/ahli-waris',
  },
  {
    type: 'wali-nikah',
    label: 'Surat Keterangan Wali Nikah',
    description: 'Surat keterangan wali nikah tanpa kop, sesuai format desa.',
    path: '/letters/create/wali-nikah',
  },
  // Tambahkan jenis surat lain sesuai kebutuhan
];

const CreateLetter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-left text-teal-800">Buat Surat</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-start items-stretch">
        {letterTypes.map((lt) => (
          <Card key={lt.type} className="flex flex-col justify-between h-full shadow-md border border-gray-100">
            <div className="flex items-center mb-2">
              <FileText className="text-teal-600 mr-2" />
              <span className="font-semibold text-base lg:text-lg">{lt.label}</span>
            </div>
            <p className="text-gray-600 text-sm flex-1 mb-2">{lt.description}</p>
            <Button
              className="mt-2 w-full"
              variant="primary"
              onClick={() => navigate(lt.path)}
            >
              Buat Surat
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreateLetter;