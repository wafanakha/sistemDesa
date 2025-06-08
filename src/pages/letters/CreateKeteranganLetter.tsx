import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { residentService } from "../../database/residentService";

interface KeteranganFormData {
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  warganegara: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  nik: string;
  kk: string;
  keperluan: string;
  berlakuDari: string; // tanggal mulai berlaku
  berlakuSampai: string; // tanggal akhir berlaku
  keteranganLain: string;
}

const initialForm: KeteranganFormData = {
  nama: "",
  tempatLahir: "",
  tanggalLahir: "",
  warganegara: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  nik: "",
  kk: "",
  keperluan: "",
  berlakuDari: "",
  berlakuSampai: "",
  keteranganLain: "",
};

const CreateKeteranganLetter: React.FC = () => {
  const [form, setForm] = useState<KeteranganFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    doc.text("SURAT KETERANGAN", pageWidth / 2, y, { align: "center" });
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
      ["1. Nama", form.nama],
      [
        "2. Tempat/Tgl Lahir",
        `${form.tempatLahir}, ${
          form.tanggalLahir &&
          new Date(form.tanggalLahir).toLocaleDateString("id-ID")
        }`,
      ],
      ["3. Warganegara", form.warganegara],
      ["4. Agama", form.agama],
      ["5. Pekerjaan", form.pekerjaan],
      ["6. Tempat Tinggal", form.alamat],
      ["7. Surat Bukti Diri", `NIK: ${form.nik}\nNo. KK: ${form.kk}`],
      ["8. Keperluan", form.keperluan],
      [
        "9. Berlaku",
        form.berlakuDari && form.berlakuSampai
          ? `${new Date(form.berlakuDari).toLocaleDateString(
              "id-ID"
            )} s/d ${new Date(form.berlakuSampai).toLocaleDateString("id-ID")}`
          : "",
      ],
      ["10. Keterangan lain", form.keteranganLain],
    ];
    data.forEach(([label, value], idx) => {
      if (label === "7. Surat Bukti Diri") {
        doc.text(label, 18, y);
        doc.text(":", 65, y);
        doc.text((value as string).split("\n")[0] || "-", 70, y);
        y += 7;
        doc.text("", 18, y);
        doc.text("", 65, y);
        doc.text((value as string).split("\n")[1] || "-", 70, y);
        y += 7;
      } else {
        doc.text(label, 18, y);
        doc.text(":", 65, y);
        doc.text(value || "-", 70, y);
        y += 7;
      }
    });
    y += 2;
    doc.text(
      "Demikian Surat Keterangan ini diberikan untuk dipergunakan seperlunya.",
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 18;
    // TTD
    // Pemohon kiri, pejabat kanan
    doc.setFontSize(10);
    doc.text("Pemohon", 30, y);
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      pageWidth - 15,
      y,
      { align: "right" }
    );
    y += 6;
    doc.text("An. KEPALA DESA KEDUNGWRINGIN", pageWidth - 15, y, {
      align: "right",
    });
    y += 6;
    doc.text("KASI PEMERINTAH", pageWidth - 15, y, { align: "right" });
    y += 24;
    doc.text(form.nama, 30, y, { align: "center" });
    doc.text("[Nama Kepala Desa]", pageWidth - 15, y, { align: "right" });
    doc.save("surat-keterangan.pdf");
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
      tempatLahir: resident.birthPlace,
      tanggalLahir: resident.birthDate,
      warganegara: "Indonesia",
      agama: resident.religion,
      pekerjaan: resident.occupation,
      alamat: resident.address,
      nik: resident.nik,
      kk: resident.kk,
      // berlakuDari dan berlakuSampai tidak di-autofill
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Keterangan
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
          placeholder="Nama"
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
          name="warganegara"
          value={form.warganegara}
          onChange={handleChange}
          placeholder="Warganegara"
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
          placeholder="Tempat Tinggal"
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
          name="kk"
          value={form.kk}
          onChange={handleChange}
          placeholder="No. KK"
          className="input"
        />
        <input
          name="keperluan"
          value={form.keperluan}
          onChange={handleChange}
          placeholder="Keperluan"
          className="input"
        />
        <div className="flex gap-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Berlaku dari</label>
            <input
              name="berlakuDari"
              value={form.berlakuDari}
              onChange={handleChange}
              type="date"
              className="input"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Berlaku sampai</label>
            <input
              name="berlakuSampai"
              value={form.berlakuSampai}
              onChange={handleChange}
              type="date"
              className="input"
            />
          </div>
        </div>
        <input
          name="keteranganLain"
          value={form.keteranganLain}
          onChange={handleChange}
          placeholder="Keterangan Lain"
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
        id="keterangan-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Instansi" className="h-16 mr-4" />
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
        <p>Kode Desa: 02122013</p>
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT KETERANGAN</div>
          <div className="text-sm">Nomor: 123/SKTM/[BULAN]/[TAHUN]</div>
        </div>
        <div className="content mt-4">
          <p style={{ textIndent: "2em" }}>
            Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
            Kecamatan Patikreja Kabupaten Banyumas Provinsi Jawa Tengah,
            menerangkan bahwa:
          </p>
          <table className="mb-2">
            <tbody>
              <tr>
                <td>1. Nama</td>
                <td>:</td>
                <td>{form.nama}</td>
              </tr>
              <tr>
                <td>2. Tempat/Tgl Lahir</td>
                <td>:</td>
                <td>
                  {form.tempatLahir}, {form.tanggalLahir}
                </td>
              </tr>
              <tr>
                <td>3. Warganegara</td>
                <td>:</td>
                <td>{form.warganegara}</td>
              </tr>
              <tr>
                <td>4. Agama</td>
                <td>:</td>
                <td>{form.agama}</td>
              </tr>
              <tr>
                <td>5. Pekerjaan</td>
                <td>:</td>
                <td>{form.pekerjaan}</td>
              </tr>
              <tr>
                <td>6. Tempat Tinggal</td>
                <td>:</td>
                <td>{form.alamat}</td>
              </tr>
              <tr>
                <td>7. Surat Bukti Diri</td>
                <td>:</td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>NIK: {form.nik}</span>
                    <span>No. KK: {form.kk}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>8. Keperluan</td>
                <td>:</td>
                <td>{form.keperluan}</td>
              </tr>
              <tr>
                <td>9. Berlaku</td>
                <td>:</td>
                <td>
                  {form.berlakuDari && form.berlakuSampai
                    ? `${new Date(form.berlakuDari).toLocaleDateString(
                        "id-ID"
                      )} s/d ${new Date(form.berlakuSampai).toLocaleDateString(
                        "id-ID"
                      )}`
                    : ""}
                </td>
              </tr>
              <tr>
                <td>10. Keterangan lain</td>
                <td>:</td>
                <td>{form.keteranganLain}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ textIndent: "2em" }}>
            Demikian Surat Keterangan ini diberikan untuk dipergunakan
            seperlunya.
          </p>
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
                style={{ minHeight: 70, borderBottom: "1px solid transparent" }}
              ></div>
              <p>
                <strong>{form.nama}</strong>
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
            <div className="compact">
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
                style={{ minHeight: 70, borderBottom: "1px solid transparent" }}
              ></div>
              <p>
                <strong>[Nama Kepala Desa]</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateKeteranganLetter;
