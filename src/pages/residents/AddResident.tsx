import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Save, ChevronLeft } from "lucide-react";
import { residentService } from "../../database/residentService";
import { CustomField, Resident } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import { toast } from "react-toastify";

const inputStyle = "border border-gray-300 rounded-none";

const AddResident: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const getAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Resident>({
    defaultValues: {
      nik: "",
      name: "",
      address: "",
      birthDate: "",
      gender: "Laki-laki",
      religion: "Islam",
      occupation: "",
      maritalStatus: "Belum Kawin",
      bloodType: "TIDAK TAHU",
      education: "Tidak/belum sekolah",
      shdk: "Kepala Keluarga",
      physicalDisability: "Tidak ada",
    },
  });

  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const fields = await residentService.getCustomFields();
        setCustomFields(fields);
      } catch (error) {
        console.error("Error loading custom fields:", error);
      }
    };

    loadCustomFields();
  }, []);

  const onSubmit = async (data: Resident) => {
    setIsSubmitting(true);

    try {
      // Add resident
      data.age = getAge(data.birthDate);

      const residentId = await residentService.addResident(data);

      // Save custom field values
      for (const [fieldId, value] of Object.entries(customFieldValues)) {
        if (value) {
          await residentService.setResidentCustomField(
            residentId,
            parseInt(fieldId),
            value
          );
        }
      }

      toast.success("Data warga berhasil ditambahkan");
      navigate("/residents");
    } catch (error) {
      console.error("Error adding resident:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal menambahkan data warga");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomFieldChange = (fieldId: number, value: string) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tambah Warga Baru</h2>

        <Button
          variant="outline"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate("/residents")}
        >
          Kembali
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic information */}
        <Card title="Masukkan Informasi Warga">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 p-4">
            {/* Personal Information Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Informasi Pribadi
              </h3>
              <Input
                label="NIK"
                {...register("nik", {
                  required: "NIK wajib diisi",
                  minLength: { value: 16, message: "NIK harus 16 digit" },
                  maxLength: { value: 16, message: "NIK harus 16 digit" },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "NIK hanya boleh berisi angka",
                  },
                })}
                error={errors.nik?.message}
                fullWidth
              />
              <Input
                label="Nama Lengkap"
                {...register("name", { required: "Nama wajib diisi" })}
                error={errors.name?.message}
                fullWidth
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  {...register("birthDate", {
                    required: "Tanggal lahir wajib diisi",
                  })}
                  error={errors.birthDate?.message}
                  fullWidth
                />
              </div>
              <Input
                label="Tempat Lahir"
                {...register("birthPlace")}
                fullWidth
              />
              <Controller
                name="gender"
                control={control}
                rules={{ required: "Jenis kelamin wajib dipilih" }}
                render={({ field }) => (
                  <Select
                    label="Jenis Kelamin"
                    options={[
                      { value: "Laki-laki", label: "Laki-laki" },
                      { value: "Perempuan", label: "Perempuan" },
                    ]}
                    error={errors.gender?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
            </div>

            {/* Family & Address Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Informasi Keluarga & Alamat
              </h3>
              <Input
                label="No KK"
                {...register("kk", { required: "No KK wajib diisi" })}
                error={errors.kk?.message}
                fullWidth
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="RT" {...register("rt")} fullWidth />
                <Input label="RW" {...register("rw")} fullWidth />
              </div>
              <Input
                label="Alamat"
                {...register("address", { required: "Alamat wajib diisi" })}
                error={errors.address?.message}
                fullWidth
              />
              <Controller
                name="shdk"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Status Hubungan Dalam Keluarga"
                    options={[
                      { value: "Kepala Keluarga", label: "Kepala Keluarga" },
                      { value: "Istri", label: "Istri" },
                      { value: "Anak", label: "Anak" },
                      { value: "Lainnya", label: "Lainnya" },
                    ]}
                    {...field}
                    fullWidth
                  />
                )}
              />
              <Input label="Nama Ayah" {...register("fatherName")} fullWidth />
              <Input label="Nama Ibu" {...register("motherName")} fullWidth />
            </div>

            {/* Documents Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200 md:col-span-2">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Dokumen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Controller
                  name="ktpEl"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="KTP Elektronik"
                      options={[
                        { value: "true", label: "Ya" },
                        { value: "false", label: "Tidak" },
                      ]}
                      value={String(field.value)}
                      onChange={(val) => field.onChange(val === "true")}
                      error={errors.ktpEl?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="birthCertificate"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      <Select
                        label="Akta Lahir"
                        options={[
                          { value: "true", label: "Ya" },
                          { value: "false", label: "Tidak" },
                        ]}
                        value={String(field.value)}
                        onChange={(val) => field.onChange(val === "true")}
                        fullWidth
                      />
                      <Input
                        label="No Akta Lahir"
                        {...register("birthCertificateNumber")}
                        fullWidth
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Marriage Information Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Informasi Perkawinan
              </h3>
              <Controller
                name="maritalStatus"
                control={control}
                rules={{ required: "Status perkawinan wajib dipilih" }}
                render={({ field }) => (
                  <Select
                    label="Status Perkawinan"
                    options={[
                      { value: "Belum Kawin", label: "Belum Kawin" },
                      { value: "Kawin", label: "Kawin" },
                      { value: "Cerai Hidup", label: "Cerai Hidup" },
                      { value: "Cerai Mati", label: "Cerai Mati" },
                    ]}
                    error={errors.maritalStatus?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              <Controller
                name="marriageCertificate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <Select
                      label="Punya Akta Kawin?"
                      options={[
                        { value: "true", label: "Ya" },
                        { value: "false", label: "Tidak" },
                      ]}
                      value={String(field.value)}
                      onChange={(val) => field.onChange(val === "true")}
                      fullWidth
                    />
                    <Input
                      label="No Akta Kawin"
                      {...register("marriageCertificateNumber")}
                      fullWidth
                    />
                  </div>
                )}
              />
              <Controller
                name="divorceCertificate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <Select
                      label="Punya Akta Cerai?"
                      options={[
                        { value: "true", label: "Ya" },
                        { value: "false", label: "Tidak" },
                      ]}
                      value={String(field.value)}
                      onChange={(val) => field.onChange(val === "true")}
                      fullWidth
                    />
                    <Input
                      label="No Akta Cerai"
                      {...register("divorceCertificateNumber")}
                      fullWidth
                    />
                  </div>
                )}
              />
            </div>

            {/* Education & Occupation Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Pendidikan & Pekerjaan
              </h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Pendidikan"
                    options={[
                      {
                        value: "Tidak/belum sekolah",
                        label: "Tidak/belum sekolah",
                      },
                      {
                        value: "Belum Tamat SD/Sederajat",
                        label: "Belum Tamat SD/Sederajat",
                      },
                      {
                        value: "Tamat SD/Sederajat",
                        label: "Tamat SD/Sederajat",
                      },
                      { value: "SLTP/Sederajat", label: "SLTP/Sederajat" },
                      { value: "SLTA/Sederajat", label: "SLTA/Sederajat" },
                      {
                        value: "Diploma IV/Strata1",
                        label: "Diploma IV/Strata1",
                      },
                      {
                        value: "Diploma I/II",
                        label: "Diploma I/II",
                      },
                      {
                        value: "Akademi/Diploma III/S. Muda",
                        label: "Akademi/Diploma III/S. Muda",
                      },
                      {
                        value: "Strata II",
                        label: "Strata II",
                      },
                      {
                        value: "Strata III",
                        label: "Strata III",
                      },
                    ]}
                    {...field}
                    fullWidth
                  />
                )}
              />
              <Input
                label="Pekerjaan"
                {...register("occupation", {
                  required: "Pekerjaan wajib diisi",
                })}
                error={errors.occupation?.message}
                fullWidth
              />
            </div>

            {/* Additional Information Section */}
            <div className="space-y-3 p-3 bg-white border border-gray-200">
              <h3 className="font-semibold text-lg border-b border-gray-300 pb-2 mb-3">
                Informasi Tambahan
              </h3>
              <Controller
                name="religion"
                control={control}
                rules={{ required: "Agama Wajib Dipilih" }}
                render={({ field }) => (
                  <Select
                    label="Agama"
                    options={[
                      { value: "Islam", label: "Islam" },
                      { value: "Protestan", label: "Protestan" },
                      { value: "Katolik", label: "Katolik" },
                      { value: "Hindu", label: "Hindu" },
                      { value: "Buddha", label: "Buddha" },
                      { value: "Konghucu", label: "Konghucu" },
                    ]}
                    error={errors.religion?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Golongan Darah"
                    options={[
                      { value: "A", label: "A" },
                      { value: "B", label: "B" },
                      { value: "AB", label: "AB" },
                      { value: "A+", label: "A+" },
                      { value: "A-", label: "A-" },
                      { value: "B+", label: "B+" },
                      { value: "B-", label: "B-" },
                      { value: "AB+", label: "AB+" },
                      { value: "AB-", label: "AB-" },
                      { value: "O-", label: "O-" },
                      { value: "O+", label: "O+" },
                      { value: "O", label: "O" },
                      { value: "TIDAK TAHU", label: "TIDAK TAHU" },
                    ]}
                    {...field}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="physicalDisability"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Disabilitas Fisik"
                    options={[
                      { value: "Tidak ada", label: "Tidak ada" },
                      { value: "Tuna Netra", label: "Tuna Netra" },
                      { value: "Tuna Rungu", label: "Tuna Rungu" },
                      { value: "Tuna Daksa", label: "Tuna Daksa" },
                      { value: "Tuna Wicara", label: "Tuna Wicara" },
                      { value: "Dwarfsime", label: "Dwarfsime" },
                      { value: "Cerebral Palsy", label: "Cerebral Palsy" },
                    ]}
                    {...field}
                    fullWidth
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {/* Custom fields */}
        {customFields.length > 0 && (
          <Card title="Informasi Tambahan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customFields.map((field) => (
                <div key={field.id}>
                  {field.type === "text" && (
                    <Input
                      label={field.name}
                      value={customFieldValues[field.id!] || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(field.id!, e.target.value)
                      }
                      required={field.required}
                      fullWidth
                    />
                  )}

                  {field.type === "number" && (
                    <Input
                      label={field.name}
                      type="number"
                      value={customFieldValues[field.id!] || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(field.id!, e.target.value)
                      }
                      required={field.required}
                      fullWidth
                    />
                  )}

                  {field.type === "date" && (
                    <Input
                      label={field.name}
                      type="date"
                      value={customFieldValues[field.id!] || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(field.id!, e.target.value)
                      }
                      required={field.required}
                      fullWidth
                    />
                  )}

                  {field.type === "select" && field.options && (
                    <Select
                      label={field.name}
                      options={field.options.map((opt) => ({
                        value: opt,
                        label: opt,
                      }))}
                      value={customFieldValues[field.id!] || ""}
                      onChange={(value) =>
                        handleCustomFieldChange(field.id!, value)
                      }
                      required={field.required}
                      fullWidth
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate("/residents")}>
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
            isLoading={isSubmitting}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddResident;