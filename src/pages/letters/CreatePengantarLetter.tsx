import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../logo-bms.png';
import { Letter } from '../../types';
import { residentService } from '../../database/residentService';

interface PengantarFormData {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  keperluan: string;
}

const initialForm: PengantarFormData = {
  nama: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  pekerjaan: '',
  alamat: '',
  keperluan: '',
};

const CreatePengantarLetter: React.FC<{ editData?: Letter; isEditMode?: boolean }> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<PengantarFormData>(initialForm);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<PengantarFormData> = {};
      try {
        parsed = JSON.parse(editData.content || '{}');
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await residentService.searchResidents(e.target.value);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectResident = (resident: any) => {
    setForm({
      ...form,
      nama: resident.name,
      nik: resident.nik,
      tempatLahir: resident.birthPlace,
      tanggalLahir: resident.birthDate,
      jenisKelamin: resident.gender,
      agama: resident.religion,
      pekerjaan: resident.occupation,
      alamat: resident.address,
    });
    setSearch(resident.nik + ' - ' + resident.name);
    setSearchResults([]);
  };

  const handleExportPDF = async () => {
    const preview = document.getElementById('pengantar-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('surat-pengantar.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">Surat Pengantar</h1>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari warga (NIK/Nama)..."
          value={search}
          onChange={handleSearch}
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {searchResults.length > 0 && (
          <div className="border rounded bg-white shadow max-h-48 overflow-y-auto z-10 relative">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectResident(r)}
              >
                {r.nik} - {r.name} ({r.address})
              </div>
            ))}
          </div>
        )}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nama" className="input" />
        <input name="nik" value={form.nik} onChange={handleChange} placeholder="NIK" className="input" />
        <input name="tempatLahir" value={form.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" className="input" />
        <input name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} placeholder="Tanggal Lahir" type="date" className="input" />
        <input name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} placeholder="Jenis Kelamin" className="input" />
        <input name="agama" value={form.agama} onChange={handleChange} placeholder="Agama" className="input" />
        <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} placeholder="Pekerjaan" className="input" />
        <input name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat" className="input" />
        <input name="keperluan" value={form.keperluan} onChange={handleChange} placeholder="Keperluan" className="input" />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <div id="pengantar-preview" className="bg-white p-8 border shadow max-w-[800px] mx-auto">
        <div className="container" style={{ width: '210mm', minHeight: '297mm', padding: '1cm', margin: 'auto', background: 'white', boxSizing: 'border-box' }}>
          <div className="header" style={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <img src={logo} alt="Logo Instansi" className="logo" style={{ width: 100, height: 100, marginRight: 20 }} />
            <div className="instansi" style={{ textAlign: 'center', flex: 1 }}>
              <div className="bold" style={{ fontWeight: 'bold' }}>PEMERINTAHAN DESA KEDUNGWRINGIN</div>
              <div className="bold" style={{ fontWeight: 'bold' }}>KECAMATAN PATIKREJA KABUPATEN BANYUMAS</div>
              <div className="bold" style={{ fontWeight: 'bold' }}>SEKERTARIAT DESA</div>
              <div className="bold" style={{ fontWeight: 'bold' }}>Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171</div>
              <div className="bold" style={{ fontWeight: 'bold' }}>Telp. (0281) 638395</div>
            </div>
          </div>
          <hr style={{ border: '1px solid black', marginTop: 10 }} />
          <p>Kode Desa: 02122013</p>
          <h2 style={{ textAlign: 'center', textDecoration: 'underline', fontSize: '11pt' }}>SURAT PENGANTAR</h2>
          <p style={{ textAlign: 'center' }}>Nomor: 123/SKTM/[BULAN]/[TAHUN]</p>
          <div className="content" style={{ marginTop: 30 }}>
            <p>Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:</p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr><td>1. Nama</td><td>:</td><td>{form.nama}</td></tr>
                <tr><td>2. Tempat/Tgl Lahir</td><td>:</td><td>{form.tempatLahir}, {form.tanggalLahir && new Date(form.tanggalLahir).toLocaleDateString('id-ID')}</td></tr>
                <tr><td>3. Warganegara</td><td>:</td><td>Indonesia</td></tr>
                <tr><td>4. Agama</td><td>:</td><td>{form.agama}</td></tr>
                <tr><td>5. Pekerjaan</td><td>:</td><td>{form.pekerjaan}</td></tr>
                <tr><td>6. Status Perkawinan</td><td>:</td><td>-</td></tr>
                <tr><td>7. Tempat Tinggal</td><td>:</td><td>{form.alamat}</td></tr>
                <tr>
                  <td>Surat Bukti Diri</td>
                  <td>:</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>NIK: {form.nik}</span>
                      <span>No. KK: -</span>
                    </div>
                  </td>
                </tr>
                <tr><td>Keperluan</td><td>:</td><td>{form.keperluan}</td></tr>
                <tr><td>Berlaku</td><td>:</td><td>s/d</td></tr>
                <tr><td>Keterangan lain</td><td>:</td><td>-</td></tr>
              </tbody>
            </table>
            <p>Demikian Surat Keterangan Keramaian ini diberikan untuk dipergunakan seperlunya.</p>
          </div>
          <div className="footer-info" style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 10 }}>
            <table>
              <tbody>
                <tr><td>No. Reg</td><td>:</td><td>_________</td></tr>
                <tr><td>Tanggal</td><td>:</td><td>{new Date().toLocaleDateString('id-ID')}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <div className="signature" style={{ width: '30%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <p>Pemohon</p>
              <div style={{ marginTop: 'auto' }}>
                <div className="ttd-space" style={{ minHeight: 70, borderBottom: '1px solid transparent' }}></div>
                <p><strong>{form.nama || '(................................)'}</strong></p>
              </div>
            </div>
            <div className="signature" style={{ width: '30%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <div>
                <p>Mengetahui,</p>
                <p>Camat Patikreja</p>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div className="ttd-space" style={{ minHeight: 70, borderBottom: '1px solid transparent' }}></div>
                <p><strong>[Nama Camat]</strong></p>
              </div>
            </div>
            <div className="signature" style={{ width: '30%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <div className="compact" style={{ textAlign: 'center' }}>
                <p>Kedungwringin, {new Date().toLocaleDateString('id-ID')}</p>
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
    </div>
  );
};

export default CreatePengantarLetter;
