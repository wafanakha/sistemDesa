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
          <Route path="residents" element={<ResidentsList />} />
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
          <Route path="letters" element={<LettersList />} />
          <Route path="letters/create" element={<CreateLetter />} />
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
