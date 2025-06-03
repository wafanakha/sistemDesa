import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Resident } from "../../types";

const BLOOD_TYPES = [
  "A",
  "B",
  "AB",
  "O",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "TIDAK TAHU",
];

const groupByRWRT = (residents: Resident[]) => {
  const result: Record<string, Record<string, Resident[]>> = {};
  for (const r of residents) {
    const rw = r.rw || "000";
    const rt = r.rt || "000";
    if (!result[rw]) result[rw] = {};
    if (!result[rw][rt]) result[rw][rt] = [];
    result[rw][rt].push(r);
  }
  return result;
};

const MonografiGolonganDarah = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupByRWRT(residents);

  const getCount = (
    list: Resident[],
    type: string,
    gender: "Laki-laki" | "Perempuan"
  ) => list.filter((r) => r.bloodType === type && r.gender === gender).length;

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Monografi Berdasarkan Golongan Darah", 14, 10);

    Object.entries(grouped).forEach(([rw, rtData], rwIndex) => {
      const allRTResidents = Object.values(rtData).flat();
      const rows: any[] = [];
      Object.entries(rtData).forEach(([rt, list], i) => {
        const row: (string | number)[] = [i + 1, `RT.${rt.padStart(3, "0")}`];
        BLOOD_TYPES.forEach((type) => {
          const l = getCount(list, type, "Laki-laki");
          const p = getCount(list, type, "Perempuan");
          row.push(l, p, l + p);
        });
        const totalL = list.filter((r) => r.gender === "Laki-laki").length;
        const totalP = list.filter((r) => r.gender === "Perempuan").length;
        row.push(totalL, totalP, totalL + totalP);
        rows.push(row);
      });

      const totalRow: (string | number)[] = ["JML RW : " + rw, ""];
      BLOOD_TYPES.forEach((type) => {
        const l = getCount(allRTResidents, type, "Laki-laki");
        const p = getCount(allRTResidents, type, "Perempuan");
        totalRow.push(l, p, l + p);
      });
      const totalL = allRTResidents.filter(
        (r) => r.gender === "Laki-laki"
      ).length;
      const totalP = allRTResidents.filter(
        (r) => r.gender === "Perempuan"
      ).length;
      totalRow.push(totalL, totalP, totalL + totalP);
      rows.push(totalRow);

      const headers = [
        [
          "NO",
          "NO RT",
          ...BLOOD_TYPES.flatMap((t) => [`${t} L`, `${t} P`, `${t} L+P`]),
          "JUMLAH L",
          "JUMLAH P",
          "JUMLAH L+P",
        ],
      ];
      autoTable(doc, {
        startY: rwIndex === 0 ? 14 : (doc as any).lastAutoTable.finalY + 10,
        head: headers,
        body: rows,
        theme: "grid",
        styles: { fontSize: 6 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 10, right: 10 },
      });
    });

    doc.save("monografi-golongan-darah.pdf");
  };

  const renderTable = (rw: string, rtData: Record<string, Resident[]>) => {
    const rtRows = Object.entries(rtData).map(([rt, list], i) => {
      const row: (string | number)[] = [i + 1, `RT.${rt.padStart(3, "0")}`];
      BLOOD_TYPES.forEach((type) => {
        const l = getCount(list, type, "Laki-laki");
        const p = getCount(list, type, "Perempuan");
        row.push(l, p, l + p);
      });
      const totalL = list.filter((r) => r.gender === "Laki-laki").length;
      const totalP = list.filter((r) => r.gender === "Perempuan").length;
      row.push(totalL, totalP, totalL + totalP);
      return row;
    });

    const allRTResidents = Object.values(rtData).flat();
    const totalRow: (string | number)[] = ["JML RW : " + rw, ""];
    BLOOD_TYPES.forEach((type) => {
      const l = getCount(allRTResidents, type, "Laki-laki");
      const p = getCount(allRTResidents, type, "Perempuan");
      totalRow.push(l, p, l + p);
    });
    const totalL = allRTResidents.filter(
      (r) => r.gender === "Laki-laki"
    ).length;
    const totalP = allRTResidents.filter(
      (r) => r.gender === "Perempuan"
    ).length;
    totalRow.push(totalL, totalP, totalL + totalP);

    return (
      <div key={rw} className="mb-10">
        <h2 className="font-bold text-lg text-blue-700 mb-2">NO RW : {rw}</h2>
        <table className="w-full border border-black text-xs text-center">
          <thead>
            <tr className="bg-gray-200">
              <th rowSpan={2}>NO</th>
              <th rowSpan={2}>NO RT</th>
              {BLOOD_TYPES.map((type) => (
                <th key={type} colSpan={3} className="bg-yellow-200">
                  {type}
                </th>
              ))}
              <th colSpan={3}>JUMLAH</th>
            </tr>
            <tr className="bg-gray-100">
              {BLOOD_TYPES.map(() => (
                <>
                  <th className="bg-yellow-100">L</th>
                  <th className="bg-yellow-100">P</th>
                  <th className="bg-yellow-100">L+P</th>
                </>
              ))}
              <th className="bg-blue-100">L</th>
              <th className="bg-blue-100">P</th>
              <th className="bg-blue-100">L+P</th>
            </tr>
          </thead>
          <tbody>
            {rtRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-black p-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-bold bg-gray-100">
              {totalRow.map((cell, i) => (
                <td key={i} className="border border-black p-1 bg-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Monografi Berdasarkan Golongan Darah
        </h1>
        <button
          onClick={exportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>
      {Object.entries(grouped).map(([rw, rtData]) => renderTable(rw, rtData))}
    </div>
  );
};

export default MonografiGolonganDarah;
