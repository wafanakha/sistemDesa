import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Resident } from "../../types";

const getOccupationList = (residents: Resident[]) => {
  const set = new Set<string>();
  residents.forEach((r) => {
    if (r.occupation?.trim()) set.add(r.occupation.trim());
  });
  return Array.from(set).sort();
};

const MonografiPekerjaan = ({ residents }: { residents: Resident[] }) => {
  const occupationList = getOccupationList(residents);

  const data = occupationList.map((job, i) => {
    const male = residents.filter(
      (r) => r.occupation === job && r.gender === "Laki-laki"
    ).length;
    const female = residents.filter(
      (r) => r.occupation === job && r.gender === "Perempuan"
    ).length;
    return {
      no: i + 1,
      job,
      male,
      female,
      total: male + female,
    };
  });

  const totalL = data.reduce((acc, d) => acc + d.male, 0);
  const totalP = data.reduce((acc, d) => acc + d.female, 0);
  const totalAll = totalL + totalP;

  const generatePDF = () => {
    const doc = new jsPDF("portrait", "mm", "a4");
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
    const title = "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN PEKERJAAN";
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

    const body = data.map((row) => [
      row.no,
      row.job,
      row.male,
      row.female,
      row.total,
    ]);

    body.push(["", "JUMLAH", totalL, totalP, totalAll]);

    (doc as any).autoTable({
      head: [["NO", "PEKERJAAN", "LK", "PR", "JUMLAH"]],
      body,
      margin: { left: 20, right: 20 },

      startY: y,
      styles: {
        fontSize: 9,
        halign: "center",
        valign: "middle",
        cellPadding: 1,
        lineColor: [0, 0, 0], // Set grid lines to black
        lineWidth: 0.1,
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

    doc.save(
      `monografi-pekerjaan-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">
            Monografi Berdasarkan Pekerjaan
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

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-green-100 text-green-900">
              <tr>
                <th className="border px-2 py-1">NO</th>
                <th className="border px-2 py-1">PEKERJAAN</th>
                <th className="border px-2 py-1">LK</th>
                <th className="border px-2 py-1">PR</th>
                <th className="border px-2 py-1">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.no} className="text-center">
                  <td className="border px-2 py-1">{row.no}</td>
                  <td className="border px-2 py-1 text-left">{row.job}</td>
                  <td className="border px-2 py-1">{row.male}</td>
                  <td className="border px-2 py-1">{row.female}</td>
                  <td className="border px-2 py-1">{row.total}</td>
                </tr>
              ))}
              <tr className="font-bold text-center bg-green-50">
                <td className="border px-2 py-1" colSpan={2}>
                  TOTAL
                </td>
                <td className="border px-2 py-1">{totalL}</td>
                <td className="border px-2 py-1">{totalP}</td>
                <td className="border px-2 py-1">{totalAll}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonografiPekerjaan;
