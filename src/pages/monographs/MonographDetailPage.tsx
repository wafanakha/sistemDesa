import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Edit, Printer, Download } from "lucide-react";

const MonographDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data contoh - nanti bisa diganti dengan data dari API
  const monograph = {
    id: 1,
    title: "Monografi Penduduk Desa Sukamaju 2023",
    type: "penduduk",
    year: 2023,
    description: "Laporan monografi penduduk Desa Sukamaju tahun 2023",
    data: [
      { label: "Jumlah Penduduk", value: "2.450" },
      { label: "Laki-laki", value: "1.200" },
      { label: "Perempuan", value: "1.250" },
      { label: "Kepala Keluarga", value: "750" },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{monograph.title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Printer size={18} />}
            onClick={() => window.print()}
          >
            Cetak
          </Button>
          <Button variant="outline" icon={<Download size={18} />}>
            Unduh
          </Button>
          <Button
            variant="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/monographs/${id}/edit`)}
          >
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Jenis Monografi</p>
              <p className="font-medium capitalize">{monograph.type}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Tahun</p>
              <p className="font-medium">{monograph.year}</p>
            </div>
          </div>

          {monograph.description && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="mt-1">{monograph.description}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Data Statistik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monograph.data.map((item, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonographDetailPage;
