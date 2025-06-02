import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Save, Upload, Download, HardDrive, FileUp, FileDown, Image, FileSignature as Signature } from 'lucide-react';
import { villageService } from '../database/villageService';
import { exportService } from '../services/exportService';
import { VillageInfo } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { toast } from 'react-toastify';

const Settings: React.FC = () => {
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUploadLogoModalOpen, setIsUploadLogoModalOpen] = useState(false);
  const [isUploadSignatureModalOpen, setIsUploadSignatureModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<VillageInfo>();
  
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
        setValue('name', info.name);
        setValue('address', info.address);
        setValue('districtName', info.districtName);
        setValue('regencyName', info.regencyName);
        setValue('provinceName', info.provinceName);
        setValue('postalCode', info.postalCode);
        setValue('phoneNumber', info.phoneNumber);
        setValue('email', info.email || '');
        setValue('website', info.website || '');
        setValue('leaderName', info.leaderName);
        setValue('leaderTitle', info.leaderTitle);
        
        // Set previews
        if (info.logoUrl) {
          setLogoPreview(info.logoUrl);
        }
        
        if (info.signatureUrl) {
          setSignaturePreview(info.signatureUrl);
        }
      }
    } catch (error) {
      console.error('Error loading village info:', error);
      toast.error('Gagal memuat informasi desa');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: VillageInfo) => {
    setIsSubmitting(true);
    
    try {
      await villageService.updateVillageInfo(data);
      toast.success('Informasi desa berhasil diperbarui');
      loadVillageInfo();
    } catch (error) {
      console.error('Error updating village info:', error);
      toast.error('Gagal memperbarui informasi desa');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportService.exportDatabase();
      toast.success('Data berhasil diekspor');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    
    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (loadEvent.target?.result) {
        setLogoPreview(loadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    
    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (loadEvent.target?.result) {
        setSignaturePreview(loadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('application/json')) {
      toast.error('File harus berupa JSON');
      return;
    }
    
    // Confirm before importing
    // (Import logic will be triggered by the "Konfirmasi" button)
  };
  
  const confirmImport = async () => {
    if (!importInputRef.current?.files || importInputRef.current.files.length === 0) {
      toast.error('Silakan pilih file terlebih dahulu');
      return;
    }
    
    const file = importInputRef.current.files[0];
    
    setIsImporting(true);
    try {
      await exportService.importDatabase(file);
      toast.success('Data berhasil diimpor');
      setIsImportModalOpen(false);
      loadVillageInfo();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Gagal mengimpor data');
    } finally {
      setIsImporting(false);
    }
  };
  
  const saveLogo = async () => {
    if (!logoPreview) return;
    
    try {
      await villageService.setVillageLogo(logoPreview);
      toast.success('Logo desa berhasil diperbarui');
      setIsUploadLogoModalOpen(false);
    } catch (error) {
      console.error('Error saving logo:', error);
      toast.error('Gagal menyimpan logo desa');
    }
  };
  
  const saveSignature = async () => {
    if (!signaturePreview) return;
    
    try {
      await villageService.setLeaderSignature(signaturePreview);
      toast.success('Tanda tangan berhasil diperbarui');
      setIsUploadSignatureModalOpen(false);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Gagal menyimpan tanda tangan');
    }
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
              {...register('name', { required: 'Nama desa wajib diisi' })}
              error={errors.name?.message}
              fullWidth
            />
            
            <Input
              label="Alamat"
              {...register('address', { required: 'Alamat desa wajib diisi' })}
              error={errors.address?.message}
              fullWidth
            />
            
            <Input
              label="Kecamatan"
              {...register('districtName', { required: 'Nama kecamatan wajib diisi' })}
              error={errors.districtName?.message}
              fullWidth
            />
            
            <Input
              label="Kabupaten/Kota"
              {...register('regencyName', { required: 'Nama kabupaten wajib diisi' })}
              error={errors.regencyName?.message}
              fullWidth
            />
            
            <Input
              label="Provinsi"
              {...register('provinceName', { required: 'Nama provinsi wajib diisi' })}
              error={errors.provinceName?.message}
              fullWidth
            />
            
            <Input
              label="Kode Pos"
              {...register('postalCode', { required: 'Kode pos wajib diisi' })}
              error={errors.postalCode?.message}
              fullWidth
            />
            
            <Input
              label="Nomor Telepon"
              {...register('phoneNumber', { required: 'Nomor telepon wajib diisi' })}
              error={errors.phoneNumber?.message}
              fullWidth
            />
            
            <Input
              label="Email"
              type="email"
              {...register('email')}
              fullWidth
            />
            
            <Input
              label="Website"
              {...register('website')}
              fullWidth
            />
          </div>
        </Card>
        
        {/* Leader Information */}
        <Card title="Informasi Kepala Desa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Kepala Desa"
              {...register('leaderName', { required: 'Nama kepala desa wajib diisi' })}
              error={errors.leaderName?.message}
              fullWidth
            />
            
            <Input
              label="Jabatan"
              {...register('leaderTitle', { required: 'Jabatan kepala desa wajib diisi' })}
              error={errors.leaderTitle?.message}
              fullWidth
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Desa
              </label>
              <div className="border rounded-md p-4 text-center">
                {logoPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={logoPreview} alt="Logo Desa" className="h-24 object-contain mb-4" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Image size={16} />}
                      onClick={() => setIsUploadLogoModalOpen(true)}
                    >
                      Ganti Logo
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-gray-500 mb-4">Belum ada logo desa</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Upload size={16} />}
                      onClick={() => setIsUploadLogoModalOpen(true)}
                    >
                      Unggah Logo
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanda Tangan Kepala Desa
              </label>
              <div className="border rounded-md p-4 text-center">
                {signaturePreview ? (
                  <div className="flex flex-col items-center">
                    <img src={signaturePreview} alt="Tanda Tangan" className="h-24 object-contain mb-4" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Signature size={16} />}
                      onClick={() => setIsUploadSignatureModalOpen(true)}
                    >
                      Ganti Tanda Tangan
                    </Button>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-gray-500 mb-4">Belum ada tanda tangan</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Upload size={16} />}
                      onClick={() => setIsUploadSignatureModalOpen(true)}
                    >
                      Unggah Tanda Tangan
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
          Data yang dibackup mencakup semua informasi warga, surat, template, dan pengaturan desa.
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
      
      {/* Upload Logo Modal */}
      <Modal
        isOpen={isUploadLogoModalOpen}
        onClose={() => setIsUploadLogoModalOpen(false)}
        title="Unggah Logo Desa"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Unggah logo desa yang akan ditampilkan pada kop surat dan aplikasi.
            Gunakan format gambar (JPG, PNG) dengan ukuran maksimal 2MB.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {logoPreview ? (
              <div className="flex flex-col items-center">
                <img src={logoPreview} alt="Logo Preview" className="h-32 object-contain mb-4" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Ganti Gambar
                </Button>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex justify-center mb-4">
                  <Image size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Klik untuk memilih file atau drag & drop file di sini</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Pilih File
                </Button>
              </div>
            )}
            
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadLogoModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={saveLogo}
              disabled={!logoPreview}
            >
              Simpan Logo
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Upload Signature Modal */}
      <Modal
        isOpen={isUploadSignatureModalOpen}
        onClose={() => setIsUploadSignatureModalOpen(false)}
        title="Unggah Tanda Tangan"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Unggah tanda tangan kepala desa yang akan ditampilkan pada surat-surat resmi.
            Gunakan format gambar (JPG, PNG) dengan latar belakang transparan untuk hasil terbaik.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {signaturePreview ? (
              <div className="flex flex-col items-center">
                <img src={signaturePreview} alt="Signature Preview" className="h-32 object-contain mb-4" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  Ganti Gambar
                </Button>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex justify-center mb-4">
                  <Signature size={48} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Klik untuk memilih file atau drag & drop file di sini</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  Pilih File
                </Button>
              </div>
            )}
            
            <input
              type="file"
              ref={signatureInputRef}
              onChange={handleSignatureUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadSignatureModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={saveSignature}
              disabled={!signaturePreview}
            >
              Simpan Tanda Tangan
            </Button>
          </div>
        </div>
      </Modal>
      
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
              Mengimpor data akan menimpa semua data yang ada. 
              Pastikan Anda telah membuat backup sebelum melakukan impor.
            </p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <HardDrive size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Pilih file backup JSON untuk diimpor</p>
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
            
            {importInputRef.current?.files && importInputRef.current.files.length > 0 && (
              <p className="mt-4 text-sm text-gray-700">
                File terpilih: {importInputRef.current.files[0].name}
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
              disabled={!importInputRef.current?.files || importInputRef.current.files.length === 0}
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