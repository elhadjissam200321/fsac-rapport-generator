import { useRef, useState } from "react";
import { Document, Paragraph, Packer, ImageRun } from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
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
    const element = document.getElementById("cover-page");
    if (!element) {
      setLoadingDocx(false);
      return;
    }

    try {
      // Capture at 3x scale for high resolution
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const dataUrl = canvas.toDataURL("image/png");
      const base64Data = dataUrl.split(",")[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        view[i] = binaryData.charCodeAt(i);
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 0, bottom: 0, left: 0, right: 0 }
            }
          },
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: arrayBuffer,
                  transformation: {
                    width: 595.28, // A4 width in points
                    height: 841.89, // A4 height in points
                  },
                }),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Page_de_Garde_${(data.sujet || "Rapport").replace(/\s+/g, '_')}.docx`);
    } catch (error) {
      console.error("DOCX Export Error:", error);
      alert("Erreur lors de l'export Word.");
    } finally {
      setLoadingDocx(false);
    }
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

      <section className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-[10px] font-bold text-blue-600 uppercase block">Mode de rendu</label>
            <p className="text-[9px] text-slate-400">Équipe ou Individuel (gras)</p>
          </div>
          <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => update("isSolo", false)}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${!data.isSolo ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >ÉQUIPE</button>
            <button
              onClick={() => update("isSolo", true)}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${data.isSolo ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >INDIVIDUEL</button>
          </div>
        </div>
      </section>

      <Section title="Document">
        <Field label="Type de document (ex: Rapport / Thèse)" value={data.documentType} onChange={(v) => update("documentType", v)} placeholder="Projet de fin de module" />
        <Field label="Diplôme / Master / Option" value={data.master} onChange={(v) => update("master", v)} placeholder="Master en Mathématiques et Informatique" />
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
        <div className="space-y-2">
          {data.students.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={`flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all ${i === 0 && data.isSolo ? "border-blue-300 ring-2 ring-blue-100 bg-blue-50/30 font-bold" : "border-slate-200 focus:ring-blue-400"}`}
                placeholder={i === 0 && data.isSolo ? "Votre nom (en gras)" : "Nom et Prénom"}
                value={s.name}
                onChange={(e) => updateStudent(i, "name", e.target.value)}
              />
              {data.students.length > 1 && (
                <button onClick={() => removeStudent(i)} className="p-1 px-2 text-slate-300 hover:text-red-500 transition-colors text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addStudent} className="w-full mt-2 py-1.5 border-2 border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all uppercase tracking-wider">+ Ajouter un étudiant</button>
        {data.isSolo && (
          <p className="text-[9px] text-blue-500 mt-2 font-medium bg-blue-50 p-1.5 rounded-md border border-blue-100 leading-tight">
            ℹ️ <b>Mode Individuel activé</b> : Le premier nom sera mis en évidence (gras) sur la page de garde.
          </p>
        )}
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