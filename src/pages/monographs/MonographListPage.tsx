import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { Plus } from "lucide-react";

const MonographListPage = () => {
  const navigate = useNavigate();

  // Data contoh - nanti bisa diganti dengan data dari API
  const monographs = [
    { id: 1, title: "Monografi Penduduk 2023", type: "penduduk", year: 2023 },
    { id: 2, title: "Monografi Keluarga 2023", type: "keluarga", year: 2023 },
    { id: 3, title: "Monografi Wilayah 2023", type: "wilayah", year: 2023 },
  ];

  const columns = [
    {
      header: "Judul",
      accessor: "title",
    },
    {
      header: "Jenis",
      accessor: "type",
    },
    {
      header: "Tahun",
      accessor: "year",
    },
    {
      header: "Aksi",
      accessor: (item: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/monographs/${item.id}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            Lihat
          </button>
          <button
            onClick={() => navigate(`/monographs/${item.id}/edit`)}
            className="text-amber-600 hover:text-amber-800"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daftar Monografi</h2>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => navigate("/monographs/create")}
        >
          Buat Monografi
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={monographs}
          keyField="id"
          emptyMessage="Belum ada data monografi"
        />
      </Card>
    </div>
  );
};

export default MonographListPage;
