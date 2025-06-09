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
  kewarganegaraan: string;
  rt: string;
  keperluan?: string;
  letterNumber?: string;
}

const initialForm: UsahaFormData = {
  nama: "",
  nik: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  namaUsaha: "",
  alamatUsaha: "",
  jenisUsaha: "",
  kewarganegaraan: "",
  rt: "",
  keperluan: "",
  letterNumber: "",
};

const CreateUsahaLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<UsahaFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editData) {
      // Jika mode edit, parse content (JSON) ke form
      let parsed: Partial<UsahaFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({
        ...initialForm,
        ...parsed,
      });
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

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

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
    doc.text("SURAT KETERANGAN USAHA", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Nomor: ${form.letterNumber || "_________/SKU/[BULAN]/[TAHUN]"}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 8;

    // Pembuka
    doc.setFontSize(10);
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
      ["3. Tempat/Tgl Lahir", `${form.tempatLahir}, ${form.tanggalLahir}`],
      ["4. Kewarganegaraan", form.kewarganegaraan],
      ["5. No. KTP/NIK", form.nik],
      ["6. Pekerjaan", form.pekerjaan],
      ["7. Alamat Pemohon", form.alamat],
    ];
    data.forEach(([label, value]) => {
      doc.text(label, 18, y);
      doc.text(":", 65, y);
      doc.text(value || "-", 70, y);
      y += 7;
    });

    // Isi utama
    y += 2;
    doc.text(
      `Berdasarkan Surat Keterangan dari Ketua Rukun Tetangga Nomor ${form.rt} Tanggal, bahwa yang bersangkutan betul warga Desa Kedungwringin dan menurut pengakuan yang bersangkutan mempunyai usaha ${form.namaUsaha}`,
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 12;
    doc.text(
      `Surat Keterangan ini diperlukan untuk ${form.keperluan || "-"}`,
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 10;
    doc.text(
      "Demikian Surat Keterangan ini kami buat atas permintaan yang bersangkutan dan dapat dipergunakan sebagaimana mestinya",
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
    doc.save("surat-usaha.pdf");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "business", // Since this is the usaha letter component
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

  // Pencarian warga
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length < 2) {
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
      kewarganegaraan: "Indonesia",
      pekerjaan: resident.occupation,
      alamat: resident.address,
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Keterangan Usaha
      </h1>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari NIK atau Nama Warga..."
          value={search}
          onChange={handleSearchChange}
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {searchResults.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectResident(r)}
              >
                {r.nik} - {r.name}
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
          name="jenisKelamin"
          value={form.jenisKelamin}
          onChange={handleChange}
          placeholder="Jenis Kelamin"
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
          name="kewarganegaraan"
          value={form.kewarganegaraan}
          onChange={handleChange}
          placeholder="Kewarganegaraan"
          className="input"
        />
        <input
          name="nik"
          value={form.nik}
          onChange={handleChange}
          placeholder="No. KTP/NIK"
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
          placeholder="Alamat Pemohon"
          className="input"
        />
        <input
          name="namaUsaha"
          value={form.namaUsaha}
          onChange={handleChange}
          placeholder="Nama Usaha"
          className="input"
        />
        <input
          name="keperluan"
          value={form.keperluan || ""}
          onChange={handleChange}
          placeholder="Keperluan Surat"
          className="input"
        />
        <input
          name="rt"
          value={form.rt}
          onChange={handleChange}
          placeholder="No. Surat RT"
          className="input"
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
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
      <div
        id="usaha-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Instansi" className="h-24 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold">PEMERINTAHAN DESA KEDUNGWRINGIN</div>
            <div className="font-bold">
              KECAMATAN PATIKREJA KABUPATEN BANYUMAS
            </div>
            <div className="font-bold">SEKERTARIAT DESA</div>
            <div className="font-bold">
              Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
            </div>
            <div className="font-bold">Telp. (0281) 638395</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">
            SURAT KETERANGAN USAHA
          </div>
          <div className="text-sm">
            Nomor: {form.letterNumber || "_________/SKU/[BULAN]/[TAHUN]"}
          </div>
        </div>
        <div className="mb-2">
          Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
          Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah,
          menerangkan bahwa:
        </div>
        <table className="mb-2">
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
              <td>3. Tempat/Tgl Lahir</td>
              <td>:</td>
              <td>
                {form.tempatLahir}, {form.tanggalLahir}
              </td>
            </tr>
            <tr>
              <td>4. Kewarganegaraan</td>
              <td>:</td>
              <td>{form.kewarganegaraan}</td>
            </tr>
            <tr>
              <td>5. No. KTP/NIK</td>
              <td>:</td>
              <td>{form.nik}</td>
            </tr>
            <tr>
              <td>6. Pekerjaan</td>
              <td>:</td>
              <td>{form.pekerjaan}</td>
            </tr>
            <tr>
              <td>7. Alamat Pemohon</td>
              <td>:</td>
              <td>{form.alamat}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ textIndent: "2em" }}>
          Berdasarkan Surat Keterangan dari Ketua Rukun Tetangga Nomor {form.rt}{" "}
          Tanggal, bahwa yang bersangkutan betul warga Desa Kedungwringin dan
          menurut pengakuan yang bersangkutan mempunyai usaha {form.namaUsaha}
        </p>
        <p style={{ textIndent: "2em" }}>
          Surat Keterangan ini diperlukan untuk {form.keperluan}
        </p>
        <p style={{ textIndent: "2em" }}>
          Demikian Surat Keterangan ini kami buat atas permintaan yang
          bersangkutan dan dapat dipergunakan sebagaimana mestinya
        </p>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 40 }}
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
              <p>
                Kedungwringin,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>KASI PEMERINTAH</p>
            </div>
            <div style={{ marginTop: "auto" }}>
              <div
                className="ttd-space"
                style={{ minHeight: 70, borderBottom: "1px solid transparent" }}
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
  );
};

export default CreateUsahaLetter;
