import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, ChevronLeft } from 'lucide-react';
import { residentService } from '../../database/residentService';
import { CustomField, Resident } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const AddResident: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<Resident>({
    defaultValues: {
      nik: '',
      name: '',
      address: '',
      birthDate: '',
      gender: 'Laki-laki',
      religion: '',
      occupation: '',
      maritalStatus: 'Belum Kawin'
    }
  });
  
  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const fields = await residentService.getCustomFields();
        setCustomFields(fields);
      } catch (error) {
        console.error('Error loading custom fields:', error);
      }
    };
    
    loadCustomFields();
  }, []);
  
  const onSubmit = async (data: Resident) => {
    setIsSubmitting(true);
    
    try {
      // Add resident
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
      
      toast.success('Data warga berhasil ditambahkan');
      navigate('/residents');
    } catch (error) {
      console.error('Error adding resident:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menambahkan data warga');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCustomFieldChange = (fieldId: number, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tambah Warga Baru</h2>
        
        <Button
          variant="outline"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate('/residents')}
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
            onClick={() => navigate('/residents')}
          >
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