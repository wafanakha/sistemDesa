import { useEffect, useState } from "react";
import { getAllResidents } from "../services/residentService";
import { Resident } from "../types/index";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
        <h2 className="font-semibold text-xl mb-4">Pendidikan</h2>
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Pendidikan</th>
              <th className="p-2">Laki-laki</th>
              <th className="p-2">Perempuan</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Tidak/belum sekolah",
              "Belum Tamat SD/Sederajat",
              "SLTP/Sederajat",
              "SLTA/Sederajat",
              "Diploma IV/Strata1",
            ].map((edu) => (
              <tr key={edu} className="hover:bg-gray-100">
                <td className="p-2">{edu}</td>
                <td className="p-2">
                  {countByGender("education", edu, "Laki-laki")}
                </td>
                <td className="p-2">
                  {countByGender("education", edu, "Perempuan")}
                </td>
                <td className="p-2">{countBy("education", edu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gender Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-xl mb-4">Jenis Kelamin</h2>
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Jenis Kelamin</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-100">
              <td className="p-2">Laki-laki</td>
              <td className="p-2">{countBy("gender", "Laki-laki")}</td>
            </tr>
            <tr className="hover:bg-gray-100">
              <td className="p-2">Perempuan</td>
              <td className="p-2">{countBy("gender", "Perempuan")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Marital Status Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-xl mb-4">Status Perkawinan</h2>
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Status</th>
              <th className="p-2">Laki-laki</th>
              <th className="p-2">Perempuan</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"].map(
              (status) => (
                <tr key={status} className="hover:bg-gray-100">
                  <td className="p-2">{status}</td>
                  <td className="p-2">
                    {countByGender("maritalStatus", status, "Laki-laki")}
                  </td>
                  <td className="p-2">
                    {countByGender("maritalStatus", status, "Perempuan")}
                  </td>
                  <td className="p-2">{countBy("maritalStatus", status)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Age Group Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-xl mb-4">Kelompok Umur</h2>
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Kelompok Umur</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {[
              [0, 4],
              [5, 9],
              [10, 14],
              [15, 19],
              [20, 24],
              [25, 29],
              [30, 34],
              [35, 39],
              [40, 44],
              [45, 49],
              [50, 54],
              [55, 59],
              [60, 64],
              [65, 69],
              [70, 74],
              [75, 120],
            ].map(([min, max]) => (
              <tr key={min} className="hover:bg-gray-100">
                <td className="p-2">
                  {min} - {max}
                </td>
                <td className="p-2">{countAgeGroup(min, max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Religion Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-xl mb-4">Agama</h2>
        <table className="table-auto w-full border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Agama</th>
              <th className="p-2">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Islam",
              "Protestan",
              "Katolik",
              "Hindu",
              "Buddha",
              "Konghucu",
              "Kepercayaan",
            ].map((agama) => (
              <tr key={agama} className="hover:bg-gray-100">
                <td className="p-2">{agama}</td>
                <td className="p-2">{countBy("religion", agama)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonografiPage;
