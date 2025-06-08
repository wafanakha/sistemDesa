import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { villageService } from '../../database/villageService';
import { exportService } from '../../services/exportService';
import { Letter, Resident, VillageInfo } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

const initialForm = {
  residentId: '',
  issuedDate: new Date().toISOString().slice(0, 10),
};

// Helper to generate the letter content as a string for export
function generateBelumMenikahLetterContent(resident: Resident, village: VillageInfo, issuedDate: string) {
  return [
    'Yang bertanda tangan di bawah ini :',
    '',
    `Nama Lengkap         : ${resident.name}`,
    `Tempat/tanggal lahir : ${resident.birthPlace}, ${resident.birthDate}`,
    `Pekerjaan            : ${resident.occupation}`,
    `NIK                  : ${resident.nik}`,
    `Agama                : ${resident.religion}`,
    `Alamat               : ${resident.address}`,
    '',
    'Dengan ini menyatakan yang sesungguhnya dan sebenarnya, bahwa saya sampai saat ini belum pernah menikah dengan seorang Perempuan, baik secara resmi maupun di bawah tangan (masih Lajang). Surat pernyataan ini saya buat untuk melengkapi persyaratan menikah.',
    '',
    'Demikian surat pernyataan ini saya buat, dan ditanda tangani dalam keadaan sehat jasmani dan rohani, tanpa ada paksaan dan bujukan dari siapapun, dan apabila surat pernyataan ini tidak benar, maka saya sedia bertanggung jawab di hadapan hukum yang berlaku.',
    '',
    `${village.name}, ${issuedDate && new Date(issuedDate).toLocaleDateString('id-ID')}`,
    'Yang menyatakan',
    '',
    '',
    '',
    resident.name,
    '',
    '',
    `Mengetahui`,
    `Kepala Desa ${village.name}`,
    '',
    '',
    '',
    village.leaderName,
  ].join('\n');
}

const CreateBelumMenikahLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadResidents();
    loadVillage();
    // Pre-fill if editing
    if (location.state?.editData) {
      const edit = location.state.editData;
      setForm({
        ...edit.content,
        residentId: edit.residentId,
        issuedDate: edit.issuedDate?.slice(0, 10) || initialForm.issuedDate,
      });
    }
  }, []);

  const loadResidents = async () => {
    const data = await residentService.getAllResidents();
    setResidents(data);
  };
  const loadVillage = async () => {
    const data = await villageService.getVillageInfo();
    setVillage(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resident = residents.find(r => String(r.id) === String(form.residentId));
      if (!resident) throw new Error('Warga tidak ditemukan');
      if (!village) throw new Error('Data desa tidak ditemukan');
      // Pastikan semua field penting terisi
      const requiredFields = ['name','nik','birthPlace','birthDate','gender','religion','occupation','address','issuedDate'];
      for (const field of requiredFields) {
        if (!form[field]) throw new Error('Field '+field+' wajib diisi');
      }
      const letter: Partial<Letter> = {
        letterType: 'belum-menikah',
        title: 'Surat Pernyataan Belum Menikah',
        residentId: form.residentId,
        issuedDate: form.issuedDate, // simpan sebagai string saja
        content: generateBelumMenikahLetterContent({
          ...resident,
          name: form.name,
          nik: form.nik,
          birthPlace: form.birthPlace,
          birthDate: form.birthDate,
          gender: form.gender,
          religion: form.religion,
          occupation: form.occupation,
          address: form.address,
        }, village, form.issuedDate),
        status: 'draft',
      };
      if (location.state?.isEditMode && location.state?.editData?.id) {
        await letterService.updateLetter(location.state.editData.id, letter);
        toast.success('Surat berhasil diperbarui');
      } else {
        await letterService.addLetter(letter as Letter);
        toast.success('Surat berhasil dibuat');
      }
      navigate('/letters');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
    const resident = residents.find(r => r.id === form.residentId);
    if (!resident || !village) {
      toast.error('Lengkapi data warga dan desa terlebih dahulu');
      return;
    }
    // Generate content string tanpa judul
    const content = generateBelumMenikahLetterContent(resident, village, form.issuedDate);
    try {
      const jsPDFmod = (await import('jspdf')).jsPDF;
      const doc = new jsPDFmod();
      // Judul surat
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('SURAT PERNYATAAN BELUM MENIKAH', 105, 20, { align: 'center' });
      // Underline judul
      const titleWidth = doc.getTextWidth('SURAT PERNYATAAN BELUM MENIKAH');
      doc.setLineWidth(0.7);
      doc.line(105 - titleWidth/2, 22, 105 + titleWidth/2, 22);
      // Isi surat
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 15, 32);
      doc.save('Surat-Pernyataan-Belum-Menikah.pdf');
      toast.success('Surat berhasil diekspor ke PDF');
    } catch (error) {
      toast.error('Gagal mengekspor surat ke PDF');
    }
  };

  // Cari resident dengan id yang sudah diparse ke number
  const resident = residents.find(r => String(r.id) === String(form.residentId));
  const genderTarget = resident?.gender === 'Laki-laki' ? 'Perempuan' : 'Laki-laki';

  // Filter residents by search
  const filteredResidents = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.nik.includes(search)
  );

  // Pencarian warga mirip CreateKeteranganLetter
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await residentService.searchResidents(e.target.value);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectResident = (resident: Resident) => {
    setForm({
      ...form,
      residentId: resident.id,
      name: resident.name,
      birthPlace: resident.birthPlace,
      birthDate: resident.birthDate,
      gender: resident.gender,
      religion: resident.religion,
      occupation: resident.occupation,
      address: resident.address,
      nik: resident.nik,
    });
    setSearch(resident.nik + ' - ' + resident.name);
    setSearchResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Surat Pernyataan Belum Menikah</h2>
      <div className="mb-4">
        <Input
          label="Cari Warga (Nama/NIK)"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Ketik nama atau NIK..."
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {searchResults.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectResident(r)}
              >
                {r.nik} - {r.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        <Input label="Nama Lengkap" name="name" value={form.name || ''} onChange={handleChange} required />
        <Input label="NIK" name="nik" value={form.nik || ''} onChange={handleChange} required />
        <Input label="Tempat Lahir" name="birthPlace" value={form.birthPlace || ''} onChange={handleChange} required />
        <Input label="Tanggal Lahir" name="birthDate" type="date" value={form.birthDate || ''} onChange={handleChange} required />
        <Input label="Jenis Kelamin" name="gender" value={form.gender || ''} onChange={handleChange} required />
        <Input label="Agama" name="religion" value={form.religion || ''} onChange={handleChange} required />
        <Input label="Pekerjaan" name="occupation" value={form.occupation || ''} onChange={handleChange} required />
        <Input label="Alamat" name="address" value={form.address || ''} onChange={handleChange} required />
        <Input label="Tanggal Surat" type="date" name="issuedDate" value={form.issuedDate} onChange={handleChange} required />
        <div className="md:col-span-2 flex space-x-2 mt-2">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="button" variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan
          </Button>
        </div>
      </form>
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview Surat">
        <div className="p-4 bg-white">
          {resident && village ? (
            <div>
              <div className="text-center font-bold underline mb-6 text-lg">SURAT PERNYATAAN BELUM MENIKAH</div>
              <pre className="whitespace-pre-wrap font-sans text-base">{generateBelumMenikahLetterContent(resident, village, form.issuedDate)}</pre>
            </div>
          ) : (
            <p>Lengkapi data warga dan desa untuk preview.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateBelumMenikahLetter;
