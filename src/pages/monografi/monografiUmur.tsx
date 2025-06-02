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
    // Create PDF with maximum possible width (A0 landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [1189, 841], // A0 size (largest standard paper size)
    });

    // Set document metadata
    doc.setProperties({
      title: "Monografi Berdasarkan Umur",
      subject: "Data Penduduk Berdasarkan Kelompok Umur",
      author: "Sistem Informasi Desa",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text("MONOGRAFI PENDUDUK BERDASARKAN KELOMPOK UMUR", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Dicetak pada: " + new Date().toLocaleDateString("id-ID"), 20, 26);

    let y = 32;

    Object.entries(grouped).forEach(([rw, rtData]) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`RW ${rw.padStart(3, "0")}`, 20, y);
      y += 8;

      const body: any[] = [];

      Object.entries(rtData).forEach(([rt], i) => {
        const list = rtData[rt];
        const row: any[] = [i + 1, `RT ${rt.padStart(3, "0")}`];

        AGE_GROUPS.forEach(([min, max]) => {
          const group = list.filter((r) => {
            const age = getAge(r.birthDate);
            return age >= min && (max === null || age <= max);
          });
          const l = group.filter((r) => r.gender === "Laki-laki").length;
          const p = group.filter((r) => r.gender === "Perempuan").length;
          row.push(l, p, l + p);
        });

        const totalL = list.filter((r) => r.gender === "Laki-laki").length;
        const totalP = list.filter((r) => r.gender === "Perempuan").length;
        row.push(totalL, totalP, totalL + totalP);
        body.push(row);
      });

      // Add RW totals row
      const rwTotals = ["", "TOTAL RW"];
      let totalL = 0;
      let totalP = 0;

      AGE_GROUPS.forEach(([min, max]) => {
        const group = Object.values(rtData)
          .flat()
          .filter((r) => {
            const age = getAge(r.birthDate);
            return age >= min && (max === null || age <= max);
          });
        const l = group.filter((r) => r.gender === "Laki-laki").length;
        const p = group.filter((r) => r.gender === "Perempuan").length;
        rwTotals.push(l, p, l + p);
        totalL += l;
        totalP += p;
      });

      rwTotals.push(totalL, totalP, totalL + totalP);
      body.push(rwTotals);

      // Calculate column widths dynamically based on content
      const columnCount = 2 + AGE_GROUPS.length * 3 + 3;
      const pageWidth = doc.internal.pageSize.getWidth();
      const minColWidth = 8;
      const maxColWidth = 15;

      // Base column styles
      const columnStyles = {
        0: { cellWidth: 10, halign: "center" }, // NO column
        1: { cellWidth: 15, halign: "center" }, // RT column
      };

      // Age group columns
      for (let i = 2; i < columnCount - 3; i++) {
        columnStyles[i] = {
          cellWidth: minColWidth,
          halign: "center",
        };
      }

      // Total columns (last 3 columns)
      for (let i = columnCount - 3; i < columnCount; i++) {
        columnStyles[i] = {
          cellWidth: minColWidth,
          halign: "center",
          fontStyle: "bold",
        };
      }

      (doc as any).autoTable({
        head: [
          [
            {
              content: "NO",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            {
              content: "RT",
              rowSpan: 2,
              styles: { halign: "center", valign: "middle" },
            },
            ...AGE_GROUPS.map(([min, max]) => ({
              content: max === null ? "≥75" : `${min}-${max}`,
              colSpan: 3,
              styles: { halign: "center", valign: "middle" },
            })),
            {
              content: "TOTAL",
              colSpan: 3,
              styles: { halign: "center", valign: "middle" },
            },
          ],
          [
            {}, // Empty for NO
            {}, // Empty for RT
            ...AGE_GROUPS.flatMap(() => [
              { content: "L", styles: { halign: "center" } },
              { content: "P", styles: { halign: "center" } },
              { content: "JML", styles: { halign: "center" } },
            ]),
            { content: "L", styles: { halign: "center" } },
            { content: "P", styles: { halign: "center" } },
            { content: "JML", styles: { halign: "center" } },
          ],
        ],
        body,
        startY: y,
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 7,
          halign: "center",
          valign: "middle",
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
          lineWidth: 0.3,
        },
        bodyStyles: {
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles,
        didDrawCell: (data: any) => {
          // Highlight the totals row
          if (data.row.index === body.length - 1) {
            doc.setFillColor(220, 240, 255);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F"
            );
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 12;

      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage({
          orientation: "landscape",
          unit: "mm",
          format: [1189, 841],
        });
        y = 20;
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
