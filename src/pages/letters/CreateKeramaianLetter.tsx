import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../logo-bms.png';
import { Letter } from '../../types';

interface KeramaianFormData {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  acara: string;
  tanggalAcara: string;
  waktuAcara: string;
  tempatAcara: string;
  keperluan: string;
}

const initialForm: KeramaianFormData = {
  nama: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  pekerjaan: '',
  alamat: '',
  acara: '',
  tanggalAcara: '',
  waktuAcara: '',
  tempatAcara: '',
  keperluan: '',
};

const CreateKeramaianLetter: React.FC<{ editData?: Letter; isEditMode?: boolean }> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<KeramaianFormData>(initialForm);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<KeramaianFormData> = {};
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
    const preview = document.getElementById('keramaian-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('surat-keramaian.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">Surat Keterangan Keramaian</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama" className="input" />
        <input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" className="input" />
        <input name="tempatLahir" value={form.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" className="input" />
        <input name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} placeholder="Tanggal Lahir" type="date" className="input" />
        <input name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} placeholder="Jenis Kelamin" className="input" />
        <input name="agama" value={form.agama} onChange={handleChange} placeholder="Agama" className="input" />
        <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} placeholder="Pekerjaan" className="input" />
        <input name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" className="input" />
        <input name="acara" value={form.acara} onChange={handleChange} placeholder="Nama Acara" className="input" />
        <input name="tanggalAcara" value={form.tanggalAcara} onChange={handleChange} placeholder="Tanggal Acara" type="date" className="input" />
        <input name="waktuAcara" value={form.waktuAcara} onChange={handleChange} placeholder="Waktu Acara" className="input" />
        <input name="tempatAcara" value={form.tempatAcara} onChange={handleChange} placeholder="Tempat Acara" className="input" />
        <textarea name="keperluan" value={form.keperluan} onChange={handleChange} placeholder="Keperluan" className="input col-span-2" />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <div id="keramaian-preview" className="bg-white p-8 border shadow max-w-[800px] mx-auto">
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
          <div className="font-bold underline text-lg">SURAT KETERANGAN IZIN KERAMAIAN</div>
          <div className="text-sm">Nomor: 470/_____/BM/____/2024</div>
        </div>
        <div className="mb-2">Yang bertanda tangan di bawah ini Kepala Desa Bumi Makmur, Kecamatan Makmur Jaya, Kabupaten Bumi Makmur Sejahtera, menerangkan bahwa:</div>
        <table className="mb-2">
          <tbody>
            <tr><td>Nama</td><td className="px-2">:</td><td>{form.nama}</td></tr>
            <tr><td>NIK</td><td className="px-2">:</td><td>{form.nik}</td></tr>
            <tr><td>Tempat/Tgl Lahir</td><td className="px-2">:</td><td>{form.tempatLahir}, {form.tanggalLahir}</td></tr>
            <tr><td>Jenis Kelamin</td><td className="px-2">:</td><td>{form.jenisKelamin}</td></tr>
            <tr><td>Agama</td><td className="px-2">:</td><td>{form.agama}</td></tr>
            <tr><td>Pekerjaan</td><td className="px-2">:</td><td>{form.pekerjaan}</td></tr>
            <tr><td>Alamat</td><td className="px-2">:</td><td>{form.alamat}</td></tr>
          </tbody>
        </table>
        <div className="mb-2">Orang tersebut di atas mengajukan permohonan izin keramaian untuk acara:</div>
        <table className="mb-2">
          <tbody>
            <tr><td>Nama Acara</td><td className="px-2">:</td><td>{form.acara}</td></tr>
            <tr><td>Tanggal</td><td className="px-2">:</td><td>{form.tanggalAcara}</td></tr>
            <tr><td>Waktu</td><td className="px-2">:</td><td>{form.waktuAcara}</td></tr>
            <tr><td>Tempat</td><td className="px-2">:</td><td>{form.tempatAcara}</td></tr>
            <tr><td>Keperluan</td><td className="px-2">:</td><td>{form.keperluan}</td></tr>
          </tbody>
        </table>
        <div className="mb-2">Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</div>
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

export default CreateKeramaianLetter;
