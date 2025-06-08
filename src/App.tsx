import React from "react";
import { useEffect, useState } from "react";
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
import { seedResidents } from "./utils/fakeResidents";
import CreatePengantarNikahLetter from "./pages/letters/CreatePengantarNikahLetter";
import CreatePermohonanKehendakNikahLetter from "./pages/letters/CreatePermohonanKehendakNikahLetter";
import CreatePersetujuanCalonPengantinLetter from "./pages/letters/CreatePersetujuanCalonPengantinLetter";
import CreateIzinOrangTuaLetter from "./pages/letters/CreateIzinOrangTuaLetter";


function App() {
  useEffect(() => {
    seedResidents();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Residents */}
          <Route path="residents" element={<ResidentsList />} />
          <Route path="residents/add" element={<AddResident />} />
          <Route path="residents/edit/:id" element={<EditResident />} />
          <Route path="residents/view/:id" element={<ViewResident />} />
          <Route path="residents/custom-fields" element={<CustomFields />} />

          {/* Letters */}
          <Route path="letters" element={<LettersList />} />
          <Route path="letters/create" element={<CreateLetter />} />
          <Route path="letters/create/keramaian" element={<CreateKeramaianLetter />} />
          <Route path="letters/create/usaha" element={<CreateUsahaLetter />} />
          <Route path="letters/create/domisili" element={<CreateDomisiliLetter />} />
          <Route path="letters/create/tidak-mampu" element={<CreateTidakMampuLetter />} />
          <Route path="letters/create/pengantar" element={<CreatePengantarLetter />} />
          <Route path="letters/create/keterangan" element={<CreateKeteranganLetter />} />
          <Route path="letters/create/domisili-usaha" element={<CreateDomisiliUsahaLetter />} />
          <Route path="letters/create/skck" element={<CreateSkckLetter />} />
          <Route path="letters/create/ahli-waris" element={<CreateAhliWarisLetter />} />
          <Route path="letters/create/wali-nikah" element={<CreateWaliNikahLetter />} />
          <Route path="letters/create/pengantar-numpang-nikah" element={<CreatePengantarNumpangNikahLetter />} />
          <Route path="letters/create/pengantar-nikah" element={<CreatePengantarNikahLetter />} />
          <Route path="letters/create/belum-menikah" element={<CreateBelumMenikahLetter />} />
          <Route path="letters/create/kematian" element={<CreateKematianLetter />} />
          <Route path="letters/create/permohonan-kehendak-nikah" element={<CreatePermohonanKehendakNikahLetter />} />
          <Route path="letters/create/persetujuan-calon-pengantin" element={<CreatePersetujuanCalonPengantinLetter />} />
          <Route path="letters/create/izin-orang-tua" element={<CreateIzinOrangTuaLetter />} />
          <Route path="letters/view/:id" element={<ViewLetter />} />
          {/* <Route path="letters/edit/:id" element={<EditLetter />} /> */}
          {/* <Route path="letters/templates" element={<LetterTemplates />} /> */}

          {/* Settings & Help */}
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
