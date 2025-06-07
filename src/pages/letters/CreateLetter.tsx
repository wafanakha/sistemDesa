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
    type: 'kelahiran',
    label: 'Surat Keterangan Kelahiran',
    description: 'Surat keterangan kelahiran anak.',
    path: '/letters/create/kelahiran',
  },
  // Tambahkan jenis surat lain sesuai kebutuhan
];

const CreateLetter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-teal-800">Buat Surat</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {letterTypes.map((lt) => (
          <Card key={lt.type} className="flex flex-col justify-between h-full">
            <div className="flex items-center mb-2">
              <FileText className="text-teal-600 mr-2" />
              <span className="font-semibold text-lg">{lt.label}</span>
            </div>
            <p className="text-gray-600 text-sm flex-1">{lt.description}</p>
            <Button
              className="mt-4 w-full"
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