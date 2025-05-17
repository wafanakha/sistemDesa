import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, ChevronLeft } from 'lucide-react';
import { residentService } from '../../database/residentService';
import { CustomField, Resident, ResidentCustomField } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const EditResident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [resident, setResident] = useState<Resident | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<Resident>();
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const residentId = parseInt(id);
        
        // Load resident data
        const residentData = await residentService.getResidentById(residentId);
        if (!residentData) {
          toast.error('Data warga tidak ditemukan');
          navigate('/residents');
          return;
        }
        
        setResident(residentData);
        
        // Set form values
        setValue('nik', residentData.nik);
        setValue('name', residentData.name);
        setValue('address', residentData.address);
        setValue('birthDate', residentData.birthDate);
        setValue('gender', residentData.gender);
        setValue('religion', residentData.religion);
        setValue('occupation', residentData.occupation);
        setValue('maritalStatus', residentData.maritalStatus);
        
        // Load custom fields
        const fields = await residentService.getCustomFields();
        setCustomFields(fields);
        
        // Load custom field values
        const fieldValues = await residentService.getResidentCustomFields(residentId);
        
        // Convert to a more convenient format for form handling
        const valuesObj: {[key: number]: string} = {};
        fieldValues.forEach(fv => {
          valuesObj[fv.customFieldId] = fv.value;
        });
        
        setCustomFieldValues(valuesObj);
        
      } catch (error) {
        console.error('Error loading resident data:', error);
        toast.error('Gagal memuat data warga');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate, setValue]);
  
  const handleCustomFieldChange = (fieldId: number, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const onSubmit = async (data: Resident) => {
    if (!resident || !id) return;
    
    setIsSubmitting(true);
    
    try {
      const residentId = parseInt(id);
      
      // Update resident data
      await residentService.updateResident(residentId, data);
      
      // Update custom field values
      for (const [fieldId, value] of Object.entries(customFieldValues)) {
        if (value) {
          await residentService.setResidentCustomField(
            residentId,
            parseInt(fieldId),
            value
          );
        }
      }
      
      toast.success('Data warga berhasil diperbarui');
      navigate(`/residents/view/${residentId}`);
    } catch (error) {
      console.error('Error updating resident:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal memperbarui data warga');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Data Warga</h2>
        </div>
        
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
  
  if (!resident) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">Data warga tidak ditemukan</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/residents')}
        >
          Kembali ke Daftar Warga
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Edit Data Warga</h2>
        
        <Button
          variant="outline"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate(`/residents/view/${id}`)}
        >
          Kembali
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic information */}
        <Card title="Informasi Dasar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="NIK"
              {...register('nik', { 
                required: 'NIK wajib diisi',
                minLength: { value: 16, message: 'NIK harus 16 digit' },
                maxLength: { value: 16, message: 'NIK harus 16 digit' },
                pattern: { value: /^[0-9]+$/, message: 'NIK hanya boleh berisi angka' }
              })}
              error={errors.nik?.message}
              fullWidth
            />
            
            <Input
              label="Nama Lengkap"
              {...register('name', { required: 'Nama wajib diisi' })}
              error={errors.name?.message}
              fullWidth
            />
            
            <Input
              label="Tanggal Lahir"
              type="date"
              {...register('birthDate', { required: 'Tanggal lahir wajib diisi' })}
              error={errors.birthDate?.message}
              fullWidth
            />
            
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Jenis kelamin wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Jenis Kelamin"
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' }
                  ]}
                  error={errors.gender?.message}
                  fullWidth
                  {...field}
                />
              )}
            />
            
            <Input
              label="Agama"
              {...register('religion', { required: 'Agama wajib diisi' })}
              error={errors.religion?.message}
              fullWidth
            />
            
            <Input
              label="Pekerjaan"
              {...register('occupation', { required: 'Pekerjaan wajib diisi' })}
              error={errors.occupation?.message}
              fullWidth
            />
            
            <Controller
              name="maritalStatus"
              control={control}
              rules={{ required: 'Status perkawinan wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Status Perkawinan"
                  options={[
                    { value: 'Belum Kawin', label: 'Belum Kawin' },
                    { value: 'Kawin', label: 'Kawin' },
                    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
                    { value: 'Cerai Mati', label: 'Cerai Mati' }
                  ]}
                  error={errors.maritalStatus?.message}
                  fullWidth
                  {...field}
                />
              )}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Alamat"
                {...register('address', { required: 'Alamat wajib diisi' })}
                error={errors.address?.message}
                fullWidth
              />
            </div>
          </div>
        </Card>
        
        {/* Custom fields */}
        {customFields.length > 0 && (
          <Card title="Informasi Tambahan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customFields.map(field => (
                <div key={field.id}>
                  {field.type === 'text' && (
                    <Input
                      label={field.name}
                      value={customFieldValues[field.id!] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id!, e.target.value)}
                      required={field.required}
                      fullWidth
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      label={field.name}
                      type="number"
                      value={customFieldValues[field.id!] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id!, e.target.value)}
                      required={field.required}
                      fullWidth
                    />
                  )}
                  
                  {field.type === 'date' && (
                    <Input
                      label={field.name}
                      type="date"
                      value={customFieldValues[field.id!] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id!, e.target.value)}
                      required={field.required}
                      fullWidth
                    />
                  )}
                  
                  {field.type === 'select' && field.options && (
                    <Select
                      label={field.name}
                      options={field.options.map(opt => ({ value: opt, label: opt }))}
                      value={customFieldValues[field.id!] || ''}
                      onChange={(value) => handleCustomFieldChange(field.id!, value)}
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
          <Button
            variant="outline"
            onClick={() => navigate(`/residents/view/${id}`)}
          >
            Batal
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
            isLoading={isSubmitting}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditResident;