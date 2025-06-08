import React, { useState, useEffect, useRef } from "react";
import { db } from "../database/db";
import { useForm, Controller } from "react-hook-form";
import {
  Save,
  Upload,
  Download,
  HardDrive,
  FileUp,
  FileDown,
  Image,
  FileSignature as Signature,
} from "lucide-react";
import { villageService } from "../database/villageService";
import { exportService } from "../services/exportService";
import { VillageInfo } from "../types";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { toast } from "react-toastify";

const Settings: React.FC = () => {
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUploadLogoModalOpen, setIsUploadLogoModalOpen] = useState(false);
  const [isUploadSignatureModalOpen, setIsUploadSignatureModalOpen] =
    useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<VillageInfo>();

  useEffect(() => {
    loadVillageInfo();
  }, []);

  const loadVillageInfo = async () => {
    setIsLoading(true);
    try {
      const info = await villageService.getVillageInfo();
      setVillageInfo(info);

      if (info) {
        // Set form values
        setValue("name", info.name);
        setValue("address", info.address);
        setValue("districtName", info.districtName);
        setValue("regencyName", info.regencyName);
        setValue("provinceName", info.provinceName);
        setValue("phoneNumber", info.phoneNumber);
        setValue("leaderName", info.leaderName);
        setValue("leaderTitle", info.leaderTitle);
        setValue("VillageCode", info.VillageCode);
      }
    } catch (error) {
      console.error("Error loading village info:", error);
      toast.error("Gagal memuat informasi desa");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VillageInfo) => {
    setIsSubmitting(true);

    try {
      await villageService.updateVillageInfo(data);
      toast.success("Informasi desa berhasil diperbarui");
      loadVillageInfo();
    } catch (error) {
      console.error("Error updating village info:", error);
      toast.error("Gagal memperbarui informasi desa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportService.exportDatabase();
      toast.success("Data berhasil diekspor");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  interface ImportModalProps {
    isOpen: boolean;
    setIsImportModalOpen: (open: boolean) => void;
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportedFile(file);
    }
  };
  const confirmImport = async () => {
    const reader = new FileReader();
    if (!importedFile) {
      toast.error("Tidak ada file yang dipilih");
      return;
    }
    reader.readAsText(importedFile);
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!json.residents || !Array.isArray(json.residents)) {
          toast.error("Format file tidak valid (tidak ada field 'residents')");
          return;
        }

        // Optional: Bersihkan database dulu
        await db.residents.clear();

        // Optional: Hitung ulang usia
        const today = new Date();
        const parsedResidents = json.residents.map((r: any) => ({
          ...r,
          age:
            today.getFullYear() -
            new Date(r.birthDate).getFullYear() -
            (today <
            new Date(
              today.getFullYear(),
              new Date(r.birthDate).getMonth(),
              new Date(r.birthDate).getDate()
            )
              ? 1
              : 0),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));

        await db.residents.bulkAdd(parsedResidents);
        toast.success("Impor data berhasil");
        setIsImportModalOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengimpor file JSON");
      }
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>

        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Village Information */}
        <Card title="Informasi Desa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Desa"
              {...register("name", { required: "Nama desa wajib diisi" })}
              error={errors.name?.message}
              fullWidth
            />

            <Input
              label="Alamat"
              {...register("address", { required: "Alamat desa wajib diisi" })}
              error={errors.address?.message}
              fullWidth
            />

            <Input
              label="Kecamatan"
              {...register("districtName", {
                required: "Nama kecamatan wajib diisi",
              })}
              error={errors.districtName?.message}
              fullWidth
            />

            <Input
              label="Kabupaten/Kota"
              {...register("regencyName", {
                required: "Nama kabupaten wajib diisi",
              })}
              error={errors.regencyName?.message}
              fullWidth
            />

            <Input
              label="Provinsi"
              {...register("provinceName", {
                required: "Nama provinsi wajib diisi",
              })}
              error={errors.provinceName?.message}
              fullWidth
            />

            <Input
              label="Kode Desa"
              {...register("VillageCode", { required: "Kode pos wajib diisi" })}
              error={errors.VillageCode?.message}
              fullWidth
            />

            <Input
              label="Nomor Telepon"
              {...register("phoneNumber", {
                required: "Nomor telepon wajib diisi",
              })}
              error={errors.phoneNumber?.message}
              fullWidth
            />
          </div>
        </Card>

        {/* Leader Information */}
        <Card title="Informasi Kepala Desa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Kepala Desa"
              {...register("leaderName", {
                required: "Nama kepala desa wajib diisi",
              })}
              error={errors.leaderName?.message}
              fullWidth
            />

            <Input
              label="Jabatan"
              {...register("leaderTitle", {
                required: "Jabatan kepala desa wajib diisi",
              })}
              error={errors.leaderTitle?.message}
              fullWidth
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
            isLoading={isSubmitting}
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>

      {/* Data Backup */}
      <Card title="Backup & Restore Data">
        <p className="text-sm text-gray-700 mb-6">
          Backup data desa secara berkala untuk menghindari kehilangan data.
          Data yang dibackup mencakup semua informasi warga, surat, dan
          pengaturan desa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-md p-6 flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
              <FileDown size={24} className="text-teal-700" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ekspor Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ekspor seluruh data ke file JSON untuk disimpan sebagai backup
            </p>
            <Button
              type="button"
              variant="primary"
              icon={<Download size={18} />}
              onClick={handleExportData}
              isLoading={isExporting}
            >
              Ekspor Data
            </Button>
          </div>

          <div className="border rounded-md p-6 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <FileUp size={24} className="text-blue-700" />
            </div>
            <h3 className="text-lg font-medium mb-2">Impor Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pulihkan data dari file backup JSON yang telah dibuat sebelumnya
            </p>
            <Button
              type="button"
              variant="primary"
              icon={<Upload size={18} />}
              onClick={() => setIsImportModalOpen(true)}
              isLoading={isImporting}
            >
              Impor Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Data"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <p className="text-amber-700 text-sm font-medium">Perhatian!</p>
            <p className="text-amber-600 text-sm mt-1">
              Mengimpor data akan <strong>menimpa semua data yang ada</strong>.
              Pastikan Anda telah membuat backup sebelum melakukan impor.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <HardDrive size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">
              Pilih file backup JSON untuk diimpor
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => importInputRef.current?.click()}
            >
              Pilih File Backup
            </Button>

            <input
              type="file"
              ref={importInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />

            {importedFile && (
              <p className="mt-4 text-sm text-gray-700">
                File terpilih: {importedFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmImport}
              isLoading={isImporting}
              disabled={!importedFile}
            >
              Konfirmasi Impor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
