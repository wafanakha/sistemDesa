import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Trash2, Eye } from "lucide-react";
import { LetterHistory } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";
import {
  getLetterHistory,
  deleteLetterHistory,
} from "../../services/residentService";
import { LetterType } from "../../types";

const LetterHistoryList: React.FC = () => {
  const [history, setHistory] = useState<LetterHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<LetterHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LetterHistory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getLetterHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error("Error loading letter history:", error);
      toast.error("Gagal memuat riwayat surat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteClick = (item: LetterHistory) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;

    try {
      await deleteLetterHistory(selectedItem.id);
      toast.success("Riwayat surat berhasil dihapus");
      loadHistory();
    } catch (error) {
      console.error("Error deleting history:", error);
      toast.error("Gagal menghapus riwayat surat");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const getLetterTypeLabel = (type: LetterType) => {
    switch (type) {
      case "domicile":
        return "Keterangan Domisili";
      case "business":
        return "Keterangan Usaha";
      case "keterangan":
        return "Keterangan";
      case "birth":
        return "Keterangan Kelahiran";
      case "kematian":
        return "Keterangan Kematian";
      case "poverty":
        return "Keterangan tidak mampu";
      case "ahli-waris":
        return "Keterangan ahli waris";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const columns = [
    {
      header: "Nama",
      accessor: (item: LetterHistory) => item.name,
    },
    {
      header: "Jenis Surat",
      accessor: (item: LetterHistory) => getLetterTypeLabel(item.letter),
    },
    {
      header: "Tanggal",
      accessor: (item: LetterHistory) => formatDate(item.date),
    },
    {
      header: "Aksi",
      accessor: (item: LetterHistory) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Implement preview functionality if needed
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Lihat"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Surat</h2>
      </div>

      <Card>
        <div className="mb-6">
          <Input
            placeholder="Cari berdasarkan nama atau NIK..."
            value={searchQuery}
            onChange={handleSearch}
            startIcon={<Search size={18} />}
            fullWidth
          />
        </div>

        <Table
          columns={columns}
          data={filteredHistory}
          keyField="id"
          onRowClick={(item) => {
            // You can implement a detail view if needed
          }}
          isLoading={isLoading}
          emptyMessage="Belum ada riwayat surat."
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
            Apakah Anda yakin ingin menghapus riwayat surat untuk{" "}
            <strong>{selectedItem?.name}</strong>?
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

export default LetterHistoryList;
