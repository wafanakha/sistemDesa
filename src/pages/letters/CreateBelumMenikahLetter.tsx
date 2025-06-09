import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { letterService } from "../../database/letterService";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { exportService } from "../../services/exportService";
import { Letter, Resident, VillageInfo } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";

const initialForm = {
  residentId: "",
  issuedDate: new Date().toISOString().slice(0, 10),
};

const exportBelumMenikahPDF = (
  resident: Resident,
  village: VillageInfo,
  issuedDate: string
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SURAT PERNYATAAN BELUM MENIKAH", pageWidth / 2, y, {
    align: "center",
  });
  y += 2;
  const titleWidth = doc.getTextWidth("SURAT PERNYATAAN BELUM MENIKAH");
  doc.setLineWidth(0.7);
  doc.line(
    pageWidth / 2 - titleWidth / 2,
    y + 1,
    pageWidth / 2 + titleWidth / 2,
    y + 1
  );
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Yang bertanda tangan di bawah ini :", 20, y);
  y += 8;

  // Data Warga
  const data = [
    ["Nama Lengkap", resident.name],
    [
      "Tempat/Tanggal Lahir",
      `${resident.birthPlace}, ${
        resident.birthDate &&
        new Date(resident.birthDate).toLocaleDateString("id-ID")
      }`,
    ],
    ["Pekerjaan", resident.occupation],
    ["NIK", resident.nik],
    ["Agama", resident.religion],
    ["Alamat", resident.address],
  ];
  data.forEach(([label, value]) => {
    doc.text(`${label}`, 25, y);
    doc.text(":", 70, y);
    doc.text(value || "-", 75, y);
    y += 7;
  });
  y += 2;

  // Isi Surat
  const isi1 =
    "Dengan ini menyatakan yang sesungguhnya dan sebenarnya, bahwa saya sampai saat ini belum pernah menikah dengan seorang Perempuan, baik secara resmi maupun di bawah tangan (masih Lajang). Surat pernyataan ini saya buat untuk melengkapi persyaratan menikah.";
  const isi2 =
    "Demikian surat pernyataan ini saya buat, dan ditanda tangani dalam keadaan sehat jasmani dan rohani, tanpa ada paksaan dan bujukan dari siapapun, dan apabila surat pernyataan ini tidak benar, maka saya sedia bertanggung jawab di hadapan hukum yang berlaku.";
  doc.text(doc.splitTextToSize(isi1, pageWidth - 40), 20, y);
  y += doc.getTextDimensions(doc.splitTextToSize(isi1, pageWidth - 40)).h + 2;
  doc.text(doc.splitTextToSize(isi2, pageWidth - 40), 20, y);
  y += doc.getTextDimensions(doc.splitTextToSize(isi2, pageWidth - 40)).h + 8;

  // Tanggal & TTD
  doc.text(
    `${village.name}, ${
      issuedDate && new Date(issuedDate).toLocaleDateString("id-ID")
    }`,
    pageWidth - 20,
    y,
    { align: "right" }
  );
  y += 7;
  doc.text("Yang menyatakan", 20, y);
  doc.text("Mengetahui", pageWidth - 60, y);
  y += 7;
  doc.text(`Kepala Desa ${village.name}`, pageWidth - 60, y);
  y += 20;
  doc.text(resident.name, 30, y, { align: "right" });
  doc.text(village.leaderName, pageWidth - 60, y);

  doc.save("Surat-Pernyataan-Belum-Menikah.pdf");
};

const CreateBelumMenikahLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadResidents();
    loadVillage();
    // Pre-fill if editing
    if (location.state?.editData) {
      const edit = location.state.editData;
      setForm({
        ...edit.content,
        residentId: edit.residentId,
        issuedDate: edit.issuedDate?.slice(0, 10) || initialForm.issuedDate,
      });
    }
  }, []);

  const loadResidents = async () => {
    const data = await residentService.getAllResidents();
    setResidents(data);
  };
  const loadVillage = async () => {
    const data = await villageService.getVillageInfo();
    setVillage(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resident = residents.find(
        (r) => String(r.id) === String(form.residentId)
      );
      if (!resident) throw new Error("Warga tidak ditemukan");
      if (!village) throw new Error("Data desa tidak ditemukan");
      // Pastikan semua field penting terisi
      const requiredFields = [
        "name",
        "nik",
        "birthPlace",
        "birthDate",
        "gender",
        "religion",
        "occupation",
        "address",
        "issuedDate",
      ];
      for (const field of requiredFields) {
        if (!form[field]) throw new Error("Field " + field + " wajib diisi");
      }
      const letter: Partial<Letter> = {
        letterType: "belum-menikah",
        title: "Surat Pernyataan Belum Menikah",
        residentId: form.residentId,
        issuedDate: form.issuedDate, // simpan sebagai string saja
        content: "", // Tidak perlu generate string, layout sudah diatur di preview & PDF
        status: "draft",
      };
      if (location.state?.isEditMode && location.state?.editData?.id) {
        await letterService.updateLetter(location.state.editData.id, letter);
        toast.success("Surat berhasil diperbarui");
      } else {
        await letterService.addLetter(letter as Letter);
        toast.success("Surat berhasil dibuat");
      }
      navigate("/letters");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan surat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
    const resident = residents.find(
      (r) => String(r.id) === String(form.residentId)
    );
    if (!resident || !village) {
      toast.error("Lengkapi data warga dan desa terlebih dahulu");
      return;
    }
    try {
      exportBelumMenikahPDF(
        {
          ...resident,
          name: form.name,
          nik: form.nik,
          birthPlace: form.birthPlace,
          birthDate: form.birthDate,
          gender: form.gender,
          religion: form.religion,
          occupation: form.occupation,
          address: form.address,
        },
        village,
        form.issuedDate
      );
      toast.success("Surat berhasil diekspor ke PDF");
      const historyEntry: LetterHistory = {
        name: form.nama,
        letter: "belum-menikah", // Since this is the usaha letter component
        date: new Date().toISOString(),
      };

      saveLetterHistory(historyEntry)
        .then(() => {
          console.log("Letter history saved");
        })
        .catch((error) => {
          console.error("Failed to save letter history:", error);
        });
    } catch (error) {
      toast.error("Gagal mengekspor surat ke PDF");
    }
  };

  // Cari resident dengan id yang sudah diparse ke number
  const resident = residents.find(
    (r) => String(r.id) === String(form.residentId)
  );
  const genderTarget =
    resident?.gender === "Laki-laki" ? "Perempuan" : "Laki-laki";

  // Filter residents by search
  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.nik.includes(search)
  );

  // Pencarian warga mirip CreateKeteranganLetter
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

  const handleSelectResident = (resident: Resident) => {
    setForm({
      ...form,
      residentId: resident.id,
      name: resident.name,
      birthPlace: resident.birthPlace,
      birthDate: resident.birthDate,
      gender: resident.gender,
      religion: resident.religion,
      occupation: resident.occupation,
      address: resident.address,
      nik: resident.nik,
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Surat Pernyataan Belum Menikah</h2>
      <div className="mb-4">
        <Input
          label="Cari Warga (Nama/NIK)"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Ketik nama atau NIK..."
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
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4"
      >
        <Input
          label="Nama Lengkap"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="NIK"
          name="nik"
          value={form.nik || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Tempat Lahir"
          name="birthPlace"
          value={form.birthPlace || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Tanggal Lahir"
          name="birthDate"
          type="date"
          value={form.birthDate || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Jenis Kelamin"
          name="gender"
          value={form.gender || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Agama"
          name="religion"
          value={form.religion || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Pekerjaan"
          name="occupation"
          value={form.occupation || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Alamat"
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          required
        />
        <Input
          label="Tanggal Surat"
          type="date"
          name="issuedDate"
          value={form.issuedDate}
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
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan
          </Button>
        </div>
      </form>
      {/* Preview Surat Pernyataan Belum Menikah */}
      {resident && village && (
        <div className="bg-white p-6 border shadow max-w-[800px] mx-auto mb-8">
          <div className="text-center font-bold text-lg mb-2">
            SURAT PERNYATAAN BELUM MENIKAH
          </div>
          <div className="mb-4">Yang bertanda tangan di bawah ini:</div>
          <table className="mb-2">
            <tbody>
              <tr>
                <td>Nama Lengkap</td>
                <td>:</td>
                <td>{resident.name}</td>
              </tr>
              <tr>
                <td>Tempat/Tanggal Lahir</td>
                <td>:</td>
                <td>
                  {resident.birthPlace},{" "}
                  {resident.birthDate &&
                    new Date(resident.birthDate).toLocaleDateString("id-ID")}
                </td>
              </tr>
              <tr>
                <td>Pekerjaan</td>
                <td>:</td>
                <td>{resident.occupation}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>:</td>
                <td>{resident.nik}</td>
              </tr>
              <tr>
                <td>Agama</td>
                <td>:</td>
                <td>{resident.religion}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>:</td>
                <td>{resident.address}</td>
              </tr>
            </tbody>
          </table>
          <div className="mb-2">
            Dengan ini menyatakan yang sesungguhnya dan sebenarnya, bahwa saya
            sampai saat ini belum pernah menikah dengan seorang Perempuan, baik
            secara resmi maupun di bawah tangan (masih Lajang). Surat pernyataan
            ini saya buat untuk melengkapi persyaratan menikah.
          </div>
          <div className="mb-4">
            Demikian surat pernyataan ini saya buat, dan ditanda tangani dalam
            keadaan sehat jasmani dan rohani, tanpa ada paksaan dan bujukan dari
            siapapun, dan apabila surat pernyataan ini tidak benar, maka saya
            sedia bertanggung jawab di hadapan hukum yang berlaku.
          </div>
          <div className="flex justify-end mt-8">
            <div className="text-center">
              <div>
                {village.name},{" "}
                {form.issuedDate &&
                  new Date(form.issuedDate).toLocaleDateString("id-ID")}
              </div>
              <div>Yang menyatakan</div>
              <div style={{ height: "50px" }}></div>
              <div className="font-bold underline">{resident.name}</div>
            </div>
          </div>
          <div className="mt-8">
            <div>Mengetahui,</div>
            <div>Kepala Desa {village.name}</div>
            <div style={{ minHeight: 50 }}></div>
            <div className="font-bold underline">{village.leaderName}</div>
          </div>
        </div>
      )}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="bg-white p-8 border shadow max-w-[800px] mx-auto">
          {resident && village ? (
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 1,
                }}
              >
                <div
                  className="instansi"
                  style={{ textAlign: "center", flex: 1 }}
                >
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
                SURAT PERNYATAAN BELUM MENIKAH
              </h2>
              <div style={{ marginTop: 30 }}>
                <p>Yang bertanda tangan di bawah ini :</p>
                <table style={{ marginLeft: 20 }}>
                  <tbody>
                    <tr>
                      <td>Nama Lengkap</td>
                      <td>:</td>
                      <td>{resident.name}</td>
                    </tr>
                    <tr>
                      <td>Tempat/Tanggal Lahir</td>
                      <td>:</td>
                      <td>
                        {resident.birthPlace},{" "}
                        {resident.birthDate &&
                          new Date(resident.birthDate).toLocaleDateString(
                            "id-ID"
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td>Pekerjaan</td>
                      <td>:</td>
                      <td>{resident.occupation}</td>
                    </tr>
                    <tr>
                      <td>NIK</td>
                      <td>:</td>
                      <td>{resident.nik}</td>
                    </tr>
                    <tr>
                      <td>Agama</td>
                      <td>:</td>
                      <td>{resident.religion}</td>
                    </tr>
                    <tr>
                      <td>Alamat</td>
                      <td>:</td>
                      <td>{resident.address}</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ marginTop: 16 }}>
                  Dengan ini menyatakan yang sesungguhnya dan sebenarnya, bahwa
                  saya sampai saat ini belum pernah menikah dengan seorang
                  Perempuan, baik secara resmi maupun di bawah tangan (masih
                  Lajang). Surat pernyataan ini saya buat untuk melengkapi
                  persyaratan menikah.
                </p>
                <p style={{ marginTop: 8 }}>
                  Demikian surat pernyataan ini saya buat, dan ditanda tangani
                  dalam keadaan sehat jasmani dan rohani, tanpa ada paksaan dan
                  bujukan dari siapapun, dan apabila surat pernyataan ini tidak
                  benar, maka saya sedia bertanggung jawab di hadapan hukum yang
                  berlaku.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 40,
                }}
              >
                <div
                  className="signature"
                  style={{
                    width: "40%",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 120,
                  }}
                >
                  <div className="compact" style={{ textAlign: "center" }}>
                    <p>
                      {village.name},{" "}
                      {form.issuedDate &&
                        new Date(form.issuedDate).toLocaleDateString("id-ID")}
                    </p>
                    <p>Yang menyatakan</p>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <div
                      className="ttd-space"
                      style={{
                        minHeight: 50,
                        borderBottom: "1px solid transparent",
                      }}
                    ></div>
                    <p>
                      <strong>{resident.name}</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 40 }}>
                <p>Mengetahui,</p>
                <p>Kepala Desa {village.name}</p>
                <div style={{ minHeight: 50 }}></div>
                <p>
                  <strong>{village.leaderName}</strong>
                </p>
              </div>
            </div>
          ) : (
            <p>Lengkapi data warga dan desa untuk preview.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreateBelumMenikahLetter;
