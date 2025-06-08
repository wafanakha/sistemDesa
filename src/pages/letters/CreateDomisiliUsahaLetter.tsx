import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";

interface DomisiliUsahaFormData {
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
  jumlahKaryawan?: string;
  luasTempatUsaha?: string;
  waktuUsaha?: string;
}

const initialForm: DomisiliUsahaFormData = {
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
  jumlahKaryawan: "",
  luasTempatUsaha: "",
  waktuUsaha: "",
};

const CreateDomisiliUsahaLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<DomisiliUsahaFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (editData) {
      let parsed: Partial<DomisiliUsahaFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({
        ...initialForm,
        ...parsed,
      });
    }
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 20;
    let y = margin;

    // Header - Logo and Institution Info
    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      pdf.addImage(logoImg, "PNG", margin, y, 25, 25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("PEMERINTAHAN DESA KEDUNGWRINGIN", 105, y + 5, {
        align: "center",
      });
      pdf.text("KECAMATAN PATIKREJA KABUPATEN BANYUMAS", 105, y + 10, {
        align: "center",
      });
      pdf.text("SEKRETARIAT DESA", 105, y + 15, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171",
        105,
        y + 20,
        { align: "center" }
      );
      pdf.text("Telp. (0281) 638395", 105, y + 25, { align: "center" });

      y += 35;
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, 210 - margin, y); // horizontal line
      y += 6;
      pdf.text("Kode Desa: 02122013", 25, y);
      y += 6;

      // Title
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("SURAT KETERANGAN DOMISILI USAHA", 105, y, { align: "center" });
      y += 6;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Nomor:", 105, y, { align: "center" });
      y += 10;

      // Introduction
      pdf.setFontSize(10);
      pdf.text(
        `     Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikreja Kabupaten Banyumas`,
        margin,
        y
      );
      y += 5;
      pdf.text(`Provinsi Jawa Tengah, menerangkan bahwa:`, margin, y);
      y += 8;

      const addField = (label: string, value: string) => {
        pdf.text(`${label}`, margin + 5, y);
        pdf.text(":", margin + 55, y);
        pdf.text(value, margin + 60, y);
        y += 6;
      };

      // Personal Data
      addField("1. Nama Lengkap", form.nama);
      addField("2. Jenis Kelamin", form.jenisKelamin);
      addField(
        "3. Tempat/Tgl Lahir",
        `${form.tempatLahir}, ${form.tanggalLahir}`
      );
      addField("4. Kewarganegaraan", form.kewarganegaraan);
      addField("5. No. KTP/NIK", form.nik);
      addField("6. Pekerjaan", form.pekerjaan);
      addField("7. Alamat", form.alamat);

      y += 5;
      pdf.text(
        "     Berdasarkan Surat Pernyataan tidak keberatan/ijin tetangga yang diketahui Ketua RT dan Ketua RW,",
        margin,
        y
      );
      y += 5;
      pdf.text(
        "bahwa yang bersangkutan benar telah membuka usaha sebagai berikut:",
        margin,
        y
      );
      y += 8;

      // Usaha Info
      addField("Nama Perusahaan", form.namaUsaha);
      addField("Nama Pemilik", form.nama);
      addField("Alamat Perusahaan", form.alamatUsaha);
      addField("Jenis Usaha", form.jenisUsaha);
      addField("Jumlah Karyawan", form.jumlahKaryawan || "-");
      addField("Luas Tempat Usaha", form.luasTempatUsaha || "-");
      addField("Waktu Usaha", form.waktuUsaha || "-");

      y += 6;
      const keperluanText =
        form.keperluan ||
        "mengajukan Permohonan Surat Ijin Tempat Usaha/Ijin Undang-undang Gangguan dari Pemerintah Kabupaten Banyumas. Surat ini berlaku 3 (tiga) bulan setelah dikeluarkan, bukan merupakan surat ijin, dan tidak diperkenankan untuk melakukan usaha sebelum mendapat ijin resmi dari instansi terkait.";
      const splitText = pdf.splitTextToSize(
        `     Demikian Surat Keterangan ini dibuat untuk keperluan ${keperluanText}`,
        170
      );
      pdf.text(splitText, margin, y);
      y += splitText.length * 5;

      // Footer
      y += 10;
      pdf.text(`No. Reg: ___________`, margin, y);
      y += 5;
      pdf.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, margin, y);
      y += 15;

      // Signatures
      pdf.text("Mengetahui,", margin, y);
      pdf.text("Camat Patikreja", margin, y + 5);
      pdf.text(
        "Kedungwringin, " +
          new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        130,
        y
      );
      pdf.text("An. KEPALA DESA KEDUNGWRINGIN", 130, y + 5);
      pdf.text("KASI PEMERINTAH", 130, y + 10);

      y += 35;
      pdf.text("[Nama Camat]", margin, y);
      pdf.text("[Nama Kepala Desa]", 130, y);

      // Save
      pdf.save("surat-domisili-usaha.pdf");
    };
  };

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
      agama: resident.religion,
      pekerjaan: resident.occupation,
      alamat: resident.address,
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Keterangan Domisili Usaha
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
          name="agama"
          value={form.agama}
          onChange={handleChange}
          placeholder="Agama"
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
          name="alamatUsaha"
          value={form.alamatUsaha}
          onChange={handleChange}
          placeholder="Alamat Usaha"
          className="input"
        />
        <input
          name="jenisUsaha"
          value={form.jenisUsaha}
          onChange={handleChange}
          placeholder="Jenis Usaha"
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
          name="keperluan"
          value={form.keperluan || ""}
          onChange={handleChange}
          placeholder="Keperluan Surat"
          className="input"
        />
        <input
          name="jumlahKaryawan"
          value={form.jumlahKaryawan || ""}
          onChange={handleChange}
          placeholder="Jumlah Karyawan"
          className="input"
        />
        <input
          name="luasTempatUsaha"
          value={form.luasTempatUsaha || ""}
          onChange={handleChange}
          placeholder="Luas Tempat Usaha"
          className="input"
        />
        <input
          name="waktuUsaha"
          value={form.waktuUsaha || ""}
          onChange={handleChange}
          placeholder="Waktu Usaha"
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
        id="domisili-usaha-preview"
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
            SURAT KETERANGAN DOMISILI USAHA
          </h2>
          <p style={{ textAlign: "center" }}>Nomor: 123/SKTM/[BULAN]/[TAHUN]</p>
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
                  <td>7. Alamat</td>
                  <td>:</td>
                  <td>{form.alamat}</td>
                </tr>
              </tbody>
            </table>
            <p>
              Berdasarkan Surat Pernyataan tidak keberatan/ijin tetangga yang
              diketahui Ketua Rukun Tetangga dan Ketua Rukun Warga Nomer
              Tanggal, bahwa yang bersangkutan benar telah membuka Usaha sebagai
              berikut:
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>Nama Perusahaan</td>
                  <td>:</td>
                  <td>{form.namaUsaha}</td>
                </tr>
                <tr>
                  <td>Nama Pemilik</td>
                  <td>:</td>
                  <td>{form.nama}</td>
                </tr>
                <tr>
                  <td>Alamat Perusahaan</td>
                  <td>:</td>
                  <td>{form.alamatUsaha}</td>
                </tr>
                <tr>
                  <td>Jenis Usaha</td>
                  <td>:</td>
                  <td>{form.jenisUsaha}</td>
                </tr>
                <tr>
                  <td>Jumlah Karyawan</td>
                  <td>:</td>
                  <td>{form.jumlahKaryawan}</td>
                </tr>
                <tr>
                  <td>Luas Tempat Usaha</td>
                  <td>:</td>
                  <td>{form.luasTempatUsaha}</td>
                </tr>
                <tr>
                  <td>Waktu Usaha</td>
                  <td>:</td>
                  <td>{form.waktuUsaha}</td>
                </tr>
              </tbody>
            </table>
            <p>
              Demikian Surat Keterangan Domisili Usaha ini dibuat untuk
              keperluan{" "}
              {form.keperluan ||
                "mengajukan Permohonan Surat Ijin Tempat Usaha/Ijin Undang-undang Gangguan dari Pemerintah Kabupaten Banyumas. Surat ini berlaku 3 (tiga) bulan setelah dikeluarkan, bukan merupakan surat ijin, dan tidak diperkenankan untuk melakukan usaha sebelum mendapat ijin resmi dari instansi terkait"}
              .
            </p>
          </div>
          <div
            className="footer-info"
            style={{
              display: "flex",
              justifyContent: "left",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            <table>
              <tbody>
                <tr>
                  <td>No. Reg</td>
                  <td>:</td>
                  <td>_________</td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td>:</td>
                  <td>{new Date().toLocaleDateString("id-ID")}</td>
                </tr>
              </tbody>
            </table>
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
                justifyContent: "flex-start",
                minHeight: 60,
              }}
            >
              <div>
                <p>Mengetahui,</p>
                <p>Camat Patikreja</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div
                  className="ttd-space"
                  style={{
                    minHeight: 60,
                    borderBottom: "1px solid transparent",
                  }}
                ></div>
                <p>
                  <strong>[Nama Camat]</strong>
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
                justifyContent: "flex-start",
                minHeight: 60,
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
                <p>An. KEPALA DESA KEDUNGWRINGIN</p>
                <p>KASI PEMERINTAH</p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div
                  className="ttd-space"
                  style={{
                    minHeight: 60,
                    borderBottom: "1px solid transparent",
                  }}
                ></div>
                <p>
                  <strong>[Nama Kepala Desa]</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDomisiliUsahaLetter;
