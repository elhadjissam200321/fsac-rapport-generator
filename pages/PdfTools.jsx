import { useState } from "react";
import { Link } from "react-router-dom";
import { FileUp, Scissors, Combine, Download, ArrowLeft, Loader2, FileText } from "lucide-react";

export default function PdfTools() {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedUrl, setProcessedUrl] = useState(null);

    const getPdfLib = async () => {
        const { PDFDocument } = await import("https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm");
        return { PDFDocument };
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).filter(f => f.type === "application/pdf");
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (idx) => {
        setFiles(files.filter((_, i) => i !== idx));
    };

    const mergePdfs = async () => {
        if (files.length < 2) return alert("Veuillez sélectionner au moins 2 fichiers PDF.");
        setIsProcessing(true);
        try {
            const { PDFDocument } = await getPdfLib();
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            setProcessedUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error("Merge error:", error);
            alert("Erreur lors de la fusion des PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const splitPdfs = async () => {
        if (files.length === 0) return alert("Veuillez sélectionner un fichier PDF.");
        setIsProcessing(true);
        try {
            const { PDFDocument } = await getPdfLib();
            const file = files[0];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);

            // Basic split: Extract first page for demonstration, or could be more complex
            const splitPdf = await PDFDocument.create();
            const [copiedPage] = await splitPdf.copyPages(pdf, [0]);
            splitPdf.addPage(copiedPage);

            const pdfBytes = await splitPdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            setProcessedUrl(URL.createObjectURL(blob));
        } catch (error) {
            console.error("Split error:", error);
            alert("Erreur lors du découpage du PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-gradient-to-r from-[#1a3a6e] to-[#2a4e8a] text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Outils PDF & Documents</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">Fusionner ou Diviser vos PDF</h2>
                        <p className="text-slate-500">Glissez-déposez vos fichiers ici pour commencer</p>
                    </div>

                    <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl p-12 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <FileUp className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors mb-4" />
                        <span className="text-slate-600 font-semibold text-lg">Sélectionner des PDF</span>
                        <input type="file" className="hidden" multiple accept=".pdf" onChange={handleFileChange} />
                    </label>

                    {files.length > 0 && (
                        <div className="space-y-4 text-left">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileText size={18} /> Fichiers sélectionnés ({files.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">{f.name}</span>
                                        <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 font-bold p-1">&times;</button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={mergePdfs}
                                    disabled={files.length < 2 || isProcessing}
                                    className="flex-1 min-w-[150px] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <Combine size={18} />}
                                    Fusionner PDF
                                </button>
                                <button
                                    onClick={splitPdfs}
                                    disabled={files.length === 0 || isProcessing}
                                    className="flex-1 min-w-[150px] bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <Scissors size={18} />}
                                    Extraire Page 1
                                </button>
                            </div>
                        </div>
                    )}

                    {processedUrl && (
                        <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-bounce">
                                ✨ Fichier traité avec succès !
                            </div>
                            <a
                                href={processedUrl}
                                download="FSAC_Processed_Document.pdf"
                                className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-lg shadow-emerald-200"
                            >
                                <Download size={22} /> Télécharger le résultat
                            </a>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Combine size={20} /></span> Fusionner
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Combinez plusieurs fichiers PDF en un seul document. Idéal pour regrouper vos annexes et rapports.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                            <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><Scissors size={20} /></span> Diviser
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Séparez vos documents PDF. (Version actuelle: Extraction de la première page pour validation).
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
