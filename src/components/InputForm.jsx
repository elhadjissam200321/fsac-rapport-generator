import { useRef, useState } from "react";
import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, Packer, ImageRun } from "docx";
import { saveAs } from "file-saver";
import fsacLogo from "../FSAC LOGO.jpg";

const templates = [
  { id: "ensias1", label: "Rapport (Fsac)" },
];

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      <input
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value || ""}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest border-b border-blue-100 pb-1">{title}</p>
      {children}
    </div>
  );
}

function FormattingToolbar({ data, update }) {
  return (
    <div className="flex gap-1 mb-1">
      <button
        type="button"
        onClick={() => update("titleBold", !data.titleBold)}
        className={`px-2 py-1 text-xs font-bold border rounded transition ${data.titleBold ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
      >B</button>
      <button
        type="button"
        onClick={() => update("titleItalic", !data.titleItalic)}
        className={`px-2 py-1 text-xs italic border rounded transition ${data.titleItalic ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"}`}
      >I</button>
      <select
        value={data.titleSize || "14"}
        onChange={(e) => update("titleSize", e.target.value)}
        className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {["10", "11", "12", "13", "14", "15", "16", "18", "20", "22", "24", "26", "28", "32"].map(s => (
          <option key={s} value={s}>{s}pt</option>
        ))}
      </select>
    </div>
  );
}

export default function InputForm({ data, update }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  const updateStudent = (idx, field, val) => {
    const students = [...data.students];
    students[idx] = { ...students[idx], [field]: val };
    update("students", students);
  };

  const addStudent = () => update("students", [...data.students, { name: "", cne: "" }]);
  const removeStudent = (idx) => update("students", data.students.filter((_, i) => i !== idx));

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
        pagebreak: { mode: "avoid-all" }
      })
      .from(element)
      .save();
    setLoadingPdf(false);
  };

  const exportDOCX = async () => {
    setLoadingDocx(true);
    const blue = "1A3A6E";
    // Precise unit conversion: 1mm = 56.7 twips
    const mmToTwips = (mm) => Math.round(mm * 56.7);
    const ptToHalfPt = (pt) => Math.round(pt * 2);

    const centered = (text, opts = {}) => new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: opts.after || mmToTwips(4) },
      children: [new TextRun({
        text: text || "",
        font: "Times New Roman",
        size: ptToHalfPt(opts.size || 12),
        ...opts
      })],
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
            spacing: { before: mmToTwips(8), after: mmToTwips(8) },
            children: [new TextRun({
              text: (text || "").toUpperCase(),
              bold: true,
              size: ptToHalfPt(parseInt(data.titleSize || 14)),
              font: "Times New Roman"
            })],
          })],
        })]
      })]
    });

    let logoImageRun = null;
    try {
      const response = await fetch(fsacLogo);
      const buffer = await response.arrayBuffer();
      // 100mm = 283 points (at 72dpi)
      logoImageRun = new ImageRun({
        data: buffer,
        transformation: { width: 283, height: 71 }, // Aspect ratio preserved
      });
    } catch (e) {
      console.error("Logo load failed for docx:", e);
    }

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: mmToTwips(20), bottom: mmToTwips(20), left: mmToTwips(20), right: mmToTwips(20) } } },
        children: [
          // Header Logo
          logoImageRun ? new Paragraph({ alignment: AlignmentType.CENTER, children: [logoImageRun], spacing: { after: mmToTwips(15) } }) : new Paragraph({}),

          // Horizontal Line (matching CSS margin: 5mm 0)
          new Paragraph({
            border: { bottom: { color: blue, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { after: mmToTwips(5) },
            children: [],
          }),

          centered(data.documentType || "PROJET DE FIN DE MODULE", { italics: true, size: 14, after: mmToTwips(4) }),
          centered(data.UE || "Mathématiques", { bold: true, size: 16, color: blue, after: mmToTwips(12) }),

          titleBox(data.projectTitle),
          new Paragraph({ spacing: { after: mmToTwips(25) }, children: [] }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ border: { bottom: { color: blue, style: BorderStyle.SINGLE, size: 6 } }, spacing: { after: mmToTwips(2) }, children: [new TextRun({ text: "Rapport réalisé par l’équipe :", italics: true, font: "Times New Roman" })] }),
                      ...(data.students || []).map(s => new Paragraph({ spacing: { before: mmToTwips(1) }, children: [new TextRun({ text: s.name, bold: true, font: "Times New Roman", size: ptToHalfPt(13) })] }))
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { color: blue, style: BorderStyle.SINGLE, size: 6 } }, spacing: { after: mmToTwips(2) }, children: [new TextRun({ text: "Supervisé par :", italics: true, font: "Times New Roman" })] }),
                      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: mmToTwips(1) }, children: [new TextRun({ text: data.professor || "Pr. Nom Professeur", bold: true, font: "Times New Roman", size: ptToHalfPt(13), color: blue })] })
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: mmToTwips(30) }, children: [] }),
          new Paragraph({
            border: { bottom: { color: "000000", style: BorderStyle.SINGLE, size: 6 } },
            spacing: { after: mmToTwips(5) },
            children: [],
          }),
          centered(`Année Universitaire : ${data.academicYear || "2025/2026"}`, { bold: true, size: 12, color: blue }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Page_de_Garde_${(data.sujet || "Rapport").replace(/\s+/g, '_')}.docx`);
    setLoadingDocx(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5 h-full overflow-y-auto">
      <h2 className="font-serif text-base font-bold text-slate-800 border-b pb-2">⚙️ Paramètres</h2>

      <Section title="Modèle">
        <select
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={data.template}
          onChange={(e) => update("template", e.target.value)}
        >
          {templates.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Section>

      <Section title="Document">
        <Field label="Type de document (ex: Rapport / Thèse)" value={data.documentType} onChange={(v) => update("documentType", v)} placeholder="Projet de fin de module" />
        <Field label="Module / UE" value={data.UE} onChange={(v) => update("UE", v)} placeholder="Mathématiques" />
        <Field label="Sujet / Thème (opt.)" value={data.sujet} onChange={(v) => update("sujet", v)} placeholder="Optimisation" />
      </Section>

      <Section title="Titre du projet / rapport">
        <FormattingToolbar data={data} update={update} />
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          value={data.projectTitle || ""}
          placeholder={"Titre complet du projet...\n(Entrée = nouveau paragraphe)"}
          onChange={(e) => update("projectTitle", e.target.value)}
          style={{
            fontWeight: data.titleBold ? "bold" : "normal",
            fontStyle: data.titleItalic ? "italic" : "normal",
            fontSize: `${Math.min(data.titleSize || 14, 18)}px`,
          }}
        />
        <p className="text-xs text-slate-400">↵ Entrée = retour à la ligne dans l'aperçu</p>
      </Section>

      <Section title="Étudiants (Réalisé par)">
        {data.students.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Nom et Prénom"
              value={s.name}
              onChange={(e) => updateStudent(i, "name", e.target.value)}
            />
            {data.students.length > 1 && (
              <button onClick={() => removeStudent(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            )}
          </div>
        ))}
        <button onClick={addStudent} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Ajouter un étudiant</button>
      </Section>

      <Section title="Encadrement">
        <Field label="Encadré par" value={data.professor} onChange={(v) => update("professor", v)} placeholder="Pr. Nom Professeur" />
      </Section>

      <Section title="Année universitaire">
        <Field label="Année universitaire" value={data.academicYear} onChange={(v) => update("academicYear", v)} placeholder="2025/2026" />
      </Section>

      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
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
      </div>
    </div>
  );
}