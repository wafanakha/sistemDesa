import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../logo-bms.png';
import { Letter } from '../../types';

interface KelahiranFormData {
  namaAnak: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaAyah: string;
  namaIbu: string;
  alamatOrtu: string;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
}

const initialForm: KelahiranFormData = {
  namaAnak: '',
  jenisKelamin: '',
  tempatLahir: '',
  tanggalLahir: '',
  namaAyah: '',
  namaIbu: '',
  alamatOrtu: '',
  pekerjaanAyah: '',
  pekerjaanIbu: '',
};

const CreateKelahiranLetter: React.FC<{ editData?: Letter; isEditMode?: boolean }> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<KelahiranFormData>(initialForm);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<KelahiranFormData> = {};
      try {
        parsed = JSON.parse(editData.content || '{}');
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPDF = async () => {
    const preview = document.getElementById('kelahiran-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('surat-kelahiran.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">Surat Keterangan Kelahiran</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="namaAnak" value={form.namaAnak} onChange={handleChange} placeholder="Nama Anak" className="input" />
        <input name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} placeholder="Jenis Kelamin" className="input" />
        <input name="tempatLahir" value={form.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" className="input" />
        <input name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} placeholder="Tanggal Lahir" type="date" className="input" />
        <input name="namaAyah" value={form.namaAyah} onChange={handleChange} placeholder="Nama Ayah" className="input" />
        <input name="pekerjaanAyah" value={form.pekerjaanAyah} onChange={handleChange} placeholder="Pekerjaan Ayah" className="input" />
        <input name="namaIbu" value={form.namaIbu} onChange={handleChange} placeholder="Nama Ibu" className="input" />
        <input name="pekerjaanIbu" value={form.pekerjaanIbu} onChange={handleChange} placeholder="Pekerjaan Ibu" className="input" />
        <input name="alamatOrtu" value={form.alamatOrtu} onChange={handleChange} placeholder="Alamat Orang Tua" className="input col-span-2" />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <div id="kelahiran-preview" className="bg-white p-8 border shadow max-w-[800px] mx-auto">
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Desa" className="h-16 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold text-lg">PEMERINTAH KABUPATEN BUMI MAKMUR SEJAHTERA</div>
            <div className="font-bold text-lg">KECAMATAN MAKMUR JAYA</div>
            <div className="font-bold text-xl">DESA BUMI MAKMUR</div>
            <div className="text-sm">Jl. Raya Desa Bumi Makmur No. 1, Kode Pos 12345</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT KETERANGAN KELAHIRAN</div>
          <div className="text-sm">Nomor: 470/_____/BM/____/2024</div>
        </div>
        <div className="mb-2">Yang bertanda tangan di bawah ini Kepala Desa Bumi Makmur, Kecamatan Makmur Jaya, Kabupaten Bumi Makmur Sejahtera, menerangkan bahwa:</div>
        <table className="mb-2">
          <tbody>
            <tr><td>Nama Anak</td><td className="px-2">:</td><td>{form.namaAnak}</td></tr>
            <tr><td>Jenis Kelamin</td><td className="px-2">:</td><td>{form.jenisKelamin}</td></tr>
            <tr><td>Tempat/Tgl Lahir</td><td className="px-2">:</td><td>{form.tempatLahir}, {form.tanggalLahir}</td></tr>
            <tr><td>Nama Ayah</td><td className="px-2">:</td><td>{form.namaAyah}</td></tr>
            <tr><td>Pekerjaan Ayah</td><td className="px-2">:</td><td>{form.pekerjaanAyah}</td></tr>
            <tr><td>Nama Ibu</td><td className="px-2">:</td><td>{form.namaIbu}</td></tr>
            <tr><td>Pekerjaan Ibu</td><td className="px-2">:</td><td>{form.pekerjaanIbu}</td></tr>
            <tr><td>Alamat Orang Tua</td><td className="px-2">:</td><td>{form.alamatOrtu}</td></tr>
          </tbody>
        </table>
        <div className="mb-2">Surat keterangan ini dibuat untuk keperluan administrasi kependudukan dan dapat dipergunakan sebagaimana mestinya.</div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>Bumi Makmur, .................... 2024</div>
            <div className="font-bold">Kepala Desa Bumi Makmur</div>
            <div style={{ height: '60px' }}></div>
            <div className="font-bold underline">(Nama Kepala Desa)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateKelahiranLetter;
