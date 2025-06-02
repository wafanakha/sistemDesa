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
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Monografi Berdasarkan Status Pernikahan", 14, 16);
    let y = 24;

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
      const rwTotals = ["", "JML RW"];
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
            content: "TOTAL",
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          },
        ],
        [
          ...STATUS_PERNIKAHAN_LIST.flatMap(() => [
            { content: "L" },
            { content: "P" },
            { content: "JML" },
          ]),
          { content: "L" },
          { content: "P" },
          { content: "JML" },
        ],
      ];

      doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: 5, right: 5 },
        styles: {
          fontSize: 7,
          halign: "center",
          valign: "middle",
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [34, 197, 94], // Green color
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 14 },
          ...Object.fromEntries(
            Array.from(
              { length: STATUS_PERNIKAHAN_LIST.length * 3 },
              (_, i) => [2 + i, { cellWidth: 15 }]
            )
          ),
          [2 + STATUS_PERNIKAHAN_LIST.length * 3]: {
            cellWidth: 10,
            fontStyle: "bold",
          },
          [3 + STATUS_PERNIKAHAN_LIST.length * 3]: {
            cellWidth: 10,
            fontStyle: "bold",
          },
          [4 + STATUS_PERNIKAHAN_LIST.length * 3]: {
            cellWidth: 10,
            fontStyle: "bold",
          },
        },
        didDrawCell: (data: any) => {
          // Highlight baris total RW
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1] === "JML RW"
          ) {
            doc.setFillColor(220, 252, 231); // Light green
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

      y = doc.lastAutoTable.finalY + 10;
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
