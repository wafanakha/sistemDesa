import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";

const initialForm = {
  calonSuami: "",
  calonIstri: "",
  hariTanggalJam: "",
  tempatAkad: "",
  tanggalSurat: new Date().toISOString().slice(0, 10),
  daftarPersyaratan: [
    "Surat pengantar nikah dari desa/Kelurahan",
    "Persetujuan calon mempelai",
    "Fotokopi KTP",
    "Fotokopi akte kelahiran",
    "Fotokopi Kartu keluarga",
    "Pas poto 2x3=3 lembar berlatar belakang biru",
    "………………………………..",
    "………………………………..",
  ],
  namaPemohon: "",
};

function generatePermohonanKehendakNikahN2(form: any) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Model N 2", 170, 12);
  doc.setFont("helvetica", "normal");
  doc.text("Perihal : ", 10, 20);
  doc.setFont("helvetica", "bold");
  doc.text("Permohonan kehendak nikah", 29, 20);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Kedungwiringin, ${
      form.tanggalSurat &&
      new Date(form.tanggalSurat).toLocaleDateString("id-ID")
    }`,
    125,
    20
  );
  doc.text("Kepada Yth.", 10, 29);
  doc.text("Kepala KUA Kecamatan /PPN LN", 10, 34);
  doc.text("di Tempat", 10, 39);
  doc.text(
    "Dengan hormat, kami mengajukan permohonan kehendak perkawinan untuk atas nama",
    25,
    50
  );
  let y = 58;
  doc.text("Calon suami", 30, y);
  doc.text(`: ${form.calonSuami}`, 65, y);
  doc.text("Calon istri", 30, y + 6);
  doc.text(`: ${form.calonIstri}`, 65, y + 6);
  doc.text("Hari / Tanggal / Jam", 30, y + 12);
  doc.text(`: ${form.hariTanggalJam}`, 65, y + 12);
  doc.text("Tempat Akad Nikah", 30, y + 18);
  doc.text(`: ${form.tempatAkad}`, 65, y + 18);
  doc.text(
    "Bersama ini kami sampaikan surat-surat yang diperlukan untuk diperiksa sebagai berikut",
    25,
    y + 30
  );
  y += 35;
  for (let i = 0; i < form.daftarPersyaratan.length; i++) {
    let item = form.daftarPersyaratan[i];
    doc.text(`${i + 1}. ${item}`, 27, y + i * 6);
  }
  doc.setFont("helvetica", "normal");
  doc.text(
    "     Demikian permohonan ini kami sampaikan, kiranya dapat diperiksa, dihadiri dan dicatat sesuai",
    10,
    y + 60
  );
  doc.text("dengan ketentuan peraturan perundang-undangan.", 10, y + 64);
  doc.text("Diterima tanggal ………………", 10, y + 80);
  doc.text("Yang menerima,", 10, y + 110);
  doc.text("Kepala KUA/PPN LN", 10, y + 115);
  doc.text("Wassalam,", 150, y + 80);
  doc.text("Pemohon", 150, y + 84);
  doc.text(form.namaPemohon || "", 150, y + 110);
  doc.save("permohonan_kehendak_nikah_n2.pdf");
}

const CreatePermohonanKehendakNikahLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePersyaratanChange = (idx: number, value: string) => {
    const daftarPersyaratan = [...form.daftarPersyaratan];
    daftarPersyaratan[idx] = value;
    setForm({ ...form, daftarPersyaratan });
  };

  const handleExportPdf = () => {
    generatePermohonanKehendakNikahN2(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Permohonan Kehendak Nikah (N2)</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        <Input
          label="Calon Suami"
          name="calonSuami"
          value={form.calonSuami}
          onChange={handleChange}
          required
        />
        <Input
          label="Calon Istri"
          name="calonIstri"
          value={form.calonIstri}
          onChange={handleChange}
          required
        />
        <Input
          label="Hari / Tanggal / Jam"
          name="hariTanggalJam"
          value={form.hariTanggalJam}
          onChange={handleChange}
          required
        />
        <Input
          label="Tempat Akad Nikah"
          name="tempatAkad"
          value={form.tempatAkad}
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
        <Input
          label="Nama Pemohon"
          name="namaPemohon"
          value={form.namaPemohon}
          onChange={handleChange}
          required
        />
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Daftar Persyaratan</label>
          {form.daftarPersyaratan.map((item: string, idx: number) => (
            <Input
              key={idx}
              value={item}
              onChange={(e) => handlePersyaratanChange(idx, e.target.value)}
              className="mb-2"
            />
          ))}
        </div>
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

export default CreatePermohonanKehendakNikahLetter;
