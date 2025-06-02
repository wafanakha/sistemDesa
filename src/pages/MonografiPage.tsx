import { useEffect, useState } from "react";
import { getAllResidents } from "../services/residentService";
import { Resident } from "../types/index";
import jsPDF from "jspdf";
import "jspdf-autotable";
import MonografiAgama from "./monografi/monografiAgama";
import MonografiUmur from "./monografi/monografiUmur";
import MonografiStatusPernikahan from "./monografi/monografiPerkawinan";
import MonografiGender from "./monografi/monografiGender";
import MonografiPendidikan from "./monografi/monografiPendidikan";

const MonografiPage = () => {
  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {
    getAllResidents().then(setResidents);
  }, []);

  const countBy = (field, value) =>
    residents.filter((r) => r[field] === value).length;

  const countByGender = (field, value, gender) =>
    residents.filter((r) => r[field] === value && r.gender === gender).length;

  const countAgeGroup = (min, max) =>
    residents.filter((r) => {
      const age =
        r.age || new Date().getFullYear() - new Date(r.birthDate).getFullYear();
      return age >= min && age <= max;
    }).length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Monografi Penduduk
      </h1>

      {/* Education Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <MonografiPendidikan residents={residents} />
      </div>

      {/* Gender Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <MonografiGender residents={residents} />
      </div>

      {/* Marital Status Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <MonografiStatusPernikahan residents={residents} />
      </div>

      {/* Age Group Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <MonografiUmur residents={residents} />
      </div>

      {/* Religion Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <MonografiAgama residents={residents} />
      </div>
    </div>
  );
};

export default MonografiPage;
