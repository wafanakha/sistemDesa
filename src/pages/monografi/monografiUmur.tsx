import React from "react";
import { Resident } from "../../types/index";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AGE_GROUPS: [number, number | null][] = [
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
  [75, null],
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

const getAgeGroup = (age: number): string => {
  if (isNaN(age)) return "unknown";

  const ranges = [
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
  ];

  for (const [min, max] of ranges) {
    if (age >= min && age <= max) return `${min}-${max}`;
  }

  if (age >= 75) return ">=75";
  return "unknown";
};

const getAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const MonografiUmur = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupResidentsByRWRT(residents);

  const generatePDF = () => {
    // Use F4 landscape for much more width
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "f4", // F4 is 330 x 210 mm in landscape
    });

    doc.setFontSize(16);
    doc.text("Monografi Berdasarkan Umur", 14, 20);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);
    let y = 40;

    Object.entries(grouped).forEach(([rw, rtData]) => {
      doc.setFontSize(14);
      doc.text(`NO RW : ${rw}`, 14, y);
      y += 8;

      const body: any[] = [];

      Object.entries(rtData).forEach(([rt], i) => {
        const list = rtData[rt];
        const row: any[] = [i + 1, `RT.${rt.padStart(3, "0")}`];

        AGE_GROUPS.forEach((group) => {
          const l = list.filter(
            (r) => getAgeGroup(r.age || 0) === group && r.gender === "Laki-laki"
          ).length;
          const p = list.filter(
            (r) => getAgeGroup(r.age || 0) === group && r.gender === "Perempuan"
          ).length;
          row.push(l, p, l + p);
        });

        const lTotal = list.filter((r) => r.gender === "Laki-laki").length;
        const pTotal = list.filter((r) => r.gender === "Perempuan").length;
        row.push(lTotal, pTotal, lTotal + pTotal);
        body.push(row);
      });

      // TOTAL ROW
      const rwTotals = ["", "JML RW"];
      let totalL = 0;
      let totalP = 0;
      AGE_GROUPS.forEach((group) => {
        const l = Object.values(rtData)
          .flat()
          .filter(
            (r) => getAgeGroup(r.age || 0) === group && r.gender === "Laki-laki"
          ).length;
        const p = Object.values(rtData)
          .flat()
          .filter(
            (r) => getAgeGroup(r.age || 0) === group && r.gender === "Perempuan"
          ).length;
        rwTotals.push(l, p, l + p);
        totalL += l;
        totalP += p;
      });
      rwTotals.push(totalL, totalP, totalL + totalP);
      body.push(rwTotals);

      const head = [
        [
          { content: "NO", rowSpan: 2 },
          { content: "RT", rowSpan: 2 },
          ...AGE_GROUPS.map((g) => ({
            content: g[1] === null ? "75+" : `${g[0]}-${g[1]}`,
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          })),
          { content: "TOT", colSpan: 3 },
        ],
        [
          ...AGE_GROUPS.flatMap(() => [
            { content: "L" },
            { content: "P" },
            { content: "J" },
          ]),
          { content: "L" },
          { content: "P" },
          { content: "J" },
        ],
      ];

      // Calculate available width and distribute columns
      const availableWidth = 330 - 16; // F4 width minus margins
      const totalColumns = 2 + AGE_GROUPS.length * 3 + 3; // NO, RT, age groups, totals
      const avgColumnWidth = availableWidth / totalColumns;

      doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: 8, right: 8 },
        styles: {
          fontSize: 5.5, // Much smaller font
          cellPadding: 0.8,
          halign: "center",
          valign: "middle",
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 5.5,
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
        tableWidth: availableWidth,
        columnStyles: {
          0: { cellWidth: Math.max(avgColumnWidth * 0.8, 6) }, // NO
          1: { cellWidth: Math.max(avgColumnWidth * 1.2, 8) }, // RT
          // All other columns get equal width
          ...Object.fromEntries(
            Array.from({ length: totalColumns - 2 }, (_, i) => [
              2 + i,
              { cellWidth: Math.max(avgColumnWidth * 0.9, 4.5) },
            ])
          ),
        },
        didDrawCell: (data: any) => {
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1] === "JML RW"
          ) {
            doc.setFillColor(220, 240, 255);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
            doc.setTextColor(0, 0, 0);
          }
        },
      });

      y = doc.lastAutoTable.finalY + 15;
      // Check if we need a new page
      if (y > 180) {
        doc.addPage();
        y = 30;
      }
    });

    // Add footer page number
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${totalPages}`,
        doc.internal.pageSize.getWidth() - 30,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save(`monografi-umur-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          Monografi Berdasarkan Kelompok Umur
        </h1>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Download PDF (F4)
        </button>
      </div>

      {Object.entries(grouped).map(([rw, rtData]) => (
        <div key={rw} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-900 px-4 py-3">
            <h2 className="text-lg font-semibold text-white">
              RW {rw.padStart(3, "0")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-3 py-3 text-center font-medium text-gray-700 uppercase tracking-wider border"
                  >
                    NO
                  </th>
                  <th
                    rowSpan={2}
                    className="px-3 py-3 text-center font-medium text-gray-700 uppercase tracking-wider border"
                  >
                    RT
                  </th>
                  {AGE_GROUPS.map(([min, max]) => (
                    <th
                      key={`${min}-${max}`}
                      colSpan={3}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider border"
                    >
                      {max === null ? "≥75" : `${min}-${max}`}
                    </th>
                  ))}
                  <th
                    colSpan={3}
                    className="px-3 py-3 text-center font-medium text-gray-700 uppercase tracking-wider border"
                  >
                    TOTAL
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  {AGE_GROUPS.map(() => (
                    <React.Fragment key={Math.random()}>
                      <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                        L
                      </th>
                      <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                        P
                      </th>
                      <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                        JML
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                    L
                  </th>
                  <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                    P
                  </th>
                  <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border">
                    JML
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(rtData).map(([rt, list], idx) => {
                  const ageGroupCounts = AGE_GROUPS.map(([min, max]) => {
                    const group = list.filter((r) => {
                      const age = getAge(r.birthDate);
                      return age >= min && (max === null || age <= max);
                    });
                    const l = group.filter(
                      (r) => r.gender === "Laki-laki"
                    ).length;
                    const p = group.filter(
                      (r) => r.gender === "Perempuan"
                    ).length;
                    return [l, p, l + p];
                  });

                  const totalL = list.filter(
                    (r) => r.gender === "Laki-laki"
                  ).length;
                  const totalP = list.filter(
                    (r) => r.gender === "Perempuan"
                  ).length;

                  return (
                    <tr key={rt} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center border">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 text-center font-medium border">
                        RT {rt.padStart(3, "0")}
                      </td>
                      {ageGroupCounts.map(([l, p, t], i) => (
                        <React.Fragment key={i}>
                          <td className="px-2 py-2 text-center border">{l}</td>
                          <td className="px-2 py-2 text-center border">{p}</td>
                          <td className="px-2 py-2 text-center font-medium border">
                            {t}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="px-2 py-2 text-center font-medium border">
                        {totalL}
                      </td>
                      <td className="px-2 py-2 text-center font-medium border">
                        {totalP}
                      </td>
                      <td className="px-2 py-2 text-center font-bold border">
                        {totalL + totalP}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-green-50 font-semibold">
                  <td colSpan={2} className="px-3 py-2 text-center border">
                    TOTAL RW {rw.padStart(3, "0")}
                  </td>
                  {AGE_GROUPS.map(([min, max]) => {
                    const group = Object.values(rtData)
                      .flat()
                      .filter((r) => {
                        const age = getAge(r.birthDate);
                        return age >= min && (max === null || age <= max);
                      });
                    const l = group.filter(
                      (r) => r.gender === "Laki-laki"
                    ).length;
                    const p = group.filter(
                      (r) => r.gender === "Perempuan"
                    ).length;
                    return (
                      <React.Fragment key={`${min}-${max}`}>
                        <td className="px-2 py-2 text-center border">{l}</td>
                        <td className="px-2 py-2 text-center border">{p}</td>
                        <td className="px-2 py-2 text-center border">
                          {l + p}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className="px-2 py-2 text-center border">
                    {
                      Object.values(rtData)
                        .flat()
                        .filter((r) => r.gender === "Laki-laki").length
                    }
                  </td>
                  <td className="px-2 py-2 text-center border">
                    {
                      Object.values(rtData)
                        .flat()
                        .filter((r) => r.gender === "Perempuan").length
                    }
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-green-700 border">
                    {Object.values(rtData).flat().length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonografiUmur;
