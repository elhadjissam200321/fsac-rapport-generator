import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InputForm from "../components/InputForm";
import CoverPreview from "../components/CoverPreview";

export const defaultData = {
  template: "ensias1",
  universityName: "Université Hassan II de Casablanca",
  faculty: "Faculté des Sciences Aïn Chock",
  department: "Département de Mathématiques et Informatique",
  city: "Casablanca",
  program: "Mathématiques",
  parcours: "",
  documentType: "Projet de fin de module",
  documentSubtype: "",
  centreLabel: "",
  centreSubLabel: "",
  diplomeText: "",
  option: "",
  sousTheme: "",
  projectTitle: "OPTIMISATION DES FLUX DANS LES RÉSEAUX DE TRANSPORT",
  titleBold: true,
  titleItalic: false,
  titleSize: "28",
  students: [
    { name: "Ahmed EL ALAMI", cne: "" },
    { name: "Sara BENNANI", cne: "" }
  ],
  professor: "CHERGUI BRAHIM",
  master: "",
  isSolo: false,
  academicYear: "2025/2026",
  UE: "Mathématiques",
  sujet: "Optimisation et Recherche Opérationnelle",
};

export default function Home() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("coverPageDataFSAC");
      let base = saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;

      // Override with URL parameters
      const params = new URLSearchParams(window.location.search);
      const overrides = {};

      // Simple fields
      const fields = ["template", "documentType", "UE", "sujet", "projectTitle", "professor", "academicYear", "master", "titleSize"];
      fields.forEach(f => {
        if (params.has(f)) overrides[f] = params.get(f);
      });

      // Boolean fields
      if (params.has("isSolo")) overrides.isSolo = params.get("isSolo") === "true";
      if (params.has("titleBold")) overrides.titleBold = params.get("titleBold") === "true";
      if (params.has("titleItalic")) overrides.titleItalic = params.get("titleItalic") === "true";

      // Handling students (e.g., student1=Name, student2=Name)
      const students = [];
      for (let i = 1; i <= 5; i++) {
        if (params.has(`student${i}`)) {
          students.push({ name: params.get(`student${i}`), cne: "" });
        }
      }
      if (students.length > 0) overrides.students = students;

      return { ...base, ...overrides };
    } catch {
      return defaultData;
    }
  });
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setIsSaved(false);
    const timeout = setTimeout(() => {
      const { logoUrl, logoRight, ...toSave } = data;
      localStorage.setItem("coverPageDataFSAC", JSON.stringify(toSave));
      setIsSaved(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleShare = () => {
    const params = new URLSearchParams();
    const fields = ["template", "documentType", "UE", "sujet", "projectTitle", "professor", "academicYear", "master", "isSolo", "titleSize", "titleBold", "titleItalic"];
    fields.forEach(f => {
      if (data[f] !== undefined && data[f] !== null) params.set(f, data[f]);
    });
    data.students.forEach((s, i) => {
      if (s.name) params.set(`student${i + 1}`, s.name);
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié ! Partagez-le avec votre groupe.");
  };

  // Calculate preview scale
  const isMobile = windowWidth < 1024;
  const containerWidth = isMobile ? windowWidth - 32 : (windowWidth - 420 - 48);
  const a4WidthPx = (210 * 96) / 25.4; // ~793.7px
  const targetScale = Math.min(containerWidth / a4WidthPx, 1) * (isMobile ? 0.95 : 0.8);

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-gradient-to-r from-[#1a3a6e] to-[#2a4e8a] border-b border-blue-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-4 lg:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-yellow-400 rounded-xl shadow-inner flex items-center justify-center transform hover:rotate-12 transition-transform">
              <span className="text-[#1a3a6e] font-black text-lg lg:text-xl">F</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base lg:text-xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Générateur <span className="hidden sm:inline">Page de Garde</span> <span className="text-yellow-400">/</span> FSAC
              </h1>
              <p className="text-blue-100 text-[10px] lg:text-sm font-medium tracking-wide opacity-90 truncate max-w-[200px] sm:max-w-none">
                Faculté des Sciences Aïn Chock <span className="mx-1 opacity-50">·</span> Université Hassan II
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pdf-tools"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold hover:bg-blue-500/40 transition-all uppercase tracking-wider whitespace-nowrap"
            >
              🛠️ <span className="hidden xs:inline">Outils</span>
            </Link>
            <button
              onClick={handleShare}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold hover:bg-emerald-500/40 transition-all uppercase tracking-wider whitespace-nowrap"
            >
              🔗 <span className="hidden xs:inline">Partager</span>
            </button>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${isSaved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
              <span className={`w-2 h-2 rounded-full ${isSaved ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400 animate-pulse"}`}></span>
              <span className="hidden xs:inline">{isSaved ? "Sauvegardé" : "En cours..."}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 mb-20 lg:mb-0">
        <aside className="w-full lg:w-[420px] lg:sticky lg:top-24 h-fit">
          <InputForm data={data} update={update} />
        </aside>
        <main className="flex-1 min-w-0">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm bg-white/50 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Aperçu en temps réel (A4)
            </div>
            <div className="w-full overflow-hidden flex justify-center bg-slate-200/50 rounded-2xl border-2 border-dashed border-slate-300 p-4 min-h-[500px]">
              <div
                style={{
                  transform: `scale(${targetScale})`,
                  transformOrigin: "top center",
                  width: "210mm",
                  height: "297mm",
                  marginBottom: `calc(297mm * (${targetScale} - 1))`
                }}
                className="shadow-2xl ring-1 ring-slate-300"
              >
                <CoverPreview data={data} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center gap-1 text-blue-600">
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Éditeur</span>
        </Link>
        <Link to="/pdf-tools" className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">🛠️</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Outils PDF</span>
        </Link>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-slate-500">
          <span className="text-xl">🔗</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Partager</span>
        </button>
      </nav>
    </div>
  );
}