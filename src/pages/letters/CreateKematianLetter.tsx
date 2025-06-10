import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
const initialForm = {
  deceasedName: "",
  deceasedAlias: "",
  deceasedBinBinti: "",
  deceasedNik: "",
  deceasedBirthPlace: "",
  deceasedBirthDate: "",
  deceasedNationality: "Indonesia",
  deceasedReligion: "",
  deceasedOccupation: "",
  deceasedAddress: "",
  deathDate: "",
  deathPlace: "",
  spouseName: "",
  spouseAlias: "",
  spouseBinBinti: "",
  spouseNik: "",
  spouseBirthPlace: "",
  spouseBirthDate: "",
  spouseNationality: "Indonesia",
  spouseReligion: "",
  spouseOccupation: "",
  spouseAddress: "",
  suratDate: new Date().toISOString().slice(0, 10),
  kepalaDesa: "",
  nomorSurat: "",
};

function generateSuratKematianN6Pdf(form: any) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  // Header
  doc.setFontSize(10);
  doc.text("KANTOR DESA", 10, 16);
  doc.text(": Kedungwiringin", 50, 16);
  doc.text("KECAMATAN", 10, 22);
  doc.text(": Patikraja", 50, 22);
  doc.text("KABUPATEN", 10, 28);
  doc.text(": Banyumas", 50, 28);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SURAT KETERANGAN KEMATIAN", 70, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nomor : ${form.nomorSurat || "........"}`, 90, 44);
  // Model N6
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Model N6", 170, 15);
  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa :",
    10,
    54
  );
  // Section A
  let y = 62;
  doc.text(
    `A. 1. Nama lengkap dan alias\t: ${form.deceasedName}${
      form.deceasedAlias ? " / " + form.deceasedAlias : ""
    }`,
    10,
    y
  );
  doc.text(`2. Bin/Binti\t\t\t\t: ${form.deceasedBinBinti}`, 10, y + 6);
  doc.text(`3. Nomor Induk Kependudukan\t: ${form.deceasedNik}`, 10, y + 12);
  doc.text(
    `4. Tempat dan tanggal lahir\t\t: ${form.deceasedBirthPlace}, ${form.deceasedBirthDate}`,
    10,
    y + 18
  );
  doc.text(
    `5. Kewarganegaraan\t\t\t\t: ${form.deceasedNationality}`,
    10,
    y + 24
  );
  doc.text(`6. Agama\t\t\t\t: ${form.deceasedReligion}`, 10, y + 30);
  doc.text(`7. Pekerjaan\t\t\t\t: ${form.deceasedOccupation}`, 10, y + 36);
  doc.text(`8. Alamat\t\t\t\t: ${form.deceasedAddress}`, 10, y + 42);
  // Keterangan meninggal
  doc.setFont("helvetica", "bold");
  doc.text(
    `Telah meninggal dunia pada tanggal\t: ${form.deathDate}`,
    10,
    y + 50
  );
  doc.text(`Di\t\t\t\t\t\t: ${form.deathPlace}`, 10, y + 56);
  // Section B
  doc.setFont("helvetica", "normal");
  doc.text("Yang bersangkutan adalah suami/istri dari :", 10, y + 66);
  let yB = y + 74;
  doc.text(
    `B. 1. Nama lengkap dan alias\t\t: ${form.spouseName}${
      form.spouseAlias ? " / " + form.spouseAlias : ""
    }`,
    10,
    yB
  );
  doc.text(`2. Bin/Binti\t\t\t\t: ${form.spouseBinBinti}`, 10, yB + 6);
  doc.text(`3. Nomor Induk Kependudukan\t: ${form.spouseNik}`, 10, yB + 12);
  doc.text(
    `4. Tempat dan tanggal lahir\t\t: ${form.spouseBirthPlace}, ${form.spouseBirthDate}`,
    10,
    yB + 18
  );
  doc.text(
    `5. Kewarganegaraan\t\t\t\t: ${form.spouseNationality}`,
    10,
    yB + 24
  );
  doc.text(`6. Agama\t\t\t\t: ${form.spouseReligion}`, 10, yB + 30);
  doc.text(`7. Pekerjaan\t\t\t\t: ${form.spouseOccupation}`, 10, yB + 36);
  doc.text(`8. Tempat tinggal\t\t\t\t: ${form.spouseAddress}`, 10, yB + 42);
  // Penutup
  doc.text(
    "Demikianlah, surat keterangan ini dibuat dengan mengingat sumpah jabatan dan untuk digunakan seperlunya.",
    10,
    yB + 52
  );
  // Tanggal, jabatan, tanda tangan
  doc.text(
    `Kedungwiringin, ${
      form.suratDate && new Date(form.suratDate).toLocaleDateString("id-ID")
    }`,
    120,
    yB + 66
  );
  doc.text("Kepala Desa Kedungwiringin", 130, yB + 72);
  doc.text(form.kepalaDesa || "", 140, yB + 92);
  // Footer
  doc.setFontSize(8);
  doc.text(
    "Lampiran X Keputusan Direktur Jendral Bimbingan Masyarakat Islam Nomor 473 Tahun 2020",
    10,
    285
  );
  return doc;
}

const CreateKematianLetter: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);

  React.useEffect(() => {
    villageService.getVillageInfo().then(setVillageInfo);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPdf = () => {
    const doc = generateSuratKematianN6Pdf(form);
    doc.save("Surat-Keterangan-Kematian-N6.pdf");

    const historyEntry: LetterHistory = {
      name: form.deceasedName,
      letter: "ahli-waris",
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => console.log("Letter history saved"))
      .catch((error) => console.error("Failed to save letter history:", error));
  };

  const handlePrintPdf = () => {
    const doc = generateSuratKematianN6Pdf(form);
    window.open(doc.output("bloburl"), "_blank");

    const historyEntry: LetterHistory = {
      name: form.deceasedName,
      letter: "ahli-waris",
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => console.log("Letter history saved"))
      .catch((error) => console.error("Failed to save letter history:", error));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        Surat Keterangan Kematian (Model N6)
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        <div className="md:col-span-2 font-semibold mb-2">
          A. Data Almarhum/Almarhumah
        </div>
        <Input
          label="Nama Lengkap"
          name="deceasedName"
          value={form.deceasedName}
          onChange={handleChange}
          required
        />
        <Input
          label="Alias"
          name="deceasedAlias"
          value={form.deceasedAlias}
          onChange={handleChange}
        />
        <Input
          label="Bin/Binti"
          name="deceasedBinBinti"
          value={form.deceasedBinBinti}
          onChange={handleChange}
        />
        <Input
          label="NIK"
          name="deceasedNik"
          value={form.deceasedNik}
          onChange={handleChange}
        />
        <Input
          label="Tempat Lahir"
          name="deceasedBirthPlace"
          value={form.deceasedBirthPlace}
          onChange={handleChange}
        />
        <Input
          label="Tanggal Lahir"
          name="deceasedBirthDate"
          type="date"
          value={form.deceasedBirthDate}
          onChange={handleChange}
        />
        <Input
          label="Kewarganegaraan"
          name="deceasedNationality"
          value={form.deceasedNationality}
          onChange={handleChange}
        />
        <Input
          label="Agama"
          name="deceasedReligion"
          value={form.deceasedReligion}
          onChange={handleChange}
        />
        <Input
          label="Pekerjaan"
          name="deceasedOccupation"
          value={form.deceasedOccupation}
          onChange={handleChange}
        />
        <Input
          label="Alamat"
          name="deceasedAddress"
          value={form.deceasedAddress}
          onChange={handleChange}
        />
        <Input
          label="Tanggal Meninggal"
          name="deathDate"
          type="date"
          value={form.deathDate}
          onChange={handleChange}
        />
        <Input
          label="Tempat Meninggal"
          name="deathPlace"
          value={form.deathPlace}
          onChange={handleChange}
        />
        <div className="md:col-span-2 font-semibold mt-4 mb-2">
          B. Data Pasangan
        </div>
        <Input
          label="Nama Lengkap"
          name="spouseName"
          value={form.spouseName}
          onChange={handleChange}
        />
        <Input
          label="Alias"
          name="spouseAlias"
          value={form.spouseAlias}
          onChange={handleChange}
        />
        <Input
          label="Bin/Binti"
          name="spouseBinBinti"
          value={form.spouseBinBinti}
          onChange={handleChange}
        />
        <Input
          label="NIK"
          name="spouseNik"
          value={form.spouseNik}
          onChange={handleChange}
        />
        <Input
          label="Tempat Lahir"
          name="spouseBirthPlace"
          value={form.spouseBirthPlace}
          onChange={handleChange}
        />
        <Input
          label="Tanggal Lahir"
          name="spouseBirthDate"
          type="date"
          value={form.spouseBirthDate}
          onChange={handleChange}
        />
        <Input
          label="Kewarganegaraan"
          name="spouseNationality"
          value={form.spouseNationality}
          onChange={handleChange}
        />
        <Input
          label="Agama"
          name="spouseReligion"
          value={form.spouseReligion}
          onChange={handleChange}
        />
        <Input
          label="Pekerjaan"
          name="spouseOccupation"
          value={form.spouseOccupation}
          onChange={handleChange}
        />
        <Input
          label="Alamat"
          name="spouseAddress"
          value={form.spouseAddress}
          onChange={handleChange}
        />
        <div className="md:col-span-2 font-semibold mt-4 mb-2">
          C. Data Surat
        </div>
        <Input
          label="Tanggal Surat"
          name="suratDate"
          type="date"
          value={form.suratDate}
          onChange={handleChange}
        />
        <Input
          label="Nama Kepala Desa"
          name="kepalaDesa"
          value={
            form.kepalaDesa === "" && villageInfo?.leaderName
              ? villageInfo.leaderName
              : form.kepalaDesa
          }
          onChange={handleChange}
        />
        <Input
          label="Nomor Surat"
          name="nomorSurat"
          value={form.nomorSurat}
          onChange={handleChange}
        />
        <div className="md:col-span-2 flex space-x-2 mt-2">
          <Button type="button" variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button type="button" variant="secondary" onClick={handlePrintPdf}>
            Print PDF
          </Button>
        </div>
      </form>
      <div className="bg-white p-6 border shadow max-w-[800px] mx-auto mb-8">
        <div className="text-center font-bold text-lg mb-2">
          SURAT KETERANGAN KEMATIAN
        </div>
        <div className="text-center text-sm mb-2">Model N6</div>
        <div className="text-center mb-2">
          Nomor: {form.nomorSurat || "........"}
        </div>
        <div className="mb-2">KANTOR DESA: Kedungwiringin</div>
        <div className="mb-2">KECAMATAN: Patikraja</div>
        <div className="mb-2">KABUPATEN: Banyumas</div>
        <div className="mb-4">
          Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya
          bahwa:
        </div>
        <div className="mb-2 font-semibold">A. Data Almarhum/Almarhumah</div>
        <table className="mb-2">
          <tbody>
            <tr>
              <td>1. Nama lengkap dan alias</td>
              <td>:</td>
              <td>
                {form.deceasedName}
                {form.deceasedAlias ? ` / ${form.deceasedAlias}` : ""}
              </td>
            </tr>
            <tr>
              <td>2. Bin/Binti</td>
              <td>:</td>
              <td>{form.deceasedBinBinti}</td>
            </tr>
            <tr>
              <td>3. NIK</td>
              <td>:</td>
              <td>{form.deceasedNik}</td>
            </tr>
            <tr>
              <td>4. Tempat & Tanggal Lahir</td>
              <td>:</td>
              <td>
                {form.deceasedBirthPlace}, {form.deceasedBirthDate}
              </td>
            </tr>
            <tr>
              <td>5. Kewarganegaraan</td>
              <td>:</td>
              <td>{form.deceasedNationality}</td>
            </tr>
            <tr>
              <td>6. Agama</td>
              <td>:</td>
              <td>{form.deceasedReligion}</td>
            </tr>
            <tr>
              <td>7. Pekerjaan</td>
              <td>:</td>
              <td>{form.deceasedOccupation}</td>
            </tr>
            <tr>
              <td>8. Alamat</td>
              <td>:</td>
              <td>{form.deceasedAddress}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2">
          Telah meninggal dunia pada tanggal: <b>{form.deathDate}</b>
        </div>
        <div className="mb-2">
          Di: <b>{form.deathPlace}</b>
        </div>
        <div className="mb-2 font-semibold">B. Data Pasangan</div>
        <table className="mb-2">
          <tbody>
            <tr>
              <td>1. Nama lengkap dan alias</td>
              <td>:</td>
              <td>
                {form.spouseName}
                {form.spouseAlias ? ` / ${form.spouseAlias}` : ""}
              </td>
            </tr>
            <tr>
              <td>2. Bin/Binti</td>
              <td>:</td>
              <td>{form.spouseBinBinti}</td>
            </tr>
            <tr>
              <td>3. NIK</td>
              <td>:</td>
              <td>{form.spouseNik}</td>
            </tr>
            <tr>
              <td>4. Tempat & Tanggal Lahir</td>
              <td>:</td>
              <td>
                {form.spouseBirthPlace}, {form.spouseBirthDate}
              </td>
            </tr>
            <tr>
              <td>5. Kewarganegaraan</td>
              <td>:</td>
              <td>{form.spouseNationality}</td>
            </tr>
            <tr>
              <td>6. Agama</td>
              <td>:</td>
              <td>{form.spouseReligion}</td>
            </tr>
            <tr>
              <td>7. Pekerjaan</td>
              <td>:</td>
              <td>{form.spouseOccupation}</td>
            </tr>
            <tr>
              <td>8. Alamat</td>
              <td>:</td>
              <td>{form.spouseAddress}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-4">
          Demikianlah, surat keterangan ini dibuat dengan mengingat sumpah
          jabatan dan untuk digunakan seperlunya.
        </div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>
              Kedungwiringin,{" "}
              {form.suratDate &&
                new Date(form.suratDate).toLocaleDateString("id-ID")}
            </div>
            <div className="font-bold">Kepala Desa Kedungwiringin</div>
            <div style={{ height: "60px" }}></div>
            <div className="font-bold underline">
              {form.kepalaDesa ||
                villageInfo?.leaderName ||
                "(................................)"}
            </div>
          </div>
        </div>
        <div className="text-xs mt-8">
          Lampiran X Keputusan Direktur Jendral Bimbingan Masyarakat Islam Nomor
          473 Tahun 2020
        </div>
      </div>
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="p-4 bg-white">
          <p>
            Preview belum tersedia. Silakan gunakan Export PDF untuk melihat
            hasil akhir.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CreateKematianLetter;
