import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FileText, Search, Shield, Zap, AlertTriangle, Loader2, Cpu, Database, Eye, Globe, MapPin, Calendar, HardDrive } from 'lucide-react';
import axios from 'axios';
import ExifReader from 'exifreader';
import { cn } from '../lib/utils';


interface ExifData {
  filename: string;
  camera?: string;
  software?: string;
  location?: string;
  timestamp?: string;
  author?: string;
  exposure?: string;
  sensitive_fragments?: string[];
}

export default function MetaExif() {
  const [isScanning, setIsScanning] = useState(false);
  const [exifResults, setExifResults] = useState<ExifData[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionMode, setExtractionMode] = useState<'exif' | 'docx'>('exif');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setAiInsight(null);
    setExifResults([]);

    try {
      const results: ExifData[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let tags: any = {};
        try {
          tags = await ExifReader.load(file);
        } catch (err) {
          console.error("Error reading exif: ", err);
        }

        const cameraModels = [];
        if (tags.Make?.description) cameraModels.push(tags.Make.description);
        if (tags.Model?.description) cameraModels.push(tags.Model.description);
        
        const camera = cameraModels.length > 0 ? cameraModels.join(" ") : "Unknown Device";
        const software = tags.Software?.description || "Unknown Software";
        
        let location = "Not found";
        if (tags.GPSLatitude && tags.GPSLongitude) {
          const lat = tags.GPSLatitude.description;
          const lon = tags.GPSLongitude.description;
          location = `${lat}, ${lon}`;
        }
        
        let timestamp = "Unknown";
        if (tags.DateTimeOriginal?.description) {
          timestamp = tags.DateTimeOriginal.description;
        } else if (tags.DateTime?.description) {
          timestamp = tags.DateTime.description;
        } else if (file.lastModified) {
          timestamp = new Date(file.lastModified).toLocaleString();
        }

        const author = tags.Artist?.description || "Unknown";
        
        let exposure = [];
        if (tags.ExposureTime?.description) exposure.push(`${tags.ExposureTime.description}s`);
        if (tags.FNumber?.description) exposure.push(tags.FNumber.description);
        if (tags.ISOSpeedRatings?.description) exposure.push(`ISO ${tags.ISOSpeedRatings.description}`);
        
        const sensitive_fragments = [];
        if (tags.GPSLatitude) sensitive_fragments.push("GPS_COORDINATES");
        if (tags.SerialNumber || tags.InternalSerialNumber) sensitive_fragments.push("DEVICE_SERIAL");
        if (author !== "Unknown") sensitive_fragments.push("AUTHOR_METADATA");
        
        results.push({
          filename: file.name,
          camera,
          software,
          location,
          timestamp,
          author,
          exposure: exposure.length > 0 ? exposure.join(' ') : "Not found",
          sensitive_fragments
        });
      }
      setExifResults(results);
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const runAiAnalysis = async () => {
    if (exifResults.length === 0) return;
    setIsAnalyzing(true);

    try {
      const res = await axios.post('/api/analyze/vulnerability', {
        code: JSON.stringify(exifResults),
        context: "Metadata forensics and identity attribution analysis",
        tool_preference: "Digital Forensics Expert"
      });
      setAiInsight(res.data.analysis);
      
      await axios.post('/api/intelligence/save', {
        tool: "META_EXIF_FORENSICS",
        strategy: "Identity Enrichment via Metadata",
        findings: `Extracted forensics from ${exifResults.length} assets.`,
        next_steps: res.data.analysis
      });
    } catch (err) {
      setAiInsight("Neural forensic link interrupted.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <Camera className="w-6 h-6 text-accent-red" />
            META_INTELLIGENCE_CORE
          </h2>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold mt-1">
            Forensic Metadata Extraction & Identity Attribution // AI forensics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-4 space-y-4">
          <div className="panel bg-surface/50 border-accent-red/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-accent-red"></div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Asset Ingest</h3>
            </div>
            
            <label className="group h-32 border-2 border-dashed border-border-main rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent-red/50 hover:bg-accent-red/5 transition-all">
              <HardDrive className="w-8 h-8 text-text-dim group-hover:text-accent-red transition-colors mb-2" />
              <span className="text-[10px] font-black text-text-dim uppercase group-hover:text-white">Ingest Tactical Media</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-[9px] text-text-dim uppercase font-bold mb-2">Extraction Engine</div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setExtractionMode('exif')}
                  className={cn(
                    "py-2 rounded text-[8px] font-black uppercase transition-all",
                    extractionMode === 'exif' ? "bg-accent-red text-bg-dark" : "bg-bg-dark border border-border-main text-text-dim hover:text-white"
                  )}
                >
                  EXIF_PROBE
                </button>
                <button 
                  onClick={() => setExtractionMode('docx')}
                  className={cn(
                    "py-2 rounded text-[8px] font-black uppercase transition-all",
                    extractionMode === 'docx' ? "bg-accent-red text-bg-dark" : "bg-bg-dark border border-border-main text-text-dim hover:text-white"
                  )}
                >
                  DOCX_XML_SIFT
                </button>
              </div>
            </div>
          </div>

          {exifResults.length > 0 && (
            <button 
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 bg-accent-red text-bg-dark rounded font-black text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,100,100,0.2)]"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
              NEURAL_IDENTITY_SYNC
            </button>
          )}

          <div className="panel flex-1 overflow-hidden">
             <div className="text-[10px] font-bold text-text-dim uppercase mb-3 flex items-center gap-2">
               <Eye className="w-3.5 h-3.5" /> Discovery Stream
             </div>
             <div className="space-y-2 overflow-y-auto custom-scrollbar h-[200px]">
               {exifResults.map((res, i) => (
                 <div key={i} className="text-[11px] font-mono text-white/50 flex justify-between p-1 hover:bg-white/5 rounded">
                   <span>{res.filename}</span>
                   <span className="text-accent-red">SIG_DET</span>
                 </div>
               ))}
               {exifResults.length === 0 && <p className="text-[10px] text-text-dim italic text-center mt-10">No assets detected</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="panel flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {exifResults.map((result, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-red/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent-red" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white italic truncate max-w-[300px]">{result.filename}</div>
                      <div className="text-[10px] text-accent-red font-bold uppercase tracking-widest">Tactical Artifact Identified</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-text-dim">{result.timestamp}</div>
                    <div className="text-[9px] font-bold text-white/30 uppercase mt-0.5">Hash: {Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-[11px]">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3 h-3" /> Capture Hardware
                    </div>
                    <div className="text-white font-mono">{result.camera}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-accent-red" /> Tactical Origin
                    </div>
                    <div className="text-white font-mono">{result.location}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3 h-3" /> System Software
                    </div>
                    <div className="text-white font-mono">{result.software}</div>
                  </div>
                  <div className="space-y-1 lg:col-span-3">
                     <div className="text-[9px] font-black text-accent-red uppercase tracking-wider mb-2">Detected Forensic Flags</div>
                     <div className="flex gap-2">
                       {result.sensitive_fragments?.map((frag, idx) => (
                         <span key={idx} className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-2 py-1 rounded text-[9px] font-black uppercase italic tracking-tighter">
                           [!] {frag}
                         </span>
                       ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {exifResults.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-text-dim italic opacity-20">
                <Search className="w-16 h-16 mb-4 animate-pulse" />
                <p className="text-[12px] uppercase font-black tracking-[0.3em]">Ready for Forensic Payload Injection</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {aiInsight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="panel bg-accent-red/5 border-accent-red/20 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-3.5 h-3.5 text-accent-red animate-pulse" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic font-mono">Neural Profiling Engine</h3>
                </div>
                <div className="text-[13px] text-text-main/90 font-light leading-relaxed prose prose-invert prose-sm max-w-none prose-red">
                  {aiInsight}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
