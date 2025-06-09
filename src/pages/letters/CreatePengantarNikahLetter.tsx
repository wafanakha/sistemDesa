import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { toast } from "react-toastify";
import { Resident, VillageInfo } from "../../types";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
const initialForm = {
  kk: "",
  residentId: "",
  ibuId: "",
  issuedDate: new Date().toISOString().slice(0, 10),
};

function generateFormulirPengantarNikahN1(
  form: any,
  resident: Resident,
  ayah: Resident | undefined,
  ibu: Resident | undefined,
  village: VillageInfo
) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("FORMULIR PENGANTAR NIKAH", 65, 12);
  doc.setFontSize(9);
  doc.text(`KANTOR DESA/KEL    : ${village.name}`, 10, 20);
  doc.text(
    `KECAMATAN          : ${village.districtName || "Patikraja"}`,
    10,
    26
  );
  doc.text(`KABUPATEN          : ${village.regencyName || "Banyumas"}`, 10, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Model N 1", 170, 16);
  doc.setFont("helvetica", "bold");
  doc.text("PENGANTAR NIKAH", 80, 43);
  doc.setFont("helvetica", "normal");
  doc.text(`Nomor : ............`, 80, 49);
  doc.setFontSize(10);
  doc.text(
    "Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa :",
    10,
    58
  );
  let y = 66;
  doc.text("1. Nama", 14, y);
  doc.text(`: ${resident.name}`, 90, y);
  doc.text("2. Nomor Induk Kependudukan (NIK)", 14, y + 6);
  doc.text(`: ${resident.nik}`, 90, y + 6);
  doc.text("3. Jenis Kelamin", 14, y + 12);
  doc.text(`: ${resident.gender}`, 90, y + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, y + 18);
  doc.text(`: ${resident.birthPlace}, ${resident.birthDate}`, 90, y + 18);
  doc.text("5. Kewarganegaraan", 14, y + 24);
  doc.text(``, 90, y + 24);
  doc.text("6. Agama", 14, y + 30);
  doc.text(`: ${resident.religion}`, 90, y + 30);
  doc.text("7. Pekerjaan", 14, y + 36);
  doc.text(`: ${resident.occupation}`, 90, y + 36);
  doc.text("8. Alamat", 14, y + 42);
  doc.text(`: ${resident.address}`, 90, y + 42);
  doc.text("9. Status Perkawinan", 14, y + 50);
  doc.text(
    `   a. Laki-laki : Jejaka / Duda / beristri ke     : ${
      resident.gender === "Laki-laki"
        ? resident.maritalStatus === "Belum Kawin"
          ? "Jejaka"
          : "Duda"
        : "-"
    }`,
    16,
    y + 56
  );
  doc.text(
    `   b. Perempuan : Perawan / Janda                : ${
      resident.gender === "Perempuan"
        ? resident.maritalStatus === "Belum Kawin"
          ? "Perawan"
          : "Janda"
        : "-"
    }`,
    16,
    y + 62
  );
  doc.text("   Adalah benar anak dari pernikahan seorang pria", 16, y + 68);
  // Data ayah
  doc.text("   Nama lengkap dan alias", 18, y + 74);
  doc.text(`: ${ayah?.name || "-"}`, 90, y + 74);
  doc.text("   Nomor Induk Kependudukan (NIK)", 18, y + 80);
  doc.text(`: ${ayah?.nik || "-"}`, 90, y + 80);
  doc.text("   Tempat dan tanggal lahir", 18, y + 86);
  doc.text(
    `: ${ayah ? ayah.birthPlace + ", " + ayah.birthDate : "-"}`,
    90,
    y + 86
  );
  doc.text("   Kewarganegaraan", 18, y + 92);
  doc.text("", 90, y + 92);
  doc.text("   Agama", 18, y + 98);
  doc.text(`: ${ayah?.religion || "-"}`, 90, y + 98);
  doc.text("   Pekerjaan", 18, y + 104);
  doc.text(`: ${ayah?.occupation || "-"}`, 90, y + 104);
  doc.text("   Alamat", 18, y + 110);
  doc.text(`: ${ayah?.address || "-"}`, 90, y + 110);
  // Data ibu
  doc.setFont("helvetica", "bold");
  doc.text("   Dengan seorang wanita", 16, y + 120);
  doc.setFont("helvetica", "normal");
  doc.text("   Nama lengkap dan alias", 18, y + 126);
  doc.text(`: ${ibu?.name || "-"}`, 90, y + 126);
  doc.text("   Nomor Induk Kependudukan (NIK)", 18, y + 132);
  doc.text(`: ${ibu?.nik || "-"}`, 90, y + 132);
  doc.text("   Tempat dan tanggal lahir", 18, y + 138);
  doc.text(
    `: ${ibu ? ibu.birthPlace + ", " + ibu.birthDate : "-"}`,
    90,
    y + 138
  );
  doc.text("   Kewarganegaraan", 18, y + 144);
  doc.text(``, 90, y + 144);
  doc.text("   Agama", 18, y + 150);
  doc.text(`: ${ibu?.religion || "-"}`, 90, y + 150);
  doc.text("   Pekerjaan", 18, y + 156);
  doc.text(`: ${ibu?.occupation || "-"}`, 90, y + 156);
  doc.text("   Alamat", 18, y + 162);
  doc.text(`: ${ibu?.address || "-"}`, 90, y + 162);
  // Penutup
  doc.text(
    "Demikianlah, surat pengantar ini dibuat dengan mengingat sumpah Jabatan dan untuk dipergunakan sebagaimana mestinya",
    10,
    y + 175
  );
  doc.text(
    `Kedungwiringin, ${
      form.issuedDate && new Date(form.issuedDate).toLocaleDateString("id-ID")
    }`,
    130,
    y + 185
  );
  doc.text("Kepala Desa Kedungwiringin", 130, y + 190);
  doc.text(village.leaderName || "", 140, y + 210);
  return doc;
}

const CreatePengantarNikahLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [kkResults, setKkResults] = useState<any[]>([]);
  const [kkSearch, setKkSearch] = useState("");
  const [selectedKk, setSelectedKk] = useState<any>(null);
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    villageService.getVillageInfo().then(setVillage);
  }, []);

  const handleKkSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setKkSearch(e.target.value);
    if (e.target.value.length < 3) {
      setKkResults([]);
      return;
    }
    const results = await residentService.searchKk(e.target.value);
    setKkResults(results);
  };

  const handleSelectKk = (kkObj: any) => {
    setSelectedKk(kkObj);
    setForm({ ...form, kk: kkObj.kk });
  };

  const handleSelectResident = (resident: Resident) => {
    setForm({ ...form, residentId: resident.id });
  };

  const handleSelectIbu = (ibuId: string) => {
    setForm({ ...form, ibuId });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPdf = async () => {
    if (!selectedKk) return toast.error("Pilih KK terlebih dahulu");
    const resident = selectedKk.members.find(
      (m: Resident) => String(m.id) === String(form.residentId)
    );
    if (!resident) return toast.error("Pilih warga yang akan dibuatkan surat");
    const ayah = selectedKk.members.find(
      (m: Resident) => m.shdk === "Kepala Keluarga"
    );
    const ibu = selectedKk.members.find(
      (m: Resident) => String(m.id) === String(form.ibuId)
    );
    if (!village) return toast.error("Data desa belum lengkap");
    const doc = generateFormulirPengantarNikahN1(
      form,
      resident,
      ayah,
      ibu,
      village
    );
    doc.save("surat-pengantar-nikah");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar-nikah", // Since this is the usaha letter component
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

  const handlePrintPdf = async () => {
    if (!selectedKk) return toast.error("Pilih KK terlebih dahulu");
    const resident = selectedKk.members.find(
      (m: Resident) => String(m.id) === String(form.residentId)
    );
    if (!resident) return toast.error("Pilih warga yang akan dibuatkan surat");
    const ayah = selectedKk.members.find(
      (m: Resident) => m.shdk === "Kepala Keluarga"
    );
    const ibu = selectedKk.members.find(
      (m: Resident) => String(m.id) === String(form.ibuId)
    );
    if (!village) return toast.error("Data desa belum lengkap");
    const doc = generateFormulirPengantarNikahN1(
      form,
      resident,
      ayah,
      ibu,
      village
    );
    window.open(doc.output("bloburl"), "_blank");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar-nikah", // Since this is the usaha letter component
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

  // Ambil daftar ibu (istri) dari anggota KK
  const ibuOptions = selectedKk
    ? selectedKk.members.filter((m: Resident) => m.shdk === "Istri")
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Formulir Pengantar Nikah (N1)</h2>
      <div className="mb-4">
        <Input
          label="Cari KK (No KK/Nama Kepala Keluarga)"
          type="text"
          value={kkSearch}
          onChange={handleKkSearch}
          placeholder="Ketik nomor KK atau nama kepala keluarga..."
        />
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
          <label className="block font-semibold mb-1">
            Pilih Anggota Keluarga
          </label>
          <Select
            value={form.residentId}
            options={selectedKk.members.map((m: Resident) => ({
              value: m.id,
              label: `${m.nik} - ${m.name}`,
            }))}
            onChange={(value: string) =>
              handleSelectResident(
                selectedKk.members.find((m: Resident) => String(m.id) === value)
              )
            }
          />
        </div>
      )}
      {selectedKk && ibuOptions.length > 0 && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Pilih Ibu (jika lebih dari 1 istri)
          </label>
          <Select
            value={form.ibuId}
            options={[
              { value: "", label: "-- Pilih Ibu --" },
              ...ibuOptions.map((ibu: Resident) => ({
                value: ibu.id,
                label: `${ibu.nik} - ${ibu.name}`,
              })),
            ]}
            onChange={(value: string) => handleSelectIbu(value)}
          />
        </div>
      )}
      <div className="flex space-x-2 mt-2">
        <Button type="button" variant="secondary" onClick={handleExportPdf}>
          Export PDF
        </Button>
        <Button type="button" variant="secondary" onClick={handlePrintPdf}>
          Print PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
      </div>
      {/* Preview Surat Pengantar Nikah (N1) */}
      {selectedKk &&
        form.residentId &&
        village &&
        (() => {
          const resident = selectedKk.members.find(
            (m: Resident) => String(m.id) === String(form.residentId)
          );
          const ayah = selectedKk.members.find(
            (m: Resident) => m.shdk === "Kepala Keluarga"
          );
          const ibu = selectedKk.members.find(
            (m: Resident) => String(m.id) === String(form.ibuId)
          );
          return (
            <div className="bg-white p-6 border shadow max-w-[800px] mx-auto mb-8 mt-6">
              <div className="text-center font-bold text-lg mb-2">
                FORMULIR PENGANTAR NIKAH
              </div>
              <div className="text-center text-sm mb-2">Model N1</div>
              <div className="mb-2">KANTOR DESA/KEL: {village.name}</div>
              <div className="mb-2">KECAMATAN: {village.districtName}</div>
              <div className="mb-2">KABUPATEN: {village.regencyName}</div>
              <div className="mb-4">
                Yang bertanda tangan di bawah ini menerangkan dengan
                sesungguhnya bahwa:
              </div>
              <table className="mb-2">
                <tbody>
                  <tr>
                    <td>1. Nama</td>
                    <td>:</td>
                    <td>{resident.name}</td>
                  </tr>
                  <tr>
                    <td>2. NIK</td>
                    <td>:</td>
                    <td>{resident.nik}</td>
                  </tr>
                  <tr>
                    <td>3. Jenis Kelamin</td>
                    <td>:</td>
                    <td>{resident.gender}</td>
                  </tr>
                  <tr>
                    <td>4. Tempat & Tanggal Lahir</td>
                    <td>:</td>
                    <td>
                      {resident.birthPlace}, {resident.birthDate}
                    </td>
                  </tr>
                  <tr>
                    <td>5. Kewarganegaraan</td>
                    <td>:</td>
                    <td>{resident.nationality || "-"}</td>
                  </tr>
                  <tr>
                    <td>6. Agama</td>
                    <td>:</td>
                    <td>{resident.religion}</td>
                  </tr>
                  <tr>
                    <td>7. Pekerjaan</td>
                    <td>:</td>
                    <td>{resident.occupation}</td>
                  </tr>
                  <tr>
                    <td>8. Alamat</td>
                    <td>:</td>
                    <td>{resident.address}</td>
                  </tr>
                  <tr>
                    <td>9. Status Perkawinan</td>
                    <td>:</td>
                    <td>{resident.maritalStatus}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mb-2">
                a. Laki-laki: Jejaka / Duda / beristri ke:{" "}
                {resident.gender === "Laki-laki"
                  ? resident.maritalStatus === "Belum Kawin"
                    ? "Jejaka"
                    : "Duda"
                  : "-"}
              </div>
              <div className="mb-2">
                b. Perempuan: Perawan / Janda:{" "}
                {resident.gender === "Perempuan"
                  ? resident.maritalStatus === "Belum Kawin"
                    ? "Perawan"
                    : "Janda"
                  : "-"}
              </div>
              <div className="mb-2">
                Adalah benar anak dari pernikahan seorang pria:
              </div>
              <table className="mb-2">
                <tbody>
                  <tr>
                    <td>Nama lengkap dan alias</td>
                    <td>:</td>
                    <td>{ayah?.name || "-"}</td>
                  </tr>
                  <tr>
                    <td>NIK</td>
                    <td>:</td>
                    <td>{ayah?.nik || "-"}</td>
                  </tr>
                  <tr>
                    <td>Tempat & Tanggal Lahir</td>
                    <td>:</td>
                    <td>
                      {ayah ? ayah.birthPlace + ", " + ayah.birthDate : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>Kewarganegaraan</td>
                    <td>:</td>
                    <td>{ayah?.nationality || "-"}</td>
                  </tr>
                  <tr>
                    <td>Agama</td>
                    <td>:</td>
                    <td>{ayah?.religion || "-"}</td>
                  </tr>
                  <tr>
                    <td>Pekerjaan</td>
                    <td>:</td>
                    <td>{ayah?.occupation || "-"}</td>
                  </tr>
                  <tr>
                    <td>Alamat</td>
                    <td>:</td>
                    <td>{ayah?.address || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mb-2">Dengan seorang wanita:</div>
              <table className="mb-2">
                <tbody>
                  <tr>
                    <td>Nama lengkap dan alias</td>
                    <td>:</td>
                    <td>{ibu?.name || "-"}</td>
                  </tr>
                  <tr>
                    <td>NIK</td>
                    <td>:</td>
                    <td>{ibu?.nik || "-"}</td>
                  </tr>
                  <tr>
                    <td>Tempat & Tanggal Lahir</td>
                    <td>:</td>
                    <td>{ibu ? ibu.birthPlace + ", " + ibu.birthDate : "-"}</td>
                  </tr>
                  <tr>
                    <td>Kewarganegaraan</td>
                    <td>:</td>
                    <td>{ibu?.nationality || "-"}</td>
                  </tr>
                  <tr>
                    <td>Agama</td>
                    <td>:</td>
                    <td>{ibu?.religion || "-"}</td>
                  </tr>
                  <tr>
                    <td>Pekerjaan</td>
                    <td>:</td>
                    <td>{ibu?.occupation || "-"}</td>
                  </tr>
                  <tr>
                    <td>Alamat</td>
                    <td>:</td>
                    <td>{ibu?.address || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mb-4">
                Demikianlah, surat pengantar ini dibuat dengan mengingat sumpah
                jabatan dan untuk dipergunakan sebagaimana mestinya.
              </div>
              <div className="flex justify-end mt-8">
                <div className="text-center">
                  <div>
                    Kedungwiringin,{" "}
                    {form.issuedDate &&
                      new Date(form.issuedDate).toLocaleDateString("id-ID")}
                  </div>
                  <div className="font-bold">Kepala Desa {village.name}</div>
                  <div style={{ height: "60px" }}></div>
                  <div className="font-bold underline">
                    {village.leaderName || "(................................)"}
                  </div>
                </div>
              </div>
              <div className="text-xs mt-8">
                Lampiran X Keputusan Direktur Jendral Bimbingan Masyarakat Islam
                Nomor 473 Tahun 2020
              </div>
            </div>
          );
        })()}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="p-4 bg-white">
          {selectedKk && form.residentId && village ? (
            <pre className="whitespace-pre-wrap font-sans text-base">
              {JSON.stringify(
                {
                  ...form,
                  anggota: selectedKk.members.find(
                    (m: Resident) => String(m.id) === String(form.residentId)
                  ),
                  ayah: selectedKk.members.find(
                    (m: Resident) => m.shdk === "Kepala Keluarga"
                  ),
                  ibu: selectedKk.members.find(
                    (m: Resident) => String(m.id) === String(form.ibuId)
                  ),
                  desa: village,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p>Lengkapi data KK, anggota, dan desa untuk preview.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreatePengantarNikahLetter;
