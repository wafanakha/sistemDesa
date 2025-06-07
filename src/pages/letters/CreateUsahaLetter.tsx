import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../logo-bms.png';
import { Letter } from '../../types';

interface UsahaFormData {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  namaUsaha: string;
  alamatUsaha: string;
  jenisUsaha: string;
}

const initialForm: UsahaFormData = {
  nama: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  pekerjaan: '',
  alamat: '',
  namaUsaha: '',
  alamatUsaha: '',
  jenisUsaha: '',
};

const CreateUsahaLetter: React.FC<{ editData?: Letter; isEditMode?: boolean }> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<UsahaFormData>(initialForm);
  const navigate = useNavigate();

  useEffect(() => {
    if (editData) {
      // Jika mode edit, parse content (JSON) ke form
      let parsed: Partial<UsahaFormData> = {};
      try {
        parsed = JSON.parse(editData.content || '{}');
      } catch {}
      setForm({
        ...initialForm,
        ...parsed,
      });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPDF = async () => {
    const preview = document.getElementById('usaha-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('surat-usaha.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">Surat Keterangan Usaha</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama" className="input" />
        <input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" className="input" />
        <input name="tempatLahir" value={form.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" className="input" />
        <input name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} placeholder="Tanggal Lahir" type="date" className="input" />
        <input name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} placeholder="Jenis Kelamin" className="input" />
        <input name="agama" value={form.agama} onChange={handleChange} placeholder="Agama" className="input" />
        <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} placeholder="Pekerjaan" className="input" />
        <input name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" className="input" />
        <input name="namaUsaha" value={form.namaUsaha} onChange={handleChange} placeholder="Nama Usaha" className="input" />
        <input name="alamatUsaha" value={form.alamatUsaha} onChange={handleChange} placeholder="Alamat Usaha" className="input" />
        <input name="jenisUsaha" value={form.jenisUsaha} onChange={handleChange} placeholder="Jenis Usaha" className="input" />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <div id="usaha-preview" className="bg-white p-8 border shadow max-w-[800px] mx-auto">
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Instansi" className="h-24 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold">PEMERINTAHAN DESA KEDUNGWRINGIN</div>
            <div className="font-bold">KECAMATAN PATIKREJA KABUPATEN BANYUMAS</div>
            <div className="font-bold">SEKERTARIAT DESA</div>
            <div className="font-bold">Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171</div>
            <div className="font-bold">Telp. (0281) 638395</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <p>Kode Desa: 02122013</p>
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT KETERANGAN USAHA</div>
          <div className="text-sm">Nomor: 123/SKU/[BULAN]/[TAHUN]</div>
        </div>
        <div className="mb-2">Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:</div>
        <table className="mb-2">
          <tbody>
            <tr><td>1. Nama</td><td>:</td><td>{form.nama}</td></tr>
            <tr><td>2. Tempat/Tgl Lahir</td><td>:</td><td>{form.tempatLahir}, {form.tanggalLahir}</td></tr>
            <tr><td>3. Warganegara</td><td>:</td><td>{form.jenisKelamin}</td></tr>
            <tr><td>4. Agama</td><td>:</td><td>{form.agama}</td></tr>
            <tr><td>5. Pekerjaan</td><td>:</td><td>{form.pekerjaan}</td></tr>
            <tr><td>6. Tempat Tinggal</td><td>:</td><td>{form.alamat}</td></tr>
            <tr>
              <td>7. Surat Bukti Diri</td>
              <td>:</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>NIK: {form.nik}</span>
                  <span>No. KK: {form.namaUsaha}</span>
                </div>
              </td>
            </tr>
            <tr><td>8. Keperluan</td><td>:</td><td>{form.jenisUsaha}</td></tr>
            <tr><td>9. Berlaku</td><td>:</td><td>s/d</td></tr>
            <tr><td>10. Keterangan lain</td><td>:</td><td>-</td></tr>
          </tbody>
        </table>
        <div className="mb-2">Demikian Surat Keterangan Usaha ini diberikan untuk dipergunakan seperlunya.</div>
        <div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <div className="signature" style={{ width: '30%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
            <p>Pemohon</p>
            <div style={{ marginTop: 'auto' }}>
              <div className="ttd-space" style={{ minHeight: 70, borderBottom: '1px solid transparent' }}></div>
              <p><strong>{form.nama}</strong></p>
            </div>
          </div>
          <div className="signature" style={{ width: '30%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
            <div className="compact">
              <p>Kedungwringin, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p>An. KEPALA DESA KEDUNGWRINGIN</p>
              <p>KASI PEMERINTAH</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div className="ttd-space" style={{ minHeight: 70, borderBottom: '1px solid transparent' }}></div>
              <p><strong>[Nama Kepala Desa]</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUsahaLetter;
