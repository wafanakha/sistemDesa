import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FileText } from "lucide-react";

const letterTypes = [
  {
    type: "keramaian",
    label: "Surat Keterangan Keramaian",
    description: "Surat izin keramaian untuk acara atau kegiatan masyarakat.",
    path: "/letters/create/keramaian",
  },
  {
    type: "usaha",
    label: "Surat Keterangan Usaha",
    description: "Surat keterangan untuk keperluan usaha atau UMKM.",
    path: "/letters/create/usaha",
  },
  {
    type: "domisili",
    label: "Surat Keterangan Domisili",
    description: "Surat keterangan domisili tempat tinggal.",
    path: "/letters/create/domisili",
  },
  {
    type: "tidak-mampu",
    label: "Surat Keterangan Tidak Mampu",
    description: "Surat keterangan untuk keperluan bantuan atau beasiswa.",
    path: "/letters/create/tidak-mampu",
  },
  {
    type: "pengantar",
    label: "Surat Pengantar",
    description: "Surat pengantar untuk berbagai keperluan administrasi.",
    path: "/letters/create/pengantar",
  },
  {
    type: "keterangan",
    label: "Surat Keterangan",
    description:
      "Surat keterangan umum untuk berbagai keperluan warga (bukan domisili, usaha, dsb).",
    path: "/letters/create/keterangan",
  },
  {
    type: "domisili-usaha",
    label: "Surat Keterangan Domisili Usaha",
    description: "Surat keterangan domisili untuk keperluan usaha/perusahaan.",
    path: "/letters/create/domisili-usaha",
  },
  {
    type: "skck",
    label: "Surat Pengantar Catatan Kepolisian (SKCK)",
    description: "Surat pengantar untuk keperluan SKCK di kepolisian.",
    path: "/letters/create/skck",
  },
  {
    type: "ahli-waris",
    label: "Surat Keterangan Ahli Waris",
    description:
      "Surat keterangan untuk penetapan ahli waris dari anggota keluarga.",
    path: "/letters/create/ahli-waris",
  },
  {
    type: "wali-nikah",
    label: "Surat Keterangan Wali Nikah",
    description: "Surat keterangan wali nikah tanpa kop, sesuai format desa.",
    path: "/letters/create/wali-nikah",
  },
  {
    type: "pengantar-numpang-nikah",
    label: "Pengantar Numpang Nikah",
    description: "Surat pengantar numpang nikah sesuai format desa.",
    path: "/letters/create/pengantar-numpang-nikah",
  },
  {
    type: "belum-menikah",
    label: "Surat Pernyataan Belum Menikah",
    description:
      "Surat pernyataan belum menikah untuk keperluan administrasi atau persyaratan nikah.",
    path: "/letters/create/belum-menikah",
  },
  {
    type: "kematian",
    label: "Surat Keterangan Kematian (Model N6)",
    description:
      "Surat keterangan kematian sesuai format N6, untuk keperluan administrasi kematian.",
    path: "/letters/create/kematian",
  },
  {
    type: "pengantar-nikah",
    label: "Surat Pengantar Nikah (N1)",
    description:
      "Formulir pengantar nikah Model N1, lengkap dengan pencarian KK dan pemilihan ibu.",
    path: "/letters/create/pengantar-nikah",
  },
  {
    type: "permohonan-kehendak-nikah",
    label: "Permohonan Kehendak Nikah (N2)",
    description:
      "Surat permohonan kehendak nikah (N2), diisi manual oleh pemohon.",
    path: "/letters/create/permohonan-kehendak-nikah",
  },
  {
    type: "persetujuan-calon-pengantin",
    label: "Persetujuan Calon Pengantin (N4)",
    description:
      "Surat persetujuan calon pengantin (N4), diisi manual oleh pemohon.",
    path: "/letters/create/persetujuan-calon-pengantin",
  },
  {
    type: "izin-orang-tua",
    label: "Surat Izin Orang Tua (N5)",
    description: "Surat izin orang tua (N5), diisi manual oleh pemohon.",
    path: "/letters/create/izin-orang-tua",
  },
  // Tambahkan jenis surat lain sesuai kebutuhan
];

const CreateLetter: React.FC = () => {
  const navigate = useNavigate();

  // Daftar surat biasa
  const suratBiasa = letterTypes.filter(
    (s) =>
      s.type !== "wali-nikah" &&
      s.type !== "pengantar-numpang-nikah" &&
      s.type !== "belum-menikah" &&
      s.type !== "pengantar-nikah" &&
      s.type !== "permohonan-kehendak-nikah" &&
      s.type !== "persetujuan-calon-pengantin" &&
      s.type !== "izin-orang-tua"
  );
  // Daftar surat nikah
  const suratNikah = letterTypes.filter(
    (s) =>
      s.type === "wali-nikah" ||
      s.type === "pengantar-numpang-nikah" ||
      s.type === "belum-menikah" ||
      s.type === "pengantar-nikah" ||
      s.type === "permohonan-kehendak-nikah" ||
      s.type === "persetujuan-calon-pengantin" ||
      s.type === "izin-orang-tua"
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-left text-teal-800">
        Buat Surat
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-start items-stretch">
        {suratBiasa.map((item) => (
          <div
            key={item.type}
            className="bg-white border rounded shadow p-4 flex flex-col cursor-pointer hover:bg-teal-50"
            onClick={() => navigate(item.path)}
          >
            <h2 className="font-semibold text-lg text-teal-800 mb-1">
              {item.label}
            </h2>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
          </div>
        ))}
      </div>
      {/* Section khusus surat nikah */}
      {suratNikah.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4 text-left text-teal-700">
            Surat Perihal Nikah
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-start items-stretch">
            {suratNikah.map((item) => (
              <div
                key={item.type}
                className="bg-white border rounded shadow p-4 flex flex-col cursor-pointer hover:bg-teal-50"
                onClick={() => navigate(item.path)}
              >
                <h2 className="font-semibold text-lg text-teal-800 mb-1">
                  {item.label}
                </h2>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CreateLetter;
