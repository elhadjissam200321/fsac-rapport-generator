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
  const combinedLogo = fsacLogo;
  const watermark = "/home/godzilla/.gemini/antigravity/brain/97c47cb5-f4a5-40c4-9aad-4af25b62b5fc/ensias_background_watermark_1775244956084.png";

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
      backgroundImage: `url(${watermark})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>

      {/* Header: Centered Logo */}
      <div style={{ textAlign: "center", marginBottom: "15mm", display: "flex", justifyContent: "center" }}>
        <img src={combinedLogo} alt="Logo" style={{ width: "100mm", objectFit: "contain", display: "block" }} />
      </div>

      <div style={{ height: "1px", backgroundColor: DARK_BLUE, width: "100%", margin: "5mm 0" }} />

      {/* Title section (Dynamic) */}
      <div style={{ textAlign: "center", marginTop: "5mm" }}>
        <div style={{ fontSize: "16pt", fontStyle: "italic", color: "#444" }}>
          {data.documentType || "PROJET DE FIN DE MODULE"}
        </div>
        <div style={{ fontSize: "16pt", marginTop: "2mm", color: DARK_BLUE }}>
          <span style={{ fontWeight: "bold" }}>{data.UE || "Mathématiques"}</span>
        </div>
      </div>

      <div style={{ flex: 0.3 }} />

      {/* Project content with Border/Outline */}
      <div style={{
        margin: "15mm 0",
        padding: "8mm 12mm",
        border: `2px solid ${DARK_BLUE}`,
        borderRadius: "4px",
        boxShadow: `inset 0 0 0 2px white, 0 0 0 2px ${DARK_BLUE}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40mm"
      }}>
        <MultilineText text={data.projectTitle || "TITRE DU PROJET"} style={titleStyle} />
      </div>

      <div style={{ flex: 1 }} />

      {/* 2-Column Team & Supervisor section */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10mm", marginBottom: "15mm" }}>
        {/* Team Column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "12pt", fontStyle: "italic", marginBottom: "3mm", color: "#333", borderBottom: `1px solid ${DARK_BLUE}`, display: "inline-block" }}>
            Rapport réalisé par l’équipe :
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1mm" }}>
            {(data.students || []).map((s, i) => (
              <div key={i} style={{ fontSize: "13pt", fontWeight: "bold" }}>{s.name}</div>
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