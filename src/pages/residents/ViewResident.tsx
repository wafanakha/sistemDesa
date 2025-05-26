import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, ChevronLeft, FileText } from "lucide-react";
import { residentService } from "../../database/residentService";
import { letterService } from "../../database/letterService";
import {
  CustomField,
  Letter,
  Resident,
  ResidentCustomField,
} from "../../types";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { toast } from "react-toastify";

const ViewResident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resident, setResident] = useState<Resident | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<
    ResidentCustomField[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const residentId = parseInt(id);

        // Load resident data
        const residentData = await residentService.getResidentById(residentId);
        if (!residentData) {
          toast.error("Data warga tidak ditemukan");
          navigate("/residents");
          return;
        }

        setResident(residentData);

        // Load custom fields
        const fields = await residentService.getCustomFields();
        setCustomFields(fields);

        // Load custom field values
        const fieldValues = await residentService.getResidentCustomFields(
          residentId
        );
        setCustomFieldValues(fieldValues);

        // Load related letters
        const residentLetters = await letterService.getLettersByResident(
          residentId
        );
        setLetters(residentLetters);
      } catch (error) {
        console.error("Error loading resident data:", error);
        toast.error("Gagal memuat data warga");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const confirmDelete = async () => {
    if (!resident) return;

    try {
      await residentService.deleteResident(resident.id!);
      toast.success("Data warga berhasil dihapus");
      navigate("/residents");
    } catch (error) {
      console.error("Error deleting resident:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal menghapus data warga");
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const getCustomFieldName = (fieldId: number) => {
    const field = customFields.find((f) => f.id === fieldId);
    return field ? field.name : "Unknown Field";
  };

  const getCustomFieldValue = (fieldId: number) => {
    const fieldValue = customFieldValues.find(
      (fv) => fv.customFieldId === fieldId
    );
    return fieldValue ? fieldValue.value : "-";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Detail Warga</h2>
        </div>

        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">Data warga tidak ditemukan</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate("/residents")}
        >
          Kembali ke Daftar Warga
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
            onClick={() => navigate("/residents")}
          >
            Kembali
          </Button>

          <h2 className="text-2xl font-bold text-gray-800">{resident.name}</h2>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/residents/edit/${resident.id}`)}
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

      {/* Basic Information */}
      <Card title="Informasi Dasar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="No KK" value={resident.kk} />
          <InfoItem label="No NIK" value={resident.nik} />
          <InfoItem label="Nama Lengkap" value={resident.name} />
          <InfoItem label="Tempat Lahir" value={resident.birthPlace} />
          <InfoItem
            label="Tanggal Lahir"
            value={new Date(resident.birthDate).toLocaleDateString("id-ID")}
          />
          <InfoItem label="Umur" value={resident.age?.toString() || "-"} />
          <InfoItem label="Jenis Kelamin" value={resident.gender} />
          <InfoItem label="Alamat" value={resident.address} />
          <InfoItem label="RT" value={resident.rt} />
          <InfoItem label="RW" value={resident.rw} />
          <InfoItem
            label="Status Hubungan Dalam Keluarga"
            value={resident.shdk}
          />
          <InfoItem
            label="KTP Elektronik"
            value={resident.ktpEl ? "Ya" : "Tidak"}
          />
          <InfoItem
            label="Akta Lahir"
            value={resident.birthCertificate ? "Ya" : "Tidak"}
          />
          <InfoItem
            label="No Akta Lahir"
            value={resident.birthCertificateNumber || "-"}
          />
          <InfoItem label="Status Pernikahan" value={resident.maritalStatus} />
          <InfoItem
            label="Akta Nikah"
            value={resident.marriageCertificate ? "Ya" : "Tidak"}
          />
          <InfoItem
            label="No Akta Nikah"
            value={resident.marriageCertificateNumber || "-"}
          />
          <InfoItem
            label="Akta Cerai"
            value={resident.divorceCertificate ? "Ya" : "Tidak"}
          />
          <InfoItem
            label="No Akta Cerai"
            value={resident.divorceCertificateNumber || "-"}
          />
          <InfoItem label="Pendidikan" value={resident.education} />
          <InfoItem label="Agama" value={resident.religion} />
          <InfoItem label="Pekerjaan" value={resident.occupation} />
          <InfoItem label="Golongan Darah" value={resident.bloodType || "-"} />
          <InfoItem
            label="Disabilitas Fisik"
            value={resident.physicalDisability || "-"}
          />
          <InfoItem label="Nama Ayah" value={resident.fatherName} />
          <InfoItem label="Nama Ibu" value={resident.motherName} />
          <InfoItem
            label="Foto"
            value={
              resident.photoUrl ? (
                <img
                  src={resident.photoUrl}
                  alt={`Foto ${resident.name}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                "-"
              )
            }
          />
        </div>
      </Card>

      {/* Custom Fields */}
      {customFields.length > 0 && customFieldValues.length > 0 && (
        <Card title="Informasi Tambahan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customFields.map((field) => (
              <InfoItem
                key={field.id}
                label={field.name}
                value={getCustomFieldValue(field.id!)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Related Letters */}
      <Card title="Daftar Surat">
        {letters.length > 0 ? (
          <div className="divide-y">
            {letters.map((letter) => (
              <div key={letter.id} className="py-3 flex items-center">
                <div className="bg-teal-100 p-2 rounded-full mr-3">
                  <FileText size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{letter.title}</h4>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                    <span>No: {letter.letterNumber}</span>
                    <span className="mx-2">•</span>
                    <span>{letter.issuedDate.toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/letters/view/${letter.id}`)}
                >
                  Lihat
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-4 text-center">
            Belum ada surat terkait
          </p>
        )}

        <div className="mt-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() =>
              navigate("/letters/create", {
                state: { residentId: resident.id },
              })
            }
          >
            Buat Surat Baru
          </Button>
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
            Apakah Anda yakin ingin menghapus data warga{" "}
            <strong>{resident.name}</strong>?
            {letters.length > 0 && (
              <span className="block mt-2 text-red-600">
                Warga ini memiliki {letters.length} surat terkait. Anda tidak
                dapat menghapus data warga ini.
              </span>
            )}
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
              disabled={letters.length > 0}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default ViewResident;
