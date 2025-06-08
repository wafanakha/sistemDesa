import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";

const initialForm = {
  namaSuami: "",
  binSuami: "",
  nikSuami: "",
  ttlSuami: "",
  kewarganegaraanSuami: "Indonesia",
  agamaSuami: "",
  pekerjaanSuami: "",
  alamatSuami: "",
  namaIstri: "",
  bintiIstri: "",
  nikIstri: "",
  ttlIstri: "",
  kewarganegaraanIstri: "Indonesia",
  agamaIstri: "",
  pekerjaanIstri: "",
  alamatIstri: "",
  tanggalSurat: new Date().toISOString().slice(0, 10),
};

function generatePersetujuanCalonPengantinN4(form: any) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Model N 4", 170, 15);
  doc.setFontSize(12);
  doc.text("PERSETUJUAN CALON PENGANTIN", 60, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Yang bertanda tangan di bawah ini", 10, 35);
  // Calon Suami
  doc.setFont("helvetica", "bold");
  doc.text("A. Calon Suami", 10, 43);
  doc.setFont("helvetica", "normal");
  let y = 49;
  doc.text("1. Nama", 14, y);
  doc.text(`: ${form.namaSuami}`, 70, y);
  doc.text("2. Bin", 14, y + 6);
  doc.text(`: ${form.binSuami}`, 70, y + 6);
  doc.text("3. Nomor Induk Kependudukan", 14, y + 12);
  doc.text(`: ${form.nikSuami}`, 70, y + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, y + 18);
  doc.text(`: ${form.ttlSuami}`, 70, y + 18);
  doc.text("5. Kewarganegaraan", 14, y + 24);
  doc.text(`: ${form.kewarganegaraanSuami}`, 70, y + 24);
  doc.text("6. Agama", 14, y + 30);
  doc.text(`: ${form.agamaSuami}`, 70, y + 30);
  doc.text("7. Pekerjaan", 14, y + 36);
  doc.text(`: ${form.pekerjaanSuami}`, 70, y + 36);
  doc.text("8. Alamat", 14, y + 42);
  doc.text(`: ${form.alamatSuami}`, 70, y + 42);
  // Calon Istri
  doc.setFont("helvetica", "bold");
  doc.text("B. Calon Istri", 10, y + 50);
  doc.setFont("helvetica", "normal");
  doc.text("Alamat", 15, y + 56);
  doc.text(`: ${form.alamatIstri}`, 70, y + 56);
  let yI = y + 62;
  doc.text("1. Nama", 14, yI);
  doc.text(`: ${form.namaIstri}`, 70, yI);
  doc.text("2. Binti", 14, yI + 6);
  doc.text(`: ${form.bintiIstri}`, 70, yI + 6);
  doc.text("3. Nomor Induk Kependudukan", 14, yI + 12);
  doc.text(`: ${form.nikIstri}`, 70, yI + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, yI + 18);
  doc.text(`: ${form.ttlIstri}`, 70, yI + 18);
  doc.text("5. Kewarganegaraan", 14, yI + 24);
  doc.text(`: ${form.kewarganegaraanIstri}`, 70, yI + 24);
  doc.text("6. Agama", 14, yI + 30);
  doc.text(`: ${form.agamaIstri}`, 70, yI + 30);
  doc.text("7. Pekerjaan", 14, yI + 36);
  doc.text(`: ${form.pekerjaanIstri}`, 70, yI + 36);
  doc.text("8. Alamat", 14, yI + 42);
  doc.text(`: ${form.alamatIstri}`, 70, yI + 42);
  // Baris tambahan alamat jika perlu
  // Pernyataan
  let yStatement = yI + 58;
  let yStatement2 = yI + 63;
  doc.setFontSize(10);
  let statement1 =
    "Menyatakan dengan sesungguhnya bahwa atas dasar suka rela , dengan kesadaran sendiri,";
  let statement2 =
    "tanpa ada paksaan siapapun juga, setuju untuk melangsungkan pernikahan.";

  doc.text(statement1, 10, yStatement);
  doc.text(statement2, 10, yStatement2);
  // Penutup
  doc.text(
    "Demikian surat persetujuan ini di buat untuk digunakan seperlunya.",
    10,
    yStatement2 + 10
  );
  doc.text(
    `Kedungwiringin, ${
      form.tanggalSurat &&
      new Date(form.tanggalSurat).toLocaleDateString("id-ID")
    }`,
    120,
    yStatement2 + 20
  );
  doc.text("Calon Suami", 30, yStatement2 + 30);
  doc.text("Calon Isteri", 120, yStatement2 + 30);
  doc.text(form.namaSuami || "", 32, yStatement2 + 60);
  doc.text(form.namaIstri || "", 120, yStatement2 + 60);
  doc.save("persetujuan_calon_pengantin_n4.pdf");
}

const CreatePersetujuanCalonPengantinLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPdf = () => {
    generatePersetujuanCalonPengantinN4(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Persetujuan Calon Pengantin (N4)</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        <Input
          label="Nama Calon Suami"
          name="namaSuami"
          value={form.namaSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Bin Calon Suami"
          name="binSuami"
          value={form.binSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="NIK Calon Suami"
          name="nikSuami"
          value={form.nikSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Tempat/Tanggal Lahir Suami"
          name="ttlSuami"
          value={form.ttlSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Kewarganegaraan Suami"
          name="kewarganegaraanSuami"
          value={form.kewarganegaraanSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Agama Suami"
          name="agamaSuami"
          value={form.agamaSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Pekerjaan Suami"
          name="pekerjaanSuami"
          value={form.pekerjaanSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Alamat Suami"
          name="alamatSuami"
          value={form.alamatSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Nama Calon Istri"
          name="namaIstri"
          value={form.namaIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Binti Calon Istri"
          name="bintiIstri"
          value={form.bintiIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="NIK Calon Istri"
          name="nikIstri"
          value={form.nikIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Tempat/Tanggal Lahir Istri"
          name="ttlIstri"
          value={form.ttlIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Kewarganegaraan Istri"
          name="kewarganegaraanIstri"
          value={form.kewarganegaraanIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Agama Istri"
          name="agamaIstri"
          value={form.agamaIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Pekerjaan Istri"
          name="pekerjaanIstri"
          value={form.pekerjaanIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Alamat Istri"
          name="alamatIstri"
          value={form.alamatIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Tanggal Surat"
          name="tanggalSurat"
          type="date"
          value={form.tanggalSurat}
          onChange={handleChange}
          required
        />
        <div className="md:col-span-2 flex space-x-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button type="button" variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
        </div>
      </form>
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="p-4 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePersetujuanCalonPengantinLetter;
