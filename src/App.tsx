import React from "react";
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
import CreateKelahiranLetter from "./pages/letters/CreateKelahiranLetter";

function App() {
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
          <Route path="letters/create/kelahiran" element={<CreateKelahiranLetter />} />
          <Route path="letters/view/:id" element={<ViewLetter />} />
          <Route path="letters/edit/:id" element={<EditLetter />} />
          <Route path="letters/templates" element={<LetterTemplates />} />

          {/* Settings & Help */}
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
