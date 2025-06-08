import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";
import { residentService } from '../../database/residentService';

const initialForm = {
  ayahNama: "",
  ayahBin: "",
  ayahNik: "",
  ayahTtl: "",
  ayahKewarganegaraan: "INDONESIA",
  ayahAgama: "",
  ayahPekerjaan: "",
  ayahAlamat: "",
  ibuNama: "",
  ibuBinti: "",
  ibuNik: "",
  ibuTtl: "",
  ibuKewarganegaraan: "INDONESIA",
  ibuAgama: "",
  ibuPekerjaan: "",
  ibuAlamat: "",
  anakNama: "",
  anakBinti: "",
  anakNik: "",
  anakTtl: "",
  anakKewarganegaraan: "INDONESIA",
  anakAgama: "",
  anakPekerjaan: "",
  anakAlamat: "",
  pasanganNama: "",
  pasanganBin: "",
  pasanganNik: "",
  pasanganTtl: "",
  pasanganKewarganegaraan: "INDONESIA",
  pasanganAgama: "",
  pasanganPekerjaan: "",
  pasanganAlamat: "",
  tanggalSurat: new Date().toISOString().slice(0, 10),
  ayahTtd: "",
  ibuTtd: "",
};

function generateSuratIzinOrangTuaN5(form: any) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SURAT IZIN ORANG TUA", 70, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Model N 5", 170, 15);
  doc.setFontSize(10);
  doc.text("Yang bertanda tangan di bawah ini :", 10, 23);
  // Bagian A
  doc.setFont("helvetica", "bold");
  doc.text("A. 1. Nama lengkap dan alias", 10, 31);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${form.ayahNama}`, 60, 31);
  doc.text("2. Bin", 16, 37);
  doc.text(`: ${form.ayahBin}`, 60, 37);
  doc.text("3. Nomor Induk Kependudukan", 16, 43);
  doc.text(`: ${form.ayahNik}`, 60, 43);
  doc.text("4. Tempat dan tanggal lahir", 16, 49);
  doc.text(`: ${form.ayahTtl}`, 60, 49);
  doc.text("5. Kewarganegaraan", 16, 55);
  doc.text(`: ${form.ayahKewarganegaraan}`, 60, 55);
  doc.text("6. Agama", 16, 61);
  doc.text(`: ${form.ayahAgama}`, 60, 61);
  doc.text("7. Pekerjaan", 16, 67);
  doc.text(`: ${form.ayahPekerjaan}`, 60, 67);
  doc.text("8. Alamat", 16, 73);
  doc.text(`: ${form.ayahAlamat}`, 60, 73);
  // Bagian B
  doc.setFont("helvetica", "bold");
  doc.text("B. 1. Nama lengkap dan alias", 10, 81);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${form.ibuNama}`, 60, 81);
  doc.text("2. Binti", 16, 87);
  doc.text(`: ${form.ibuBinti}`, 60, 87);
  doc.text("3. Nomor Induk Kependudukan", 16, 93);
  doc.text(`: ${form.ibuNik}`, 60, 93);
  doc.text("4. Tempat dan tanggal lahir", 16, 99);
  doc.text(`: ${form.ibuTtl}`, 60, 99);
  doc.text("5. Kewarganegaraan", 16, 105);
  doc.text(`: ${form.ibuKewarganegaraan}`, 60, 105);
  doc.text("6. Agama", 16, 111);
  doc.text(`: ${form.ibuAgama}`, 60, 111);
  doc.text("7. Pekerjaan", 16, 117);
  doc.text(`: ${form.ibuPekerjaan}`, 60, 117);
  doc.text("8. Alamat", 16, 123);
  doc.text(`: ${form.ibuAlamat}`, 60, 123);
  // Anak kandung
  doc.setFont("helvetica", "normal");
  doc.text("Adalah benar ayah dan ibu kandung dari :", 10, 131);
  doc.setFont("helvetica", "bold");
  doc.text("1. Nama lengkap dan alias", 16, 137);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${form.anakNama}`, 70, 137);
  doc.text("2. Binti", 22, 143);
  doc.text(`: ${form.anakBinti}`, 70, 143);
  doc.text("3. Nomor Induk Kependudukan", 22, 149);
  doc.text(`: ${form.anakNik}`, 70, 149);
  doc.text("4. Tempat dan tanggal lahir", 22, 155);
  doc.text(`: ${form.anakTtl}`, 70, 155);
  doc.text("5. Kewarganegaraan", 22, 161);
  doc.text(`: ${form.anakKewarganegaraan}`, 70, 161);
  doc.text("6. Agama", 22, 167);
  doc.text(`: ${form.anakAgama}`, 70, 167);
  doc.text("7. Pekerjaan", 22, 173);
  doc.text(`: ${form.anakPekerjaan}`, 70, 173);
  doc.text("8. Alamat", 22, 179);
  doc.text(`: ${form.anakAlamat}`, 70, 179);
  // Persetujuan menikah
  doc.setFont("helvetica", "normal");
  doc.text("Memberikan izin kepada anak kami untuk melakukan pernikahan dengan :", 10, 187);
  // Pasangan
  doc.setFont("helvetica", "bold");
  doc.text("1. Nama lengkap dan alias", 16, 193);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${form.pasanganNama}`, 70, 193);
  doc.text("2. Bin", 22, 199);
  doc.text(`: ${form.pasanganBin}`, 70, 199);
  doc.text("3. Nomor Induk Kependudukan", 22, 205);
  doc.text(`: ${form.pasanganNik}`, 70, 205);
  doc.text("4. Tempat dan tanggal lahir", 22, 211);
  doc.text(`: ${form.pasanganTtl}`, 70, 211);
  doc.text("5. Kewarganegaraan", 22, 217);
  doc.text(`: ${form.pasanganKewarganegaraan}`, 70, 217);
  doc.text("6. Agama", 22, 223);
  doc.text(`: ${form.pasanganAgama}`, 70, 223);
  doc.text("7. Pekerjaan", 22, 229);
  doc.text(`: ${form.pasanganPekerjaan}`, 70, 229);
  doc.text("8. Alamat", 22, 235);
  doc.text(`: ${form.pasanganAlamat}`, 70, 235);
  // Penutup
  doc.setFont("helvetica", "normal");
  doc.text("Demikian surat izin ini ", 10, 245);
  doc.setTextColor(255, 0, 0);
  doc.text("ini di buat", 55, 245);
  doc.setTextColor(0, 0, 0);
  doc.text(" dengan kesadaran tanpa ada paksaan dari siapapun dan untuk digunakan seperlunya.", 78, 245);
  doc.text(
    `Kedungwiringin, ${form.tanggalSurat && new Date(form.tanggalSurat).toLocaleDateString("id-ID")}`,
    120,
    255
  );
  doc.text("Ayah/Wali/Pengampu,", 20, 265);
  doc.text("Ibu/Wali/Pengampu,", 120, 265);
  doc.text(`( ${form.ayahTtd || form.ayahNama} )`, 20, 275);
  doc.text(`( ${form.ibuTtd || form.ibuNama} )`, 120, 275);
  doc.setFontSize(8);
  doc.text(
    "Lampiran IX Keputusan Direktur Jendral Bimbingan Masyarakat Islam Nomor 473 Tahun 2020",
    10,
    287
  );
  doc.text(
    "Tentang Petunjuk Teknis Pelaksanaan Pencatatan Pernikahan FORMULIR SURAT IZIN ORANG TUA",
    10,
    291
  );
  doc.save("surat_izin_orang_tua_n5.pdf");
}

const CreateIzinOrangTuaLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [waliSearch, setWaliSearch] = useState('');
  const [waliResults, setWaliResults] = useState<any[]>([]);
  const [searchingWali, setSearchingWali] = useState(false);
  const [selectedWali, setSelectedWali] = useState<any>(null);
  const [anakList, setAnakList] = useState<any[]>([]);
  const [kkMembers, setKkMembers] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPdf = () => {
    generateSuratIzinOrangTuaN5(form);
  };

  const handleWaliSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaliSearch(e.target.value);
    if (e.target.value.length < 3) {
      setWaliResults([]);
      return;
    }
    setSearchingWali(true);
    const results = await residentService.searchResidents(e.target.value);
    setWaliResults(results);
    setSearchingWali(false);
  };

  const handleSelectWali = async (wali: any) => {
    setSelectedWali(wali);
    setWaliSearch(wali.nik + ' - ' + wali.name);
    setWaliResults([]);
    // Cari semua anggota KK berdasarkan KK wali
    setSearchingWali(true);
    const allMembers = await residentService.searchResidents(wali.kk);
    setSearchingWali(false);
    setKkMembers(allMembers);
    setAnakList(allMembers.filter((m: any) => m.shdk && m.shdk.toLowerCase().includes('anak')));
    // Autofill data ayah/ibu sesuai gender wali
    if (wali.gender === 'Laki-laki') {
      setForm((f: any) => ({
        ...f,
        ayahNama: wali.name,
        ayahBin: wali.fatherName || '',
        ayahNik: wali.nik,
        ayahTtl: `${wali.birthPlace}, ${wali.birthDate}`,
        ayahKewarganegaraan: wali.nationality || 'INDONESIA',
        ayahAgama: wali.religion,
        ayahPekerjaan: wali.occupation,
        ayahAlamat: wali.address,
      }));
    } else {
      setForm((f: any) => ({
        ...f,
        ibuNama: wali.name,
        ibuBinti: wali.fatherName || '',
        ibuNik: wali.nik,
        ibuTtl: `${wali.birthPlace}, ${wali.birthDate}`,
        ibuKewarganegaraan: wali.nationality || 'INDONESIA',
        ibuAgama: wali.religion,
        ibuPekerjaan: wali.occupation,
        ibuAlamat: wali.address,
      }));
    }
  };

  const handleSelectAnak = (anak: any) => {
    setForm((f: any) => ({
      ...f,
      anakNama: anak.name,
      anakBinti: anak.fatherName || '',
      anakNik: anak.nik,
      anakTtl: `${anak.birthPlace}, ${anak.birthDate}`,
      anakKewarganegaraan: anak.nationality || 'INDONESIA',
      anakAgama: anak.religion,
      anakPekerjaan: anak.occupation,
      anakAlamat: anak.address,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Surat Izin Orang Tua (N5)</h2>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari wali (NIK/Nama)..."
          value={waliSearch}
          onChange={handleWaliSearch}
        />
        {searchingWali && <div className="text-sm text-gray-500">Mencari wali...</div>}
        {waliResults.length > 0 && (
          <div className="border rounded bg-white shadow max-h-48 overflow-y-auto z-10 relative">
            {waliResults.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectWali(r)}
              >
                {r.nik} - {r.name} ({r.address})
              </div>
            ))}
          </div>
        )}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        <Input label="Nama Ayah" name="ayahNama" value={form.ayahNama} onChange={handleChange} required />
        <Input label="Bin Ayah" name="ayahBin" value={form.ayahBin} onChange={handleChange} />
        <Input label="NIK Ayah" name="ayahNik" value={form.ayahNik} onChange={handleChange} />
        <Input label="Tempat/Tanggal Lahir Ayah" name="ayahTtl" value={form.ayahTtl} onChange={handleChange} />
        <Input label="Kewarganegaraan Ayah" name="ayahKewarganegaraan" value={form.ayahKewarganegaraan} onChange={handleChange} />
        <Input label="Agama Ayah" name="ayahAgama" value={form.ayahAgama} onChange={handleChange} />
        <Input label="Pekerjaan Ayah" name="ayahPekerjaan" value={form.ayahPekerjaan} onChange={handleChange} />
        <Input label="Alamat Ayah" name="ayahAlamat" value={form.ayahAlamat} onChange={handleChange} />
        <Input label="Nama Ibu" name="ibuNama" value={form.ibuNama} onChange={handleChange} required />
        <Input label="Binti Ibu" name="ibuBinti" value={form.ibuBinti} onChange={handleChange} />
        <Input label="NIK Ibu" name="ibuNik" value={form.ibuNik} onChange={handleChange} />
        <Input label="Tempat/Tanggal Lahir Ibu" name="ibuTtl" value={form.ibuTtl} onChange={handleChange} />
        <Input label="Kewarganegaraan Ibu" name="ibuKewarganegaraan" value={form.ibuKewarganegaraan} onChange={handleChange} />
        <Input label="Agama Ibu" name="ibuAgama" value={form.ibuAgama} onChange={handleChange} />
        <Input label="Pekerjaan Ibu" name="ibuPekerjaan" value={form.ibuPekerjaan} onChange={handleChange} />
        <Input label="Alamat Ibu" name="ibuAlamat" value={form.ibuAlamat} onChange={handleChange} />
        <Input label="Nama Anak" name="anakNama" value={form.anakNama} onChange={handleChange} required />
        <Input label="Binti Anak" name="anakBinti" value={form.anakBinti} onChange={handleChange} />
        <Input label="NIK Anak" name="anakNik" value={form.anakNik} onChange={handleChange} />
        <Input label="Tempat/Tanggal Lahir Anak" name="anakTtl" value={form.anakTtl} onChange={handleChange} />
        <Input label="Kewarganegaraan Anak" name="anakKewarganegaraan" value={form.anakKewarganegaraan} onChange={handleChange} />
        <Input label="Agama Anak" name="anakAgama" value={form.anakAgama} onChange={handleChange} />
        <Input label="Pekerjaan Anak" name="anakPekerjaan" value={form.anakPekerjaan} onChange={handleChange} />
        <Input label="Alamat Anak" name="anakAlamat" value={form.anakAlamat} onChange={handleChange} />
        <Input label="Nama Pasangan" name="pasanganNama" value={form.pasanganNama} onChange={handleChange} required />
        <Input label="Bin/Binti Pasangan" name="pasanganBin" value={form.pasanganBin} onChange={handleChange} />
        <Input label="NIK Pasangan" name="pasanganNik" value={form.pasanganNik} onChange={handleChange} />
        <Input label="Tempat/Tanggal Lahir Pasangan" name="pasanganTtl" value={form.pasanganTtl} onChange={handleChange} />
        <Input label="Kewarganegaraan Pasangan" name="pasanganKewarganegaraan" value={form.pasanganKewarganegaraan} onChange={handleChange} />
        <Input label="Agama Pasangan" name="pasanganAgama" value={form.pasanganAgama} onChange={handleChange} />
        <Input label="Pekerjaan Pasangan" name="pasanganPekerjaan" value={form.pasanganPekerjaan} onChange={handleChange} />
        <Input label="Alamat Pasangan" name="pasanganAlamat" value={form.pasanganAlamat} onChange={handleChange} />
        <Input label="Tanggal Surat" name="tanggalSurat" type="date" value={form.tanggalSurat} onChange={handleChange} required />
        <Input label="Tanda Tangan Ayah (opsional)" name="ayahTtd" value={form.ayahTtd} onChange={handleChange} />
        <Input label="Tanda Tangan Ibu (opsional)" name="ibuTtd" value={form.ibuTtd} onChange={handleChange} />
        <div className="md:col-span-2 flex space-x-2 mt-2">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="button" variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
        </div>
      </form>
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview Surat">
        <div className="p-4 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </Modal>
      {selectedWali && kkMembers.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow max-w-4xl mx-auto px-8 py-6">
            <div className="font-semibold mb-4 text-lg text-center">Anggota Kartu Keluarga</div>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border text-xs" style={{ minWidth: 700 }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-6 py-3">Nama</th>
                    <th className="border px-6 py-3">NIK</th>
                    <th className="border px-6 py-3">SHDK</th>
                    <th className="border px-6 py-3">TTL</th>
                    <th className="border px-6 py-3">Alamat</th>
                  </tr>
                </thead>
                <tbody>
                  {kkMembers.map((m: any) => (
                    <tr key={m.id} className="hover:bg-teal-50">
                      <td className="border px-6 py-3 whitespace-nowrap">{m.name}</td>
                      <td className="border px-6 py-3 whitespace-nowrap">{m.nik}</td>
                      <td className="border px-6 py-3 whitespace-nowrap">{m.shdk}</td>
                      <td className="border px-6 py-3 whitespace-nowrap">{m.birthPlace}, {m.birthDate}</td>
                      <td className="border px-6 py-3 whitespace-nowrap">{m.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="font-semibold mb-2 text-center">Pilih Anak yang akan diwalikan:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-2">
              {anakList.map((anak: any) => (
                <Button key={anak.id} className="w-full py-3 text-base" variant="outline" onClick={() => handleSelectAnak(anak)}>
                  {anak.name} ({anak.nik})
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateIzinOrangTuaLetter;
