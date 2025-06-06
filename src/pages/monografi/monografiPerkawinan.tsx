import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Resident } from "../../types"; // pastikan path sesuai

const STATUS_PERNIKAHAN_LIST = [
  "Belum Kawin",
  "Kawin",
  "Cerai Hidup",
  "Cerai Mati",
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

const MonografiStatusPernikahan = ({
  residents,
}: {
  residents: Resident[];
}) => {
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
    const title = "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN AGAMA";
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

        STATUS_PERNIKAHAN_LIST.forEach((status) => {
          const l = list.filter(
            (r) => r.maritalStatus === status && r.gender === "Laki-laki"
          ).length;
          const p = list.filter(
            (r) => r.maritalStatus === status && r.gender === "Perempuan"
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
      STATUS_PERNIKAHAN_LIST.forEach((status) => {
        const l = Object.values(rtData)
          .flat()
          .filter(
            (r) => r.maritalStatus === status && r.gender === "Laki-laki"
          ).length;
        const p = Object.values(rtData)
          .flat()
          .filter(
            (r) => r.maritalStatus === status && r.gender === "Perempuan"
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
          ...STATUS_PERNIKAHAN_LIST.map((status) => ({
            content: status,
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
          ...STATUS_PERNIKAHAN_LIST.flatMap(() => [
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

      (doc as any).autoTable({
        head,
        body,
        startY: y,
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 10,
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
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
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
        // columnStyles: {
        //   0: { cellWidth: 8 },
        //   1: { cellWidth: 14 },
        //   ...Object.fromEntries(
        //     Array.from(
        //       { length: STATUS_PERNIKAHAN_LIST.length * 3 },
        //       (_, i) => [2 + i, { cellWidth: 15 }]
        //     )
        //   ),
        //   [2 + STATUS_PERNIKAHAN_LIST.length * 3]: {
        //     cellWidth: 10,
        //     fontStyle: "bold",
        //   },
        //   [3 + STATUS_PERNIKAHAN_LIST.length * 3]: {
        //     cellWidth: 10,
        //     fontStyle: "bold",
        //   },
        //   [4 + STATUS_PERNIKAHAN_LIST.length * 3]: {
        //     cellWidth: 10,
        //     fontStyle: "bold",
        //   },
        // },
        didDrawCell: (data: any) => {
          // Highlight baris total RW
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1] === "JML RW"
          ) {
            doc.setFillColor(225, 235, 255); // Light green
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

      y = (doc as any).lastAutoTable.finalY + 10;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(
      `monografi-status-pernikahan-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          Monografi Berdasarkan Status Pernikahan
        </h1>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-green-900 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                  {STATUS_PERNIKAHAN_LIST.map((status) => (
                    <th
                      key={status}
                      colSpan={3}
                      className="px-2 py-2 text-center font-medium text-gray-700 uppercase tracking-wider border"
                    >
                      {status}
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
                  {STATUS_PERNIKAHAN_LIST.map(() => (
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
                      {STATUS_PERNIKAHAN_LIST.map((status) => {
                        const l = list.filter(
                          (r) =>
                            r.maritalStatus === status &&
                            r.gender === "Laki-laki"
                        ).length;
                        const p = list.filter(
                          (r) =>
                            r.maritalStatus === status &&
                            r.gender === "Perempuan"
                        ).length;
                        return (
                          <React.Fragment key={status}>
                            <td className="px-2 py-2 text-center border">
                              {l}
                            </td>
                            <td className="px-2 py-2 text-center border">
                              {p}
                            </td>
                            <td className="px-2 py-2 text-center font-medium border">
                              {l + p}
                            </td>
                          </React.Fragment>
                        );
                      })}
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
                  {STATUS_PERNIKAHAN_LIST.map((status) => {
                    const l = Object.values(rtData)
                      .flat()
                      .filter(
                        (r) =>
                          r.maritalStatus === status && r.gender === "Laki-laki"
                      ).length;
                    const p = Object.values(rtData)
                      .flat()
                      .filter(
                        (r) =>
                          r.maritalStatus === status && r.gender === "Perempuan"
                      ).length;
                    return (
                      <React.Fragment key={status}>
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

export default MonografiStatusPernikahan;
