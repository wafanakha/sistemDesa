import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { residentService } from "../../database/residentService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
interface PewarisData {
  nama: string;
  umur: string;
  alamat: string;
  hariWafat: string;
  tanggalWafat: string;
  tempatWafat: string;
  aktaKematian: string;
  tanggalAkta: string;
}

interface AhliWarisData {
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  alamat: string;
  hubungan: string;
}

const initialPewaris: PewarisData = {
  nama: "",
  umur: "",
  alamat: "",
  hariWafat: "",
  tanggalWafat: "",
  tempatWafat: "",
  aktaKematian: "",
  tanggalAkta: "",
};

const initialAhliWaris: AhliWarisData[] = [];

const CreateAhliWarisLetter: React.FC = () => {
  const [kkSearch, setKkSearch] = useState("");
  const [kkResults, setKkResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedKk, setSelectedKk] = useState<any>(null);
  const [pewaris, setPewaris] = useState<PewarisData>(initialPewaris);
  const [ahliWaris, setAhliWaris] = useState<AhliWarisData[]>(initialAhliWaris);
  const [letterNumber, setLetterNumber] = useState("");
  const navigate = useNavigate();

  // Cari KK dan tampilkan anggota, pilih yang meninggal
  const handleKkSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setKkSearch(e.target.value);
    if (e.target.value.length < 3) {
      setKkResults([]);
      return;
    }
    setSearching(true);
    const results = await residentService.searchKk(e.target.value); // Anda perlu menyesuaikan residentService agar bisa search KK
    setKkResults(results);
    setSearching(false);
  };

  // Setelah KK dipilih, pilih pewaris (yang meninggal)
  const handleSelectKk = (kk: any) => {
    setSelectedKk(kk);
    setKkSearch(kk.kk);
    setKkResults([]);
  };

  // Pilih pewaris (yang meninggal)
  const handleSelectPewaris = (pewarisRes: any) => {
    setPewaris({
      nama: pewarisRes.name,
      umur: pewarisRes.age + " Tahun",
      alamat: pewarisRes.address,
      hariWafat: "",
      tanggalWafat: "",
      tempatWafat: pewarisRes.address,
      aktaKematian: "",
      tanggalAkta: "",
    });
    // Otomatis ambil anggota KK lain sebagai ahli waris
    const ahli = (selectedKk?.members || [])
      .filter((m: any) => m.id !== pewarisRes.id)
      .map((m: any) => ({
        nama: m.name,
        tempatLahir: m.birthPlace,
        tanggalLahir: m.birthDate,
        nik: m.nik,
        alamat: m.address,
        hubungan: m.shdk || "", // Ganti dari m.relationship ke m.shdk
      }));
    setAhliWaris(ahli);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF("p", "mm", "a4");
    // Logo
    doc.addImage(logo, "PNG", 20, 10, 24, 24);
    // Header
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("PEMERINTAH KABUPATEN BANYUMAS", 105, 17, { align: "center" });
    doc.text("KECAMATAN PATIKRAJA", 105, 23, { align: "center" });
    doc.text("KEPALA DESA KEDUNGWRINGIN", 105, 29, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("Times", "Normal");
    doc.text(
      "Jalan Raya Kedungwringin No. 01 Telp. 0281 6438935 Kode Pos    53171",
      105,
      35,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
    // Title
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("SURAT KETERANGAN AHLI WARIS", 105, 48, { align: "center" });
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text(`Nomor : ${letterNumber || "145/           /III/2025"}`, 105, 55, {
      align: "center",
    });
    let y = 65;
    doc.setFontSize(11);
    doc.text("Yang bertanda tangan di bawah ini :", 20, y);
    y += 7;
    doc.text("Nama", 30, y);
    doc.text(": PARMINAH", 60, y);
    y += 6;
    doc.text("Jabatan", 30, y);
    doc.text(": Kepala Desa Kedungwringin", 60, y);
    y += 8;
    doc.text("Dengan ini menerangkan dengan sebenarnya, Bahwa :", 20, y);
    y += 7;
    doc.text("Nama", 30, y);
    doc.text(`: ${pewaris.nama}`, 60, y);
    y += 6;
    doc.text("Umur", 30, y);
    doc.text(`: ${pewaris.umur}`, 60, y);
    y += 6;
    doc.text("Alamat", 30, y);
    doc.text(`: ${pewaris.alamat}`, 60, y);
    y += 8;
    const kalimatKematian = `Telah meninggal dunia pada hari ${
      pewaris.hariWafat || "..."
    } tanggal ${
      pewaris.tanggalWafat
        ? new Date(pewaris.tanggalWafat).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "..."
    } di ${
      pewaris.tempatWafat || "..."
    }, sebagaimana tercatat pada Akta Kematian No. ${
      pewaris.aktaKematian || "..."
    } tanggal ${
      pewaris.tanggalAkta
        ? new Date(pewaris.tanggalAkta).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "..."
    }.`;
    const kematianLines = doc.splitTextToSize(kalimatKematian, 170);
    doc.text(kematianLines, 20, y);
    y += kematianLines.length * 6;
    doc.text(
      "Bahwa berdasarkan data yang ditunjukkan sesuai ketentuan hukum yang berlaku, yang menjadi ahli waris dari",
      20,
      y
    );
    y += 6;
    doc.text("pewaris adalah sebagai berikut :", 20, y);
    // Ahli waris list
    ahliWaris.forEach((a, i) => {
      y += 8;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Times", "Bold");
      doc.text(`${i + 1}.`, 23, y);
      doc.setFont("Times", "Normal");
      doc.text("Nama", 30, y);
      doc.text(`: ${a.nama}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Tempat/Tgl Lahir", 30, y);
      doc.text(`: ${a.tempatLahir}, ${a.tanggalLahir}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("No KTP/NIK", 30, y);
      doc.text(`: ${a.nik}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Alamat", 30, y);
      doc.text(`: ${a.alamat}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Hubungan dengan ahli waris", 30, y);
      doc.text(`: ${a.hubungan}`, 90, y);
    });
    y += 10;
    doc.text(
      "Bahwa selain ahli waris tersebut di atas, tidak ada lagi ahli waris lain dari pewaris,",
      20,
      y
    );
    y += 6;
    doc.text(
      "Demikian Surat Keterangan Ahli Waris ini kami buat dengan sebenarnya. Dan untuk dapat dipergunakan",
      20,
      y
    );
    y += 6;
    doc.text("sebagaimana mestinya.", 20, y);
    y += 12;
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      135,
      y
    );
    y += 7;
    doc.text("Kepala Desa", 145, y);
    y += 20;
    doc.setFont("Times", "Bold");
    doc.text("PARMINAH", 145, y);
    return doc;
  };
  // Export PDF
  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save("ahli-waris.pdf");

    const historyEntry: LetterHistory = {
      name: pewaris.nama,
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
      name: pewaris.nama,
      letter: "ahli-waris",
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => console.log("Letter history saved"))
      .catch((error) => console.error("Failed to save letter history:", error));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-left text-teal-800">
        Surat Keterangan Ahli Waris
      </h1>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari Nomor KK..."
          value={kkSearch}
          onChange={handleKkSearch}
        />
        <input
          type="text"
          className="input w-full mt-2"
          placeholder="Nomor Surat"
          value={letterNumber}
          onChange={(e) => setLetterNumber(e.target.value)}
        />
        <input
          type="text"
          className="input w-full mt-2"
          placeholder="Nomor Akta Kematian"
          value={pewaris.aktaKematian}
          onChange={(e) =>
            setPewaris({ ...pewaris, aktaKematian: e.target.value })
          }
        />

        <div className="flex gap-2">
          <label className="text-xs text-gray-600 mb-1">Tanggal Wafat</label>

          <input
            type="date"
            className="input w-full mt-2"
            placeholder="Tanggal Wafat"
            value={pewaris.tanggalWafat}
            onChange={(e) =>
              setPewaris({ ...pewaris, tanggalWafat: e.target.value })
            }
          />
          <label className="text-xs text-gray-600 mb-1">
            Tanggal Akta Kematian
          </label>
          <input
            type="date"
            className="input w-full mt-2"
            placeholder="Tanggal Akta Kematian"
            value={pewaris.tanggalAkta}
            onChange={(e) =>
              setPewaris({ ...pewaris, tanggalAkta: e.target.value })
            }
          />
        </div>
        <input
          type="text"
          className="input w-full mt-2"
          placeholder="Hari Wafat"
          value={pewaris.hariWafat}
          onChange={(e) =>
            setPewaris({ ...pewaris, hariWafat: e.target.value })
          }
        />
        <input
          type="text"
          className="input w-full mt-2"
          placeholder="Tempat Wafat"
          value={pewaris.tempatWafat}
          onChange={(e) =>
            setPewaris({ ...pewaris, tempatWafat: e.target.value })
          }
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {kkResults.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {kkResults.map((kk) => (
              <div
                key={kk.kk}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectKk(kk)}
              >
                {kk.kk} - {kk.headName}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedKk && (
        <div className="mb-4">
          <div className="font-semibold mb-2">
            Pilih Pewaris (yang meninggal):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedKk.members.map((m: any) => (
              <Button
                key={m.id}
                variant="outline"
                onClick={() => handleSelectPewaris(m)}
              >
                {m.name} ({m.relationship})
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Form manual jika ingin edit data pewaris/ahli waris */}
      {/* ...bisa ditambah jika perlu... */}
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
        id="ahli-waris-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Instansi" className="h-24 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold">PEMERINTAHAN DESA KEDUNGWRINGIN</div>
            <div className="font-bold">
              KECAMATAN PATIKRAJA KABUPATEN BANYUMAS
            </div>
            <div className="font-bold">SEKRETARIAT DESA</div>
            <div className="font-bold">
              Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
            </div>
            <div className="font-bold">Telp. (0281) 638395</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">
            SURAT KETERANGAN AHLI WARIS
          </div>
          <div className="text-sm">
            Nomor: {letterNumber || `145/ /III/${new Date().getFullYear()}`}
          </div>
        </div>
        <div className="mb-2" style={{ textAlign: "left" }}>
          Yang bertanda tangan di bawah ini:
          <br />
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>PARMINAH</td>
              </tr>
              <tr>
                <td>Jabatan</td>
                <td>:</td>
                <td>Kepala Desa Kedungwringin</td>
              </tr>
            </tbody>
          </table>
          <br />
          Dengan ini menerangkan dengan sebenarnya, Bahwa:
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>{pewaris.nama}</td>
              </tr>
              <tr>
                <td>Umur</td>
                <td>:</td>
                <td>{pewaris.umur}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>:</td>
                <td>{pewaris.alamat}</td>
              </tr>
            </tbody>
          </table>
          <br />
          Telah meninggal dunia pada hari <b>
            {pewaris.hariWafat}
          </b> tanggal <b>{pewaris.tanggalWafat}</b> di {pewaris.tempatWafat},
          sebagaimana tercatat pada Akta Kematian No.{" "}
          <b>{pewaris.aktaKematian}</b> tanggal <b>{pewaris.tanggalAkta}</b>.
          <br />
          Bahwa berdasarkan data yang ditunjukkan sesuai ketentuan hukum yang
          berlaku, yang menjadi ahli waris dari pewaris adalah sebagai berikut:
          <table
            style={{
              marginLeft: 20,
              marginTop: 10,
              marginBottom: 10,
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ fontWeight: "bold", textAlign: "left" }}>
                <td>Nama</td>
                <td>Tempat/Tgl Lahir</td>
                <td>No KTP/NIK</td>
                <td>Alamat</td>
                <td>Hubungan</td>
              </tr>
            </thead>
            <tbody>
              {ahliWaris.map((a, i) => (
                <tr key={i}>
                  <td>{a.nama}</td>
                  <td>
                    {a.tempatLahir}, {a.tanggalLahir}
                  </td>
                  <td>{a.nik}</td>
                  <td>{a.alamat}</td>
                  <td>{a.hubungan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          Bahwa selain ahli waris tersebut di atas, tidak ada lagi ahli waris
          lain dari pewaris.
          <br />
          Demikian Surat Keterangan Ahli Waris ini kami buat dengan sebenarnya.
          Dan untuk dapat dipergunakan sebagaimana mestinya.
        </div>
        <div style={{ textAlign: "right", marginTop: 40 }}>
          Kedungwringin,{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          <br />
          <b>Kepala Desa</b>
          <div style={{ minHeight: 70 }}></div>
          <b>PARMINAH</b>
        </div>
      </div>
    </div>
  );
};

export default CreateAhliWarisLetter;
