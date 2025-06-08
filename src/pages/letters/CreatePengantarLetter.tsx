import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";

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
  nama: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  keperluan: "",
};

const CreatePengantarLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<PengantarFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<PengantarFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;
    // Logo
    doc.addImage(logo, "PNG", 15, 10, 24, 24);
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PEMERINTAHAN DESA KEDUNGWRINGIN", pageWidth / 2, y, {
      align: "center",
    });
    y += 7;
    doc.text("KECAMATAN PATIKREJA KABUPATEN BANYUMAS", pageWidth / 2, y, {
      align: "center",
    });
    y += 7;
    doc.setFontSize(10);
    doc.text("SEKERTARIAT DESA", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.text(
      "Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 7;
    doc.text("Telp. (0281) 638395", pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setLineWidth(0.8);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Kode Desa: 02122013", 15, y);
    y += 8;
    // Judul
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SURAT PENGANTAR", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Nomor:", pageWidth / 2, y, {
      align: "center",
    });
    y += 8;
    // Pembuka
    doc.text(
      "Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:",
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 12;
    // Data warga
    const data = [
      ["1. Nama Lengkap", form.nama],
      ["2. Jenis Kelamin", form.jenisKelamin],
      [
        "3. Tempat/Tgl Lahir",
        `${form.tempatLahir}, ${
          form.tanggalLahir &&
          new Date(form.tanggalLahir).toLocaleDateString("id-ID")
        }`,
      ],
      ["4. Agama", form.agama],
      ["5. No. KTP/NIK", form.nik],
      ["6. Pekerjaan", form.pekerjaan],
      ["7. Alamat", form.alamat],
    ];
    data.forEach(([label, value]) => {
      doc.text(label, 18, y);
      doc.text(":", 65, y);
      doc.text(value || "-", 70, y);
      y += 7;
    });
    y += 2;
    doc.text(
      `Adalah benar warga Desa Kedungwringin dan surat ini dibuat untuk keperluan: ${
        form.keperluan || "..."
      } `,
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 10;
    doc.text(
      "Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.",
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 16;
    // TTD
    const ttdY = y;
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      pageWidth - 15,
      ttdY,
      { align: "right" }
    );
    y += 6;
    doc.text("An. KEPALA DESA KEDUNGWRINGIN", pageWidth - 15, y, {
      align: "right",
    });
    y += 6;
    doc.text("KASI PEMERINTAH", pageWidth - 15, y, { align: "right" });
    y += 24;
    doc.text("[Nama Kepala Desa]", pageWidth - 15, y, { align: "right" });
    doc.save("surat-pengantar.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Pengantar
      </h1>
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
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          placeholder="Nama"
          className="input"
        />
        <input
          name="nik"
          value={form.nik}
          onChange={handleChange}
          placeholder="NIK"
          className="input"
        />
        <input
          name="tempatLahir"
          value={form.tempatLahir}
          onChange={handleChange}
          placeholder="Tempat Lahir"
          className="input"
        />
        <input
          name="tanggalLahir"
          value={form.tanggalLahir}
          onChange={handleChange}
          placeholder="Tanggal Lahir"
          type="date"
          className="input"
        />
        <input
          name="jenisKelamin"
          value={form.jenisKelamin}
          onChange={handleChange}
          placeholder="Jenis Kelamin"
          className="input"
        />
        <input
          name="agama"
          value={form.agama}
          onChange={handleChange}
          placeholder="Agama"
          className="input"
        />
        <input
          name="pekerjaan"
          value={form.pekerjaan}
          onChange={handleChange}
          placeholder="Pekerjaan"
          className="input"
        />
        <input
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          placeholder="Alamat"
          className="input"
        />
        <textarea
          name="keperluan"
          value={form.keperluan}
          onChange={handleChange}
          placeholder="Keperluan"
          className="input col-span-2"
        />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>
          Export PDF
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
      <div
        id="pengantar-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto hidden"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Desa" className="h-16 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold text-lg">
              PEMERINTAH KABUPATEN BUMI MAKMUR SEJAHTERA
            </div>
            <div className="font-bold text-lg">KECAMATAN MAKMUR JAYA</div>
            <div className="font-bold text-xl">DESA BUMI MAKMUR</div>
            <div className="text-sm">
              Jl. Raya Desa Bumi Makmur No. 1, Kode Pos 12345
            </div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT PENGANTAR</div>
          <div className="text-sm">Nomor: 470/_____/BM/____/2024</div>
        </div>
        <div className="mb-2">
          Yang bertanda tangan di bawah ini Kepala Desa Bumi Makmur, Kecamatan
          Makmur Jaya, Kabupaten Bumi Makmur Sejahtera, menerangkan bahwa:
        </div>
        <table className="mb-2">
          <tbody>
            <tr>
              <td>Nama</td>
              <td className="px-2">:</td>
              <td>{form.nama}</td>
            </tr>
            <tr>
              <td>NIK</td>
              <td className="px-2">:</td>
              <td>{form.nik}</td>
            </tr>
            <tr>
              <td>Tempat/Tgl Lahir</td>
              <td className="px-2">:</td>
              <td>
                {form.tempatLahir}, {form.tanggalLahir}
              </td>
            </tr>
            <tr>
              <td>Jenis Kelamin</td>
              <td className="px-2">:</td>
              <td>{form.jenisKelamin}</td>
            </tr>
            <tr>
              <td>Agama</td>
              <td className="px-2">:</td>
              <td>{form.agama}</td>
            </tr>
            <tr>
              <td>Pekerjaan</td>
              <td className="px-2">:</td>
              <td>{form.pekerjaan}</td>
            </tr>
            <tr>
              <td>Alamat</td>
              <td className="px-2">:</td>
              <td>{form.alamat}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2">
          Adalah benar warga Desa Bumi Makmur dan surat ini dibuat untuk
          keperluan: <span className="font-semibold">{form.keperluan}</span>
        </div>
        <div className="mb-2">
          Demikian surat pengantar ini dibuat untuk dapat dipergunakan
          sebagaimana mestinya.
        </div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>Bumi Makmur, .................... 2024</div>
            <div className="font-bold">Kepala Desa Bumi Makmur</div>
            <div style={{ height: "60px" }}></div>
            <div className="font-bold underline">(Nama Kepala Desa)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePengantarLetter;
