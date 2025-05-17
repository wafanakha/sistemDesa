import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, UserPlus, Trash2, Edit, Eye } from 'lucide-react';
import { residentService } from '../../database/residentService';
import { Resident } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const ResidentsList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    loadResidents();
  }, []);
  
  const loadResidents = async () => {
    setIsLoading(true);
    try {
      const data = await residentService.getAllResidents();
      setResidents(data);
      setFilteredResidents(data);
    } catch (error) {
      console.error('Error loading residents:', error);
      toast.error('Gagal memuat data warga');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResidents(residents);
    } else {
      const filtered = residents.filter(
        resident =>
          resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resident.nik.includes(searchQuery) ||
          resident.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResidents(filtered);
    }
  }, [searchQuery, residents]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDeleteClick = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedResident) return;
    
    try {
      await residentService.deleteResident(selectedResident.id!);
      toast.success('Warga berhasil dihapus');
      loadResidents();
    } catch (error) {
      console.error('Error deleting resident:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menghapus data warga');
      }
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedResident(null);
    }
  };
  
  const columns = [
    {
      header: 'NIK',
      accessor: 'nik'
    },
    {
      header: 'Nama',
      accessor: 'name'
    },
    {
      header: 'Alamat',
      accessor: 'address'
    },
    {
      header: 'Tanggal Lahir',
      accessor: (resident: Resident) => new Date(resident.birthDate).toLocaleDateString('id-ID')
    },
    {
      header: 'Aksi',
      accessor: (resident: Resident) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/residents/view/${resident.id}`);
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Lihat"
          >
            <Eye size={18} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/residents/edit/${resident.id}`);
            }}
            className="p-1 text-amber-600 hover:text-amber-800"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(resident);
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
        <h2 className="text-2xl font-bold text-gray-800">Daftar Warga</h2>
        
        <Button
          variant="primary"
          icon={<UserPlus size={18} />}
          onClick={() => navigate('/residents/add')}
        >
          Tambah Warga
        </Button>
      </div>
      
      <Card>
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan nama, NIK, atau alamat..."
            value={searchQuery}
            onChange={handleSearch}
            startIcon={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <Table
          columns={columns}
          data={filteredResidents}
          keyField="id"
          onRowClick={(resident) => navigate(`/residents/view/${resident.id}`)}
          isLoading={isLoading}
          emptyMessage="Belum ada data warga. Silakan tambahkan warga terlebih dahulu."
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
            Apakah Anda yakin ingin menghapus data warga <strong>{selectedResident?.name}</strong>?
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

export default ResidentsList;