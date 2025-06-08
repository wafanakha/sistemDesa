import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../logo-bms.png';
import { residentService } from '../../database/residentService';

interface PewarisData {
  nama: string;
  umur: string;
  alamat: string;
  hariWafat: string;
  tanggalWafat: string;
  tempatWafat: string;
  aktaKematian: string;
  tanggalAkta: string;
}

interface AhliWarisData {
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  alamat: string;
  hubungan: string;
}

const initialPewaris: PewarisData = {
  nama: '',
  umur: '',
  alamat: '',
  hariWafat: '',
  tanggalWafat: '',
  tempatWafat: '',
  aktaKematian: '',
  tanggalAkta: '',
};

const initialAhliWaris: AhliWarisData[] = [];

const CreateAhliWarisLetter: React.FC = () => {
  const [kkSearch, setKkSearch] = useState('');
  const [kkResults, setKkResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedKk, setSelectedKk] = useState<any>(null);
  const [pewaris, setPewaris] = useState<PewarisData>(initialPewaris);
  const [ahliWaris, setAhliWaris] = useState<AhliWarisData[]>(initialAhliWaris);
  const navigate = useNavigate();

  // Cari KK dan tampilkan anggota, pilih yang meninggal
  const handleKkSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setKkSearch(e.target.value);
    if (e.target.value.length < 3) {
      setKkResults([]);
      return;
    }
    setSearching(true);
    const results = await residentService.searchKk(e.target.value); // Anda perlu menyesuaikan residentService agar bisa search KK
    setKkResults(results);
    setSearching(false);
  };

  // Setelah KK dipilih, pilih pewaris (yang meninggal)
  const handleSelectKk = (kk: any) => {
    setSelectedKk(kk);
    setKkSearch(kk.kk);
    setKkResults([]);
  };

  // Pilih pewaris (yang meninggal)
  const handleSelectPewaris = (pewarisRes: any) => {
    setPewaris({
      nama: pewarisRes.name,
      umur: pewarisRes.age + ' Tahun',
      alamat: pewarisRes.address,
      hariWafat: '',
      tanggalWafat: '',
      tempatWafat: pewarisRes.address,
      aktaKematian: '',
      tanggalAkta: '',
    });
    // Otomatis ambil anggota KK lain sebagai ahli waris
    const ahli = (selectedKk?.members || []).filter((m: any) => m.id !== pewarisRes.id).map((m: any) => ({
      nama: m.name,
      tempatLahir: m.birthPlace,
      tanggalLahir: m.birthDate,
      nik: m.nik,
      alamat: m.address,
      hubungan: m.shdk || '', // Ganti dari m.relationship ke m.shdk
    }));
    setAhliWaris(ahli);
  };

  // Export PDF
  const handleExportPDF = async () => {
    const preview = document.getElementById('ahli-waris-preview');
    if (!preview) return;
    const canvas = await html2canvas(preview, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('surat-ahli-waris.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-left text-teal-800">Surat Keterangan Ahli Waris</h1>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari Nomor KK..."
          value={kkSearch}
          onChange={handleKkSearch}
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {kkResults.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {kkResults.map((kk) => (
              <div
                key={kk.kk}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectKk(kk)}
              >
                {kk.kk} - {kk.headName}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedKk && (
        <div className="mb-4">
          <div className="font-semibold mb-2">Pilih Pewaris (yang meninggal):</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedKk.members.map((m: any) => (
              <Button key={m.id} variant="outline" onClick={() => handleSelectPewaris(m)}>{m.name} ({m.relationship})</Button>
            ))}
          </div>
        </div>
      )}
      {/* Form manual jika ingin edit data pewaris/ahli waris */}
      {/* ...bisa ditambah jika perlu... */}
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <div id="ahli-waris-preview" className="bg-white p-8 border shadow max-w-[800px] mx-auto">
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
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT KETERANGAN AHLI WARIS</div>
          <div className="text-sm">Nomor: 145/ /III/{new Date().getFullYear()}</div>
        </div>
        <div className="mb-2" style={{ textAlign: 'left' }}>
          Yang bertanda tangan di bawah ini:<br />
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr><td>Nama</td><td>:</td><td>PARMINAH</td></tr>
              <tr><td>Jabatan</td><td>:</td><td>Kepala Desa Kedungwringin</td></tr>
            </tbody>
          </table>
          <br />
          Dengan ini menerangkan dengan sebenarnya, Bahwa:
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr><td>Nama</td><td>:</td><td>{pewaris.nama}</td></tr>
              <tr><td>Umur</td><td>:</td><td>{pewaris.umur}</td></tr>
              <tr><td>Alamat</td><td>:</td><td>{pewaris.alamat}</td></tr>
            </tbody>
          </table>
          <br />
          Telah meninggal dunia pada hari <b>{pewaris.hariWafat}</b> tanggal <b>{pewaris.tanggalWafat}</b> di {pewaris.tempatWafat}, sebagaimana tercatat pada Akta Kematian No. <b>{pewaris.aktaKematian}</b> tanggal <b>{pewaris.tanggalAkta}</b>.<br />
          Bahwa berdasarkan data yang ditunjukkan sesuai ketentuan hukum yang berlaku, yang menjadi ahli waris dari pewaris adalah sebagai berikut:
          <table style={{ marginLeft: 20, marginTop: 10, marginBottom: 10, width: '100%' }}>
            <thead>
              <tr style={{ fontWeight: 'bold', textAlign: 'left' }}>
                <td>Nama</td>
                <td>Tempat/Tgl Lahir</td>
                <td>No KTP/NIK</td>
                <td>Alamat</td>
                <td>Hubungan</td>
              </tr>
            </thead>
            <tbody>
              {ahliWaris.map((a, i) => (
                <tr key={i}>
                  <td>{a.nama}</td>
                  <td>{a.tempatLahir}, {a.tanggalLahir}</td>
                  <td>{a.nik}</td>
                  <td>{a.alamat}</td>
                  <td>{a.hubungan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          Bahwa selain ahli waris tersebut di atas, tidak ada lagi ahli waris lain dari pewaris.<br />
          Demikian Surat Keterangan Ahli Waris ini kami buat dengan sebenarnya. Dan untuk dapat dipergunakan sebagaimana mestinya.
        </div>
        <div style={{ textAlign: 'right', marginTop: 40 }}>
          Kedungwringin, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}<br />
          <b>Kepala Desa</b>
          <div style={{ minHeight: 70 }}></div>
          <b>PARMINAH</b>
        </div>
      </div>
    </div>
  );
};

export default CreateAhliWarisLetter;
