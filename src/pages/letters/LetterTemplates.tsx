import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Save, Trash2, Edit, Plus, FileText } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { LetterTemplate, LetterType } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

interface TemplateFormData {
  name: string;
  type: LetterType;
  template: string;
  isDefault: boolean;
}

const LetterTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<LetterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { register, handleSubmit, setValue, control, reset, formState: { errors } } = useForm<TemplateFormData>();
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await letterService.getAllTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Gagal memuat template surat');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(template => template.type === selectedType);
      setFilteredTemplates(filtered);
    }
  }, [selectedType, templates]);
  
  const openEditModal = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setValue('name', template.name);
    setValue('type', template.type);
    setValue('template', template.template);
    setValue('isDefault', template.isDefault);
    setIsEditModalOpen(true);
  };
  
  const openNewModal = () => {
    reset({
      name: '',
      type: 'domicile',
      template: '',
      isDefault: false
    });
    setIsNewModalOpen(true);
  };
  
  const openDeleteModal = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };
  
  const onSubmitEdit = async (data: TemplateFormData) => {
    if (!selectedTemplate) return;
    
    try {
      await letterService.updateTemplate(selectedTemplate.id!, {
        name: data.name,
        type: data.type,
        template: data.template,
        isDefault: data.isDefault
      });
      
      toast.success('Template berhasil diperbarui');
      setIsEditModalOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal memperbarui template');
      }
    }
  };
  
  const onSubmitNew = async (data: TemplateFormData) => {
    try {
      await letterService.addTemplate({
        name: data.name,
        type: data.type,
        template: data.template,
        isDefault: data.isDefault,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast.success('Template berhasil ditambahkan');
      setIsNewModalOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Gagal menambahkan template');
    }
  };
  
  const confirmDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      await letterService.deleteTemplate(selectedTemplate.id!);
      toast.success('Template berhasil dihapus');
      setIsDeleteModalOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal menghapus template');
      }
    }
  };
  
  const getLetterTypeLabel = (type: string) => {
    switch (type) {
      case 'domicile': return 'Keterangan Domisili';
      case 'poverty': return 'Keterangan Tidak Mampu';
      case 'introduction': return 'Pengantar';
      case 'business': return 'Keterangan Usaha';
      case 'birth': return 'Keterangan Kelahiran';
      case 'custom': return 'Kustom';
      default: return type;
    }
  };
  
  const renderTemplateForm = (isEdit: boolean) => {
    return (
      <form onSubmit={handleSubmit(isEdit ? onSubmitEdit : onSubmitNew)} className="space-y-4">
        <Input
          label="Nama Template"
          {...register('name', { required: 'Nama template wajib diisi' })}
          error={errors.name?.message}
          fullWidth
        />
        
        <Controller
          name="type"
          control={control}
          rules={{ required: 'Jenis surat wajib dipilih' }}
          render={({ field }) => (
            <Select
              label="Jenis Surat"
              options={[
                { value: 'domicile', label: 'Surat Keterangan Domisili' },
                { value: 'poverty', label: 'Surat Keterangan Tidak Mampu' },
                { value: 'introduction', label: 'Surat Pengantar' },
                { value: 'business', label: 'Surat Keterangan Usaha' },
                { value: 'birth', label: 'Surat Keterangan Kelahiran' },
                { value: 'custom', label: 'Surat Kustom' }
              ]}
              error={errors.type?.message}
              fullWidth
              {...field}
            />
          )}
        />
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Isi Template
            </label>
            <span className="text-xs text-gray-500">
              Gunakan [PLACEHOLDER] untuk data dinamis
            </span>
          </div>
          <textarea
            className="w-full h-64 border border-gray-300 rounded-md shadow-sm p-3 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 font-mono text-sm"
            {...register('template', { required: 'Isi template wajib diisi' })}
          />
          {errors.template && (
            <p className="mt-1 text-sm text-red-600">{errors.template.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            {...register('isDefault')}
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
            Jadikan sebagai template default untuk jenis surat ini
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
            {isEdit ? 'Simpan Perubahan' : 'Simpan Template'}
          </Button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Template Surat</h2>
        
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={openNewModal}
        >
          Tambah Template
        </Button>
      </div>
      
      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter Jenis Surat
          </label>
          <Select
            options={[
              { value: 'all', label: 'Semua Jenis' },
              { value: 'domicile', label: 'Surat Keterangan Domisili' },
              { value: 'poverty', label: 'Surat Keterangan Tidak Mampu' },
              { value: 'introduction', label: 'Surat Pengantar' },
              { value: 'business', label: 'Surat Keterangan Usaha' },
              { value: 'birth', label: 'Surat Keterangan Kelahiran' },
              { value: 'custom', label: 'Surat Kustom' }
            ]}
            value={selectedType}
            onChange={setSelectedType}
            fullWidth
          />
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText size={20} className="text-teal-600 mr-2" />
                      <h3 className="font-medium text-gray-800">{template.name}</h3>
                      {template.isDefault && (
                        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full ml-2">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-1 text-amber-600 hover:text-amber-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(template)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Jenis: {getLetterTypeLabel(template.type)}
                  </p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto font-mono">
                    <pre className="whitespace-pre-wrap">{template.template.substring(0, 200)}...</pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada template yang ditemukan</p>
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  className="mt-4"
                  onClick={openNewModal}
                >
                  Tambah Template
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Placeholder guide */}
      <Card title="Panduan Placeholder Template">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Gunakan placeholder berikut untuk mengisi data secara otomatis ke dalam template:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Data Warga</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_NAME]</code> - Nama warga</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_NIK]</code> - NIK warga</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_BIRTHDATE]</code> - Tanggal lahir</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_GENDER]</code> - Jenis kelamin</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_RELIGION]</code> - Agama</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_OCCUPATION]</code> - Pekerjaan</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_MARITAL_STATUS]</code> - Status perkawinan</li>
                <li><code className="bg-gray-100 p-1 rounded">[RESIDENT_ADDRESS]</code> - Alamat</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Data Desa & Surat</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_NAME]</code> - Nama desa</li>
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_DISTRICT]</code> - Nama kecamatan</li>
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_REGENCY]</code> - Nama kabupaten</li>
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_PROVINCE]</code> - Nama provinsi</li>
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_LEADER_NAME]</code> - Nama kepala desa</li>
                <li><code className="bg-gray-100 p-1 rounded">[VILLAGE_LEADER_TITLE]</code> - Jabatan kepala desa</li>
                <li><code className="bg-gray-100 p-1 rounded">[LETTER_PURPOSE]</code> - Tujuan surat</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Template Surat"
        size="lg"
      >
        {renderTemplateForm(true)}
      </Modal>
      
      {/* New Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Tambah Template Surat Baru"
        size="lg"
      >
        {renderTemplateForm(false)}
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
            Apakah Anda yakin ingin menghapus template <strong>{selectedTemplate?.name}</strong>?
            {selectedTemplate?.isDefault && (
              <span className="block mt-2 text-amber-600">
                Ini adalah template default untuk jenis surat {getLetterTypeLabel(selectedTemplate.type)}.
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
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LetterTemplates;