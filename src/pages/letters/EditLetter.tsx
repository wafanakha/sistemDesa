import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { letterService } from '../../database/letterService';
import { Letter } from '../../types';
import CreateKeramaianLetter from './CreateKeramaianLetter';
import CreateUsahaLetter from './CreateUsahaLetter';
import CreateDomisiliLetter from './CreateDomisiliLetter';
import CreateTidakMampuLetter from './CreateTidakMampuLetter';
import CreatePengantarLetter from './CreatePengantarLetter';
import CreateKelahiranLetter from './CreateKelahiranLetter';
import Button from '../../components/ui/Button';

const EditLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLetter = async () => {
      if (!id) return;
      setLoading(true);
      const letterId = parseInt(id);
      const data = await letterService.getLetterById(letterId);
      if (!data) {
        setLetter(null);
        setLoading(false);
        return;
      }
      setLetter(data);
      setLoading(false);
    };
    fetchLetter();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Memuat data surat...</div>;
  }
  if (!letter) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Data surat tidak ditemukan.</p>
        <Button variant="primary" onClick={() => navigate('/letters')}>Kembali ke Daftar Surat</Button>
      </div>
    );
  }

  // Routing ke form edit spesifik sesuai jenis surat
  switch (letter.letterType) {
    case 'business':
      return <CreateUsahaLetter editData={letter} isEditMode />;
    case 'domicile':
      return <CreateDomisiliLetter editData={letter} isEditMode />;
    case 'poverty':
      return <CreateTidakMampuLetter editData={letter} isEditMode />;
    case 'introduction':
      return <CreatePengantarLetter editData={letter} isEditMode />;
    case 'birth':
      return <CreateKelahiranLetter editData={letter} isEditMode />;
    default:
      return (
        <div className="p-8 text-center">
          <p className="mb-4">Jenis surat tidak dikenali.</p>
          <Button variant="primary" onClick={() => navigate('/letters')}>Kembali ke Daftar Surat</Button>
        </div>
      );
  }
};

export default EditLetter;

// Tambahkan props opsional untuk mode edit pada setiap form surat
// EditLetter akan mengirimkan editData dan isEditMode ke form spesifik
// Pastikan signature props di setiap komponen form surat:
//   export default function CreateUsahaLetter({ editData, isEditMode }: { editData?: Letter, isEditMode?: boolean })
// dst.