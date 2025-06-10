import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { letterService } from "../../database/letterService";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
interface PengantarNumpangNikahFormData {
  nama: string;
  tempatTanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  statusPerkawinan: string;
  alamat: string;
  nik: string;
  kk: string;
  keperluan: string;
  berlaku: string;
  keteranganLain: string;
  residentId?: number; // Tambahkan residentId
}

const initialForm: PengantarNumpangNikahFormData = {
  nama: "",
  tempatTanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  statusPerkawinan: "",
  alamat: "",
  nik: "",
  kk: "",
  keperluan: "",
  berlaku: "",
  keteranganLain: "",
  residentId: undefined,
};

const CreatePengantarNumpangNikahLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Ambil editData dari props atau location.state
  const editData =
    props.editData || (location.state && location.state.editData);
  const isEditMode =
    props.isEditMode || (location.state && location.state.isEditMode);

  const [form, setForm] = useState<PengantarNumpangNikahFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<PengantarNumpangNikahFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  React.useEffect(() => {
    const loadVillage = async () => {
      const info = await villageService.getVillageInfo();
      setVillageInfo(info);
    };
    loadVillage();
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
      tempatTanggalLahir: resident.birthPlace + ", " + resident.birthDate,
      jenisKelamin: resident.gender,
      agama: resident.religion,
      pekerjaan: resident.occupation,
      statusPerkawinan: resident.maritalStatus || "",
      alamat: resident.address,
      nik: resident.nik,
      kk: resident.kk || "",
      residentId: resident.id, // Set residentId
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = 18;
    // Kop surat
    doc.addImage(logo, "PNG", 25, y, 25, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(
      `PEMERINTAHAN ${villageInfo?.regencyName || "KABUPATEN"}`,
      105,
      y + 6,
      { align: "center" }
    );
    doc.text(
      `KECAMATAN ${villageInfo?.districtName || "KECAMATAN"}`,
      105,
      y + 12,
      { align: "center" }
    );
    doc.text(`DESA ${villageInfo?.name || "DESA"}`, 105, y + 18, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(villageInfo?.address || "Alamat Desa", 105, y + 24, {
      align: "center",
    });
    doc.text(`Telp. ${villageInfo?.phoneNumber || "-"}`, 105, y + 29, {
      align: "center",
    });
    y += 32;
    doc.setLineWidth(0.7);
    doc.line(20, y, 190, y);
    y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Kode Desa: ${villageInfo?.postalCode || "Kode Pos"}`, 25, y);
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PENGANTAR NUMPANG NIKAH", 105, y, { align: "center" });
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Nomor: ", 105, y, { align: "center" });
    y += 10;
    doc.text(
      `Yang bertanda tangan di bawah ini, kami Kepala Desa ${
        villageInfo?.name || "Desa"
      } Kecamatan ${villageInfo?.districtName || "-"} Kabupaten ${
        villageInfo?.regencyName || "-"
      } Provinsi ${villageInfo?.provinceName || "-"}, menerangkan bahwa:`,
      25,
      y,
      { maxWidth: 170 }
    );
    y += 10;
    doc.text("Nama", 30, y);
    doc.text(":", 70, y);
    doc.text(form.nama || "-", 75, y);
    y += 7;
    doc.text("Tempat/Tgl Lahir", 30, y);
    doc.text(":", 70, y);
    doc.text(form.tempatTanggalLahir || "-", 75, y);
    y += 7;
    doc.text("Warganegara", 30, y);
    doc.text(":", 70, y);
    doc.text(form.jenisKelamin || "-", 75, y);
    y += 7;
    doc.text("Agama", 30, y);
    doc.text(":", 70, y);
    doc.text(form.agama || "-", 75, y);
    y += 7;
    doc.text("Pekerjaan", 30, y);
    doc.text(":", 70, y);
    doc.text(form.pekerjaan || "-", 75, y);
    y += 7;
    doc.text("Status Perkawinan", 30, y);
    doc.text(":", 70, y);
    doc.text(form.statusPerkawinan || "-", 75, y);
    y += 7;
    doc.text("Tempat Tinggal", 30, y);
    doc.text(":", 70, y);
    doc.text(form.alamat || "-", 75, y);
    y += 7;
    doc.text("Surat Bukti Diri", 30, y);
    doc.text(":", 70, y);
    doc.text(`NIK: ${form.nik || "-"}  No. KK: ${form.kk || "-"}`, 75, y);
    y += 7;
    doc.text("Keperluan", 30, y);
    doc.text(":", 70, y);
    doc.text(form.keperluan || "-", 75, y);
    y += 7;
    doc.text("Berlaku", 30, y);
    doc.text(":", 70, y);
    doc.text(form.berlaku || "s/d", 75, y);
    y += 7;
    doc.text("Keterangan lain", 30, y);
    doc.text(":", 70, y);
    doc.text(form.keteranganLain || "-", 75, y);
    y += 10;
    doc.text(
      "Demikian Surat Keterangan ini diberikan untuk dipergunakan seperlunya.",
      25,
      y,
      { maxWidth: 170 }
    );
    y += 14;
    // Tanda tangan
    doc.text("Pemohon", 35, y);
    doc.text(
      `${villageInfo?.name || "Desa"}, ${new Date().toLocaleDateString(
        "id-ID"
      )}`,
      140,
      y
    );
    y += 7;
    doc.text(`${form.nama}`, 35, y + 26);
    doc.text(
      `An. ${villageInfo?.leaderTitle || "KEPALA DESA"} ${
        villageInfo?.name || ""
      }`,
      140,
      y
    );
    doc.text("KASI PEMERINTAH", 140, y + 6);
    doc.text(
      `(${villageInfo?.leaderName || "................................"})`,
      140,
      y + 26
    );
    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();

    doc.save("pengantar-numpang-nikah.pdf");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar-numpang-nikah", // Since this is the usaha letter component
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
      letter: "pengantar-numpang-nikah", // Since this is the usaha letter component
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

  const handleSaveLetter = async () => {
    const letterData = {
      letterType: "pengantar-numpang-nikah",
      title: "Pengantar Numpang Nikah",
      content: JSON.stringify(form),
      issuedDate: new Date(),
      status: "draft" as const,
      residentName: form.nama,
      residentId: form.residentId || 0, // Gunakan residentId dari form
      letterNumber: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      await letterService.addLetter(letterData as any);
      alert("Surat berhasil disimpan!");
    } catch (err) {
      alert(
        "Gagal menyimpan surat: " + (err instanceof Error ? err.message : err)
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Pengantar Numpang Nikah
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
          name="tempatTanggalLahir"
          value={form.tempatTanggalLahir}
          onChange={handleChange}
          placeholder="Tempat/Tgl Lahir"
          className="input"
        />
        <input
          name="jenisKelamin"
          value={form.jenisKelamin}
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
          name="statusPerkawinan"
          value={form.statusPerkawinan}
          onChange={handleChange}
          placeholder="Status Perkawinan"
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
        <input
          name="berlaku"
          value={form.berlaku}
          onChange={handleChange}
          placeholder="Berlaku s/d"
          className="input"
        />
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
        <Button variant="outline" onClick={handlePrintPDF}>
          Print Surat
        </Button>
      </div>
      <div className="bg-white p-8 border shadow max-w-[800px] mx-auto">
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
                PEMERINTAHAN {villageInfo?.regencyName || "KABUPATEN"}
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                KECAMATAN {villageInfo?.districtName || "KECAMATAN"}
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                DESA {villageInfo?.name || "DESA"}
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                {villageInfo?.address || "Alamat Desa"}
              </div>
              <div className="bold" style={{ fontWeight: "bold" }}>
                Telp. {villageInfo?.phoneNumber || "-"}
              </div>
            </div>
          </div>
          <hr style={{ border: "1px solid black", marginTop: 10 }} />
          <p>Kode Desa: {villageInfo?.postalCode || "Kode Pos"}</p>
          <h2
            style={{
              textAlign: "center",
              textDecoration: "underline",
              fontSize: "11pt",
            }}
          >
            PENGANTAR NUMPANG NIKAH
          </h2>
          <p style={{ textAlign: "center" }}>Nomor: 123/SKTM/[BULAN]/[TAHUN]</p>
          <div className="content" style={{ marginTop: 30 }}>
            <p>
              Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
              Kecamatan PATIKRAJA Kabupaten Banyumas Provinsi Jawa Tengah,
              menerangkan bahwa:
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>Nama</td>
                  <td>:</td>
                  <td>{form.nama}</td>
                </tr>
                <tr>
                  <td>Tempat/Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.tempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td>Warganegara</td>
                  <td>:</td>
                  <td>{form.jenisKelamin}</td>
                </tr>
                <tr>
                  <td>Agama</td>
                  <td>:</td>
                  <td>{form.agama}</td>
                </tr>
                <tr>
                  <td>Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan}</td>
                </tr>
                <tr>
                  <td>Status Perkawinan</td>
                  <td>:</td>
                  <td>{form.statusPerkawinan}</td>
                </tr>
                <tr>
                  <td>Tempat Tinggal</td>
                  <td>:</td>
                  <td>{form.alamat}</td>
                </tr>
                <tr>
                  <td>Surat Bukti Diri</td>
                  <td>:</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>NIK: {form.nik}</span>
                      <span>No. KK: {form.kk}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Keperluan</td>
                  <td>:</td>
                  <td>{form.keperluan}</td>
                </tr>
                <tr>
                  <td>Berlaku</td>
                  <td>:</td>
                  <td>{form.berlaku}</td>
                </tr>
                <tr>
                  <td>Keterangan lain</td>
                  <td>:</td>
                  <td>{form.keteranganLain}</td>
                </tr>
              </tbody>
            </table>
            <p>
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
            ></div>
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
                  {villageInfo?.name || "Desa"},{" "}
                  {new Date().toLocaleDateString("id-ID")}
                </p>
                <p>
                  An. {villageInfo?.leaderTitle || "KEPALA DESA"}{" "}
                  {villageInfo?.name || ""}
                </p>
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
                    {villageInfo?.leaderName || "[Nama Kepala Desa]"}
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

export default CreatePengantarNumpangNikahLetter;
