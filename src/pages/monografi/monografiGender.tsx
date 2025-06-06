import jsPDF from "jspdf";
import "jspdf-autotable";
import { Resident } from "../../types";
import { FootprintsIcon } from "lucide-react";

type Props = {
  residents: Resident[];
};

const MonografiGender = ({ residents }: Props) => {
  // Group by RW and RT
  const grouped = residents.reduce((acc, resident) => {
    const rw = resident.rw || "Unknown";
    const rt = resident.rt || "Unknown";
    const gender = resident.gender;

    if (!acc[rw]) acc[rw] = {};
    if (!acc[rw][rt]) acc[rw][rt] = { "Laki-laki": 0, Perempuan: 0 };

    acc[rw][rt][gender] += 1;
    return acc;
  }, {} as Record<string, Record<string, { "Laki-laki": number; Perempuan: number }>>);

  const exportPDF = () => {
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
    const title = "REKAPITULASI JUMLAH PENDUDUK BERDASARKAN JENIS KELAMIN ";
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

    Object.entries(grouped).forEach(([rw, rts], rwIndex) => {
      doc.setFont("helvetica", "bold");

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`NO RW : ${rw}`, 14, y);
      y += 4;
      doc.setFont("helvetica", "normal");

      type TableCell =
        | string
        | number
        | {
            content: string;
            colSpan?: number;
            styles?: { halign: string };
          };

      const tableBody: TableCell[][] = Object.entries(rts).map(
        ([rt, count], idx) => {
          const total = count["Laki-laki"] + count["Perempuan"];
          return [
            idx + 1,
            `RT. ${rt}`,
            count["Laki-laki"],
            count["Perempuan"],
            total,
          ];
        }
      );

      const totalRW = tableBody.reduce(
        (acc, row) => {
          acc.male += row[2] as number;
          acc.female += row[3] as number;
          acc.total += row[4] as number;
          return acc;
        },
        { male: 0, female: 0, total: 0 }
      );

      tableBody.push([
        {
          content: `JUMLAH RW : ${rw}`,
          colSpan: 2,
          styles: { halign: "center" },
        },
        totalRW.male,
        totalRW.female,
        totalRW.total,
      ]);

      (doc as any).autoTable({
        startY: y,
        head: [["NO", "NO RT", "LAKI-LAKI", "PEREMPUAN", "JUMLAH"]],
        body: tableBody,
        styles: {
          halign: "center",
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: 0,
        },
        headStyles: { fillColor: [221, 221, 221] },
        didParseCell: (data: any) => {
          // Highlight the last row (summary row) with gray background
          if (data.row.index === tableBody.length - 1) {
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

    doc.save("Monografi_Jenis_Kelamin_RW_RT.pdf");
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">
            Monografi Berdasarkan Jenis Kelamin
          </h1>
          <button
            onClick={exportPDF}
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

        {Object.entries(grouped).map(([rw, rts], idx) => {
          let totalMale = 0,
            totalFemale = 0;
          return (
            <div key={rw} className="mb-6 border rounded p-2 bg-white shadow">
              <h3 className="font-semibold text-md mb-2">NO RW : {rw}</h3>
              <table className="table-auto w-full text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-2">NO</th>
                    <th className="border px-2">NO RT</th>
                    <th className="border px-2">LAKI-LAKI</th>
                    <th className="border px-2">PEREMPUAN</th>
                    <th className="border px-2">JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rts).map(([rt, count], index) => {
                    const total = count["Laki-laki"] + count["Perempuan"];
                    totalMale += count["Laki-laki"];
                    totalFemale += count["Perempuan"];
                    return (
                      <tr key={rt} className="hover:bg-gray-100 text-center">
                        <td className="border px-2">{index + 1}</td>
                        <td className="border px-2">RT. {rt}</td>
                        <td className="border px-2">{count["Laki-laki"]}</td>
                        <td className="border px-2">{count["Perempuan"]}</td>
                        <td className="border px-2">{total}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-gray-100 text-center">
                    <td className="border px-2" colSpan={2}>
                      JUMLAH RW : {rw}
                    </td>
                    <td className="border px-2">{totalMale}</td>
                    <td className="border px-2">{totalFemale}</td>
                    <td className="border px-2">{totalMale + totalFemale}</td>
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

export default MonografiGender;
