import { useState } from "react";
import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, Packer, ImageRun } from "docx";
import { saveAs } from "file-saver";
import fsacLogo from "../FSAC LOGO.jpg";

export default function ExportButtons({ data }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  const exportPDF = async () => {
    setLoadingPdf(true);
    const element = document.getElementById("cover-page");
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: 0,
        filename: `Page_de_Garde_${(data.sujet || "Rapport").replace(/\s+/g, '_')}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
    setLoadingPdf(false);
  };

  const exportDOCX = async () => {
    setLoadingDocx(true);
    const blue = "1A3A6E";
    const centered = (text, opts = {}) => new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: text || "", font: "Times New Roman", ...opts })],
    });

    const makeHR = () => new Paragraph({
      border: { bottom: { color: "000000", style: BorderStyle.SINGLE, size: 6 } },
      spacing: { after: 200 }, children: [],
    });

    const titleBox = (text) => new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 300 },
            children: [new TextRun({
              text: (text || "").toUpperCase(),
              bold: true,
              size: parseInt(data.titleSize || 14) * 2,
              font: "Times New Roman"
            })],
          })],
        })]
      },
      )]
    });

    // Prepare logo buffer
    let logoImageRun = null;
    try {
      const response = await fetch(fsacLogo);
      const buffer = await response.arrayBuffer();
      logoImageRun = new ImageRun({
        data: buffer,
        transformation: { width: 380, height: 95 },
      });
    } catch (e) {
      console.error("Logo load failed for docx:", e);
    }

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          logoImageRun ? new Paragraph({ alignment: AlignmentType.CENTER, children: [logoImageRun], spacing: { after: 400 } }) : new Paragraph({}),

          centered(data.documentType || "PROJET DE FIN DE MODULE", { italics: true, size: 28 }),
          centered(data.UE || "Mathématiques", { bold: true, size: 32, color: blue }),
          new Paragraph({ spacing: { after: 600 }, children: [] }),

          titleBox(data.projectTitle),
          new Paragraph({ spacing: { after: 1200 }, children: [] }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ border: { bottom: { color: blue, style: BorderStyle.SINGLE, size: 6 } }, spacing: { after: 100 }, children: [new TextRun({ text: "Rapport réalisé par l’équipe :", italics: true, font: "Times New Roman" })] }),
                      ...(data.students || []).map(s => new Paragraph({ children: [new TextRun({ text: s.name, bold: true, font: "Times New Roman", size: 26 })] }))
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { color: blue, style: BorderStyle.SINGLE, size: 6 } }, spacing: { after: 100 }, children: [new TextRun({ text: "Supervisé par :", italics: true, font: "Times New Roman" })] }),
                      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.professor || "Pr. Nom Professeur", bold: true, font: "Times New Roman", size: 26, color: blue })] })
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 1500 }, children: [] }),
          makeHR(),
          centered(`Année Universitaire : ${data.academicYear || "2024/2025"}`, { bold: true, size: 24, color: blue }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Page_de_Garde_${(data.sujet || "Rapport").replace(/\s+/g, '_')}.docx`);
    setLoadingDocx(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
      <h2 className="font-serif text-base font-bold text-slate-800 border-b pb-2">📤 Exporter</h2>

      <button
        onClick={exportPDF}
        disabled={loadingPdf}
        className="w-full py-2.5 px-4 bg-[#1a3a6e] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loadingPdf ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Génération PDF...</>
        ) : (
          "📄 Exporter en PDF"
        )}
      </button>

      <button
        onClick={exportDOCX}
        disabled={loadingDocx}
        className="w-full py-2.5 px-4 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loadingDocx ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Génération Word...</>
        ) : (
          "📝 Exporter en Word (.docx)"
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">Format A4 · Impression prête</p>
    </div>
  );
}