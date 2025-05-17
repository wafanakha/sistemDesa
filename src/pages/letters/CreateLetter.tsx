import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, ChevronLeft, Search, FileText, Eye } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { villageService } from '../../database/villageService';
import { Letter, LetterTemplate, LetterType, Resident, VillageInfo } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

interface LetterFormData {
  title: string;
  letterType: LetterType;
  purpose: string;
  content: string;
  issuedDate: string;
  status: 'draft' | 'completed' | 'signed';
}

const CreateLetter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedResidentId = location.state?.residentId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<LetterFormData>({
    defaultValues: {
      title: '',
      letterType: 'domicile',
      purpose: '',
      content: '',
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    }
  });
  
  const selectedLetterType = watch('letterType');
  const letterContent = watch('content');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load residents
        const allResidents = await residentService.getAllResidents();
        setResidents(allResidents);
        setFilteredResidents(allResidents);
        
        // Load templates
        const templates = await letterService.getAllTemplates();
        setLetterTemplates(templates);
        
        // Load village info
        const info = await villageService.getVillageInfo();
        setVillageInfo(info);
        
        // If a resident ID was passed in the location state, select that resident
        if (preselectedResidentId) {
          const resident = await residentService.getResidentById(preselectedResidentId);
          if (resident) {
            setSelectedResident(resident);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Gagal memuat data');
      }
    };
    
    loadData();
  }, [preselectedResidentId]);
  
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const defaultTemplate = await letterService.getDefaultTemplateByType(selectedLetterType);
        setSelectedTemplate(defaultTemplate || null);
        
        if (defaultTemplate) {
          setValue('content', defaultTemplate.template);
        }
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };
    
    loadTemplate();
  }, [selectedLetterType, setValue]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResidents(residents);
    } else {
      const filtered = residents.filter(
        resident =>
          resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resident.nik.includes(searchQuery)
      );
      setFilteredResidents(filtered);
    }
  }, [searchQuery, residents]);
  
  const selectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsResidentModalOpen(false);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const onLetterTypeChange = (value: string) => {
    setValue('letterType', value as LetterType);
  };
  
  const populateLetterContent = () => {
    if (!selectedResident || !selectedTemplate || !villageInfo) return;
    
    // Make a copy of the template content
    let content = selectedTemplate.template;
    
    // Replace resident placeholders
    content = content.replace(/\[RESIDENT_NAME\]/g, selectedResident.name);
    content = content.replace(/\[RESIDENT_NIK\]/g, selectedResident.nik);
    
    const birthDate = new Date(selectedResident.birthDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    content = content.replace(/\[RESIDENT_BIRTHDATE\]/g, birthDate);
    
    content = content.replace(/\[RESIDENT_GENDER\]/g, selectedResident.gender);
    content = content.replace(/\[RESIDENT_RELIGION\]/g, selectedResident.religion);
    content = content.replace(/\[RESIDENT_OCCUPATION\]/g, selectedResident.occupation);
    content = content.replace(/\[RESIDENT_MARITAL_STATUS\]/g, selectedResident.maritalStatus);
    content = content.replace(/\[RESIDENT_ADDRESS\]/g, selectedResident.address);
    
    // Replace village information placeholders
    content = content.replace(/\[VILLAGE_NAME\]/g, villageInfo.name);
    content = content.replace(/\[VILLAGE_DISTRICT\]/g, villageInfo.districtName);
    content = content.replace(/\[VILLAGE_REGENCY\]/g, villageInfo.regencyName);
    content = content.replace(/\[VILLAGE_PROVINCE\]/g, villageInfo.provinceName);
    content = content.replace(/\[VILLAGE_LEADER_NAME\]/g, villageInfo.leaderName);
    content = content.replace(/\[VILLAGE_LEADER_TITLE\]/g, villageInfo.leaderTitle);
    
    // Replace letter purpose if entered
    const purpose = watch('purpose');
    if (purpose) {
      content = content.replace(/\[LETTER_PURPOSE\]/g, purpose);
    }
    
    setValue('content', content);
  };
  
  const onSubmit = async (data: LetterFormData) => {
    if (!selectedResident) {
      toast.error('Silakan pilih warga terlebih dahulu');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate letter number
      const letterNumber = await letterService.generateLetterNumber(data.letterType);
      
      // Create letter object
      const letter: Letter = {
        letterNumber,
        letterType: data.letterType,
        residentId: selectedResident.id!,
        title: data.title,
        content: data.content,
        purpose: data.purpose,
        issuedDate: new Date(data.issuedDate),
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to database
      const id = await letterService.addLetter(letter);
      
      toast.success('Surat berhasil dibuat');
      navigate(`/letters/view/${id}`);
    } catch (error) {
      console.error('Error creating letter:', error);
      toast.error('Gagal membuat surat');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Buat Surat Baru</h2>
        
        <Button
          variant="outline"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate('/letters')}
        >
          Kembali
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Resident Selection */}
        <Card title="Pilih Warga">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
            <div className="w-full sm:w-auto sm:flex-1">
              {selectedResident ? (
                <div className="px-4 py-3 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedResident.name}</p>
                      <p className="text-sm text-gray-600">NIK: {selectedResident.nik}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsResidentModalOpen(true)}
                    >
                      Ganti
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-gray-500 mb-2">Belum ada warga dipilih</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsResidentModalOpen(true)}
                  >
                    Pilih Warga
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Letter Information */}
        <Card title="Informasi Surat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Judul Surat"
              {...register('title', { required: 'Judul surat wajib diisi' })}
              error={errors.title?.message}
              fullWidth
            />
            
            <Controller
              name="letterType"
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
                  onChange={onLetterTypeChange}
                  error={errors.letterType?.message}
                  fullWidth
                  {...field}
                />
              )}
            />
            
            <Input
              label="Keperluan"
              placeholder="Contoh: Pengajuan Bantuan Sosial"
              {...register('purpose')}
              fullWidth
            />
            
            <Input
              label="Tanggal Surat"
              type="date"
              {...register('issuedDate', { required: 'Tanggal surat wajib diisi' })}
              error={errors.issuedDate?.message}
              fullWidth
            />
            
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status surat wajib dipilih' }}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'completed', label: 'Selesai' },
                    { value: 'signed', label: 'Ditandatangani' }
                  ]}
                  error={errors.status?.message}
                  fullWidth
                  {...field}
                />
              )}
            />
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Isi Surat
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={populateLetterContent}
              >
                Isi Otomatis
              </Button>
            </div>
            <textarea
              className="w-full h-64 border border-gray-300 rounded-md shadow-sm p-3 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              {...register('content', { required: 'Isi surat wajib diisi' })}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </Card>
        
        {/* Preview */}
        {isPreviewMode && (
          <Card title="Preview Surat">
            <div className="whitespace-pre-wrap border p-4 rounded-md bg-white min-h-[300px]">
              {letterContent}
            </div>
          </Card>
        )}
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            icon={<Eye size={18} />}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? 'Tutup Preview' : 'Preview'}
          </Button>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/letters')}
            >
              Batal
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={18} />}
              isLoading={isSubmitting}
            >
              Simpan Surat
            </Button>
          </div>
        </div>
      </form>
      
      {/* Resident selection modal */}
      <Modal
        isOpen={isResidentModalOpen}
        onClose={() => setIsResidentModalOpen(false)}
        title="Pilih Warga"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            placeholder="Cari berdasarkan nama atau NIK..."
            value={searchQuery}
            onChange={handleSearch}
            startIcon={<Search size={18} />}
            fullWidth
          />
          
          <div className="max-h-96 overflow-y-auto">
            {filteredResidents.length > 0 ? (
              <div className="divide-y">
                {filteredResidents.map(resident => (
                  <div
                    key={resident.id}
                    className="py-3 px-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectResident(resident)}
                  >
                    <p className="font-medium">{resident.name}</p>
                    <div className="flex flex-wrap text-sm text-gray-500 mt-1">
                      <span>NIK: {resident.nik}</span>
                      <span className="mx-2">•</span>
                      <span>{resident.address}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">Tidak ada warga yang ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateLetter;