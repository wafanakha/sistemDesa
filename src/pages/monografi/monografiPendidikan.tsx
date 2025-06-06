import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Resident } from "../../types"; // Pastikan path ini sesuai

const PENDIDIKAN_LIST = [
  "Tidak/belum sekolah",
  "Belum Tamat SD/Sederajat",
  "SD/Sederajat",
  "SLTP/Sederajat",
  "SLTA/Sederajat",
  "Diploma I/II/III",
  "Diploma IV/Strata1",
  "Strata2",
  "Strata3",
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

const MonografiPendidikan = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupResidentsByRWRT(residents);

  const generatePDF = () => {
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
    const title = "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN PENDIDIKAN";
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

    Object.entries(grouped).forEach(([rw, rtData]) => {
      doc.setFontSize(12);
      doc.text(`NO RW : ${rw}`, 14, y);
      y += 4;

      const body: any[] = [];

      Object.entries(rtData).forEach(([rt], i) => {
        const list = rtData[rt];
        const row: any[] = [i + 1, `RT.${rt.padStart(3, "0")}`];

        PENDIDIKAN_LIST.forEach((edu) => {
          const l = list.filter(
            (r) => r.education === edu && r.gender === "Laki-laki"
          ).length;
          const p = list.filter(
            (r) => r.education === edu && r.gender === "Perempuan"
          ).length;
          row.push(l, p, l + p);
        });

        const lTotal = list.filter((r) => r.gender === "Laki-laki").length;
        const pTotal = list.filter((r) => r.gender === "Perempuan").length;
        row.push(lTotal, pTotal, lTotal + pTotal);
        body.push(row);
      });

      // Baris total RW
      const rwTotals: (string | number)[] = [
        "",
        `JML RW : ${rw.padStart(3, "0")}`,
      ];
      let totalL = 0;
      let totalP = 0;
      PENDIDIKAN_LIST.forEach((edu) => {
        const l = Object.values(rtData)
          .flat()
          .filter(
            (r) => r.education === edu && r.gender === "Laki-laki"
          ).length;
        const p = Object.values(rtData)
          .flat()
          .filter(
            (r) => r.education === edu && r.gender === "Perempuan"
          ).length;
        rwTotals.push(l, p, l + p);
        totalL += l;
        totalP += p;
      });
      rwTotals.push(totalL, totalP, totalL + totalP);
      body.push(rwTotals);

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
          ...PENDIDIKAN_LIST.map((edu) => ({
            content: edu,
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
          ...PENDIDIKAN_LIST.flatMap(() => [
            { content: "L" },
            { content: "P" },
            {
              content: "L+P",
              styles: {
                fillColor: [255, 213, 153], // yellow highlight
                fontStyle: "bold",
              },
            },
          ]),
          { content: "L" },
          { content: "P" },
          {
            content: "L+P",
            styles: {
              fillColor: [255, 213, 153], // yellow highlight
              fontStyle: "bold",
            },
          },
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
            data.cell.styles.fillColor = [255, 213, 153]; // Yellowish
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
              data.cell.styles.fillColor = [255, 213, 153];
            }
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(
      `monografi-pendidikan-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Monografi Berdasarkan Pendidikan
        </h1>
        <button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      {Object.entries(grouped).map(([rw, rtData]) => (
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

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                {/* Main Header Row */}
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
                  {PENDIDIKAN_LIST.map((edu) => (
                    <th
                      key={edu}
                      colSpan={3}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider border"
                    >
                      {edu}
                    </th>
                  ))}
                  <th
                    colSpan={3}
                    className="px-3 py-3 text-center font-medium text-gray-700 uppercase tracking-wider border"
                  >
                    TOTAL
                  </th>
                </tr>

                {/* Subheader Row */}
                <tr className="bg-gray-100">
                  {PENDIDIKAN_LIST.flatMap((edu) => [
                    <th
                      key={`${edu}-l`}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border"
                    >
                      L
                    </th>,
                    <th
                      key={`${edu}-p`}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border"
                    >
                      P
                    </th>,
                    <th
                      key={`${edu}-jml`}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider text-xs border"
                    >
                      JML
                    </th>,
                  ])}
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
                {Object.entries(rtData).map(([rt, list], i) => {
                  const row: React.ReactNode[] = [];

                  // Add RT data
                  row.push(
                    <td
                      key={`no-${i}`}
                      className="px-3 py-2 text-center border"
                    >
                      {i + 1}
                    </td>,
                    <td
                      key={`rt-${i}`}
                      className="px-3 py-2 text-center font-medium border"
                    >
                      RT {rt.padStart(3, "0")}
                    </td>
                  );

                  // Add education data
                  PENDIDIKAN_LIST.forEach((edu) => {
                    const l = list.filter(
                      (r) => r.education === edu && r.gender === "Laki-laki"
                    ).length;
                    const p = list.filter(
                      (r) => r.education === edu && r.gender === "Perempuan"
                    ).length;
                    row.push(
                      <td
                        key={`${edu}-l-${i}`}
                        className="px-2 py-2 text-center border"
                      >
                        {l}
                      </td>,
                      <td
                        key={`${edu}-p-${i}`}
                        className="px-2 py-2 text-center border"
                      >
                        {p}
                      </td>,
                      <td
                        key={`${edu}-jml-${i}`}
                        className="px-2 py-2 text-center font-medium border"
                      >
                        {l + p}
                      </td>
                    );
                  });

                  // Add totals
                  const lTotal = list.filter(
                    (r) => r.gender === "Laki-laki"
                  ).length;
                  const pTotal = list.filter(
                    (r) => r.gender === "Perempuan"
                  ).length;
                  row.push(
                    <td
                      key={`total-l-${i}`}
                      className="px-2 py-2 text-center font-medium border"
                    >
                      {lTotal}
                    </td>,
                    <td
                      key={`total-p-${i}`}
                      className="px-2 py-2 text-center font-medium border"
                    >
                      {pTotal}
                    </td>,
                    <td
                      key={`total-jml-${i}`}
                      className="px-2 py-2 text-center font-bold border"
                    >
                      {lTotal + pTotal}
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
                  {PENDIDIKAN_LIST.flatMap((edu) => {
                    const l = Object.values(rtData)
                      .flat()
                      .filter(
                        (r) => r.education === edu && r.gender === "Laki-laki"
                      ).length;
                    const p = Object.values(rtData)
                      .flat()
                      .filter(
                        (r) => r.education === edu && r.gender === "Perempuan"
                      ).length;
                    return [
                      <td
                        key={`${edu}-l-total`}
                        className="px-2 py-2 text-center border"
                      >
                        {l}
                      </td>,
                      <td
                        key={`${edu}-p-total`}
                        className="px-2 py-2 text-center border"
                      >
                        {p}
                      </td>,
                      <td
                        key={`${edu}-jml-total`}
                        className="px-2 py-2 text-center border"
                      >
                        {l + p}
                      </td>,
                    ];
                  })}
                  {(() => {
                    const totalL = Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Laki-laki").length;
                    const totalP = Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Perempuan").length;
                    return [
                      <td
                        key="total-l"
                        className="px-2 py-2 text-center border"
                      >
                        {totalL}
                      </td>,
                      <td
                        key="total-p"
                        className="px-2 py-2 text-center border"
                      >
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
      ))}
    </div>
  );
};

export default MonografiPendidikan;
