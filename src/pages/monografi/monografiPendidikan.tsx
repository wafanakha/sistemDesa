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
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Monografi Berdasarkan Pendidikan", 14, 16);
    let y = 24;

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
      const rwTotals = [3, 0];
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
            content: "TOTAL",
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          },
        ],
        [
          ...PENDIDIKAN_LIST.flatMap(() => [
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
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
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
      });

      y = doc.lastAutoTable.finalY + 10;
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

      {/* Tabel tampilan di aplikasi bisa ditambahkan mirip dengan MonografiAgama jika dibutuhkan */}
    </div>
  );
};

export default MonografiPendidikan;
