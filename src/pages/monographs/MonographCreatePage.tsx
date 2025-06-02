import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import { Save } from "lucide-react";

const MonographCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "penduduk",
    year: new Date().getFullYear(),
    description: "",
    data: [],
  });

  const monographTypes = [
    { value: "penduduk", label: "Monografi Penduduk" },
    { value: "keluarga", label: "Monografi Keluarga" },
    { value: "wilayah", label: "Monografi Wilayah" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simpan data ke API atau state management
    console.log("Data monografi:", formData);
    navigate("/monographs");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Buat Monografi Penduduk</h2>
        <Button variant="outline" onClick={() => navigate("/monographs")}>
          Kembali
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Judul Monografi"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <Select
              label="Jenis Monografi"
              options={monographTypes}
              value={formData.type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
              fullWidth
            />

            <Input
              label="Tahun"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={4}
            />
          </div>

          {/* Bagian untuk menambahkan data statistik */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-lg mb-4">Data Statistik</h3>
            <div className="space-y-4">
              {/* Di sini bisa ditambahkan form untuk input data statistik */}
              <div className="p-4 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">Tambahkan data statistik</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    // Logika untuk menambah data statistik
                  }}
                >
                  Tambah Data
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/monographs")}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" icon={<Save size={18} />}>
              Simpan Monografi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MonographCreatePage;
