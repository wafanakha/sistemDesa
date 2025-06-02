import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, ChevronLeft, Eye } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { villageService } from '../../database/villageService';
import { Letter, LetterType, Resident, VillageInfo } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

interface LetterFormData {
  title: string;
  letterType: LetterType;
  purpose: string;
  content: string;
  issuedDate: string;
  status: 'draft' | 'completed' | 'signed';
}

const EditLetter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [letter, setLetter] = useState<Letter | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<LetterFormData>();
  
  const letterContent = watch('content');
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const letterId = parseInt(id);
        
        // Load letter data
        const letterData = await letterService.getLetterById(letterId);
        if (!letterData) {
          toast.error('Data surat tidak ditemukan');
          navigate('/letters');
          return;
        }
        
        setLetter(letterData);
        
        // Load resident data
        const residentData = await residentService.getResidentById(letterData.residentId);
        if (residentData) {
          setResident(residentData);
        } else {
          toast.error('Data warga tidak ditemukan');
        }
        
        // Load village info
        const info = await villageService.getVillageInfo();
        setVillageInfo(info);
        
        // Set form values
        setValue('title', letterData.title);
        setValue('letterType', letterData.letterType);
        setValue('purpose', letterData.purpose || '');
        setValue('content', letterData.content);
        setValue('issuedDate', letterData.issuedDate.toISOString().split('T')[0]);
        setValue('status', letterData.status);
        
      } catch (error) {
        console.error('Error loading letter data:', error);
        toast.error('Gagal memuat data surat');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate, setValue]);
  
  const onSubmit = async (data: LetterFormData) => {
    if (!letter || !id) return;
    
    setIsSubmitting(true);
    
    try {
      const letterId = parseInt(id);
      
      // Create updated letter object
      const updatedLetter: Partial<Letter> = {
        title: data.title,
        letterType: data.letterType,
        purpose: data.purpose,
        content: data.content,
        issuedDate: new Date(data.issuedDate),
        status: data.status,
        updatedAt: new Date()
      };
      
      // Update letter in database
      await letterService.updateLetter(letterId, updatedLetter);
      
      toast.success('Surat berhasil diperbarui');
      navigate(`/letters/view/${letterId}`);
    } catch (error) {
      console.error('Error updating letter:', error);
      toast.error('Gagal memperbarui surat');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const populateLetterContent = () => {
    if (!resident || !letter || !villageInfo) return;
    
    // Make a copy of the template content
    let content = letter.content;
    
    // Replace resident placeholders
    content = content.replace(/\[RESIDENT_NAME\]/g, resident.name);
    content = content.replace(/\[RESIDENT_NIK\]/g, resident.nik);
    
    const birthDate = new Date(resident.birthDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    content = content.replace(/\[RESIDENT_BIRTHDATE\]/g, birthDate);
    
    content = content.replace(/\[RESIDENT_GENDER\]/g, resident.gender);
    content = content.replace(/\[RESIDENT_RELIGION\]/g, resident.religion);
    content = content.replace(/\[RESIDENT_OCCUPATION\]/g, resident.occupation);
    content = content.replace(/\[RESIDENT_MARITAL_STATUS\]/g, resident.maritalStatus);
    content = content.replace(/\[RESIDENT_ADDRESS\]/g, resident.address);
    
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
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Surat</h2>
        </div>
        
        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!letter || !resident) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">Data surat tidak ditemukan</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/letters')}
        >
          Kembali ke Daftar Surat
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Edit Surat</h2>
        
        <Button
          variant="outline"
          icon={<ChevronLeft size={18} />}
          onClick={() => navigate(`/letters/view/${id}`)}
        >
          Kembali
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Resident Information */}
        <Card title="Informasi Warga">
          <div className="px-4 py-3 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{resident.name}</p>
                <p className="text-sm text-gray-600">NIK: {resident.nik}</p>
                <p className="text-sm text-gray-600">Alamat: {resident.address}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/residents/view/${resident.id}`)}
              >
                Lihat Detail
              </Button>
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
                Perbarui Isi Otomatis
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
              onClick={() => navigate(`/letters/view/${id}`)}
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
        </div>
      </form>
    </div>
  );
};

export default EditLetter;