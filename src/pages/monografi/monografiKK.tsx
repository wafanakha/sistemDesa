import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Resident } from "../../types";

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

const MonografiKepalaKeluarga = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupResidentsByRWRT(residents);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Header
    doc.text("PEMERINTAH KABUPATEN BANYUMAS", pageWidth / 2, 14, {
      align: "center",
    });
    doc.text("KECAMATAN PATIKRAJA", pageWidth / 2, 20, { align: "center" });
    doc.text("DESA/KELURAHAN KEDUNGWRINGIN", pageWidth / 2, 26, {
      align: "center",
    });
    // Title with underline
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const title =
      "REKAPITULASI JUMLAH KEPALA KELUARGA BERDASARKAN JENIS KELAMIN";
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
      { align: "center" }
    );

    let y = 48;

    Object.entries(grouped).forEach(([rw, rtData]) => {
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");

      doc.setFontSize(12);
      doc.text(`NO RW : ${rw}`, 14, y);
      doc.setFont("helvetica", "normal");

      y += 4;

      const body: any[] = [];
      const rwTotals: (string | number)[] = [
        "",
        `JML RW : ${rw.padStart(3, "0")}`,
      ];
      let totalL = 0;
      let totalP = 0;

      Object.entries(rtData).forEach(([rt], i) => {
        const list = rtData[rt].filter((r) => r.shdk === "Kepala Keluarga");
        const l = list.filter((r) => r.gender === "Laki-laki").length;
        const p = list.filter((r) => r.gender === "Perempuan").length;
        body.push([i + 1, `RT. ${rt.padStart(3, "0")}`, l, p, l + p]);
        totalL += l;
        totalP += p;
      });
      rwTotals.push(totalL, totalP, totalL + totalP);
      body.push(rwTotals);

      (doc as any).autoTable({
        head: [
          [
            { content: "NO", rowSpan: 2 },
            { content: "NO RT", rowSpan: 2 },
            {
              content: "JUMLAH KEPALA KELUARGA",
              colSpan: 3,
              styles: { halign: "center" },
            },
          ],
          [
            { content: "LAKI-LAKI" },
            { content: "PEREMPUAN" },
            { content: "JUMLAH" },
          ],
        ],
        body,
        startY: y,
        theme: "grid",
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
        didDrawCell: (data: any) => {
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1]?.toString().includes("JUMLAH RW")
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
            doc.setFont("helvetica", "bold");
          }
        },
        didParseCell: (data: any) => {
          // Highlight the last row (summary row) with gray background
          if (data.row.index === body.length - 1) {
            data.cell.styles.fillColor = [221, 221, 221]; // Light gray
            data.cell.styles.fontStyle = "bold"; // Optional: make text bold
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

    doc.save(
      `monografi-kepala-keluarga-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">
            Monografi Kepala Keluarga berdasarkan Jenis Kelamin
          </h1>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2  bg-green-900 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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

        {Object.entries(grouped).map(([rw, rtData]) => {
          let totalL = 0;
          let totalP = 0;

          return (
            <div
              key={rw}
              className="bg-white rounded shadow-md overflow-x-auto"
            >
              <h2 className="text-lg font-semibold px-4 py-2">
                NO RW : {rw.padStart(3, "0")}
              </h2>
              <table className="min-w-full text-sm border border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2" rowSpan={2}>
                      NO
                    </th>
                    <th className="border px-3 py-2" rowSpan={2}>
                      NO RT
                    </th>
                    <th className="border px-3 py-2" colSpan={3}>
                      JUMLAH KEPALA KELUARGA
                    </th>
                  </tr>
                  <tr>
                    <th className="border px-3 py-1">LAKI-LAKI</th>
                    <th className="border px-3 py-1">PEREMPUAN</th>
                    <th className="border px-3 py-1">JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rtData).map(([rt, list], idx) => {
                    const kepala = list.filter(
                      (r) => r.shdk === "Kepala Keluarga"
                    );
                    const l = kepala.filter(
                      (r) => r.gender === "Laki-laki"
                    ).length;
                    const p = kepala.filter(
                      (r) => r.gender === "Perempuan"
                    ).length;
                    totalL += l;
                    totalP += p;
                    return (
                      <tr key={rt} className="text-center">
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">
                          RT. {rt.padStart(3, "0")}
                        </td>
                        <td className="border px-2 py-1">{l}</td>
                        <td className="border px-2 py-1">{p}</td>
                        <td className="border px-2 py-1 font-semibold">
                          {l + p}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-gray-200">
                    <td className="border px-2 py-1" colSpan={2}>
                      JUMLAH RW : {rw.padStart(3, "0")}
                    </td>
                    <td className="border px-2 py-1">{totalL}</td>
                    <td className="border px-2 py-1">{totalP}</td>
                    <td className="border px-2 py-1">{totalL + totalP}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonografiKepalaKeluarga;
