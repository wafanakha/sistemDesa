import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Save, Trash2, Edit, Plus, X } from 'lucide-react';
import { residentService } from '../../database/residentService';
import { CustomField } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

interface FieldFormData {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string;
}

const CustomFields: React.FC = () => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const { register, handleSubmit, setValue, control, reset, watch, formState: { errors } } = useForm<FieldFormData>();
  
  // Watch the type field to conditionally show options input
  const selectedType = watch('type');
  
  useEffect(() => {
    loadFields();
  }, []);
  
  const loadFields = async () => {
    setIsLoading(true);
    try {
      const data = await residentService.getCustomFields();
      setFields(data);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      toast.error('Gagal memuat data field kustom');
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEditModal = (field: CustomField) => {
    setSelectedField(field);
    setValue('name', field.name);
    setValue('type', field.type);
    setValue('required', field.required);
    
    // If field has options (for select type), join them into a comma-separated string
    if (field.options && field.options.length > 0) {
      setValue('options', field.options.join(','));
    } else {
      setValue('options', '');
    }
    
    setIsEditModalOpen(true);
  };
  
  const openNewModal = () => {
    reset({
      name: '',
      type: 'text',
      required: false,
      options: ''
    });
    setIsNewModalOpen(true);
  };
  
  const openDeleteModal = (field: CustomField) => {
    setSelectedField(field);
    setIsDeleteModalOpen(true);
  };
  
  const parseOptions = (optionsString?: string): string[] | undefined => {
    if (!optionsString || optionsString.trim() === '') return undefined;
    
    // Split by comma and trim whitespace
    return optionsString.split(',').map(option => option.trim()).filter(option => option !== '');
  };
  
  const onSubmitEdit = async (data: FieldFormData) => {
    if (!selectedField) return;
    
    try {
      await residentService.updateCustomField(selectedField.id!, {
        name: data.name,
        type: data.type,
        required: data.required,
        options: data.type === 'select' ? parseOptions(data.options) : undefined
      });
      
      toast.success('Field berhasil diperbarui');
      setIsEditModalOpen(false);
      loadFields();
    } catch (error) {
      console.error('Error updating custom field:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal memperbarui field');
      }
    }
  };
  
  const onSubmitNew = async (data: FieldFormData) => {
    try {
      await residentService.addCustomField({
        name: data.name,
        type: data.type,
        required: data.required,
        options: data.type === 'select' ? parseOptions(data.options) : undefined
      });
      
      toast.success('Field berhasil ditambahkan');
      setIsNewModalOpen(false);
      loadFields();
    } catch (error) {
      console.error('Error adding custom field:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menambahkan field');
      }
    }
  };
  
  const confirmDelete = async () => {
    if (!selectedField) return;
    
    try {
      await residentService.deleteCustomField(selectedField.id!);
      toast.success('Field berhasil dihapus');
      setIsDeleteModalOpen(false);
      loadFields();
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast.error('Gagal menghapus field');
    }
  };
  
  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Teks';
      case 'number': return 'Angka';
      case 'date': return 'Tanggal';
      case 'select': return 'Pilihan';
      default: return type;
    }
  };
  
  const renderFieldForm = (isEdit: boolean) => {
    return (
      <form onSubmit={handleSubmit(isEdit ? onSubmitEdit : onSubmitNew)} className="space-y-4">
        <Input
          label="Nama Field"
          {...register('name', { required: 'Nama field wajib diisi' })}
          error={errors.name?.message}
          fullWidth
        />
        
        <Controller
          name="type"
          control={control}
          rules={{ required: 'Tipe field wajib dipilih' }}
          render={({ field }) => (
            <Select
              label="Tipe Field"
              options={[
                { value: 'text', label: 'Teks' },
                { value: 'number', label: 'Angka' },
                { value: 'date', label: 'Tanggal' },
                { value: 'select', label: 'Pilihan' }
              ]}
              error={errors.type?.message}
              fullWidth
              {...field}
            />
          )}
        />
        
        {selectedType === 'select' && (
          <Input
            label="Opsi Pilihan"
            helperText="Pisahkan opsi dengan koma (contoh: Opsi 1,Opsi 2,Opsi 3)"
            {...register('options', { 
              required: selectedType === 'select' ? 'Opsi pilihan wajib diisi' : false 
            })}
            error={errors.options?.message}
            fullWidth
          />
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            {...register('required')}
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
            Field wajib diisi
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => isEdit ? setIsEditModalOpen(false) : setIsNewModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
          >
            {isEdit ? 'Simpan Perubahan' : 'Simpan Field'}
          </Button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Field Kustom</h2>
        
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={openNewModal}
        >
          Tambah Field
        </Button>
      </div>
      
      <Card>
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Field kustom memungkinkan Anda menambahkan informasi tambahan untuk setiap warga sesuai kebutuhan desa Anda.
            Field ini akan muncul di form tambah dan edit warga.
          </p>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {fields.length > 0 ? (
              fields.map(field => (
                <div key={field.id} className="border rounded-lg p-4 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{field.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {getFieldTypeLabel(field.type)}
                        </span>
                        {field.required && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">
                            Wajib
                          </span>
                        )}
                        {field.type === 'select' && field.options && (
                          <span className="ml-2">
                            Opsi: {field.options.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(field)}
                        className="p-1 text-amber-600 hover:text-amber-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(field)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada field kustom yang ditambahkan</p>
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  className="mt-4"
                  onClick={openNewModal}
                >
                  Tambah Field Kustom
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Field Kustom"
        size="md"
      >
        {renderFieldForm(true)}
      </Modal>
      
      {/* New Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Tambah Field Kustom Baru"
        size="md"
      >
        {renderFieldForm(false)}
      </Modal>
      
      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus field <strong>{selectedField?.name}</strong>?
          </p>
          <p className="text-amber-600 text-sm">
            Menghapus field ini akan menghapus semua data terkait dari semua warga.
            Tindakan ini tidak dapat dibatalkan.
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
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomFields;