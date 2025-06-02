import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Download, FileText, Share2 } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { villageService } from '../../database/villageService';
import { exportService } from '../../services/exportService';
import { Letter, Resident, VillageInfo } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

const ViewLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [letter, setLetter] = useState<Letter | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const letterId = parseInt(id);
        
        // Load letter data
        const letterData = await letterService.getLetterById(letterId);
        if (!letterData) {
          toast.error('Data surat tidak ditemukan');
          navigate('/letters');
          return;
        }
        
        setLetter(letterData);
        
        // Load resident data
        const residentData = await residentService.getResidentById(letterData.residentId);
        if (residentData) {
          setResident(residentData);
        }
        
        // Load village info
        const info = await villageService.getVillageInfo();
        setVillageInfo(info);
        
      } catch (error) {
        console.error('Error loading letter data:', error);
        toast.error('Gagal memuat data surat');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  const confirmDelete = async () => {
    if (!letter) return;
    
    try {
      await letterService.deleteLetter(letter.id!);
      toast.success('Surat berhasil dihapus');
      navigate('/letters');
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Gagal menghapus surat');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const exportToPdf = async () => {
    if (!letter || !resident || !villageInfo) return;
    
    setIsExporting(true);
    try {
      await exportService.exportLetterToPdf(letter, resident, villageInfo);
      toast.success('Surat berhasil diekspor ke PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Gagal mengekspor surat ke PDF');
    } finally {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }
  };
  
  const exportToDocx = async () => {
    if (!letter || !resident || !villageInfo) return;
    
    setIsExporting(true);
    try {
      await exportService.exportLetterToDocx(letter, resident, villageInfo);
      toast.success('Surat berhasil diekspor ke DOCX');
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      toast.error('Gagal mengekspor surat ke DOCX');
    } finally {
      setIsExporting(false);
      setIsExportModalOpen(false);
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
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Detail Surat</h2>
        </div>
        
        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!letter) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">Data surat tidak ditemukan</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/letters')}
        >
          Kembali ke Daftar Surat
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() => navigate('/letters')}
          >
            Kembali
          </Button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{letter.title}</h2>
            <p className="text-sm text-gray-500">
              Nomor: {letter.letterNumber} | {getLetterTypeLabel(letter.letterType)}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={() => setIsExportModalOpen(true)}
          >
            Ekspor
          </Button>
          
          <Button
            variant="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/letters/edit/${letter.id}`)}
          >
            Edit
          </Button>
          
          <Button
            variant="danger"
            icon={<Trash2 size={18} />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Hapus
          </Button>
        </div>
      </div>
      
      {/* Letter Information */}
      <Card title="Informasi Surat">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoItem label="Status" value={getStatusBadge(letter.status)} />
          <InfoItem label="Tanggal Surat" value={formatDate(letter.issuedDate)} />
          
          {letter.purpose && (
            <InfoItem label="Keperluan" value={letter.purpose} className="md:col-span-2" />
          )}
          
          {resident && (
            <InfoItem
              label="Warga"
              value={
                <div className="flex items-center">
                  <span>{resident.name} (NIK: {resident.nik})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => navigate(`/residents/view/${resident.id}`)}
                  >
                    Lihat Detail
                  </Button>
                </div>
              }
              className="md:col-span-2"
            />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-md font-medium text-gray-700">Isi Surat</h3>
          <div className="border rounded-md p-4 bg-gray-50 whitespace-pre-wrap text-gray-700">
            {letter.content}
          </div>
        </div>
      </Card>
      
      {/* Preview Section */}
      <Card title="Preview Surat">
        <div className="bg-white p-4 rounded-md border mb-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold uppercase">PEMERINTAH {villageInfo?.regencyName || 'KABUPATEN'}</h3>
            <h3 className="text-lg font-bold uppercase">KECAMATAN {villageInfo?.districtName || 'KECAMATAN'}</h3>
            <h3 className="text-xl font-bold uppercase mb-1">DESA {villageInfo?.name || 'DESA'}</h3>
            <p className="text-sm">{villageInfo?.address || 'Alamat Desa'}</p>
            <div className="border-t-2 border-black mt-2 pt-1 mx-auto" style={{ borderBottomWidth: '1px' }}></div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase">{letter.title}</h2>
            <p>Nomor: {letter.letterNumber}</p>
          </div>
          
          <div className="whitespace-pre-wrap">
            {letter.content}
          </div>
          
          <div className="text-right mt-8">
            <p>{villageInfo?.name || 'Desa'}, {formatDate(letter.issuedDate)}</p>
            <p>{villageInfo?.leaderTitle || 'Kepala Desa'}</p>
            <div className="h-16"></div>
            <p className="font-bold">{villageInfo?.leaderName || 'Nama Kepala Desa'}</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            variant="primary"
            icon={<Download size={18} />}
            onClick={() => setIsExportModalOpen(true)}
          >
            Ekspor Surat
          </Button>
        </div>
      </Card>
      
      {/* Metadata */}
      <Card title="Metadata">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <InfoItem label="Dibuat pada" value={formatDate(letter.createdAt)} />
          <InfoItem label="Terakhir diperbarui" value={formatDate(letter.updatedAt)} />
        </div>
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
            Apakah Anda yakin ingin menghapus surat <strong>{letter.title}</strong>?
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
      
      {/* Export modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Ekspor Surat"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Pilih format ekspor untuk surat <strong>{letter.title}</strong>:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportToPdf}
              disabled={isExporting}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-3 text-red-600">
                <FileText size={32} />
              </div>
              <h3 className="font-medium">PDF</h3>
              <p className="text-sm text-gray-500 mt-1">Ekspor sebagai dokumen PDF</p>
            </button>
            
            <button
              onClick={exportToDocx}
              disabled={isExporting}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-3 text-blue-600">
                <FileText size={32} />
              </div>
              <h3 className="font-medium">DOCX</h3>
              <p className="text-sm text-gray-500 mt-1">Ekspor sebagai dokumen Word</p>
            </button>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
              disabled={isExporting}
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, className = '' }) => {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-base text-gray-900 mt-1">{value}</div>
    </div>
  );
};

export default ViewLetter;