import React from "react";
import { Resident } from "../../types/index.tsx"; // ganti sesuai lokasi tipe kamu
import jsPDF from "jspdf";
import "jspdf-autotable";

const AGAMA_LIST = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Budha",
  "Konghucu",
  "Kepercayaan",
];

const groupResidentsByRWRT = (residents: Resident[]) => {
  const result: Record<string, Record<string, Resident[]>> = {};

  residents.forEach((r) => {
    const rw = r.rw || "000";
    const rt = r.rt || "000";

    if (!result[rw]) result[rw] = {};
    if (!result[rw][rt]) result[rw][rt] = [];

    result[rw][rt].push(r);
  });

  return result;
};

const MonografiAgama = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupResidentsByRWRT(residents);

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Monografi Berdasarkan Agama", 14, 16);
    let y = 24;

    Object.entries(grouped).forEach(([rw, rtData]) => {
      doc.text(`NO RW : ${rw}`, 14, y);
      y += 4;

      const body: any[] = [];

      Object.entries(rtData).forEach(([rt], i) => {
        const list = rtData[rt];
        const row: any[] = [i + 1, `RT.${rt.padStart(3, "0")}`];

        AGAMA_LIST.forEach((agama) => {
          const l = list.filter(
            (r) => r.religion === agama && r.gender === "Laki-laki"
          ).length;
          const p = list.filter(
            (r) => r.religion === agama && r.gender === "Perempuan"
          ).length;
          row.push(l, p, l + p);
        });

        const lTotal = list.filter((r) => r.gender === "Laki-laki").length;
        const pTotal = list.filter((r) => r.gender === "Perempuan").length;
        row.push(lTotal, pTotal, lTotal + pTotal);
        body.push(row);
      });

      const head = [
        [
          "NO",
          "NO RT",
          ...AGAMA_LIST.flatMap((a) => [`${a} L`, "P", "L+P"]),
          "L",
          "P",
          "L+P",
        ],
      ];

      (doc as any).autoTable({
        head,
        body,
        startY: y,
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 7,
          halign: "center",
          valign: "middle",
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [33, 150, 243], // warna biru terang
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] }, // zebra stripe
        columnStyles: {
          0: { cellWidth: 10 }, // NO
          1: { cellWidth: 20 }, // NO RT
          // Kolom lain menyesuaikan otomatis
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save("monografi-agama.pdf");
  };

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([rw, rtData], rwIndex) => (
        <div key={rw}>
          <h2 className="font-bold text-lg mb-2">
            NO RW : {rw.padStart(3, "0")}
          </h2>
          <table className="table-auto border border-collapse w-full text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th rowSpan={2}>NO</th>
                <th rowSpan={2}>NO RT</th>
                {AGAMA_LIST.map((agama) => (
                  <th key={agama} colSpan={3}>
                    {agama}
                  </th>
                ))}
                <th colSpan={3}>JUMLAH</th>
              </tr>
              <tr className="bg-gray-100">
                {AGAMA_LIST.map(() => (
                  <>
                    <th>L</th>
                    <th>P</th>
                    <th>L+P</th>
                  </>
                ))}
                <th>L</th>
                <th>P</th>
                <th>L+P</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rtData).map(([rt, list], idx) => {
                const totalL = list.filter(
                  (r) => r.gender === "Laki-laki"
                ).length;
                const totalP = list.filter(
                  (r) => r.gender === "Perempuan"
                ).length;

                return (
                  <tr key={rt} className="text-center">
                    <td>{idx + 1}</td>
                    <td>{`RT.${rt.padStart(3, "0")}`}</td>
                    {AGAMA_LIST.map((agama) => {
                      const l = list.filter(
                        (r) => r.religion === agama && r.gender === "Laki-laki"
                      ).length;
                      const p = list.filter(
                        (r) => r.religion === agama && r.gender === "Perempuan"
                      ).length;
                      return (
                        <React.Fragment key={agama}>
                          <td>{l}</td>
                          <td>{p}</td>
                          <td>{l + p}</td>
                        </React.Fragment>
                      );
                    })}
                    <td>{totalL}</td>
                    <td>{totalP}</td>
                    <td>{totalL + totalP}</td>
                  </tr>
                );
              })}
              {/* Total RW */}
              <tr className="bg-gray-100 font-semibold text-center">
                <td colSpan={2}>JML RW : {rw}</td>
                {AGAMA_LIST.map((agama) => {
                  const l = Object.values(rtData)
                    .flat()
                    .filter(
                      (r) => r.religion === agama && r.gender === "Laki-laki"
                    ).length;
                  const p = Object.values(rtData)
                    .flat()
                    .filter(
                      (r) => r.religion === agama && r.gender === "Perempuan"
                    ).length;
                  return (
                    <React.Fragment key={agama}>
                      <td>{l}</td>
                      <td>{p}</td>
                      <td>{l + p}</td>
                    </React.Fragment>
                  );
                })}
                <td>
                  {
                    Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Laki-laki").length
                  }
                </td>
                <td>
                  {
                    Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Perempuan").length
                  }
                </td>
                <td>{Object.values(rtData).flat().length}</td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={generatePDF}
            className="mb-4 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm"
          >
            Download PDF Agama
          </button>
        </div>
      ))}
    </div>
  );
};

export default MonografiAgama;
