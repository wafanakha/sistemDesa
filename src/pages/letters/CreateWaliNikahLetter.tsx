import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import jsPDF from "jspdf";
import { Letter } from "../../types";
import { letterService } from "../../database/letterService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
interface WaliNikahFormData {
  waliNama: string;
  waliTempatTanggalLahir: string;
  waliAgama: string;
  waliPekerjaan: string;
  waliAlamat: string;
  perempuanNama: string;
  perempuanTempatTanggalLahir: string;
  perempuanAgama: string;
  perempuanPekerjaan: string;
  perempuanAlamat: string;
  hubunganWali: string;
}

const initialForm: WaliNikahFormData = {
  waliNama: "",
  waliTempatTanggalLahir: "",
  waliAgama: "",
  waliPekerjaan: "",
  waliAlamat: "",
  perempuanNama: "",
  perempuanTempatTanggalLahir: "",
  perempuanAgama: "",
  perempuanPekerjaan: "",
  perempuanAlamat: "",
  hubunganWali: "",
};

const hubunganOptions = [
  "Ayah",
  "Kakek",
  "Kakek Buyut",
  "Sdr. Laki-laki seayah seibu",
  "Sdr. Laki-laki Seayah",
  "Kemenakan Laki-laki dari sdr. laki-laki seayah seibu",
  "Kemenakan Laki-laki dari sdr. laki-laki seayah",
  "Paman seayah seibu",
  "Paman seayah",
  "Anak laki-laki paman seayah seibu",
  "Anak laki-laki paman seayah",
  "Anak laki-laki dari anak paman seayah seibu",
  "Anak laki-laki dari anak paman seayah",
  "Paman ayah seayah seibu",
  "Paman ayah seayah",
  "Anak laki-laki paman ayah seayah seibu",
  "Anak laki-laki paman ayah seayah",
  "Paman kakek seayah seibu",
  "Paman kakek seayah",
  "Anak laki-laki dari paman kakek seayah seibu",
  "Anak laki-laki dari paman kakek seayah",
];

const CreateWaliNikahLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<WaliNikahFormData>(initialForm);
  const [letterNumber, setLetterNumber] = useState("");
  const [kepalaDesa, setKepalaDesa] = useState("");
  const [villageInfo, setVillageInfo] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<WaliNikahFormData> = {};
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SURAT KETERANGAN WALI NIKAH", 105, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      `Nomor : ${letterNumber || "........................................"}`,
      60,
      y
    );
    y += 7;
    doc.text(
      "     Yang bertanda tangan di bawah ini kami Kepala Desa Kedungwringin Kecamatan Patikraja",
      20,
      y
    );
    y += 4;
    doc.text(
      "Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa :",
      20,
      y
    );
    y += 7;
    doc.text("N a m a", 30, y);
    doc.text(":", 70, y);
    doc.text(form.waliNama || "-", 75, y);
    y += 4;
    doc.text("Tempat dan tanggal lahir", 30, y);
    doc.text(":", 70, y);
    doc.text(form.waliTempatTanggalLahir || "-", 75, y);
    y += 4;
    doc.text("Agama", 30, y);
    doc.text(":", 70, y);
    doc.text(form.waliAgama || "-", 75, y);
    y += 4;
    doc.text("Pekerjaan", 30, y);
    doc.text(":", 70, y);
    doc.text(form.waliPekerjaan || "-", 75, y);
    y += 4;
    doc.text("Tempat tinggal", 30, y);
    doc.text(":", 70, y);
    doc.text(form.waliAlamat || "-", 75, y);
    y += 7;
    doc.text("Adalah sebagai WALI NIKAH dari seorang perempuan :", 20, y);
    y += 7;
    doc.text("N a m a", 30, y);
    doc.text(":", 70, y);
    doc.text(form.perempuanNama || "-", 75, y);
    y += 4;
    doc.text("Tempat dan tanggal lahir", 30, y);
    doc.text(":", 70, y);
    doc.text(form.perempuanTempatTanggalLahir || "-", 75, y);
    y += 4;
    doc.text("Agama", 30, y);
    doc.text(":", 70, y);
    doc.text(form.perempuanAgama || "-", 75, y);
    y += 4;
    doc.text("Pekerjaan", 30, y);
    doc.text(":", 70, y);
    doc.text(form.perempuanPekerjaan || "-", 75, y);
    y += 4;
    doc.text("Tempat tinggal", 30, y);
    doc.text(":", 70, y);
    doc.text(form.perempuanAlamat || "-", 75, y);
    y += 7;
    doc.text("Hubungan wali/status terhadap perempuan tsb :", 20, y);
    y += 7;
    hubunganOptions.forEach((opt, idx) => {
      doc.text(
        `${idx + 1}. ${opt}${form.hubunganWali === opt ? " (dipilih)" : ""}`,
        30,
        y
      );
      y += 5;
    });
    y += 2;
    doc.setFont("helvetica", "normal");
    doc.text(
      "(lingkarilah salah satu sesuai dengan hubungannya/statusnya)",
      20,
      y
    );
    y += 5;
    doc.text(
      "Demikian Surat Keterangan ini dibuat untuk menjadikan periksa dan dapat dipergunakan seperlunya.",
      20,
      y,
      { maxWidth: 170 }
    );
    y += 7;
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID")}`,
      140,
      y
    );
    y += 7;
    doc.text("Kepala Desa Kedungwringin", 140, y);
    y += 30;
    doc.text(
      kepalaDesa ||
        villageInfo?.leaderName ||
        "(................................)",
      140,
      y
    );
    doc.save("surat-wali-nikah.pdf");
    const historyEntry: LetterHistory = {
      name: form.waliNama,
      letter: "wali-nikah", // Since this is the usaha letter component
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
      letterType: "wali-nikah",
      title: "Surat Keterangan Wali Nikah",
      content: JSON.stringify(form),
      issuedDate: new Date(),
      status: "draft" as const,
      residentName: form.waliNama,
      residentId: 0,
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
        Surat Keterangan Wali Nikah
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input
          name="waliNama"
          value={form.waliNama}
          onChange={handleChange}
          placeholder="Nama Wali"
          className="input"
        />
        <input
          name="waliTempatTanggalLahir"
          value={form.waliTempatTanggalLahir}
          onChange={handleChange}
          placeholder="Tempat & Tanggal Lahir Wali"
          className="input"
        />
        <input
          name="waliAgama"
          value={form.waliAgama}
          onChange={handleChange}
          placeholder="Agama Wali"
          className="input"
        />
        <input
          name="waliPekerjaan"
          value={form.waliPekerjaan}
          onChange={handleChange}
          placeholder="Pekerjaan Wali"
          className="input"
        />
        <input
          name="waliAlamat"
          value={form.waliAlamat}
          onChange={handleChange}
          placeholder="Alamat Wali"
          className="input"
        />
        <input
          name="perempuanNama"
          value={form.perempuanNama}
          onChange={handleChange}
          placeholder="Nama Perempuan"
          className="input"
        />
        <input
          name="perempuanTempatTanggalLahir"
          value={form.perempuanTempatTanggalLahir}
          onChange={handleChange}
          placeholder="Tempat & Tanggal Lahir Perempuan"
          className="input"
        />
        <input
          name="perempuanAgama"
          value={form.perempuanAgama}
          onChange={handleChange}
          placeholder="Agama Perempuan"
          className="input"
        />
        <input
          name="perempuanPekerjaan"
          value={form.perempuanPekerjaan}
          onChange={handleChange}
          placeholder="Pekerjaan Perempuan"
          className="input"
        />
        <input
          name="perempuanAlamat"
          value={form.perempuanAlamat}
          onChange={handleChange}
          placeholder="Alamat Perempuan"
          className="input"
        />
        <select
          name="hubunganWali"
          value={form.hubunganWali}
          onChange={handleChange}
          className="input"
        >
          <option value="">Pilih Hubungan Wali</option>
          {hubunganOptions.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          name="letterNumber"
          value={letterNumber}
          onChange={(e) => setLetterNumber(e.target.value)}
          placeholder="Nomor Surat"
          className="input"
        />
        <input
          name="kepalaDesa"
          value={
            kepalaDesa === "" && villageInfo?.leaderName
              ? villageInfo.leaderName
              : kepalaDesa
          }
          onChange={(e) => setKepalaDesa(e.target.value)}
          placeholder="Nama Kepala Desa"
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
        <Button variant="outline" onClick={handleSaveLetter}>
          Simpan Surat
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
          <h2
            style={{
              textAlign: "center",
              textDecoration: "underline",
              fontSize: "13pt",
              fontWeight: "bold",
            }}
          >
            SURAT KETERANGAN WALI NIKAH
          </h2>
          <p style={{ textAlign: "center" }}>
            Nomor : {letterNumber || "........................................"}
          </p>
          <div style={{ marginTop: 30 }}>
            <p>
              Yang bertanda tangan di bawah ini kami Kepala Desa Kedungwringin
              Kecamatan Patikraja
              <br />
              Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa :
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>N a m a</td>
                  <td>:</td>
                  <td>{form.waliNama}</td>
                </tr>
                <tr>
                  <td>Tempat dan tanggal lahir</td>
                  <td>:</td>
                  <td>{form.waliTempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td>Agama</td>
                  <td>:</td>
                  <td>{form.waliAgama}</td>
                </tr>
                <tr>
                  <td>Pekerjaan</td>
                  <td>:</td>
                  <td>{form.waliPekerjaan}</td>
                </tr>
                <tr>
                  <td>Tempat tinggal</td>
                  <td>:</td>
                  <td>{form.waliAlamat}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 10 }}>
              Adalah sebagai WALI NIKAH dari seorang perempuan :
            </p>
            <table style={{ marginLeft: 20 }}>
              <tbody>
                <tr>
                  <td>N a m a</td>
                  <td>:</td>
                  <td>{form.perempuanNama}</td>
                </tr>
                <tr>
                  <td>Tempat dan tanggal lahir</td>
                  <td>:</td>
                  <td>{form.perempuanTempatTanggalLahir}</td>
                </tr>
                <tr>
                  <td>Agama</td>
                  <td>:</td>
                  <td>{form.perempuanAgama}</td>
                </tr>
                <tr>
                  <td>Pekerjaan</td>
                  <td>:</td>
                  <td>{form.perempuanPekerjaan}</td>
                </tr>
                <tr>
                  <td>Tempat tinggal</td>
                  <td>:</td>
                  <td>{form.perempuanAlamat}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 10 }}>
              Hubungan wali/status terhadap perempuan tsb :
            </p>
            <ol style={{ marginLeft: 30 }}>
              {hubunganOptions.map((opt, idx) => (
                <li
                  key={idx}
                  style={{
                    fontWeight: form.hubunganWali === opt ? "bold" : "normal",
                    color: form.hubunganWali === opt ? "#0d9488" : undefined,
                  }}
                >
                  {opt}
                  {form.hubunganWali === opt ? " (dipilih)" : ""}
                </li>
              ))}
            </ol>
            <p style={{ fontStyle: "italic", marginTop: 5 }}>
              (lingkarilah salah satu sesuai dengan hubungannya/statusnya)
            </p>
            <p style={{ marginTop: 20 }}>
              Demikian Surat Keterangan ini dibuat untuk menjadikan periksa dan
              dapat dipergunakan seperlunya.
            </p>
            <div style={{ marginTop: 40, textAlign: "right", marginRight: 40 }}>
              <p>Kedungwringin, {new Date().toLocaleDateString("id-ID")}</p>
              <p>Kepala Desa Kedungwringin</p>
              <div style={{ minHeight: 70 }}></div>
              <p>
                <strong>
                  {kepalaDesa ||
                    villageInfo?.leaderName ||
                    "(................................)"}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWaliNikahLetter;
