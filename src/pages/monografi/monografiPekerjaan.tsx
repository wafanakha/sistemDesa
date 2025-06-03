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
    const doc = new jsPDF();
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
    doc.text(
      "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN AGAMA",
      pageWidth / 2,
      34,
      { align: "center" }
    );
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

    const body = data.map((row) => [
      row.no,
      row.job,
      row.male,
      row.female,
      row.total,
    ]);

    body.push(["", "TOTAL", totalL, totalP, totalAll]);

    (doc as any).autoTable({
      head: [["NO", "PEKERJAAN", "LK", "PR", "JUMLAH"]],
      body,
      startY: 24,
      styles: {
        fontSize: 9,
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
    });

    doc.save(
      `monografi-pekerjaan-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          Monografi Berdasarkan Pekerjaan
        </h1>
        <button
          onClick={generatePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-blue-100 text-blue-900">
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
            <tr className="font-bold text-center bg-blue-50">
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
  );
};

export default MonografiPekerjaan;
