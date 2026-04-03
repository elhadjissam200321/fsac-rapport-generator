import { forwardRef } from "react";
import fsacLogo from "../FSAC LOGO.jpg";

const BLUE = "#1a3a6e";
const LIGHT_BLUE = "#4a90c4";

// Helper: render multiline text with <br> support
function MultilineText({ text, style }) {
  if (!text) return null;
  const lines = String(text).split("\n");
  return (
    <div style={style}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}

const CoverPreview = forwardRef(function CoverPreview({ data }, ref) {
  return <TemplateENSIAS data={data} ref={ref} />;
});

export default CoverPreview;

/* ══════════════════════════════════════════════
   TEMPLATE ENSIAS — STYLE 1
   ══════════════════════════════════════════════ */
const TemplateENSIAS = forwardRef(function TemplateENSIAS({ data }, ref) {
  const combinedLogo = "/fsac-logo.jpg";

  const DARK_BLUE = "#1A3A6E";

  const titleStyle = {
    fontWeight: "bold",
    fontSize: `${data.titleSize || 28}pt`,
    textAlign: "center",
    color: DARK_BLUE,
    lineHeight: 1.2,
    textTransform: "uppercase",
    fontFamily: "'Times New Roman', Times, serif",
  };

  return (
    <div ref={ref} id="cover-page" style={{
      width: "210mm", height: "297mm",
      backgroundColor: "#fff",
      fontFamily: "'Times New Roman', Times, serif",
      color: "#000",
      display: "flex", flexDirection: "column",
      padding: "15mm 25mm",
      boxSizing: "border-box",
      boxShadow: "0 4px 40px rgba(0,0,0,0.18)",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Header: Centered Logo & Master/Diplôme */}
      {/* Header: Centered Logo */}
      <div style={{ textAlign: "center", marginBottom: "5mm", display: "flex", justifyContent: "center" }}>
        <img src={combinedLogo} alt="Logo" style={{ width: "100mm", objectFit: "contain", display: "block" }} />
      </div>

      <div style={{ height: "1px", backgroundColor: DARK_BLUE, width: "100%", margin: "5mm 0" }} />

      {/* Academic Info: Master & UE (After Divider) */}
      <div style={{ textAlign: "center", marginTop: "3mm", display: "flex", flexDirection: "column", gap: "2mm" }}>
        {data.master && (
          <div style={{ fontSize: "16pt", fontWeight: "bold", color: "#444", textTransform: "uppercase" }}>
            {data.master}
          </div>
        )}
        <div style={{ fontSize: "15pt", fontStyle: "italic", color: "#555", marginTop: "1mm" }}>
          {data.documentType || "Projet de fin de module"}
        </div>
        <div style={{ fontSize: "18pt", fontWeight: "bold", color: DARK_BLUE }}>
          {data.UE || "Mathématiques pour l’analyse des données"}
        </div>
      </div>

      <div style={{ flex: 0.2 }} />

      {/* Project content with Border/Outline */}
      <div style={{
        margin: "12mm 0",
        padding: "8mm 12mm",
        border: `2px solid ${DARK_BLUE}`,
        borderRadius: "4px",
        boxShadow: `inset 0 0 0 2px white, 0 0 0 2px ${DARK_BLUE}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "35mm"
      }}>
        <MultilineText text={data.projectTitle || "TITRE DU PROJET"} style={titleStyle} />
      </div>

      <div style={{ flex: 1 }} />

      {/* 2-Column Team & Supervisor section */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10mm", marginBottom: "15mm" }}>
        {/* Team Column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12pt", fontStyle: "italic", marginBottom: "3mm", color: "#333", borderBottom: `1px solid ${DARK_BLUE}`, display: "inline-block" }}>
            {data.isSolo ? "Réalisé par :" : "Rapport réalisé par l’équipe :"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1mm" }}>
            {(data.students || []).map((s, i) => (
              <div key={i} style={{
                fontSize: "13pt",
                fontWeight: (i === 0 && data.isSolo) || !data.isSolo ? "bold" : "normal",
                color: (i === 0 && data.isSolo) ? "#000" : (data.isSolo ? "#666" : "#000")
              }}>
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Supervisor Column */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: "12pt", fontStyle: "italic", marginBottom: "3mm", color: "#333", borderBottom: `1px solid ${DARK_BLUE}`, display: "inline-block" }}>
            Supervisé par :
          </div>
          <div style={{ fontSize: "13pt", fontWeight: "bold", color: DARK_BLUE }}>
            {data.professor || "Pr. Nom Professeur"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "auto", borderTop: "1px solid #ccc", paddingTop: "5mm" }}>
        <div style={{ fontSize: "12pt", fontWeight: "bold", color: DARK_BLUE }}>
          Année Universitaire : {data.academicYear || "2024/2025"}
        </div>
      </div>

    </div>
  );
});