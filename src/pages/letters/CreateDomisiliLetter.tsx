import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";

interface DomisiliFormData {
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  binBinti?: string;
  letterNumber?: string;
  rtNumber?: string;
  rtDate?: string;
}

const initialForm: DomisiliFormData = {
  nama: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  binBinti: "",
  letterNumber: "",
  rtNumber: "",
  rtDate: "",
};

const CreateDomisiliLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<DomisiliFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editData) {
      let parsed: Partial<DomisiliFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  useEffect(() => {
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
      binBinti: resident.fatherName || resident.motherName || "",
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF();
    // Tambahkan logo di kiri atas
    doc.addImage(logo, "PNG", 20, 10, 24, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PEMERINTAHAN DESA KEDUNGWRINGIN", 105, 15, { align: "center" });
    doc.text("KECAMATAN PATIKREJA KABUPATEN BANYUMAS", 105, 22, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text("SEKERTARIAT DESA", 105, 28, { align: "center" });
    doc.text(
      "Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171",
      105,
      34,
      { align: "center" }
    );
    doc.text("Telp. (0281) 638395", 105, 40, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 44, 190, 44);
    doc.setFontSize(11);
    doc.text("SURAT KETERANGAN DOMISILI TEMPAT TINGGAL", 105, 54, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      `Nomor: ${form.letterNumber || "_________/SKD/[BULAN]/[TAHUN]"}`,
      105,
      60,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      "Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:",
      15,
      70,
      { maxWidth: 180 }
    );
    let y = 80;

    const data = [
      ["1. Nama Lengkap", form.nama],
      ["2. Jenis Kelamin", form.jenisKelamin],
      ["3. Bin/Binti", form.binBinti || "-"],
      ["4. Tempat/Tgl Lahir", form.tempatLahir + (form.tanggalLahir ? ", " + new Date(form.tanggalLahir).toLocaleDateString("id-ID") : "")],
      ["5. Agama", form.agama],
      ["6. Warganegara", "Indonesia"],
      ["7. No. KTP", form.nik],
      ["8. Pekerjaan", form.pekerjaan],
      ["9. Alamat", form.alamat],
    ];
    data.forEach(([label, value]) => {
      doc.text(label, 18, y);
      doc.text(":", 65, y);
      doc.text(value || "-", 70, y);
      y += 9;
    });
    doc.text(
      `Berdasarkan Surat Keterangan dari Ketua Rukun Tetangga Nomor ${form.rtNumber || "Nomor"} Tanggal ${form.rtDate ? new Date(form.rtDate).toLocaleDateString("id-ID") : "Tanggal"}, bahwa yang bersangkutan benar penduduk Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas yang beralamat pada alamat tersebut diatas, surat ini dibuat untuk keperluan administrasi.`,
      15,
      y,
      { maxWidth: 180 }
    );
    y += 15;
    doc.text(
      "Demikian Surat Keterangan ini kami buat atas permintaan yang bersangkutan agar yang berkepentingan mengetahui dan maklum.",
      15,
      y,
      { maxWidth: 180 }
    );
    y += 20;
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      140,
      y
    );
    y += 5;
    doc.text("An. KEPALA DESA KEDUNGWRINGIN", 140, y);
    y += 5;
    doc.text("KASI PEMERINTAH", 140, y);
    y += 30;
    doc.text(
      villageInfo?.kasipemerintah?.trim()
        ? villageInfo.kasipemerintah
        : "(................................)",
      140,
      y
    );
    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save("surat-domisili.pdf");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "domicile",
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

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "domicile",
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
        Surat Keterangan Domisili
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
        <input
          name="binBinti"
          value={form.binBinti}
          onChange={handleChange}
          placeholder="Bin/Binti"
          className="input"
        />
        <input
          name="letterNumber"
          value={form.letterNumber}
          onChange={handleChange}
          placeholder="Nomor Surat"
          className="input"
        />
        <input
          name="rtNumber"
          value={form.rtNumber}
          onChange={handleChange}
          placeholder="Nomor RT"
          className="input"
        />
        <input
          name="rtDate"
          value={form.rtDate}
          onChange={handleChange}
          placeholder="Tanggal RT"
          type="date"
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
        id="domisili-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div
          className="container"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "1cm",
            margin: "auto",
            background: "white",
            boxSizing: "border-box",
          }}
        >
          <div
            className="header"
            style={{ display: "flex", alignItems: "center", marginBottom: 1 }}
          >
            <img
              src={logo}
              alt="Logo Instansi"
              className="logo"
              style={{ width: 100, height: 100, marginRight: 20 }}
            />
            <div className="instansi" style={{ textAlign: "center", flex: 1 }}>
              <div className="bold" style={{ fontWeight: "bold" }}>
                PEMERINTAHAN DESA KEDUNGWRINGIN
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                KECAMATAN PATIKREJA KABUPATEN BANYUMAS
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                SEKERTARIAT DESA
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                Telp. (0281) 638395
              </div>
            </div>
          </div>
          <hr style={{ border: "1px solid black", marginTop: 10 }} />
          <p>Kode Desa: 02122013</p>
          <h2
            style={{
              textAlign: "center",
              textDecoration: "underline",
              fontSize: "11pt",
            }}
          >
            SURAT KETERANGAN DOMISILI TEMPAT TINGGAL
          </h2>
          <p style={{ textAlign: "center" }}>
            Nomor: {form.letterNumber || "_________/SKD/[BULAN]/[TAHUN]"}
          </p>
          <div className="content" style={{ marginTop: 30 }}>
            <p>
              Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
              Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah,
              menerangkan bahwa:
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>1. Nama Lengkap</td>
                  <td>:</td>
                  <td>{form.nama}</td>
                </tr>
                <tr>
                  <td>2. Jenis Kelamin</td>
                  <td>:</td>
                  <td>{form.jenisKelamin}</td>
                </tr>
                <tr>
                  <td>3. Bin/Binti</td>
                  <td>:</td>
                  <td>{form.binBinti}</td>
                </tr>
                <tr>
                  <td>4. Tempat/Tgl Lahir</td>
                  <td>:</td>
                  <td>
                    {form.tempatLahir},{" "}
                    {form.tanggalLahir &&
                      new Date(form.tanggalLahir).toLocaleDateString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <td>5. Agama</td>
                  <td>:</td>
                  <td>{form.agama}</td>
                </tr>
                <tr>
                  <td>6. Warganegara</td>
                  <td>:</td>
                  <td>Indonesia</td>
                </tr>
                <tr>
                  <td>7. No. KTP/NIK</td>
                  <td>:</td>
                  <td>{form.nik}</td>
                </tr>
                <tr>
                  <td>8. Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan}</td>
                </tr>
                <tr>
                  <td>9. Alamat</td>
                  <td>:</td>
                  <td>{form.alamat}</td>
                </tr>
              </tbody>
            </table>
            <p>
              Berdasarkan Surat Keterangan dari Ketua Rukun Tetangga Nomor {form.rtNumber || "Nomor"} Tanggal {form.rtDate ? new Date(form.rtDate).toLocaleDateString("id-ID") : "Tanggal"}, bahwa yang bersangkutan benar penduduk Desa Kedungwringin
              Kecamatan Patikreja Kabupaten Banyumas yang beralamat pada alamat
              tersebut diatas, surat ini dibuat untuk keperluan administrasi.
            </p>
            <p>
              Demikian Surat Keterangan ini kami buat atas permintaan yang
              bersangkutan agar yang berkepentingan mengetahui dan maklum.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 40,
            }}
          >
            <div
              className="signature"
              style={{
                width: "30%",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 180,
              }}
            >
              <div className="compact" style={{ textAlign: "center" }}>
                <p>Kedungwringin, .................... 2025</p>
                <p>KASI PEMERINTAH</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div
                  className="ttd-space"
                  style={{
                    minHeight: 70,
                    borderBottom: "1px solid transparent",
                  }}
                ></div>
                <p>
                  <strong>
                    {villageInfo?.kasipemerintah?.trim()
                      ? villageInfo.kasipemerintah
                      : "(................................)"}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDomisiliLetter;
