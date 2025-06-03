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
    const doc = new jsPDF("landscape");
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

    doc.setFontSize(13);
    doc.text("REKAPITULASI JUMLAH KEPALA KELUARGA", pageWidth / 2, 34, {
      align: "center",
    });

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
      const body: any[] = [];
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

      // RW Total Row
      body.push([
        "",
        `JUMLAH RW : ${rw.padStart(3, "0")}`,
        totalL,
        totalP,
        totalL + totalP,
      ]);

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
        headStyles: {
          fillColor: [80, 80, 80],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawCell: (data: any) => {
          if (
            data.row.index === body.length - 1 &&
            data.row.raw[1]?.toString().includes("JUMLAH RW")
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
            doc.setFont("helvetica", "bold");
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
      `monografi-kepala-keluarga-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Monografi Kepala Keluarga
        </h1>
        <button
          onClick={generatePDF}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {Object.entries(grouped).map(([rw, rtData]) => {
        let totalL = 0;
        let totalP = 0;

        return (
          <div key={rw} className="bg-white rounded shadow-md overflow-x-auto">
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
  );
};

export default MonografiKepalaKeluarga;
