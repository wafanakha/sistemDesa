import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
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
  letterNumber?: string;
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
  letterNumber: "",
};

const CreatePengantarLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<PengantarFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);
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

  React.useEffect(() => {
    villageService.getVillageInfo().then(setVillageInfo);
  }, []);

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

  const generatePDF = (): jsPDF => {
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
    doc.text("KECAMATAN PATIKRAJA KABUPATEN BANYUMAS", pageWidth / 2, y, {
      align: "center",
    });
    y += 7;
    doc.setFontSize(10);
    doc.text("SEKRETARIAT DESA", pageWidth / 2, y, { align: "center" });
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
    doc.text(
      `Nomor: ${
        form.letterNumber || "........................................"
      }`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 8;
    // Pembuka
    doc.text(
      "Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:",
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
    doc.text(
      villageInfo?.kasipemerintah?.trim()
        ? villageInfo.kasipemerintah
        : "(................................)",
      pageWidth - 15,
      y,
      { align: "right" }
    );
    return doc;
  };
  const handleExportPDF = () => {
    const doc = generatePDF();

    doc.save("surat-pengantar.pdf");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar", // Since this is the usaha letter component
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => {
        console.log("Letter history saved");
      })
      .catch((error) => {
        console.error("Failed to save letter history:", error);
      });
  };

  const handlePrintPDF = () => {
    const doc = generatePDF();
    window.open(doc.output("bloburl"), "_blank");

    doc.save("surat-pengantar.pdf");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar", // Since this is the usaha letter component
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => {
        console.log("Letter history saved");
      })
      .catch((error) => {
        console.error("Failed to save letter history:", error);
      });
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
          placeholder="Nama Lengkap"
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

        <div className="flex gap-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Tanggal Lahir</label>
            <input
              name="tanggalLahir"
              value={form.tanggalLahir}
              onChange={handleChange}
              placeholder="Tanggal Lahir"
              type="date"
              className="input"
            />
          </div>
        </div>
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
        <input
          name="letterNumber"
          value={form.letterNumber}
          onChange={handleChange}
          placeholder="Nomor Surat"
          className="input"
        />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>
          Export PDF
        </Button>
        <Button variant="primary" onClick={handlePrintPDF}>
          Print Surat
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
      <div
        id="pengantar-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Desa" className="h-16 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold text-lg">
              PEMERINTAHAN DESA KEDUNGWRINGIN
            </div>
            <div className="font-bold text-lg">
              KECAMATAN PATIKRAJA KABUPATEN BANYUMAS
            </div>
            <div className="font-bold">SEKRETARIAT DESA</div>
            <div className="text-sm">
              Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
            </div>
            <div className="text-sm">Telp. (0281) 638395</div>
            <div className="text-sm">Kode Desa: 02122013</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT PENGANTAR</div>
          <div className="text-sm">
            Nomor:{" "}
            {form.letterNumber || "........................................"}
          </div>
        </div>
        <div className="mb-2">
          Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
          Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah,
          menerangkan bahwa:
        </div>
        <table className="mb-2">
          <tbody>
            <tr>
              <td>1. Nama Lengkap</td>
              <td className="px-2">:</td>
              <td>{form.nama}</td>
            </tr>
            <tr>
              <td>2. Jenis Kelamin</td>
              <td className="px-2">:</td>
              <td>{form.jenisKelamin}</td>
            </tr>
            <tr>
              <td>3. Tempat/Tgl Lahir</td>
              <td className="px-2">:</td>
              <td>
                {form.tempatLahir},{" "}
                {form.tanggalLahir &&
                  new Date(form.tanggalLahir).toLocaleDateString("id-ID")}
              </td>
            </tr>
            <tr>
              <td>4. Agama</td>
              <td className="px-2">:</td>
              <td>{form.agama}</td>
            </tr>
            <tr>
              <td>5. No. KTP/NIK</td>
              <td className="px-2">:</td>
              <td>{form.nik}</td>
            </tr>
            <tr>
              <td>6. Pekerjaan</td>
              <td className="px-2">:</td>
              <td>{form.pekerjaan}</td>
            </tr>
            <tr>
              <td>7. Alamat</td>
              <td className="px-2">:</td>
              <td>{form.alamat}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2">
          Adalah benar warga Desa Kedungwringin dan surat ini dibuat untuk
          keperluan:{" "}
          <span className="font-semibold">{form.keperluan || "..."}</span>
        </div>
        <div className="mb-2">
          Demikian surat pengantar ini dibuat untuk dapat dipergunakan
          sebagaimana mestinya.
        </div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>
              Kedungwringin,{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="font-bold">KASI PEMERINTAH</div>
            <div style={{ height: "60px" }}></div>
            <div className="font-bold underline">
              {villageInfo?.kasipemerintah?.trim()
                ? villageInfo.kasipemerintah
                : "(................................)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePengantarLetter;
