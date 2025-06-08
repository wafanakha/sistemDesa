import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, FileText, Trash2, Edit, Eye, FilePlus } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { villageService } from '../../database/villageService';
import { Letter, Resident } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const LettersList: React.FC = () => {
  const [letters, setLetters] = useState<(Letter & { residentName?: string })[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<(Letter & { residentName?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    setIsLoading(true);
    try {
      const data = await letterService.getAllLetters();

      // Get resident names for each letter
      const lettersWithNames = await Promise.all(
        data.map(async (letter) => {
          const resident = await residentService.getResidentById(letter.residentId);
          return {
            ...letter,
            residentName: resident ? resident.name : 'Unknown'
          };
        })
      );

      setLetters(lettersWithNames);
      setFilteredLetters(lettersWithNames);
    } catch (error) {
      console.error('Error loading letters:', error);
      toast.error('Gagal memuat data surat');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLetters(letters);
    } else {
      const filtered = letters.filter(
        letter =>
          letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          letter.letterNumber.includes(searchQuery) ||
          (letter.residentName && letter.residentName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredLetters(filtered);
    }
  }, [searchQuery, letters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteClick = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLetter) return;

    try {
      await letterService.deleteLetter(selectedLetter.id!);
      toast.success('Surat berhasil dihapus');
      loadLetters();
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Gagal menghapus surat');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedLetter(null);
    }
  };

  const getLetterTypeLabel = (type: string) => {
    switch (type) {
      case 'domicile': return 'Keterangan Domisili';
      case 'poverty': return 'Keterangan Tidak Mampu';
      case 'introduction': return 'Pengantar';
      case 'business': return 'Keterangan Usaha';
      case 'birth': return 'Keterangan Kelahiran';
      case 'custom': return 'Kustom';
      case 'pengantar-numpang-nikah': return 'Pengantar Numpang Nikah';
      case 'belum-menikah': return 'Pernyataan Belum Menikah';
      case 'kematian': return 'Keterangan Kematian (N6)';
      case 'pengantar-nikah': return 'Pengantar Nikah (N1)';
      case 'permohonan-kehendak-nikah': return 'Permohonan Kehendak Nikah (N2)';
      case 'persetujuan-calon-pengantin': return 'Persetujuan Calon Pengantin (N4)';
      case 'izin-orang-tua': return 'Surat Izin Orang Tua (N5)';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'signed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }

    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      completed: 'Selesai',
      signed: 'Ditandatangani'
    };

    return (
      <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const columns = [
    {
      header: 'No. Surat',
      accessor: (letter: Letter & { residentName?: string }) => letter.letterNumber
    },
    {
      header: 'Judul',
      accessor: (letter: Letter & { residentName?: string }) => letter.title
    },
    {
      header: 'Jenis',
      accessor: (letter: Letter & { residentName?: string }) => getLetterTypeLabel(letter.letterType)
    },
    {
      header: 'Warga',
      accessor: (letter: Letter & { residentName?: string }) => letter.residentName || ''
    },
    {
      header: 'Tanggal',
      accessor: (letter: Letter & { residentName?: string }) => {
        const dateObj = typeof letter.issuedDate === 'string' ? new Date(letter.issuedDate) : letter.issuedDate;
        return dateObj && typeof dateObj.toLocaleDateString === 'function'
          ? dateObj.toLocaleDateString('id-ID')
          : '-';
      }
    },
    {
      header: 'Status',
      accessor: (letter: Letter & { residentName?: string }) => getStatusBadge(letter.status)
    },
    {
      header: 'Aksi',
      accessor: (letter: Letter & { residentName?: string }) => (
        <div className="flex space-x-2">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              // await openPreviewModal(letter);
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Preview"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(letter);
            }}
            className="p-1 text-red-600 hover:text-red-800"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Surat</h2>

        <Button
          variant="primary"
          icon={<FilePlus size={18} />}
          onClick={() => navigate('/letters/create')}
        >
          Buat Surat
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan nomor, judul, atau nama warga..."
            value={searchQuery}
            onChange={handleSearch}
            startIcon={<Search size={18} />}
            fullWidth
          />
        </div>

        <Table
          columns={columns}
          data={filteredLetters}
          keyField="id"
          onRowClick={(letter) => {
            let path = '';
            switch (letter.letterType) {
              case 'pengantar-numpang-nikah':
                path = '/letters/create/pengantar-numpang-nikah';
                break;
              case 'belum-menikah':
                path = '/letters/create/belum-menikah';
                break;
              case 'pengantar-nikah':
                path = '/letters/create/pengantar-nikah';
                break;
              case 'permohonan-kehendak-nikah':
                path = '/letters/create/permohonan-kehendak-nikah';
                break;
              case 'persetujuan-calon-pengantin':
                path = '/letters/create/persetujuan-calon-pengantin';
                break;
              case 'izin-orang-tua':
                path = '/letters/create/izin-orang-tua';
                break;
              case 'domicile':
                path = '/letters/create/domisili';
                break;
              case 'poverty':
                path = '/letters/create/tidak-mampu';
                break;
              case 'introduction':
                path = '/letters/create/pengantar';
                break;
              case 'business':
                path = '/letters/create/usaha';
                break;
              case 'birth':
                path = '/letters/create/kelahiran';
                break;
              case 'keramaian':
                path = '/letters/create/keramaian';
                break;
              case 'custom':
                path = '/letters/create/keterangan';
                break;
              case 'wali-nikah':
                path = '/letters/create/wali-nikah';
                break;
              case 'kematian':
                path = '/letters/create/kematian';
                break;
              default:
                path = '/letters/create';
            }
            navigate(path, { state: { editData: letter, isEditMode: true } });
          }}
          isLoading={isLoading}
          emptyMessage="Belum ada surat yang dibuat. Silakan buat surat terlebih dahulu."
        />
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus surat <strong>{selectedLetter?.title}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LettersList;