import React from 'react';
import { Info, HelpCircle, Book, FileText, UserPlus, Pen, Download, Settings } from 'lucide-react';
import Card from '../components/ui/Card';

const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Bantuan</h2>
      
      <Card title="Tentang Sistem Administrasi Desa">
        <div className="space-y-4">
          <p className="text-gray-700">
            Sistem Administrasi Desa adalah aplikasi manajemen administrasi desa yang dirancang khusus
            untuk perangkat desa di Indonesia. Aplikasi ini memungkinkan pengelolaan data warga dan
            pembuatan berbagai jenis surat administratif yang umum dibutuhkan di tingkat desa.
          </p>
          
          <p className="text-gray-700">
            Aplikasi ini dibuat untuk beroperasi secara offline, artinya dapat digunakan tanpa koneksi internet.
            Semua data disimpan secara lokal pada perangkat yang digunakan, sehingga tidak memerlukan
            server atau hosting terpisah.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Versi aplikasi: 0.1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="Fitur Utama">
        <div className="space-y-4">
          <HelpSection
            icon={<UserPlus className="h-6 w-6 text-blue-600" />}
            title="Manajemen Data Warga"
            content={`
              Fitur ini memungkinkan Anda untuk mengelola data penduduk desa, termasuk:
              
              - Menambahkan data warga baru
              - Mengedit dan memperbarui data warga
              - Mencari data warga berdasarkan nama atau NIK
              - Menambahkan field kustom sesuai kebutuhan desa
            `}
          />
          
          <HelpSection
            icon={<FileText className="h-6 w-6 text-teal-600" />}
            title="Manajemen Surat"
            content={`
              Buat berbagai jenis surat administratif dengan mudah:
              
              - Surat Keterangan Domisili
              - Surat Keterangan Tidak Mampu
              - Surat Pengantar
              - Surat Keterangan Usaha
              - Surat Keterangan Kelahiran
              - Dan jenis surat lainnya
              
              Surat akan otomatis terisi dengan data warga yang relevan dan kop surat desa.
            `}
          />
          
          <HelpSection
            icon={<Pen className="h-6 w-6 text-amber-600" />}
            title="Template Surat"
            content={`
              Kelola template untuk berbagai jenis surat:
              
              - Gunakan template default yang tersedia
              - Buat template kustom sesuai kebutuhan
              - Edit template yang sudah ada
              - Tambahkan placeholder untuk mengisi data secara otomatis
            `}
          />
          
          <HelpSection
            icon={<Download className="h-6 w-6 text-purple-600" />}
            title="Ekspor Surat"
            content={`
              Ekspor surat dalam berbagai format:
              
              - Format PDF untuk pencetakan dan distribusi
              - Format DOCX untuk pengeditan lebih lanjut
              
              Surat yang diekspor akan menyertakan kop surat resmi desa dan dapat ditambahkan tanda tangan digital.
            `}
          />
          
          <HelpSection
            icon={<Settings className="h-6 w-6 text-gray-600" />}
            title="Pengaturan"
            content={`
              Konfigurasi sistem sesuai kebutuhan desa:
              
              - Pengaturan informasi desa (nama, alamat, dll)
              - Pengaturan kepala desa
              - Unggah logo desa untuk kop surat
              - Unggah tanda tangan kepala desa
              - Backup dan restore data
            `}
          />
        </div>
      </Card>
      
      <Card title="Panduan Penggunaan">
        <div className="space-y-4">
          <HelpAccordion
            title="Cara Menambahkan Warga Baru"
            content={`
              1. Buka menu "Data Warga" di sidebar
              2. Klik tombol "Tambah Warga"
              3. Isi semua informasi yang diperlukan (NIK, nama, dll)
              4. Klik tombol "Simpan" untuk menyimpan data warga
              
              Setelah warga disimpan, data mereka akan tersedia untuk digunakan dalam pembuatan surat.
            `}
          />
          
          <HelpAccordion
            title="Cara Membuat Surat"
            content={`
              1. Buka menu "Surat" di sidebar
              2. Klik tombol "Buat Surat"
              3. Pilih jenis surat yang ingin dibuat
              4. Pilih warga yang terkait dengan surat
              5. Isi informasi tambahan yang diperlukan
              6. Klik "Isi Otomatis" untuk mengisi template dengan data warga
              7. Klik tombol "Simpan Surat" untuk menyimpan surat
              
              Setelah surat disimpan, Anda dapat melihat, mengedit, atau mengekspornya ke PDF/DOCX.
            `}
          />
          
          <HelpAccordion
            title="Cara Mengelola Template Surat"
            content={`
              1. Buka menu "Surat" di sidebar
              2. Klik submenu "Template Surat"
              3. Untuk membuat template baru, klik "Tambah Template"
              4. Untuk mengedit template yang ada, klik ikon edit di samping template
              
              Dalam template, Anda dapat menggunakan placeholder seperti [RESIDENT_NAME],
              [RESIDENT_NIK], dll. yang akan otomatis diganti dengan data warga saat membuat surat.
              
              Lihat bagian "Panduan Placeholder Template" untuk daftar lengkap placeholder yang tersedia.
            `}
          />
          
          <HelpAccordion
            title="Cara Backup dan Restore Data"
            content={`
              Backup Data:
              1. Buka menu "Pengaturan"
              2. Gulir ke bagian "Backup & Restore Data"
              3. Klik tombol "Ekspor Data"
              4. File JSON akan diunduh - simpan file ini di tempat yang aman
              
              Restore Data:
              1. Buka menu "Pengaturan"
              2. Gulir ke bagian "Backup & Restore Data"
              3. Klik tombol "Impor Data"
              4. Pilih file backup JSON yang ingin dipulihkan
              5. Klik "Konfirmasi Impor"
              
              PERHATIAN: Impor data akan menimpa semua data yang ada saat ini.
              Pastikan untuk membuat backup terlebih dahulu jika diperlukan.
            `}
          />
          
          <HelpAccordion
            title="Cara Mengatur Informasi Desa"
            content={`
              1. Buka menu "Pengaturan"
              2. Isi informasi desa pada bagian "Informasi Desa":
                 - Nama desa
                 - Alamat
                 - Kecamatan, Kabupaten/Kota, Provinsi
                 - Informasi kontak
              3. Isi informasi kepala desa pada bagian "Informasi Kepala Desa"
              4. Unggah logo desa dan tanda tangan kepala desa jika tersedia
              5. Klik "Simpan Pengaturan" untuk menyimpan perubahan
              
              Informasi ini akan digunakan dalam kop surat dan bagian lain dari sistem.
            `}
          />
        </div>
      </Card>
      
    </div>
  );
};

interface HelpSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({ icon, title, content }) => {
  return (
    <div className="border rounded-lg p-4 hover:border-teal-200 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
          <div className="text-gray-600 whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

interface HelpAccordionProps {
  title: string;
  content: string;
}

const HelpAccordion: React.FC<HelpAccordionProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <HelpCircle size={18} className="text-teal-600 mr-2" />
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        <span className="text-gray-500 transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
        style={{ maxHeight: isOpen ? '500px' : '0' }}
      >
        <div className="p-4 bg-white whitespace-pre-line text-gray-700">
          {content}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;