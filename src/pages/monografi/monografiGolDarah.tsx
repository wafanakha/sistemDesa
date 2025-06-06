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
  residents.forEach((r) => {
    const rw = r.rw?.padStart(3, "0") || "000";
    const rt = r.rt?.padStart(3, "0") || "000";
    if (!result[rw]) result[rw] = {};
    if (!result[rw][rt]) result[rw][rt] = [];
    result[rw][rt].push(r);
  });
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
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Pemerintah heading
    doc.text("PEMERINTAH KABUPATEN BANYUMAS", pageWidth / 2, 14, {
      align: "center",
    });
    doc.text("KECAMATAN PATIKRAJA", pageWidth / 2, 20, {
      align: "center",
    });
    doc.text("DESA/KELURAHAN KEDUNGWRINGIN", pageWidth / 2, 26, {
      align: "center",
    });

    // Title with underline
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const title = "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN GOLONGAN DARAH";
    const titleY = 34;

    doc.text(title, pageWidth / 2, titleY, { align: "center" });

    // Draw underline manually
    const textWidth = doc.getTextWidth(title);
    const lineXStart = (pageWidth - textWidth) / 2;
    const lineXEnd = lineXStart + textWidth;

    doc.setLineWidth(0.5);
    doc.line(lineXStart, titleY + 1.5, lineXEnd, titleY + 1.5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Tgl. ${new Date().toLocaleDateString("id-ID")}`,
      pageWidth / 2,
      40,
      {
        align: "center",
      }
    );

    let y = 48;

    Object.entries(grouped).forEach(([rw, rtData], rwIndex) => {
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      doc.text(`NO RW : ${rw}`, 14, y);
      doc.setFont("helvetica", "normal");

      y += 4;

      const allRTResidents = Object.values(rtData).flat();

      // Prepare data
      const body = Object.entries(rtData).map(([rt, list], i) => {
        const row: any[] = [
          { content: i + 1, styles: { halign: "center" } },
          {
            content: `RT ${rt.padStart(3, "0")}`,
            styles: { halign: "center" },
          },
        ];

        BLOOD_TYPES.forEach((type) => {
          const l = getCount(list, type, "Laki-laki");
          const p = getCount(list, type, "Perempuan");
          row.push(
            { content: l, styles: { halign: "center" } },
            { content: p, styles: { halign: "center" } },
            { content: l + p, styles: { halign: "center", fontStyle: "bold" } }
          );
        });

        const totalL = list.filter((r) => r.gender === "Laki-laki").length;
        const totalP = list.filter((r) => r.gender === "Perempuan").length;
        row.push(
          { content: totalL, styles: { halign: "center", fontStyle: "bold" } },
          { content: totalP, styles: { halign: "center", fontStyle: "bold" } },
          {
            content: totalL + totalP,
            styles: { halign: "center", fontStyle: "bold" },
          }
        );

        return row;
      });

      // Add RW total row
      const totalRow: any[] = [
        {
          content: `TOTAL RW ${rw.padStart(3, "0")}`,
          colSpan: 2,
          styles: {
            halign: "center",
            fillColor: [233, 236, 239],
            fontStyle: "bold",
          },
        },
      ];

      BLOOD_TYPES.forEach((type) => {
        const l = getCount(allRTResidents, type, "Laki-laki");
        const p = getCount(allRTResidents, type, "Perempuan");
        totalRow.push(
          {
            content: l,
            styles: { halign: "center", fillColor: [233, 236, 239] },
          },
          {
            content: p,
            styles: { halign: "center", fillColor: [233, 236, 239] },
          },
          {
            content: l + p,
            styles: {
              halign: "center",
              fontStyle: "bold",
            },
          }
        );
      });

      const totalL = allRTResidents.filter(
        (r) => r.gender === "Laki-laki"
      ).length;
      const totalP = allRTResidents.filter(
        (r) => r.gender === "Perempuan"
      ).length;
      totalRow.push(
        {
          content: totalL,
          styles: {
            halign: "center",
            fillColor: [233, 236, 239],
            fontStyle: "bold",
          },
        },
        {
          content: totalP,
          styles: {
            halign: "center",
            fillColor: [233, 236, 239],
            fontStyle: "bold",
          },
        },
        {
          content: totalL + totalP,
          styles: {
            halign: "center",
            fillColor: [233, 236, 239],
            fontStyle: "bold",
          },
        }
      );

      body.push(totalRow);

      const head = [
        [
          {
            content: "NO",
            rowSpan: 2,
            styles: { valign: "middle", halign: "center" },
          },
          {
            content: "NO RT",
            rowSpan: 2,
            styles: { valign: "middle", halign: "center" },
          },
          ...BLOOD_TYPES.map((agama) => ({
            content: agama,
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          })),
          {
            content: "JUMLAH",
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          },
        ],
        [
          ...BLOOD_TYPES.flatMap(() => [
            { content: "L" },
            { content: "P" },
            {
              content: "L+P",
              styles: {
                fillColor: [255, 225, 160], // yellow highlight
                fontStyle: "bold",
              },
            },
          ]),
          { content: "L" },
          { content: "P" },
          {
            content: "L+P",
            styles: {
              fillColor: [255, 225, 160], // yellow highlight
              fontStyle: "bold",
            },
          },
        ],
      ];

      // Create table
      (doc as any).autoTable({
        head,
        body,
        startY: y,
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 9,
          halign: "center",
          valign: "middle",
          cellPadding: 1,
          lineColor: [0, 0, 0], // Set grid lines to black
          lineWidth: 0.2,
          textColor: 0,
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 0,
          fontStyle: "bold",
        },
        theme: "grid",
        didDrawCell: (data: any) => {
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1] === "JML RW"
          ) {
            doc.setFillColor(225, 235, 255);
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
        didParseCell: (data: any) => {
          const isJMLColumn =
            data.column.index >= 2 && (data.column.index - 2) % 3 === 2;

          const isJMLRWRow =
            data.section === "body" &&
            data.row.index === body.length - 1 &&
            typeof data.row.raw?.[1] === "string" &&
            data.row.raw[1].toString().includes("JML RW");

          // Highlight "L+P" columns in any row
          if (data.section === "body" && isJMLColumn) {
            data.cell.styles.fillColor = [255, 225, 160]; // Yellowish
            data.cell.styles.fontStyle = "bold";
          }

          // Additionally style the entire "JML RW" row
          if (isJMLRWRow) {
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";

            // Optional: apply a base light grey background
            data.cell.styles.fillColor = [220, 220, 220];

            // If it's also a JML column, override it with yellow
            if (isJMLColumn) {
              data.cell.styles.fillColor = [255, 225, 160];
            }
          }
        },
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });

    // Save PDF
    doc.save(
      `Monografi_Golongan_Darah_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const renderTable = (rw: string, rtData: Record<string, Resident[]>) => {
    const allRTResidents = Object.values(rtData).flat();

    return (
      <div
        key={rw}
        className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        {/* RW Header */}
        <div className="bg-blue-600 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">
            RW {rw.padStart(3, "0")}
          </h2>
        </div>

        {/* Table */}
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
                {BLOOD_TYPES.map((type) => (
                  <th
                    key={type}
                    colSpan={3}
                    className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider border bg-blue-100"
                  >
                    {type}
                  </th>
                ))}
                <th
                  colSpan={3}
                  className="px-3 py-3 text-center font-medium text-gray-700 uppercase tracking-wider border bg-blue-200"
                >
                  TOTAL
                </th>
              </tr>
              <tr className="bg-gray-100">
                {BLOOD_TYPES.flatMap((type) => [
                  <th
                    key={`${type}-l`}
                    className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-50"
                  >
                    L
                  </th>,
                  <th
                    key={`${type}-p`}
                    className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-50"
                  >
                    P
                  </th>,
                  <th
                    key={`${type}-jml`}
                    className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-50"
                  >
                    JML
                  </th>,
                ])}
                <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-100">
                  L
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-100">
                  P
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border bg-blue-100">
                  JML
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(rtData).map(([rt, list], i) => {
                const row: React.ReactNode[] = [];

                // Add RT data
                row.push(
                  <td key={`no-${i}`} className="px-3 py-2 text-center border">
                    {i + 1}
                  </td>,
                  <td
                    key={`rt-${i}`}
                    className="px-3 py-2 text-center font-medium border"
                  >
                    RT {rt.padStart(3, "0")}
                  </td>
                );

                // Add blood type data
                BLOOD_TYPES.forEach((type) => {
                  const l = getCount(list, type, "Laki-laki");
                  const p = getCount(list, type, "Perempuan");
                  row.push(
                    <td
                      key={`${type}-l-${i}`}
                      className="px-2 py-2 text-center border"
                    >
                      {l}
                    </td>,
                    <td
                      key={`${type}-p-${i}`}
                      className="px-2 py-2 text-center border"
                    >
                      {p}
                    </td>,
                    <td
                      key={`${type}-jml-${i}`}
                      className="px-2 py-2 text-center font-medium border"
                    >
                      {l + p}
                    </td>
                  );
                });

                // Add totals
                const totalL = list.filter(
                  (r) => r.gender === "Laki-laki"
                ).length;
                const totalP = list.filter(
                  (r) => r.gender === "Perempuan"
                ).length;
                row.push(
                  <td
                    key={`total-l-${i}`}
                    className="px-2 py-2 text-center font-medium border"
                  >
                    {totalL}
                  </td>,
                  <td
                    key={`total-p-${i}`}
                    className="px-2 py-2 text-center font-medium border"
                  >
                    {totalP}
                  </td>,
                  <td
                    key={`total-jml-${i}`}
                    className="px-2 py-2 text-center font-bold border"
                  >
                    {totalL + totalP}
                  </td>
                );

                return (
                  <tr key={rt} className="hover:bg-gray-50">
                    {row}
                  </tr>
                );
              })}

              {/* RW Total Row */}
              <tr className="bg-blue-50 font-semibold">
                <td colSpan={2} className="px-3 py-2 text-center border">
                  TOTAL RW {rw.padStart(3, "0")}
                </td>
                {BLOOD_TYPES.flatMap((type) => {
                  const l = getCount(allRTResidents, type, "Laki-laki");
                  const p = getCount(allRTResidents, type, "Perempuan");
                  return [
                    <td
                      key={`${type}-l-total`}
                      className="px-2 py-2 text-center border"
                    >
                      {l}
                    </td>,
                    <td
                      key={`${type}-p-total`}
                      className="px-2 py-2 text-center border"
                    >
                      {p}
                    </td>,
                    <td
                      key={`${type}-jml-total`}
                      className="px-2 py-2 text-center border"
                    >
                      {l + p}
                    </td>,
                  ];
                })}
                {(() => {
                  const totalL = allRTResidents.filter(
                    (r) => r.gender === "Laki-laki"
                  ).length;
                  const totalP = allRTResidents.filter(
                    (r) => r.gender === "Perempuan"
                  ).length;
                  return [
                    <td key="total-l" className="px-2 py-2 text-center border">
                      {totalL}
                    </td>,
                    <td key="total-p" className="px-2 py-2 text-center border">
                      {totalP}
                    </td>,
                    <td
                      key="total-jml"
                      className="px-2 py-2 text-center font-bold text-blue-700 border"
                    >
                      {totalL + totalP}
                    </td>,
                  ];
                })()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">
            Monografi Berdasarkan Golongan Darah
          </h1>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            Download PDF
          </button>
        </div>

        {Object.entries(grouped).map(([rw, rtData]) => renderTable(rw, rtData))}
      </div>
    </div>
  );
};

export default MonografiGolonganDarah;
