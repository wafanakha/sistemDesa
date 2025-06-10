import React from "react";
import { useEffect, useState } from "react";
import { getAllResidents } from "./services/residentService";
import { Resident } from "./types/index";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ResidentsList from "./pages/residents/ResidentsList";
import AddResident from "./pages/residents/AddResident";
import EditResident from "./pages/residents/EditResident";
import ViewResident from "./pages/residents/ViewResident";
import CustomFields from "./pages/residents/CustomFields";
import LettersList from "./pages/letters/LettersList";
import CreateLetter from "./pages/letters/CreateLetter";
import ViewLetter from "./pages/letters/ViewLetter";
import EditLetter from "./pages/letters/EditLetter";
import LetterTemplates from "./pages/letters/LetterTemplates";
import Settings from "./pages/Settings";
import HelpPage from "./pages/HelpPage";
import MonografiAgama from "./pages/monografi/monografiAgama";
import MonografiGender from "./pages/monografi/monografiGender";
import MonografiGolonganDarah from "./pages/monografi/monografiGolDarah";
import MonografiKepalaKeluarga from "./pages/monografi/monografiKK";
import MonografiPekerjaan from "./pages/monografi/monografiPekerjaan";
import MonografiPendidikan from "./pages/monografi/monografiPendidikan";
import MonografiStatusPernikahan from "./pages/monografi/monografiPerkawinan";
import MonografiUmur from "./pages/monografi/monografiUmur";
import { seedResidents } from "./utils/fakeResidents";
import CreateKeramaianLetter from "./pages/letters/CreateKeramaianLetter";
import CreateUsahaLetter from "./pages/letters/CreateUsahaLetter";
import CreateDomisiliLetter from "./pages/letters/CreateDomisiliLetter";
import CreateTidakMampuLetter from "./pages/letters/CreateTidakMampuLetter";
import CreatePengantarLetter from "./pages/letters/CreatePengantarLetter";
import CreateKeteranganLetter from "./pages/letters/CreateKeteranganLetter";
import CreateDomisiliUsahaLetter from "./pages/letters/CreateDomisiliUsahaLetter";
import CreateSkckLetter from "./pages/letters/CreateSkckLetter";
import CreateAhliWarisLetter from "./pages/letters/CreateAhliWarisLetter";
import CreateWaliNikahLetter from "./pages/letters/CreateWaliNikahLetter";
import CreatePengantarNumpangNikahLetter from "./pages/letters/CreatePengantarNumpangNikahLetter";
import CreateBelumMenikahLetter from "./pages/letters/CreateBelumMenikahLetter";
import CreateKematianLetter from "./pages/letters/CreateKematianLetter";
import CreatePengantarNikahLetter from "./pages/letters/CreatePengantarNikahLetter";
import CreatePermohonanKehendakNikahLetter from "./pages/letters/CreatePermohonanKehendakNikahLetter";
import CreatePersetujuanCalonPengantinLetter from "./pages/letters/CreatePersetujuanCalonPengantinLetter";
import CreateIzinOrangTuaLetter from "./pages/letters/CreateIzinOrangTuaLetter";

function App() {
  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {
    getAllResidents().then(setResidents);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          {/* Residents */}
          <Route path="residents/" element={<ResidentsList />} />
          <Route path="residents/list" element={<ResidentsList />} />
          <Route path="residents/add" element={<AddResident />} />
          <Route path="residents/edit/:id" element={<EditResident />} />
          <Route path="residents/view/:id" element={<ViewResident />} />
          <Route path="residents/custom-fields" element={<CustomFields />} />
          {/* Monografi */}
          <Route
            path="/monografi/agama"
            element={<MonografiAgama residents={residents} />}
          />
          <Route
            path="/monografi/gender"
            element={<MonografiGender residents={residents} />}
          />
          <Route
            path="/monografi/goldarah"
            element={<MonografiGolonganDarah residents={residents} />}
          />
          <Route
            path="/monografi/kk"
            element={<MonografiKepalaKeluarga residents={residents} />}
          />
          <Route
            path="/monografi/pekerjaan"
            element={<MonografiPekerjaan residents={residents} />}
          />
          <Route
            path="/monografi/pendidikan"
            element={<MonografiPendidikan residents={residents} />}
          />
          <Route
            path="/monografi/perkawinan"
            element={<MonografiStatusPernikahan residents={residents} />}
          />{" "}
          <Route
            path="/monografi/umur"
            element={<MonografiUmur residents={residents} />}
          />
          {/* Letters */}
          <Route path="letters/list" element={<LettersList />} />
          <Route path="letters/create" element={<CreateLetter />} />
          <Route
            path="letters/create/keramaian"
            element={<CreateKeramaianLetter />}
          />
          <Route path="letters/create/usaha" element={<CreateUsahaLetter />} />
          <Route
            path="letters/create/domisili"
            element={<CreateDomisiliLetter />}
          />
          <Route
            path="letters/create/tidak-mampu"
            element={<CreateTidakMampuLetter />}
          />
          <Route
            path="letters/create/pengantar"
            element={<CreatePengantarLetter />}
          />
          <Route
            path="letters/create/keterangan"
            element={<CreateKeteranganLetter />}
          />
          <Route
            path="letters/create/domisili-usaha"
            element={<CreateDomisiliUsahaLetter />}
          />
          <Route path="letters/create/skck" element={<CreateSkckLetter />} />
          <Route
            path="letters/create/ahli-waris"
            element={<CreateAhliWarisLetter />}
          />
          <Route
            path="letters/create/wali-nikah"
            element={<CreateWaliNikahLetter />}
          />
          <Route
            path="letters/create/pengantar-numpang-nikah"
            element={<CreatePengantarNumpangNikahLetter />}
          />
          <Route
            path="letters/create/pengantar-nikah"
            element={<CreatePengantarNikahLetter />}
          />
          <Route
            path="letters/create/belum-menikah"
            element={<CreateBelumMenikahLetter />}
          />
          <Route
            path="letters/create/kematian"
            element={<CreateKematianLetter />}
          />
          <Route
            path="letters/create/permohonan-kehendak-nikah"
            element={<CreatePermohonanKehendakNikahLetter />}
          />
          <Route
            path="letters/create/persetujuan-calon-pengantin"
            element={<CreatePersetujuanCalonPengantinLetter />}
          />
          <Route
            path="letters/create/izin-orang-tua"
            element={<CreateIzinOrangTuaLetter />}
          />
          <Route path="letters/view/:id" element={<ViewLetter />} />
          {/* <Route path="letters/edit/:id" element={<EditLetter />} /> */}
          {/* Settings & Help */}
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
