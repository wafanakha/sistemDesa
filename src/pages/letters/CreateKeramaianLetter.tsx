import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";
import { letterService } from "../../database/letterService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
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
  jenisHiburan: string;
  jumlahUndangan: string;
  residentId?: number; // Tambahkan residentId ke form
  letterNumber: string;
  rtNumber?: string;
  rtDate?: string;
  regNumber?: string; // Tambah field No. Reg
  regDate?: string; // Tambah field Tanggal Reg
  camatName?: string; // Nama Camat manual
}

const initialForm: KeramaianFormData = {
  nama: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  acara: "",
  tanggalAcara: "",
  waktuAcara: "",
  tempatAcara: "",
  jenisHiburan: "",
  jumlahUndangan: "",
  residentId: undefined,
  letterNumber: "",
  rtNumber: "",
  rtDate: "",
  regNumber: "", // Tambah default
  regDate: "", // Tambah default
  camatName: "",
};

const CreateKeramaianLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<KeramaianFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<KeramaianFormData> = {};
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      ...(e.target.name === "nama" || e.target.name === "nik"
        ? { residentId: undefined }
        : {}),
    });
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
      residentId: resident.id, // Simpan id warga
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth() + 10;
    let y = 18;
    // Kop surat
    doc.addImage(logo, "PNG", 25, y, 25, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PEMERINTAHAN DESA KEDUNGWRINGIN", pageWidth / 2, y + 6, {
      align: "center",
    });
    doc.text("KECAMATAN PATIKRAJA KABUPATEN BANYUMAS", pageWidth / 2, y + 12, {
      align: "center",
    });
    doc.text("SEKRETARIAT DESA", pageWidth / 2, y + 18, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      "Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171",
      pageWidth / 2,
      y + 24,
      { align: "center" }
    );
    doc.text("Telp. (0281) 638395", pageWidth / 2, y + 29, { align: "center" });
    y += 32;
    doc.setLineWidth(0.7);
    doc.line(20, y, pageWidth - 20, y);
    y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Kode Desa: 02122013", 25, y);
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT PENGANTAR IJIN KERAMAIAN", pageWidth / 2, y, {
      align: "center",
    });
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Nomor: ${form.letterNumber || "_________/SK-KRMN/[BULAN]/[TAHUN]"}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 10;
    // Paragraf pembuka
    doc.setFontSize(10);
    doc.text(
      "Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:",
      25,
      y,
      { maxWidth: pageWidth - 50 }
    );
    y += 10;
    // Tabel data pemohon
    const rows = [
      ["Nama Lengkap", form.nama],
      [
        "Tempat/Tgl Lahir",
        `${form.tempatLahir}, ${
          form.tanggalLahir &&
          new Date(form.tanggalLahir).toLocaleDateString("id-ID")
        }`,
      ],
      ["Jenis Kelamin", form.jenisKelamin],
      ["Agama", form.agama],
      ["Kewarganegaraan", "Indonesia"],
      ["No. KTP/NIK", form.nik],
      ["Pekerjaan", form.pekerjaan],
      ["Alamat Pemohon", form.alamat],
      ["Maksud Keramaian", form.acara],
      [
        "Tanggal Penyelenggaraan",
        form.tanggalAcara &&
          new Date(form.tanggalAcara).toLocaleDateString("id-ID"),
      ],
      ["Waktu Penyelenggaraan", form.waktuAcara],
      ["Jenis Hiburan", form.jenisHiburan],
      ["Jumlah Undangan", form.jumlahUndangan],
      ["Tempat Penyelenggaraan", form.tempatAcara],
    ];
    rows.forEach(([label, value]) => {
      doc.text(`${label}`, 28, y);
      doc.text(":", 70, y);
      doc.text(`${value || "-"}`, 75, y);
      y += 7;
    });
    // Paragraf aturan and penutup
    y += 2;
    doc.text(
      `Berdasarkan Surat Pernyataan dari Ketua Rukun Tetangga Nomor ${
        form.rtNumber || "Nomor"
      } Tanggal ${
        form.rtDate
          ? new Date(form.rtDate).toLocaleDateString("id-ID")
          : "Tanggal"
      }, maka dengan ini menerangkan bahwa atas permohonan yang bersangkutan, kegiatan tersebut dapat dilaksanakan dengan ketentuan sebagai berikut:`,
      25,
      y,
      { maxWidth: pageWidth - 50 }
    );
    y += 15;
    doc.text("1. Menjaga keamanan dan ketertiban masyarakat.", 28, y);
    y += 6;
    doc.text("2. Mengikuti aturan yang berlaku dari pemerintah daerah.", 28, y);
    y += 6;
    doc.text(
      "3. Menyudahi kegiatan sesuai waktu yang telah ditentukan.",
      28,
      y
    );
    y += 6;
    doc.text(
      "Demikian Surat Keterangan Keramaian ini diberikan untuk dipergunakan sebagaimana mestinya.",
      25,
      y,
      { maxWidth: pageWidth - 50 }
    );
    y += 12;
    // Footer info
    doc.text("No. Reg", 28, y);
    doc.text(":", 70, y);
    doc.text(form.regNumber || "_________", 75, y);
    y += 7;
    doc.text("Tanggal", 28, y);
    doc.text(":", 70, y);
    doc.text(
      form.regDate
        ? new Date(form.regDate).toLocaleDateString("id-ID")
        : new Date().toLocaleDateString("id-ID"),
      75,
      y
    );
    y += 10;
    // Blok tanda tangan
    const ttdY = y;
    doc.setFont("helvetica", "normal");
    doc.text("Pemohon", 30, ttdY);
    doc.text("Mengetahui,", pageWidth / 2, ttdY, { align: "center" });
    doc.text(
      "Kedungwringin, " + new Date().toLocaleDateString("id-ID"),
      pageWidth - 70,
      ttdY
    );
    doc.text("Camat Patikraja", pageWidth / 2, ttdY + 6, { align: "center" });
    doc.text("An. KEPALA DESA KEDUNGWRINGIN", pageWidth - 80, ttdY + 6);
    doc.text("KASI PEMERINTAH", pageWidth - 70, ttdY + 12);
    // Spacer tanda tangan

    doc.text(
      form.nama && form.nama.trim() ? `(${form.nama})` : "()",
      25,
      ttdY + 35
    );
    doc.text(
      villageInfo?.kasipemerintah?.trim()
        ? `(${villageInfo.kasipemerintah})`
        : "()",
      pageWidth - 70,
      ttdY + 35
    );
    doc.text(
      form.camatName && form.camatName.trim()
        ? `(${form.camatName})`
        : "[Nama Camat]",
      pageWidth / 2,
      ttdY + 35,
      { align: "center" }
    );
    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save("surat-keramaian.pdf");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "keramaian", // Since this is the usaha letter component
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

    // For Electron environment
    window.open(doc.output("bloburl"), "_blank");

    // Also save history
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "keramaian",
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => console.log("Letter history saved"))
      .catch((error) => console.error("Failed to save letter history:", error));
  };

  // Simpan surat ke database
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Keterangan Keramaian
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
          name="acara"
          value={form.acara}
          onChange={handleChange}
          placeholder="Nama Acara"
          className="input"
        />

        <input
          name="waktuAcara"
          value={form.waktuAcara}
          onChange={handleChange}
          placeholder="Waktu Acara"
          className="input"
        />
        <input
          name="tempatAcara"
          value={form.tempatAcara}
          onChange={handleChange}
          placeholder="Tempat Acara"
          className="input"
        />
        <input
          name="jenisHiburan"
          value={form.jenisHiburan}
          onChange={handleChange}
          placeholder="Jenis Hiburan"
          className="input"
        />
        <input
          name="jumlahUndangan"
          value={form.jumlahUndangan}
          onChange={handleChange}
          placeholder="Jumlah Undangan"
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

        {/* Tambah input No. Reg dan Tanggal Reg */}
        <input
          name="regNumber"
          value={form.regNumber}
          onChange={handleChange}
          placeholder="No. Reg"
          className="input"
        />
        <div className="flex gap-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Tanggal lahir</label>
            <input
              name="tanggalLahir"
              value={form.tanggalLahir}
              onChange={handleChange}
              placeholder="Tanggal Lahir"
              type="date"
              className="input"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Tanggal acara</label>
            <input
              name="tanggalAcara"
              value={form.tanggalAcara}
              onChange={handleChange}
              placeholder="Tanggal Acara"
              type="date"
              className="input"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">
              Tanggal surat rt
            </label>

            <input
              name="rtDate"
              value={form.rtDate}
              onChange={handleChange}
              placeholder="Tanggal RT"
              type="date"
              className="input"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Tanggal reg</label>

            <input
              name="regDate"
              value={form.regDate}
              onChange={handleChange}
              placeholder="Tanggal Reg"
              type="date"
              className="input"
            />
          </div>
        </div>
        {/* Input nama camat manual */}
        <input
          name="camatName"
          value={form.camatName}
          onChange={handleChange}
          placeholder="Nama Camat"
          className="input"
        />
      </form>
      <div className="flex gap-2 mb-6">
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
      </div>
      <div
        id="keramaian-preview"
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
                KECAMATAN PATIKRAJA KABUPATEN BANYUMAS
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                SEKRETARIAT DESA
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
            SURAT PENGANTAR IJIN KERAMAIAN
          </h2>
          <p style={{ textAlign: "center" }}>
            Nomor: {form.letterNumber || "_________/SK-KRMN/[BULAN]/[TAHUN]"}
          </p>
          <div className="content" style={{ marginTop: 30 }}>
            <p>
              Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
              Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah,
              menerangkan bahwa:
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>Nama Lengkap</td>
                  <td>:</td>
                  <td>{form.nama}</td>
                </tr>
                <tr>
                  <td>Tempat/Tgl Lahir</td>
                  <td>:</td>
                  <td>
                    {form.tempatLahir},{" "}
                    {form.tanggalLahir &&
                      new Date(form.tanggalLahir).toLocaleDateString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <td>Jenis Kelamin</td>
                  <td>:</td>
                  <td>{form.jenisKelamin}</td>
                </tr>
                <tr>
                  <td>Agama</td>
                  <td>:</td>
                  <td>{form.agama}</td>
                </tr>
                <tr>
                  <td>Kewarganegaraan</td>
                  <td>:</td>
                  <td>Indonesia</td>
                </tr>
                <tr>
                  <td>No. KTP/NIK</td>
                  <td>:</td>
                  <td>{form.nik}</td>
                </tr>
                <tr>
                  <td>Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan}</td>
                </tr>
                <tr>
                  <td>Alamat Pemohon</td>
                  <td>:</td>
                  <td>{form.alamat}</td>
                </tr>
                <tr>
                  <td>Maksud Keramaian</td>
                  <td>:</td>
                  <td>{form.acara}</td>
                </tr>
                <tr>
                  <td>Tanggal Penyelenggaraan</td>
                  <td>:</td>
                  <td>
                    {form.tanggalAcara &&
                      new Date(form.tanggalAcara).toLocaleDateString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <td>Waktu Penyelenggaraan</td>
                  <td>:</td>
                  <td>{form.waktuAcara}</td>
                </tr>
                <tr>
                  <td>Jenis Hiburan</td>
                  <td>:</td>
                  <td>{form.jenisHiburan}</td>
                </tr>
                <tr>
                  <td>Jumlah Undangan</td>
                  <td>:</td>
                  <td>{form.jumlahUndangan}</td>
                </tr>
                <tr>
                  <td>Tempat Penyelenggaraan</td>
                  <td>:</td>
                  <td>{form.tempatAcara}</td>
                </tr>
              </tbody>
            </table>
            {/* Pindahkan blok No. Reg & Tanggal ke bawah, setelah penutup */}
            <p>
              Berdasarkan Surat Pernyataan dari Ketua Rukun Tetangga Nomor{" "}
              {form.rtNumber || "Nomor"} Tanggal{" "}
              {form.rtDate
                ? new Date(form.rtDate).toLocaleDateString("id-ID")
                : "Tanggal"}
              , maka dengan ini menerangkan bahwa atas permohonan yang
              bersangkutan, kegiatan tersebut dapat dilaksanakan dengan
              ketentuan sebagai berikut:
            </p>
            <p>1. Menjaga keamanan dan ketertiban masyarakat.</p>
            <p>2. Mengikuti aturan yang berlaku dari pemerintah daerah.</p>
            <p>3. Menyudahi kegiatan sesuai waktu yang telah ditentukan.</p>
            <p>
              Demikian Surat Keterangan Keramaian ini diberikan untuk
              dipergunakan sebagaimana mestinya.
            </p>
            {/* Blok No. Reg & Tanggal di bawah penutup */}
            <div
              className="footer-info"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              <table>
                <tbody>
                  <tr>
                    <td>No. Reg</td>
                    <td>:</td>
                    <td>{form.regNumber || "_________"}</td>
                  </tr>
                  <tr>
                    <td>Tanggal</td>
                    <td>:</td>
                    <td>
                      {form.regDate
                        ? new Date(form.regDate).toLocaleDateString("id-ID")
                        : new Date().toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className="signature-block"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
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
              <p>Pemohon</p>
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
                    {form.nama || "(................................)"}
                  </strong>
                </p>
              </div>
            </div>
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
              <div>
                <p>Mengetahui,</p>
                <p>Camat Patikraja</p>
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
                  <strong>{form.camatName || "[Nama Camat]"}</strong>
                </p>
              </div>
            </div>
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
                <p>Kedungwringin, {new Date().toLocaleDateString("id-ID")}</p>
                <p>An. KEPALA DESA KEDUNGWRINGIN</p>
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

export default CreateKeramaianLetter;
