import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Search,
  UserPlus,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { residentService } from "../../database/residentService";
import { Resident } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";

const ResidentsList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [groupedResidents, setGroupedResidents] = useState<
    Record<string, Resident[]>
  >({});
  const [expandedKKs, setExpandedKKs] = useState<Record<string, boolean>>({});
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
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
      groupResidentsByKK(data);
      setFilteredResidents(data);
    } catch (error) {
      console.error("Error loading residents:", error);
      toast.error("Gagal memuat data warga");
    } finally {
      setIsLoading(false);
    }
  };

  const groupResidentsByKK = (residentsData: Resident[]) => {
    const grouped: Record<string, Resident[]> = {};
    const expanded: Record<string, boolean> = {};

    residentsData.forEach((resident) => {
      if (!grouped[resident.kk]) {
        grouped[resident.kk] = [];
        expanded[resident.kk] = true; // Default to expanded
      }
      grouped[resident.kk].push(resident);
    });

    setGroupedResidents(grouped);
    setExpandedKKs(expanded);
  };

  const toggleKKGroup = (kk: string) => {
    setExpandedKKs((prev) => ({
      ...prev,
      [kk]: !prev[kk],
    }));
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResidents(residents);
      groupResidentsByKK(residents);
    } else {
      const filtered = residents.filter(
        (resident) =>
          resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resident.nik.includes(searchQuery) ||
          resident.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResidents(filtered);
      groupResidentsByKK(filtered);
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
      toast.success("Warga berhasil dihapus");
      loadResidents();
    } catch (error) {
      console.error("Error deleting resident:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal menghapus data warga");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedResident(null);
    }
  };

  const columns = [
    {
      header: "NIK",
      accessor: "nik", // Valid as "nik" is a keyof Resident
    },
    {
      header: "Nama",
      accessor: "name", // Valid as "name" is a keyof Resident
    },
    {
      header: "Memiliki KTP Elektronik",
      accessor: (resident: Resident) => (resident.ktpEl ? "Ya" : "Tidak"),
    },
    {
      header: "Alamat",
      accessor: "address", // Valid as "address" is a keyof Resident
    },
    {
      header: "Tanggal Lahir",
      accessor: (resident: Resident) =>
        new Date(resident.birthDate).toLocaleDateString("id-ID"), // Function accessor
    },
    {
      header: "Tempat Lahir",
      accessor: "birthPlace", // Valid as "birthPlace" is a keyof Resident
    },
    {
      header: "Umur",
      accessor: "age", // Valid as "age" is a keyof Resident (optional property is fine)
    },
    {
      header: "Jenis Kelamin",
      accessor: "gender", // Valid as "gender" is a keyof Resident
    },
    {
      header: "RT",
      accessor: "rt", // Valid as "rt" is a keyof Resident
    },
    {
      header: "RW",
      accessor: "rw", // Valid as "rw" is a keyof Resident
    },
    {
      header: "Status Hubungan",
      accessor: "shdk", // Valid as "shdk" is a keyof Resident
    },
    {
      header: "Status Pernikahan",
      accessor: "maritalStatus", // Valid as "maritalStatus" is a keyof Resident
    },
    {
      header: "Pendidikan",
      accessor: "education", // Valid as "education" is a keyof Resident
    },
    {
      header: "Agama",
      accessor: "religion", // Valid as "religion" is a keyof Resident
    },
    {
      header: "Pekerjaan",
      accessor: "occupation", // Valid as "occupation" is a keyof Resident
    },
    {
      header: "Golongan Darah",
      accessor: (resident: Resident) => resident.bloodType || "-",
    },
    {
      header: "Disabilitas Fisik",
      accessor: (resident: Resident) => resident.physicalDisability || "-",
    },
    {
      header: "Nama Ayah",
      accessor: "fatherName", // Valid as "fatherName" is a keyof Resident
    },
    {
      header: "Nama Ibu",
      accessor: "motherName", // Valid as "motherName" is a keyof Resident
    },
    {
      header: "Aksi",
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
      ),
    },
  ];

  const renderKKGroups = () => {
    return Object.entries(groupedResidents).map(([kk, familyMembers]) => {
      const familyHead = familyMembers.find(
        (member) => member.shdk === "Kepala Keluarga"
      );
      const isExpanded = expandedKKs[kk];

      return (
        <div key={kk} className="mb-4 border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleKKGroup(kk)}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {isExpanded ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </span>
              <div>
                <h3 className="font-semibold">No. KK: {kk}</h3>
                {familyHead && (
                  <p className="text-sm text-gray-600">
                    Kepala Keluarga: {familyHead.name}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Jumlah Anggota: {familyMembers.length}
                </p>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="border-t text-gray-900 text-sm font-medium">
              <Table
                columns={columns}
                data={familyMembers}
                keyField="id"
                onRowClick={(resident) =>
                  navigate(`/residents/view/${resident.id}`)
                }
                isLoading={false}
                emptyMessage="Tidak ada anggota keluarga"
                hideHeader
              />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Warga</h2>
        <Button
          variant="primary"
          icon={<UserPlus size={18} />}
          onClick={() => navigate("/residents/add")}
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

        {isLoading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedResidents).length > 0 ? (
              renderKKGroups()
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada data warga. Silakan tambahkan warga terlebih dahulu.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete confirmation modal (keep the same) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus data warga{" "}
            <strong>{selectedResident?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResidentsList;
