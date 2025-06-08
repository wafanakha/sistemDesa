import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { residentService } from "../../database/residentService";
import { Resident } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const ROW_HEIGHT = 60; // Height of each family member row
const HEADER_HEIGHT = 80; // Height of family group header
const GROUP_PADDING = 20; // Additional padding for each group

const ResidentsList: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [groupedResidents, setGroupedResidents] = useState<
    [string, Resident[]][]
  >([]);
  const [expandedKKs, setExpandedKKs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "nik",
    "name",
    "gender",
    "age",
    "address",
    "shdk",
    "actions",
  ]);

  const listRef = useRef<List>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResidents = async () => {
      setIsLoading(true);
      try {
        const data = await residentService.getAllResidents();
        setResidents(data);
        groupResidentsByKK(data);
      } catch (error) {
        console.error("Error loading residents:", error);
        toast.error("Gagal memuat data warga");
      } finally {
        setIsLoading(false);
      }
    };
    loadResidents();
  }, []);

  const groupResidentsByKK = (residentsData: Resident[]) => {
    const groupedMap: Record<string, Resident[]> = {};
    const expanded: Record<string, boolean> = {};

    residentsData.forEach((resident) => {
      if (!groupedMap[resident.kk]) {
        groupedMap[resident.kk] = [];
        expanded[resident.kk] = true; // Default to expanded
      }
      groupedMap[resident.kk].push(resident);
    });

    // Sort family members with Kepala Keluarga first
    Object.keys(groupedMap).forEach((kk) => {
      groupedMap[kk].sort((a, b) => {
        if (a.shdk === "Kepala Keluarga") return -1;
        if (b.shdk === "Kepala Keluarga") return 1;
        return a.name.localeCompare(b.name);
      });
    });

    const groupedEntries = Object.entries(groupedMap).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    setGroupedResidents(groupedEntries);
    setExpandedKKs(expanded);
  };

  const toggleKKGroup = (kk: string, index: number) => {
    setExpandedKKs((prev) => {
      const newExpanded = { ...prev, [kk]: !prev[kk] };
      setTimeout(() => {
        listRef.current?.resetAfterIndex(index);
      }, 0);
      return newExpanded;
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      groupResidentsByKK(residents);
      return;
    }

    const filtered = residents.filter(
      (r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.nik.includes(query) ||
        r.address.toLowerCase().includes(query.toLowerCase())
    );
    groupResidentsByKK(filtered);
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
      const updated = await residentService.getAllResidents();
      setResidents(updated);
      groupResidentsByKK(updated);
    } catch (error) {
      console.error("Error deleting resident:", error);
      toast.error("Gagal menghapus data warga");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedResident(null);
    }
  };

  const columnDefinitions = {
    nik: { header: "NIK", accessor: "nik", width: 150 },
    name: { header: "Nama", accessor: "name", width: 180 },
    gender: { header: "Jenis Kelamin", accessor: "gender", width: 120 },
    age: { header: "Umur", accessor: "age", width: 80 },
    address: { header: "Alamat", accessor: "address", width: 200 },
    shdk: { header: "Status Hubungan", accessor: "shdk", width: 150 },
    actions: {
      header: "Aksi",
      accessor: (r: Resident) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/residents/view/${r.id}`);
            }}
            title="Lihat"
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/residents/edit/${r.id}`);
            }}
            title="Edit"
            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(r);
            }}
            title="Hapus"
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      width: 120,
      sticky: true,
    },
  };

  const columns = Object.entries(columnDefinitions)
    .filter(([key]) => visibleColumns.includes(key))
    .map(([_, value]) => value);

  const getItemSize = useCallback(
    (index: number) => {
      const [kk, members] = groupedResidents[index];
      const isExpanded = expandedKKs[kk];
      return isExpanded
        ? HEADER_HEIGHT + members.length * ROW_HEIGHT + GROUP_PADDING
        : HEADER_HEIGHT;
    },
    [groupedResidents, expandedKKs]
  );

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const [kk, familyMembers] = groupedResidents[index];
    const isExpanded = expandedKKs[kk];
    const familyHead = familyMembers.find((r) => r.shdk === "Kepala Keluarga");

    return (
      <div style={style}>
        <div className="mb-4 border rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Family header */}
          <div
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleKKGroup(kk, index)}
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
            <span className="text-sm text-gray-500">
              {isExpanded ? "Sembunyikan" : "Tampilkan"}
            </span>
          </div>

          {isExpanded && (
            <div className="border-t">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {familyMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => navigate(`/residents/view/${member.id}`)}
                      >
                        {columns.map((column) => (
                          <td
                            key={`${member.id}-${column.header}`}
                            className="px-4 py-3 text-sm"
                            style={{
                              width: column.width,
                              minWidth: column.width,
                              maxWidth: column.width,
                              ...(column.sticky
                                ? {
                                    position: "sticky",
                                    right: 0,
                                    background: "white",
                                  }
                                : {}),
                            }}
                          >
                            {typeof column.accessor === "function"
                              ? column.accessor(member)
                              : member[column.accessor as keyof Resident]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((col) => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Warga</h2>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              const modal = document.getElementById("columnModal");
              if (modal) (modal as HTMLDialogElement).showModal();
            }}
          >
            Kolom Tampilan
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus size={18} />}
            onClick={() => navigate("/residents/add")}
          >
            Tambah Warga
          </Button>
        </div>
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
        ) : groupedResidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data warga
          </div>
        ) : (
          <div style={{ height: "calc(100vh - 200px)" }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={groupedResidents.length}
                  itemSize={getItemSize}
                  overscanCount={10}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Yakin ingin menghapus data warga{" "}
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

      {/* Column Visibility Modal */}
      <dialog id="columnModal" className="modal">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4">Pengaturan Kolom</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(columnDefinitions).map(([key, { header }]) => (
              <div key={key} className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(key)}
                    onChange={() => toggleColumnVisibility(key)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="label-text">{header}</span>
                </label>
              </div>
            ))}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Tutup</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ResidentsList;
