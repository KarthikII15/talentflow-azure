// import React, { useEffect, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Cloud, Upload, FileText, Users, CheckCircle, XCircle,
//   AlertCircle, Activity, BrainCircuit, LayoutDashboard, Database,
//   ArrowRight, Sparkles, Server, Terminal, FileCheck, Search
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // --- API SETUP ---
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   timeout: 15000, // Fast fail for demo mode
// });

// // --- MOCK DATA (For Demo Mode) ---
// const MOCK_SETUP = {
//   bucket_name: "talentflow-demo-bucket",
//   upload_link: "https://storage.googleapis.com/demo-upload",
//   folders_created: ["incoming/", "JDs/", "Resumes/"]
// };

// const MOCK_LOGS = {
//   total_files: 5,
//   details: [
//     { file: "Senior_React_Dev.pdf", type: "JD", moved_to: "JDs/" },
//     { file: "Alice_Smith_CV.pdf", type: "RESUME", moved_to: "Resumes/" },
//     { file: "Backend_Python_Eng.docx", type: "JD", moved_to: "JDs/" },
//     { file: "Bob_Jones_Resume.docx", type: "RESUME", moved_to: "Resumes/" },
//     { file: "unknown_file.txt", type: "UNKNOWN", moved_to: "Others/" },
//   ]
// };

// const MOCK_JDS = [
//   { jd_id: "jd-1", file_name: "Senior_React_Dev.pdf", extracted_text: "Senior React Developer needed. Must have 5+ years experience in React, Redux, and TypeScript. Remote friendly." },
//   { jd_id: "jd-2", file_name: "Backend_Python_Eng.docx", extracted_text: "Seeking Python Backend Engineer. Experience with FastAPI, Docker, and Kubernetes is essential. High scalability focus." },
// ];

// const MOCK_CANDIDATES = [
//   { candidate_id: "c-1", file_name: "Alice_Smith_CV.pdf", extracted_text: "Alice Smith. Frontend Specialist. 6 years in React/Vue. Strong UI/UX skills." },
//   { candidate_id: "c-2", file_name: "Bob_Jones_Resume.docx", extracted_text: "Bob Jones. Backend Developer. 4 years python experience. Knows Django & AWS." },
//   { candidate_id: "c-3", file_name: "Charlie_Junior.pdf", extracted_text: "Charlie. Recent grad. Eager to learn full stack development." },
// ];

// // --- UTILITY ---
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // --- ANIMATION VARIANTS ---
// const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

// // --- MAIN COMPONENT ---
// export default function App() {
//   // --- STATE ---
//   const [activePhase, setActivePhase] = useState(1); // 1: Setup, 2: Ingest, 3: Recruit
//   const [loading, setLoading] = useState(false);
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   // Data
//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);
  
//   // Setup & Process
//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   // Recruiter Workspace
//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);
//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null); 
//   const [defaultSkillScore, setDefaultSkillScore] = useState(75);

//   // --- INITIALIZATION ---
//   useEffect(() => { refreshData(); }, []);
//   useEffect(() => { if (selectedJdId) fetchMappedCandidates(selectedJdId); }, [selectedJdId]);

//   const refreshData = async () => {
//     try {
//       const [jdsRes, candRes] = await Promise.all([api.get("/jds"), api.get("/candidates")]);
//       setJds(jdsRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);
//       setIsDemoMode(false);
//     } catch (e) { 
//       console.warn("Backend unreachable, switching to demo mode");
//       setIsDemoMode(true);
//       if (jds.length === 0) {
//         setJds(MOCK_JDS);
//         setCandidates(MOCK_CANDIDATES);
//       }
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     if (isDemoMode) {
//       // Filter mock mapped candidates if needed, or just return empty for demo flow
//       // We'll keep it simple for demo
//       return;
//     }
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`);
//       setMappedCandidates(res.data.candidates || []);
//     } catch (e) { toast.error("Failed to sync candidates."); }
//   };

//   // --- ACTIONS ---
  
//   // 1. Setup Cloud
//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
//       toast.success("Infrastructure Ready");
//     } catch (e) {
//       // Demo Fallback
//       setTimeout(() => {
//         setSetupData(MOCK_SETUP);
//         toast.info("Backend offline. Using Demo Environment.");
//       }, 1000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Process Files (Librarian)
//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, { params: { provider: "gcp" } });
//       setProcessLogs(res.data);
//       toast.success(`Classified ${res.data.total_files} documents`);
//       refreshData();
//     } catch (e) {
//       // Demo Fallback
//       setTimeout(() => {
//         setProcessLogs(MOCK_LOGS);
//         refreshData(); // Load mock JDs/Candidates
//         toast.success("Demo: Files Classified & Organized");
//       }, 1500);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 3. Map Candidate
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a Job Role first.");
//     setLoadingId(candidateId);
    
//     try {
//       await api.post("/map-candidate-to-jd", { jd_id: selectedJdId, candidate_id: candidateId, status: "PENDING" });
//       await fetchMappedCandidates(selectedJdId);
//       toast.success("Candidate mapped successfully");
//     } catch (e) { 
//       // Demo Fallback
//       const candidate = candidates.find(c => c.candidate_id === candidateId);
//       if (candidate) {
//         setMappedCandidates(prev => [...prev, candidate]);
//         toast.success("Demo: Candidate mapped");
//       }
//     } 
//     finally { setLoadingId(null); }
//   };

//   // 4. Run AI Evaluation
//   const handleShortlist = async (candidateId) => {
//     setLoadingId(candidateId);
//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, { candidate_id: candidateId, skills_match_score: defaultSkillScore });
//       setEvaluations(prev => ({ ...prev, [candidateId]: res.data }));
//       toast.success("Evaluation Generated");
//     } catch (e) { 
//       // Demo Fallback
//       setTimeout(() => {
//         const isMatch = Math.random() > 0.4;
//         setEvaluations(prev => ({ ...prev, [candidateId]: {
//           final_verdict: isMatch ? "SELECTED" : "REJECTED",
//           score: isMatch ? 85 : 45,
//           reason: isMatch ? "Strong match with required skills and experience." : "Missing key requirements for this role."
//         }}));
//         toast.success("Demo: AI Evaluation Generated");
//         setLoadingId(null);
//       }, 1000);
//       return; // Early return to skip finally block if simulating async
//     } 
//     setLoadingId(null);
//   };

//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
//       <Toaster position="top-right" theme="dark" richColors />
      
//       {/* HEADER */}
//       <header className="sticky top-0 z-50 glass-header border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-white tracking-tight">TalentFlow <span className="text-emerald-400">AI</span></h1>
//               <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Carpas Pipeline v1.0</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
//              <StatusBadge active={!isDemoMode} label="Backend" />
//              <StatusBadge active={true} label="Demo Mode" className={isDemoMode ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "hidden"} />
//           </div>
//         </div>
//       </header>

//       {/* PHASE NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/50 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between py-2 px-6">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" icon={Server} />
//           <div className="h-px w-8 bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" icon={Cloud} />
//           <div className="h-px w-8 bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" icon={LayoutDashboard} />
//         </div>
//       </div>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">
          
//           {/* --- PHASE 1: SETUP --- */}
//           {activePhase === 1 && (
//             <motion.div key="phase1" {...fadeIn} className="max-w-3xl mx-auto text-center">
//               <h2 className="text-3xl font-bold text-white mb-4">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup('gcp')} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} />
//                 </div>
//               ) : (
//                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
//                   <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <CheckCircle className="w-8 h-8 text-emerald-400" />
//                   </div>
//                   <h3 className="text-xl font-bold text-white mb-6">Environment Provisioned</h3>
                  
//                   <div className="bg-slate-950/80 rounded-lg p-4 font-mono text-xs text-left border border-slate-800 mb-8 space-y-2">
//                     <LogLine label="bucket_name" value={setupData.bucket_name} />
//                     <LogLine label="folders" value={JSON.stringify(setupData.folders_created)} />
//                     <LogLine label="upload_link" value="SIGNED_URL_GENERATED (Valid for 60m)" color="text-emerald-400" />
//                   </div>

//                   <button 
//                     onClick={() => setActivePhase(2)}
//                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto"
//                   >
//                     Proceed to Ingestion <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* --- PHASE 2: INGESTION --- */}
//           {activePhase === 2 && (
//             <motion.div key="phase2" {...fadeIn} className="max-w-5xl mx-auto">
//                {!setupData ? (
//                  <div className="text-center p-12 border border-dashed border-slate-700 rounded-2xl">
//                     <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
//                     <h3 className="text-slate-300">No Active Environment</h3>
//                     <button onClick={() => setActivePhase(1)} className="text-emerald-400 hover:underline mt-2">Go to Setup</button>
//                  </div>
//                ) : (
//                  <div className="grid md:grid-cols-2 gap-8">
//                     {/* Upload Zone */}
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//                            <Upload className="w-5 h-5 text-emerald-400" /> Direct Upload
//                          </h3>
//                          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">Target: /incoming</span>
//                       </div>
//                       <DragDropUpload uploadUrl={setupData.upload_link} />
//                     </div>

//                     {/* Process Control */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//                         <BrainCircuit className="w-5 h-5 text-purple-400" /> Librarian Agent
//                       </h3>
                      
//                       {!processLogs ? (
//                         <button
//                           onClick={handleProcess}
//                           disabled={loading}
//                           className="w-full h-48 rounded-2xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 flex flex-col items-center justify-center gap-4 transition-all group disabled:opacity-50 hover:border-purple-500/50"
//                         >
//                            <div className={`p-4 rounded-full ${loading ? 'bg-purple-500/10' : 'bg-slate-800 group-hover:bg-purple-500/20'} transition-colors`}>
//                              {loading ? <Activity className="w-8 h-8 text-purple-400 animate-spin" /> : <Sparkles className="w-8 h-8 text-slate-400 group-hover:text-purple-400" />}
//                            </div>
//                            <div className="text-center">
//                              <span className="block font-medium text-slate-200">{loading ? "Running Classification Pipeline..." : "Run Classification"}</span>
//                              <span className="text-xs text-slate-500 mt-1">Scans bucket, OCRs text, moves files</span>
//                            </div>
//                         </button>
//                       ) : (
//                          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-64">
//                             <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
//                               <Terminal className="w-4 h-4 text-slate-500" />
//                               <span className="text-xs font-mono text-slate-400">agent_output.log</span>
//                             </div>
//                             <div className="p-4 font-mono text-xs space-y-1 overflow-y-auto custom-scrollbar flex-1">
//                                <div className="text-slate-500 mb-2"># Pipeline Report</div>
//                                {processLogs.details.map((log, i) => (
//                                   <div key={i} className="flex gap-2">
//                                      <span className="text-slate-400">[{log.type}]</span>
//                                      <span className="text-slate-300">{log.file}</span>
//                                      <span className="text-slate-600">→</span>
//                                      <span className="text-emerald-500/80">{log.moved_to}</span>
//                                   </div>
//                                ))}
//                                <div className="mt-4 text-emerald-400 font-bold">{">>>"} SYNC COMPLETE: {processLogs.total_files} files processed.</div>
//                             </div>
//                             <div className="p-3 bg-slate-900/50 border-t border-slate-800">
//                                <button onClick={() => setActivePhase(3)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold">
//                                  Open Recruiter Dashboard
//                                </button>
//                             </div>
//                          </div>
//                       )}
//                     </div>
//                  </div>
//                )}
//             </motion.div>
//           )}

//           {/* --- PHASE 3: DASHBOARD --- */}
//           {activePhase === 3 && (
//             <motion.div key="phase3" {...fadeIn} className="h-[calc(100vh-200px)] flex gap-6">
              
//               {/* Left: Jobs */}
//               <div className="w-1/3 flex flex-col gap-4">
//                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-xl">
//                     <h3 className="font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400"/> Job Roles</h3>
//                     <p className="text-xs text-slate-500 mt-1">Select a role to manage pipeline</p>
//                  </div>
//                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
//                     {jds.map(jd => (
//                        <div 
//                          key={jd.jd_id}
//                          onClick={() => setSelectedJdId(jd.jd_id)}
//                          className={cn(
//                            "p-4 rounded-xl border cursor-pointer transition-all",
//                            selectedJdId === jd.jd_id ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
//                          )}
//                        >
//                           <div className="flex justify-between items-start mb-2">
//                              <h4 className={cn("text-sm font-semibold", selectedJdId === jd.jd_id ? "text-blue-400" : "text-slate-200")}>{jd.file_name}</h4>
//                              {selectedJdId === jd.jd_id && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>}
//                           </div>
//                           <p className="text-xs text-slate-500 line-clamp-2">{jd.extracted_text || "No summary available"}</p>
//                        </div>
//                     ))}
//                  </div>
//               </div>

//               {/* Right: Candidates */}
//               <div className="w-2/3 flex flex-col gap-4">
//                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-xl flex justify-between items-center">
//                     <div>
//                       <h3 className="font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400"/> Candidate Pool</h3>
//                       <p className="text-xs text-slate-500 mt-1">{selectedJdId ? "Managing candidates for selected role" : "Select a JD to start mapping"}</p>
//                     </div>
//                     {selectedJdId && (
//                       <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800">
//                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Threshold</span>
//                          <input type="number" value={defaultSkillScore} onChange={e=>setDefaultSkillScore(e.target.value)} className="w-8 bg-transparent text-xs text-center focus:outline-none text-emerald-400 font-bold"/>
//                       </div>
//                     )}
//                  </div>

//                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
//                     {/* Mapped Section */}
//                     {mappedCandidates.length > 0 && (
//                       <div className="space-y-3">
//                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"><LayoutDashboard className="w-3 h-3"/> Mapped Candidates</div>
//                          {mappedCandidates.map(cand => {
//                             const result = evaluations[cand.candidate_id];
//                             return (
//                                <div key={cand.candidate_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 hover:border-slate-700 transition-colors">
//                                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{cand.file_name.substring(0,2).toUpperCase()}</div>
//                                   <div className="flex-1">
//                                      <div className="flex justify-between">
//                                         <h4 className="text-sm font-semibold text-slate-200">{cand.file_name}</h4>
//                                         <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
//                                      </div>
                                     
//                                      {result ? (
//                                         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-4">
//                                            <ScoreRing score={result.score || result.skills_match_score || 0} />
//                                            <div>
//                                               <div className={cn("text-xs font-bold", result.final_verdict === "SELECTED" ? "text-emerald-400" : "text-red-400")}>
//                                                  {result.final_verdict}
//                                               </div>
//                                               <p className="text-[10px] text-slate-400 line-clamp-1">{result.reason || "AI analysis completed."}</p>
//                                            </div>
//                                         </motion.div>
//                                      ) : (
//                                         <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cand.extracted_text.slice(0, 80)}...</p>
//                                      )}
//                                   </div>
//                                   <button onClick={()=>handleShortlist(cand.candidate_id)} disabled={loadingId===cand.candidate_id} className="self-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/20 w-24 flex justify-center">
//                                      {loadingId===cand.candidate_id ? <Activity className="w-3 h-3 animate-spin"/> : "Evaluate"}
//                                   </button>
//                                </div>
//                             )
//                          })}
//                       </div>
//                     )}

//                     {/* Unmapped Section */}
//                     <div className="space-y-3 pt-4 border-t border-slate-800/50">
//                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider"><Search className="w-3 h-3"/> Unmapped Pool</div>
//                        {candidates.filter(c => !mappedCandidates.find(m => m.candidate_id === c.candidate_id)).map(cand => (
//                           <div key={cand.candidate_id} className="bg-slate-950/30 border border-dashed border-slate-800 rounded-xl p-3 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
//                              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-xs text-slate-500">?</div>
//                              <div className="flex-1 text-xs font-medium text-slate-400">{cand.file_name}</div>
//                              <button onClick={()=>handleMap(cand.candidate_id)} disabled={!selectedJdId || loadingId===cand.candidate_id} className="bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
//                                 {loadingId===cand.candidate_id ? "..." : "Map to Role"}
//                              </button>
//                           </div>
//                        ))}
//                     </div>
//                  </div>
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // --- SUB COMPONENTS ---

// const StepButton = ({ phase, current, onClick, label, icon: Icon }) => (
//   <button 
//     onClick={() => onClick(phase)}
//     className={cn(
//       "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
//       current === phase ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
//       current > phase ? "text-emerald-500/60" : "text-slate-600"
//     )}
//   >
//     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", current === phase ? "bg-emerald-500 text-slate-900" : "bg-slate-800")}>
//       {phase}
//     </div>
//     <span className="hidden sm:inline">{label}</span>
//   </button>
// );

// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button 
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-2xl border text-left transition-all relative overflow-hidden group",
//       active ? "bg-slate-900 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100"
//     )}
//   >
//     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Cloud className="w-20 h-20"/></div>
//     <div className="text-2xl font-bold text-white mb-1">{name === 'aws' ? 'AWS' : name === 'gcp' ? 'GCP' : 'Azure'}</div>
//     <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
//     {active && <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Recommended</div>}
//   </button>
// );

// const DragDropUpload = ({ uploadUrl }) => {
//   const [dragActive, setDragActive] = useState(false);
//   const [file, setFile] = useState(null);
//   const [progress, setProgress] = useState(0);
  
//   const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  
//   const handleDrop = (e) => {
//     e.preventDefault(); e.stopPropagation(); setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
//   };

//   const uploadFile = async () => {
//     if(!file) return;
//     try {
//       setProgress(30);
//       const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: file });
//       if(!res.ok) throw new Error();
//       setProgress(100);
//       toast.success("Upload successful");
//       setTimeout(() => { setFile(null); setProgress(0); }, 2000);
//     } catch(e) { setProgress(0); toast.error("Upload failed"); }
//   };

//   return (
//     <div 
//        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
//        className={cn(
//          "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all h-48",
//          dragActive ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800/20 hover:bg-slate-800/40"
//        )}
//     >
//        {!file ? (
//          <>
//            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-400"><Upload className="w-6 h-6"/></div>
//            <p className="text-sm text-slate-300 font-medium">Drag & Drop files here</p>
//            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
//            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setFile(e.target.files[0])} />
//          </>
//        ) : (
//          <div className="w-full text-center">
//             <FileText className="w-8 h-8 text-emerald-400 mx-auto mb-2"/>
//             <p className="text-sm text-white font-medium truncate max-w-[200px] mx-auto">{file.name}</p>
//             {progress === 0 ? (
//                <button onClick={uploadFile} className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-bold">Start Upload</button>
//             ) : (
//                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
//                   <div className="bg-emerald-500 h-full transition-all duration-500" style={{width: `${progress}%`}}/>
//                </div>
//             )}
//          </div>
//        )}
//     </div>
//   )
// }

// const ScoreRing = ({ score }) => {
//   const r = 18, c = 2 * Math.PI * r, off = c - (score / 100) * c;
//   const color = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
//   return (
//     <div className="relative w-10 h-10 flex items-center justify-center">
//        <svg className="w-full h-full -rotate-90"><circle cx="20" cy="20" r={r} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800"/><circle cx="20" cy="20" r={r} stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className={cn("transition-all duration-1000", color)}/></svg>
//        <span className="absolute text-[10px] font-bold text-slate-300">{score}</span>
//     </div>
//   )
// }

// const LogLine = ({ label, value, color="text-slate-300" }) => (
//   <div className="flex gap-2 font-mono">
//     <span className="text-slate-500">$</span>
//     <span className="text-blue-400">{label}:</span>
//     <span className={color}>{value}</span>
//   </div>
// );

// const StatusBadge = ({ active, label, className }) => (
//   <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px]", active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500", className)}>
//     <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-500 animate-pulse" : "bg-slate-600")}/>
//     {label}
//   </span>
// );

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, Activity, BrainCircuit, LayoutDashboard,
//   ArrowRight, Sparkles, Server, Terminal, Search
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // --- API SETUP ---
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   timeout: 15000,
// });

// // --- UTILITY ---
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // --- FIXED MISSING COMPONENTS ---
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold 
//       ${active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value, color }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className={color || "text-slate-300"}>{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
//     {score}
//   </div>
// );

// // --- ANIMATION ---
// const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);
//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);
//   const [defaultSkillScore, setDefaultSkillScore] = useState(75);

//   useEffect(() => {
//     refreshData();
//   }, []);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   const refreshData = async () => {
//     try {
//       const [jdsRes, candRes] = await Promise.all([
//         api.get("/jds"),
//         api.get("/candidates"),
//       ]);
//       setJds(jdsRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);
//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`);
//       setMappedCandidates(res.data.candidates || []);
//     } catch {
//       toast.error("Failed to sync candidates.");
//     }
//   };

//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
//       toast.success("Cloud setup completed.");
//       setBackendOnline(true);
//     } catch {
//       toast.error("Cloud setup failed.");
//     }
//     setLoading(false);
//   };

//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider: "gcp" },
//       });
//       setProcessLogs(res.data);
//       refreshData();
//       toast.success("Files processed successfully.");
//     } catch {
//       toast.error("Processing failed.");
//     }
//     setLoading(false);
//   };

//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");
//     setLoadingId(candidateId);
//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//         status: "PENDING",
//       });
//       fetchMappedCandidates(selectedJdId);
//       toast.success("Candidate mapped.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;
//     setLoadingId(candidateId);
//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore) || 0,
//       });
//       setEvaluations((prev) => ({ ...prev, [candidateId]: res.data }));
//       toast.success("Evaluation ready");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200">
//       <Toaster richColors />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">TalentFlow <span className="text-emerald-400">AI</span></h1>
//               <p className="text-[10px] text-slate-500">Carpas Pipeline v1.0</p>
//             </div>
//           </div>

//           <StatusBadge active={backendOnline} label={backendOnline ? "Backend Online" : "Backend Offline"} />
//         </div>
//       </header>

//       {/* PHASE NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-2">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">
//           {/* PHASE 1 */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-3xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-4">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup("gcp")} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} />
//                 </div>
//               ) : (
//                 <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
//                   <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
//                   <h3 className="text-lg font-semibold">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded">
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-6 bg-emerald-600 px-6 py-2 rounded-lg"
//                   >
//                     Proceed
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* PHASE 2 */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                 <div className="text-center p-10 border border-slate-700 rounded-xl">
//                   <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
//                   <p>No environment configured</p>
//                 </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Files
//                     </h3>
//                     <DragDropUpload />
//                   </div>

//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> Process Files
//                     </h3>

//                     {!processLogs ? (
//                       <button
//                         onClick={handleProcess}
//                         className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center"
//                       >
//                         {loading ? "Processing…" : "Run Processing"}
//                       </button>
//                     ) : (
//                       <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto">
//                         <div className="text-slate-500 mb-2">Pipeline Results</div>
//                         {processLogs.details.map((l, i) => (
//                           <div key={i} className="text-xs text-slate-300">
//                             {l.file} → {l.moved_to}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* PHASE 3 */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-3 gap-6 h-[80vh]">
              
//               {/* LEFT PANEL */}
//               <div className="col-span-1 border border-slate-800 rounded-xl p-4 overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center">
//                   <FileText className="w-4 h-4 text-blue-400" /> Job Roles
//                 </h3>

//                 {jds.map((jd) => (
//                   <div
//                     key={jd.jd_id}
//                     onClick={() => setSelectedJdId(jd.jd_id)}
//                     className={`p-3 mb-2 rounded-lg cursor-pointer border ${
//                       selectedJdId === jd.jd_id
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-800 bg-slate-900"
//                     }`}
//                   >
//                     <div className="font-semibold">{jd.file_name}</div>
//                     <div className="text-xs text-slate-500">{jd.extracted_text?.slice(0, 60)}...</div>
//                   </div>
//                 ))}
//               </div>

//               {/* RIGHT PANEL */}
//               <div className="col-span-2 border border-slate-800 rounded-xl p-4 overflow-y-auto">

//                 <h3 className="font-semibold mb-3 flex gap-2 items-center">
//                   <Users className="w-4 h-4 text-emerald-400" /> Candidates
//                 </h3>

//                 {/* MAPPED */}
//                 {mappedCandidates.map((cand) => {
//                   const evalData = evaluations[cand.candidate_id];
//                   return (
//                     <div key={cand.candidate_id} className="p-3 bg-slate-900 rounded-lg border border-slate-700 mb-3 flex items-center gap-4">
                      
//                       <div className="w-8 h-8 bg-slate-800 rounded-full flex justify-center items-center text-xs">
//                         {cand.file_name.slice(0,2).toUpperCase()}
//                       </div>

//                       <div className="flex-1">
//                         <div className="font-semibold">{cand.file_name}</div>
//                         {evalData ? (
//                           <div className="mt-2 flex gap-3 items-center">
//                             <ScoreRing score={evalData.skills_match_score} />
//                             <div>
//                               <div className="text-xs text-emerald-400">{evalData.final_verdict}</div>
//                               <p className="text-[10px] text-slate-500">{evalData.reason}</p>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="text-xs text-slate-500">{cand.extracted_text?.slice(0, 80)}...</div>
//                         )}
//                       </div>

//                       <button
//                         onClick={() => handleShortlist(cand.candidate_id)}
//                         disabled={loadingId === cand.candidate_id}
//                         className="px-4 py-1 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/20 text-xs"
//                       >
//                         {loadingId === cand.candidate_id ? "..." : "Evaluate"}
//                       </button>
//                     </div>
//                   );
//                 })}

//                 {/* UNMAPPED */}
//                 <h4 className="text-xs uppercase tracking-wider text-slate-600 mt-4 mb-2">Unmapped</h4>
//                 {candidates
//                   .filter((c) => !mappedCandidates.find((m) => m.candidate_id === c.candidate_id))
//                   .map((cand) => (
//                     <div key={cand.candidate_id} className="p-3 border border-slate-800 rounded-lg bg-slate-950 flex justify-between items-center mb-2">
//                       <span className="text-xs">{cand.file_name}</span>
//                       <button
//                         onClick={() => handleMap(cand.candidate_id)}
//                         className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs"
//                       >
//                         Map
//                       </button>
//                     </div>
//                   ))}
//               </div>

//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // --- STEP BUTTON ---
// const StepButton = ({ phase, current, onClick, label }) => (
//   <button
//     onClick={() => onClick(phase)}
//     className={cn(
//       "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
//       current === phase
//         ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//         : current > phase
//         ? "text-emerald-500/60"
//         : "text-slate-500"
//     )}
//   >
//     <div
//       className={cn(
//         "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
//         current === phase ? "bg-emerald-500 text-slate-900" : "bg-slate-800"
//       )}
//     >
//       {phase}
//     </div>
//     <span>{label}</span>
//   </button>
// );

// // --- PROVIDER CARD ---
// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-2xl border text-left transition-all relative group",
//       active ? "bg-slate-900 border-emerald-500/50" : "bg-slate-900/40 border-slate-800"
//     )}
//   >
//     <div className="absolute top-0 right-0 p-2 opacity-10">
//       <Cloud className="w-20 h-20" />
//     </div>

//     <div className="text-2xl font-bold text-white">{name.toUpperCase()}</div>
//     <p className="text-xs text-slate-400">{label}</p>

//     {active && (
//       <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
//         <CheckCircle className="w-3 h-3" />
//         Recommended
//       </div>
//     )}
//   </button>
// );
// const DragDropUpload = () => {
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => {
//     setFiles(Array.from(fileList));
//   };

//   const uploadAllFiles = async () => {
//     if (files.length === 0) {
//       toast.error("No files selected");
//       return;
//     }

//     setUploading(true);
//     setProgress(0);

//     let successCount = 0;
//     let failCount = 0;

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];

//       try {
//         // 1️⃣ ask backend for signed URL for this file
//         const { data } = await api.post("/cloud/generate-upload-url", {
//           filename: file.name,
//         });

//         // 2️⃣ upload the file to GCS
//         const res = await fetch(data.upload_url, {
//           method: "PUT",
//           headers: { "Content-Type": "application/octet-stream" },
//           // headers: { "Content-Type": "application/octet-stream" },
//           body: file,
//         });

//         // if (!res.ok) {
//         //   console.error("Upload failed", file.name, res.status);
//         //   failCount += 1;
//         //   toast.error(`Failed: ${file.name} (status ${res.status})`);
//         //   continue;
//         // }
//         if (!(res.status === 200 || res.status === 204)) {
//             console.warn("Upload might have succeeded but returned", res.status);
//         } else {
//             console.log("Uploaded:", file.name);
//         }


//         successCount += 1;
//         setProgress(Math.round(((i + 1) / files.length) * 100));
//       } catch (err) {
//         console.error(err);
//         failCount += 1;
//         toast.error(`Failed: ${file.name}`);
//       }
//     }

//     if (successCount > 0 && failCount === 0) {
//       toast.success(`Uploaded ${successCount} file(s)`);
//     } else if (successCount > 0 && failCount > 0) {
//       toast.warning(`Uploaded ${successCount}, failed ${failCount}`);
//     } else {
//       toast.error("No files were uploaded");
//     }

//     setUploading(false);
//     setFiles([]);
//     setProgress(0);
//   };

//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/40">
//       <input
//         type="file"
//         multiple
//         className="w-full"
//         onChange={(e) => handleFiles(e.target.files)}
//       />

//       {files.length > 0 && (
//         <div className="mt-4 space-y-2">
//           <p className="text-xs text-slate-400">
//             {files.length} files selected
//           </p>

//           <button
//             onClick={uploadAllFiles}
//             disabled={uploading}
//             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
//           >
//             {uploading ? "Uploading..." : "Start Upload"}
//           </button>

//           {uploading && (
//             <div className="mt-3 h-2 bg-slate-700 rounded">
//               <div
//                 className="h-full bg-emerald-500 transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, BrainCircuit
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // ------------------- API CLIENT -------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   timeout: 15000,
// });

// // ------------------- UTILITY -------------------
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ------------------- UI COMPONENTS -------------------
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//       active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
//     }`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className="text-slate-300">{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
//     {score}
//   </div>
// );

// // Animation
// const fadeIn = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

// // ======================================================
// // ◼️ MAIN APPLICATION
// // ======================================================
// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);

//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);

//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);

//   const [defaultSkillScore] = useState(75);

//   // -----------------------------------------------------
//   // LOAD INITIAL DATA
//   // -----------------------------------------------------
//   useEffect(() => {
//     refreshData();
//   }, []);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   const refreshData = async () => {
//     try {
//       const [jdRes, candRes] = await Promise.all([
//         api.get("/jds"),
//         api.get("/candidates"),
//       ]);

//       setJds(jdRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);

//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`);
//       setMappedCandidates(res.data.candidates || []);
//     } catch {
//       toast.error("Failed loading candidates for JD.");
//     }
//   };

//   // -----------------------------------------------------
//   // CLOUD SETUP
//   // -----------------------------------------------------
//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
//       toast.success("Cloud setup complete.");
//       setActivePhase(2);
//     } catch {
//       toast.error("Setup failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // PROCESS FILES
//   // -----------------------------------------------------
//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider: "gcp" },
//       });

//       setProcessLogs(res.data);

//       toast.success("Processing completed.");

//       await refreshData();

//       // AUTO MOVE TO WORKSPACE
//       setActivePhase(3);
//     } catch (err) {
//       toast.error("Processing failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // MAP CANDIDATE
//   // -----------------------------------------------------
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");

//     setLoadingId(candidateId);

//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//       });

//       toast.success("Candidate mapped.");

//       fetchMappedCandidates(selectedJdId);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // -----------------------------------------------------
//   // SHORTLIST / EVALUATE
//   // -----------------------------------------------------
//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;

//     setLoadingId(candidateId);

//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore),
//       });

//       setEvaluations((prev) => ({
//         ...prev,
//         [candidateId]: res.data,
//       }));

//       toast.success("Evaluation completed.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ======================================================
//   // ◼️ UI LAYOUT
//   // ======================================================
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200">
//       <Toaster richColors />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">
//                 TalentFlow <span className="text-emerald-400">AI</span>
//               </h1>
//               <p className="text-[10px] text-slate-500">Carpas Pipeline v1.0</p>
//             </div>
//           </div>

//           <StatusBadge
//             active={backendOnline}
//             label={backendOnline ? "Backend Online" : "Backend Offline"}
//           />
//         </div>
//       </header>

//       {/* STEPS NAVIGATION */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-2">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN AREA */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">

//           {/* ---------------------------
//               PHASE 1 — Setup
//           --------------------------- */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-3xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-4">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup("gcp")} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} />
//                 </div>
//               ) : (
//                 <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
//                   <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
//                   <h3 className="text-lg font-semibold">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded">
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-6 bg-emerald-600 px-6 py-2 rounded-lg"
//                   >
//                     Proceed
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ---------------------------
//               PHASE 2 — Upload + Process
//           --------------------------- */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                 <div className="text-center p-10 border border-slate-700 rounded-xl">
//                   <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
//                   <p>No environment configured</p>
//                 </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">

//                   {/* Upload */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Files
//                     </h3>
//                     <DragDropUpload />
//                   </div>

//                   {/* Process */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> Process Files
//                     </h3>

//                     {!processLogs ? (
//                       <button
//                         onClick={handleProcess}
//                         className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center"
//                       >
//                         {loading ? "Processing…" : "Run Processing"}
//                       </button>
//                     ) : (
//                       <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto">
//                         <div className="text-slate-500 mb-2">Pipeline Results</div>
//                         {processLogs.details.map((l, i) => (
//                           <div key={i} className="text-xs text-slate-300">
//                             {l.file} → {l.moved_to}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ---------------------------
//               PHASE 3 — Workspace
//           --------------------------- */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-3 gap-6 h-[80vh]">

//               {/* LEFT PANEL — JDs */}
//               <div className="col-span-1 border border-slate-800 rounded-xl p-4 overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center">
//                   <FileText className="w-4 h-4 text-blue-400" /> Job Roles
//                 </h3>

//                 {jds.map((jd) => (
//                   <div
//                     key={jd.jd_id}
//                     onClick={() => setSelectedJdId(jd.jd_id)}
//                     className={`p-3 mb-2 rounded-lg cursor-pointer border ${
//                       selectedJdId === jd.jd_id
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-800 bg-slate-900"
//                     }`}
//                   >
//                     <div className="font-semibold">{jd.file_name}</div>
//                     <div className="text-xs text-slate-500">
//                       {jd.extracted_text?.slice(0, 60)}...
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* RIGHT PANEL — Candidates */}
//               <div className="col-span-2 border border-slate-800 rounded-xl p-4 overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center">
//                   <Users className="w-4 h-4 text-emerald-400" /> Candidates
//                 </h3>

//                 {/* MAPPED CANDIDATES */}
//                 {mappedCandidates.map((cand) => {
//                   const evalData = evaluations[cand.candidate_id] || {};

//                   return (
//                     <div key={cand.candidate_id} className="p-3 bg-slate-900 rounded-lg border border-slate-700 mb-3 flex items-center gap-4">

//                       {/* Avatar */}
//                       <div className="w-8 h-8 bg-slate-800 rounded-full flex justify-center items-center text-xs">
//                         {cand.file_name.slice(0, 2).toUpperCase()}
//                       </div>

//                       {/* Candidate Data */}
//                       <div className="flex-1">
//                         <div className="font-semibold">{cand.file_name}</div>

//                         {evalData.final_verdict ? (
//                           <div className="mt-2 flex gap-3 items-center">
//                             <ScoreRing score={evalData.analysis?.skills_match_score || 0} />
//                             <div>
//                               <div className="text-xs text-emerald-400">{evalData.final_verdict}</div>
//                               <p className="text-[10px] text-slate-500">
//                                 {evalData.analysis?.experience?.classification || "OK"}
//                               </p>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="text-xs text-slate-500">{cand.extracted_text?.slice(0, 80)}...</div>
//                         )}
//                       </div>

//                       {/* BUTTON */}
//                       <button
//                         onClick={() => handleShortlist(cand.candidate_id)}
//                         disabled={loadingId === cand.candidate_id}
//                         className="px-4 py-1 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/20 text-xs"
//                       >
//                         {loadingId === cand.candidate_id ? "…" : "Evaluate"}
//                       </button>
//                     </div>
//                   );
//                 })}

//                 {/* UNMAPPED CANDIDATES */}
//                 <h4 className="text-xs uppercase tracking-wider text-slate-600 mt-4 mb-2">Unmapped</h4>
//                 {candidates
//                   .filter((c) => !mappedCandidates.some((m) => m.candidate_id === c.candidate_id))
//                   .map((cand) => (
//                     <div
//                       key={cand.candidate_id}
//                       className="p-3 border border-slate-800 rounded-lg bg-slate-950 flex justify-between items-center mb-2"
//                     >
//                       <span className="text-xs">{cand.file_name}</span>
//                       <button
//                         onClick={() => handleMap(cand.candidate_id)}
//                         className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs"
//                       >
//                         Map
//                       </button>
//                     </div>
//                   ))}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // ------------------- STEP BUTTON -------------------
// const StepButton = ({ phase, current, onClick, label }) => (
//   <button
//     onClick={() => onClick(phase)}
//     className={cn(
//       "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
//       current === phase
//         ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//         : current > phase
//         ? "text-emerald-500/60"
//         : "text-slate-500"
//     )}
//   >
//     <div
//       className={cn(
//         "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
//         current === phase ? "bg-emerald-500 text-slate-900" : "bg-slate-800"
//       )}
//     >
//       {phase}
//     </div>
//     <span>{label}</span>
//   </button>
// );

// // ------------------- CLOUD PROVIDER CARD -------------------
// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-2xl border text-left transition-all relative group",
//       active ? "bg-slate-900 border-emerald-500/50" : "bg-slate-900/40 border-slate-800"
//     )}
//   >
//     <div className="absolute top-0 right-0 p-2 opacity-10">
//       <Cloud className="w-20 h-20" />
//     </div>

//     <div className="text-2xl font-bold text-white">{name.toUpperCase()}</div>
//     <p className="text-xs text-slate-400">{label}</p>

//     {active && (
//       <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
//         <CheckCircle className="w-3 h-3" />
//         Recommended
//       </div>
//     )}
//   </button>
// );

// // ------------------- FILE UPLOADER -------------------
// const DragDropUpload = () => {
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => setFiles(Array.from(fileList));

//   const uploadAllFiles = async () => {
//     if (!files.length) {
//       toast.error("No files selected");
//       return;
//     }

//     setUploading(true);
//     setProgress(0);

//     let success = 0;

//     for (let i = 0; i < files.length; i++) {
//       const f = files[i];

//       try {
//         const { data } = await api.post("/cloud/generate-upload-url", {
//           filename: f.name,
//         });

//         const res = await fetch(data.upload_url, {
//           method: "PUT",
//           headers: { "Content-Type": "application/octet-stream" },
//           body: f,
//         });

//         if (res.status === 200 || res.status === 204) {
//           success++;
//         } else {
//           toast.warning(`Upload returned ${res.status}, but may still be OK.`);
//         }
//       } catch {
//         toast.error(`Failed: ${f.name}`);
//       }

//       setProgress(Math.round(((i + 1) / files.length) * 100));
//     }

//     toast.success(`Uploaded ${success}/${files.length} files`);
//     setUploading(false);
//     setFiles([]);
//     setProgress(0);
//   };

//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/40">
//       <input type="file" multiple className="w-full" onChange={(e) => handleFiles(e.target.files)} />

//       {files.length > 0 && (
//         <div className="mt-4 space-y-2">
//           <p className="text-xs text-slate-400">{files.length} files selected</p>

//           <button
//             onClick={uploadAllFiles}
//             disabled={uploading}
//             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
//           >
//             {uploading ? "Uploading..." : "Start Upload"}
//           </button>

//           {uploading && (
//             <div className="mt-3 h-2 bg-slate-700 rounded">
//               <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, BrainCircuit
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // ------------------- API CLIENT -------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   timeout: 60000,
// });

// // ------------------- UTILITY -------------------
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ------------------- HELPER COMPONENTS -------------------
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//       active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
//     }`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className="text-slate-300">{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
//     {score}
//   </div>
// );

// // Animation variants
// const fadeIn = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

// // ======================================================
// // ◼️ MAIN APPLICATION
// // ======================================================
// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);

//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);

//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);

//   const [defaultSkillScore] = useState(75);

//   // -----------------------------------------------------
//   // LOAD INITIAL DATA
//   // -----------------------------------------------------
//   useEffect(() => {
//     refreshData();
//   }, []);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   const refreshData = async () => {
//     try {
//       const [jdRes, candRes] = await Promise.all([
//         api.get("/jds"),
//         api.get("/candidates"),
//       ]);

//       setJds(jdRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);

//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`);
//       setMappedCandidates(res.data.candidates || []);
//     } catch {
//       toast.error("Failed loading candidates for JD.");
//     }
//   };

//   // -----------------------------------------------------
//   // CLOUD SETUP
//   // -----------------------------------------------------
//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
//       toast.success("Cloud setup complete.");
//       // Optional: Auto advance
//       // setActivePhase(2);
//     } catch {
//       toast.error("Setup failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // PROCESS FILES
//   // -----------------------------------------------------
//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider: "gcp" },
//       });

//       setProcessLogs(res.data);
//       toast.success("Processing completed.");
//       await refreshData();
//       if (res.data.total_files > 0) {
//         setTimeout(() => setActivePhase(3), 1500); 
//       }

//     } catch (err) {
//       toast.error("Processing failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // MAP CANDIDATE
//   // -----------------------------------------------------
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");

//     setLoadingId(candidateId);

//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//       });

//       toast.success("Candidate mapped.");
//       fetchMappedCandidates(selectedJdId);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // -----------------------------------------------------
//   // SHORTLIST / EVALUATE
//   // -----------------------------------------------------
//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;

//     setLoadingId(candidateId);

//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore),
//       });

//       setEvaluations((prev) => ({
//         ...prev,
//         [candidateId]: res.data,
//       }));

//       toast.success("Evaluation completed.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ======================================================
//   // ◼️ UI LAYOUT
//   // ======================================================
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200">
//       <Toaster richColors />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">
//                 TalentFlow <span className="text-emerald-400">AI</span>
//               </h1>
//               <p className="text-[10px] text-slate-500">Carpas Pipeline v1.0</p>
//             </div>
//           </div>

//           <StatusBadge
//             active={backendOnline}
//             label={backendOnline ? "Backend Online" : "Backend Offline"}
//           />
//         </div>
//       </header>

//       {/* STEPS NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-2">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">

//           {/* ============ PHASE 1 — INFRASTRUCTURE ============ */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-3xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-4">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup("gcp")} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} />
//                 </div>
//               ) : (
//                 <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
//                   <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
//                   <h3 className="text-lg font-semibold">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded">
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-6 bg-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-500 transition-all text-white font-medium"
//                   >
//                     Proceed to Ingestion
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 2 — UPLOAD + PROCESS ============ */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                  <div className="text-center p-10 border border-slate-700 rounded-xl">
//                    <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
//                    <p>Please configure cloud infrastructure in Step 1 first.</p>
//                    <button onClick={() => setActivePhase(1)} className="text-emerald-400 underline mt-2">Go to Step 1</button>
//                  </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">
//                   {/* Upload */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Files
//                     </h3>
//                     <DragDropUpload />
//                   </div>

//                   {/* Process */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> Process Files
//                     </h3>
//                     {!processLogs ? (
//                       <button
//                         onClick={handleProcess}
//                         disabled={loading}
//                         className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all text-slate-300"
//                       >
//                         {loading ? "Processing..." : "Run AI Classification Pipeline"}
//                       </button>
//                     ) : (
//                       <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto">
//                         <div className="text-slate-500 mb-2 font-mono text-xs uppercase">Pipeline Results</div>
//                         {processLogs.details.map((l, i) => (
//                           <div key={i} className="text-xs text-slate-300 mb-1 border-b border-slate-800/50 pb-1 last:border-0">
//                             <span className="text-emerald-400">✓</span> {l.file} <span className="text-slate-500">→</span> {l.moved_to}
//                           </div>
//                         ))}
//                         <button 
//                           onClick={() => setActivePhase(3)} 
//                           className="w-full mt-4 bg-emerald-600/20 text-emerald-400 py-2 rounded border border-emerald-500/20 text-xs hover:bg-emerald-600/30"
//                         >
//                             Go to Workspace
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 3 — WORKSPACE ============ */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">

//               {/* LEFT PANEL — JDs */}
//               <div className="col-span-1 border border-slate-800 rounded-xl p-4 overflow-y-auto bg-slate-900/30">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center text-slate-300">
//                   <FileText className="w-4 h-4 text-blue-400" /> Job Roles
//                 </h3>

//                 {jds.length === 0 && <div className="text-xs text-slate-500">No Job Descriptions found.</div>}

//                 {jds.map((jd) => (
//                   <div
//                     key={jd.jd_id}
//                     onClick={() => setSelectedJdId(jd.jd_id)}
//                     className={`p-3 mb-2 rounded-lg cursor-pointer border transition-all ${
//                       selectedJdId === jd.jd_id
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-800 bg-slate-950 hover:border-slate-700"
//                     }`}
//                   >
//                     <div className="font-semibold text-sm text-slate-200">{jd.file_name}</div>
//                     <div className="text-xs text-slate-500 mt-1">{jd.extracted_text?.slice(0, 60)}...</div>
//                   </div>
//                 ))}
//               </div>

//               {/* RIGHT PANEL — Candidates */}
//               <div className="col-span-2 border border-slate-800 rounded-xl p-4 overflow-y-auto bg-slate-900/30">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center text-slate-300">
//                   <Users className="w-4 h-4 text-emerald-400" /> Candidates
//                 </h3>

//                 {!selectedJdId && (
//                     <div className="text-center py-10 text-slate-500 text-sm">Select a Job Role to view candidates</div>
//                 )}

//                 {/* MAPPED CANDIDATES */}
//                 {selectedJdId && mappedCandidates.map((cand) => {
//                   const evalData = evaluations[cand.candidate_id] || {};
//                   // Handle structure if backend returns nested analysis or direct fields
//                   const score = evalData.analysis?.skills_match_score || evalData.skills_match_score || 0;
//                   const verdict = evalData.final_verdict || "Pending Evaluation";

//                   return (
//                     <div key={cand.candidate_id} className="p-3 bg-slate-950 rounded-lg border border-slate-700 mb-3 flex items-center gap-4">

//                       {/* Avatar */}
//                       <div className="w-10 h-10 bg-slate-800 rounded-full flex justify-center items-center text-xs font-bold text-slate-400">
//                         {cand.file_name.slice(0, 2).toUpperCase()}
//                       </div>

//                       {/* Candidate Data */}
//                       <div className="flex-1">
//                         <div className="font-semibold text-sm">{cand.file_name}</div>
                        
//                         {evalData.final_verdict || evalData.analysis ? (
//                           <div className="mt-2 flex gap-3 items-center animate-in fade-in slide-in-from-left-2">
//                             <ScoreRing score={score} />
//                             <div>
//                               <div className="text-xs font-bold text-emerald-400">{verdict}</div>
//                               <p className="text-[10px] text-slate-500 max-w-md line-clamp-2">
//                                 {evalData.reason || evalData.analysis?.reasoning || "Analysis complete."}
//                               </p>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="text-xs text-slate-500 mt-1">{cand.extracted_text?.slice(0, 100)}...</div>
//                         )}
//                       </div>

//                       {/* BUTTON */}
//                       <button
//                         onClick={() => handleShortlist(cand.candidate_id)}
//                         disabled={loadingId === cand.candidate_id}
//                         className="px-4 py-2 bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 rounded-lg border border-amber-500/20 text-xs transition-colors"
//                       >
//                         {loadingId === cand.candidate_id ? "Analyzing..." : "Evaluate Agent"}
//                       </button>
//                     </div>
//                   );
//                 })}

//                 {/* UNMAPPED CANDIDATES */}
//                 {selectedJdId && (
//                     <>
//                         <h4 className="text-xs uppercase tracking-wider text-slate-600 mt-6 mb-3 border-b border-slate-800 pb-1">Unmapped Candidates</h4>
//                         {candidates
//                         .filter((c) => !mappedCandidates.some((m) => m.candidate_id === c.candidate_id))
//                         .map((cand) => (
//                             <div
//                             key={cand.candidate_id}
//                             className="p-3 border border-slate-800/50 rounded-lg bg-slate-950/50 flex justify-between items-center mb-2"
//                             >
//                             <span className="text-xs text-slate-400">{cand.file_name}</span>
//                             <button
//                                 onClick={() => handleMap(cand.candidate_id)}
//                                 disabled={loadingId === cand.candidate_id}
//                                 className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/30 border border-slate-700 rounded text-xs transition-colors"
//                             >
//                                 {loadingId === cand.candidate_id ? "..." : "Map to JD"}
//                             </button>
//                             </div>
//                         ))}
//                         {candidates.length === 0 && <div className="text-xs text-slate-600">No candidates available.</div>}
//                     </>
//                 )}
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // ------------------- SUB COMPONENTS -------------------

// const StepButton = ({ phase, current, onClick, label }) => (
//   <button
//     onClick={() => onClick(phase)}
//     className={cn(
//       "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
//       current === phase
//         ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//         : current > phase
//         ? "text-emerald-500/60"
//         : "text-slate-500 hover:text-slate-300"
//     )}
//   >
//     <div
//       className={cn(
//         "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
//         current === phase ? "bg-emerald-500 text-slate-900" : "bg-slate-800"
//       )}
//     >
//       {phase}
//     </div>
//     <span>{label}</span>
//   </button>
// );

// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-2xl border text-left transition-all relative group overflow-hidden",
//       active ? "bg-slate-900 border-emerald-500/50" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60"
//     )}
//   >
//     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
//       <Cloud className="w-20 h-20" />
//     </div>

//     <div className="text-2xl font-bold text-white relative z-10">{name.toUpperCase()}</div>
//     <p className="text-xs text-slate-400 relative z-10">{label}</p>

//     {active && (
//       <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1 relative z-10">
//         <CheckCircle className="w-3 h-3" />
//         Recommended
//       </div>
//     )}
//   </button>
// );

// /* ---------------- FILE UPLOAD (FIXED) ---------------- */
// const DragDropUpload = () => {
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => setFiles(Array.from(fileList));

//   const uploadAllFiles = async () => {
//   if (!files.length) {
//     toast.error("No files selected");
//     return;
//   }

//   setUploading(true);
//   setProgress(0);

//   let success = 0;

//   for (let i = 0; i < files.length; i++) {
//     const f = files[i];

//     try {
//       // 1. Ask backend for signed URL
//       const { data } = await api.post("/cloud/generate-upload-url", {
//         filename: f.name,
//       });

//       console.log("Got signed URL for", f.name, data);

//       // 2. Upload to Signed URL
//       // ❗ No headers – must match how URL was signed
//       const res = await fetch(data.upload_url, {
//         method: "PUT",
//         body: f,
//         headers: { "Content-Type": "application/octet-stream" },
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         console.error(
//           `Upload HTTP error for ${f.name}:`,
//           res.status,
//           res.statusText,
//           text
//         );
//         toast.error(`Upload failed: ${f.name} (status ${res.status})`);
//       } else {
//         success++;
//       }
//     } catch (err) {
//       console.error("Upload error for", f.name, err);
//       toast.error(`Failed: ${f.name}`);
//     }

//     setProgress(Math.round(((i + 1) / files.length) * 100));
//   }

//   if (success > 0) {
//     toast.success(`Uploaded ${success}/${files.length} files`);
//   }

//   setUploading(false);
//   setFiles([]);
//   setProgress(0);
// };


//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
//       <input 
//         type="file" 
//         multiple 
//         className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" 
//         onChange={(e) => handleFiles(e.target.files)} 
//       />

//       {files.length > 0 && (
//         <div className="mt-4 space-y-2">
//           <p className="text-xs text-slate-400">{files.length} files selected</p>

//           <button
//             onClick={uploadAllFiles}
//             disabled={uploading}
//             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm w-full transition-colors"
//           >
//             {uploading ? "Uploading..." : "Start Upload"}
//           </button>

//           {uploading && (
//             <div className="mt-3 h-1 bg-slate-700 rounded overflow-hidden">
//               <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, BrainCircuit, ChevronRight
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // ------------------- API CLIENT -------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   // ✅ Keeping timeout at 5 mins to prevent "Processing Failed" errors on large files
//   timeout: 300000, 
// });

// // ------------------- UTILITY -------------------
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ------------------- HELPER COMPONENTS -------------------
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//       active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
//     }`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className="text-slate-300">{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
//     {score}
//   </div>
// );

// // Animation variants
// const fadeIn = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

// // ======================================================
// // ◼️ MAIN APPLICATION
// // ======================================================
// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   // ✅ 1. Add Session State
//   const [sessionId, setSessionId] = useState(null);

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);

//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);

//   const [defaultSkillScore] = useState(75);

//   // -----------------------------------------------------
//   // LOAD INITIAL DATA
//   // -----------------------------------------------------
  
//   // ✅ 5. Trigger refresh only when sessionId is available
//   useEffect(() => {
//     if (sessionId) {
//       refreshData();
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   // ✅ 4. Update refreshData to pass session_id
//   const refreshData = async () => {
//     if (!sessionId) return; // Wait for session

//     try {
//       const [jdRes, candRes] = await Promise.all([
//         api.get("/jds", { params: { session_id: sessionId } }),
//         api.get("/candidates", { params: { session_id: sessionId } }),
//       ]);

//       setJds(jdRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);

//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`, {
//         params: { session_id: sessionId }
//       });
  
//       setMappedCandidates(res.data.candidates || []);
//     } catch (err) {
//       console.error("Error loading JD mappings:", err);
//       toast.error("Failed loading candidates for JD.");
//     }
//   };

//   // -----------------------------------------------------
//   // CLOUD SETUP
//   // -----------------------------------------------------
//   // ✅ 2. Update handleSetup to store session_id
//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
      
//       // Store Session ID from Backend
//       if (res.data.session_id) {
//         setSessionId(res.data.session_id);
//         toast.success(`Session started: ${res.data.session_id.slice(0,8)}...`);
//       } else {
//         toast.success("Cloud setup complete.");
//       }
//     } catch {
//       toast.error("Setup failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // PROCESS FILES
//   // -----------------------------------------------------
//   // ✅ 3. Update handleProcess to send session_id
//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider: "gcp", session_id: sessionId },
//       });

//       setProcessLogs(res.data);
//       toast.success("Processing completed.");
      
//       // Refresh data for this session
//       await refreshData();
      
//       if (res.data.total_files > 0) {
//         setTimeout(() => setActivePhase(3), 1500); 
//       }

//     } catch (err) {
//       if (err.code === 'ECONNABORTED') {
//         toast.warning("Processing is taking a while. Moving to workspace...");
//         setTimeout(() => {
//             refreshData();
//             setActivePhase(3);
//         }, 2000);
//       } else {
//         console.error(err);
//         toast.error("Processing failed.");
//       }
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // MAP CANDIDATE
//   // -----------------------------------------------------
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");

//     setLoadingId(candidateId);

//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//       });

//       toast.success("Candidate mapped.");
//       fetchMappedCandidates(selectedJdId);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // -----------------------------------------------------
//   // SHORTLIST / EVALUATE
//   // -----------------------------------------------------
//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;

//     setLoadingId(candidateId);

//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore),
//       });

//       setEvaluations((prev) => ({
//         ...prev,
//         [candidateId]: res.data,
//       }));

//       toast.success("Evaluation completed.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ======================================================
//   // ◼️ UI LAYOUT
//   // ======================================================
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200">
//       <Toaster richColors />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">
//                 TalentFlow <span className="text-emerald-400">AI</span>
//               </h1>
//               <p className="text-[10px] text-slate-500">Carpas Pipeline v1.0</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             {sessionId && (
//               <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
//                 SESSION: {sessionId.slice(0, 8)}
//               </div>
//             )}
//             <StatusBadge
//               active={backendOnline}
//               label={backendOnline ? "Backend Online" : "Backend Offline"}
//             />
//           </div>
//         </div>
//       </header>

//       {/* STEPS NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-2">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-8 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">

//           {/* ============ PHASE 1 — INFRASTRUCTURE ============ */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-3xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-4">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup("gcp")} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} />
//                 </div>
//               ) : (
//                 <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
//                   <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
//                   <h3 className="text-lg font-semibold">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded">
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                     {sessionId && <LogLine label="Session ID" value={sessionId} />}
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-6 bg-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-500 transition-all text-white font-medium"
//                   >
//                     Proceed to Ingestion
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 2 — UPLOAD + PROCESS ============ */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                  <div className="text-center p-10 border border-slate-700 rounded-xl">
//                    <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
//                    <p>Please configure cloud infrastructure in Step 1 first.</p>
//                    <button onClick={() => setActivePhase(1)} className="text-emerald-400 underline mt-2">Go to Step 1</button>
//                  </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">
//                   {/* Upload */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Files
//                     </h3>
//                     <DragDropUpload />
//                   </div>

//                   {/* Process */}
//                   <div>
//                     <h3 className="font-semibold mb-3 flex items-center gap-2">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> Process Files
//                     </h3>
//                     {!processLogs ? (
//                       <button
//                         onClick={handleProcess}
//                         disabled={loading}
//                         className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all text-slate-300"
//                       >
//                         {loading ? "Processing..." : "Run AI Classification Pipeline"}
//                       </button>
//                     ) : (
//                       <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto">
//                         <div className="text-slate-500 mb-2 font-mono text-xs uppercase">Pipeline Results</div>
//                         {processLogs.details.map((l, i) => (
//                           <div key={i} className="text-xs text-slate-300 mb-1 border-b border-slate-800/50 pb-1 last:border-0">
//                             <span className="text-emerald-400">✓</span> {l.file} <span className="text-slate-500">→</span> {l.moved_to}
//                           </div>
//                         ))}
//                         <button 
//                           onClick={() => setActivePhase(3)} 
//                           className="w-full mt-4 bg-emerald-600/20 text-emerald-400 py-2 rounded border border-emerald-500/20 text-xs hover:bg-emerald-600/30"
//                         >
//                             Go to Workspace
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 3 — RECRUITER WORKSPACE ============ */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[85vh]">

//               {/* LEFT PANEL — Job Descriptions */}
//               <div className="col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center text-slate-300">
//                   <FileText className="w-4 h-4 text-blue-400" /> Job Descriptions
//                 </h3>

//                 {jds.length === 0 ? (
//                   <div className="text-xs text-slate-500">No JDs found. Upload & Process first.</div>
//                 ) : null}

//                 {jds.map((jd) => (
//                   <div
//                     key={jd.jd_id}
//                     onClick={() => setSelectedJdId(jd.jd_id)}
//                     className={`p-3 mb-2 rounded-xl cursor-pointer transition-all border ${
//                       selectedJdId === jd.jd_id
//                         ? "border-blue-500 bg-blue-500/10"
//                         : "border-slate-800 bg-slate-950 hover:border-slate-700"
//                     }`}
//                   >
//                     <div className="font-semibold text-sm">
//                       {jd.filename || jd.file_name}
//                     </div>
//                     <p className="text-[11px] text-slate-500 mt-1 italic">
//                       {(jd.text || jd.extracted_text || "").slice(0, 70)}...
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               {/* RIGHT PANEL — Candidates */}
//               <div className="col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 overflow-y-auto">
//                 <h3 className="font-semibold mb-3 flex gap-2 items-center text-slate-300">
//                   <Users className="w-4 h-4 text-emerald-400" /> Candidates
//                 </h3>

//                 {!selectedJdId && (
//                   <div className="text-center text-slate-500 text-sm py-10">
//                     Select a Job Description to view linked candidates.
//                   </div>
//                 )}

//                 {selectedJdId && (
//                   <>
//                     {/* ----- MAPPED CANDIDATES ----- */}
//                     <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
//                       Mapped Candidates
//                     </h4>

//                     {mappedCandidates.length === 0 && (
//                       <div className="text-xs text-slate-600 mb-4">No candidates mapped yet.</div>
//                     )}

//                     {mappedCandidates.map((cand) => {
//                       const evalData = evaluations[cand.candidate_id] || {};
//                       const score =
//                         evalData.skills_match_score ||
//                         evalData.analysis?.skills_match_score ||
//                         0;

//                       return (
//                         <div
//                           key={cand.candidate_id}
//                           className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-3 flex gap-4 items-start"
//                         >
//                           {/* Avatar */}
//                           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-300">
//                             {(cand.filename || cand.file_name || "??")
//                               .slice(0, 2)
//                               .toUpperCase()}
//                           </div>

//                           {/* Info */}
//                           <div className="flex-1">
//                             <div className="font-semibold text-slate-200 text-sm">
//                               {cand.filename || cand.file_name}
//                             </div>

//                             {/* If evaluated: show result */}
//                             {evalData.final_verdict ? (
//                               <div className="mt-2 flex gap-4">
                                
//                                 {/* Score Ring */}
//                                 <div className="flex flex-col items-center">
//                                   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
//                                     {score}
//                                   </div>
//                                 </div>

//                                 {/* Reasoning */}
//                                 <div>
//                                   <p className="text-xs text-emerald-400 font-bold">
//                                     {evalData.final_verdict}
//                                   </p>

//                                   <p className="text-[10px] text-slate-500 max-w-md">
//                                     {evalData.reason ||
//                                       evalData.analysis?.reasoning ||
//                                       "No reasoning available."}
//                                   </p>
//                                 </div>

//                               </div>
//                             ) : (
//                               <p className="text-[11px] text-slate-500 mt-1">
//                                 {(cand.text || cand.extracted_text || "").slice(0, 80)}...
//                               </p>
//                             )}
//                           </div>

//                           {/* Evaluate Button */}
//                           <button
//                             onClick={() => handleShortlist(cand.candidate_id)}
//                             disabled={loadingId === cand.candidate_id}
//                             className="px-4 py-2 bg-amber-600/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 hover:bg-amber-600/20"
//                           >
//                             {loadingId === cand.candidate_id ? "Analyzing..." : "Evaluate"}
//                           </button>
//                         </div>
//                       );
//                     })}

//                     {/* ----- UNMAPPED CANDIDATES ----- */}
//                     <h4 className="mt-6 text-xs uppercase tracking-wider text-slate-500 mb-2">
//                       Unmapped Candidates
//                     </h4>

//                     {candidates
//                       .filter(
//                         (c) =>
//                           !mappedCandidates.some(
//                             (m) => m.candidate_id === c.candidate_id
//                           )
//                       )
//                       .map((cand) => (
//                         <div
//                           key={cand.candidate_id}
//                           className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between mb-2 items-center"
//                         >
//                           <span className="text-xs text-slate-400">
//                             {cand.filename || cand.file_name}
//                           </span>

//                           <button
//                             onClick={() => handleMap(cand.candidate_id)}
//                             className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 hover:text-emerald-400"
//                           >
//                             Map to JD
//                           </button>
//                         </div>
//                       ))}

//                     {candidates.length === 0 && (
//                       <div className="text-xs text-slate-500">No candidates available.</div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // ------------------- SUB COMPONENTS -------------------

// const StepButton = ({ phase, current, onClick, label }) => (
//   <button
//     onClick={() => onClick(phase)}
//     className={cn(
//       "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
//       current === phase
//         ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//         : current > phase
//         ? "text-emerald-500/60"
//         : "text-slate-500 hover:text-slate-300"
//     )}
//   >
//     <div
//       className={cn(
//         "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
//         current === phase ? "bg-emerald-500 text-slate-900" : "bg-slate-800"
//       )}
//     >
//       {phase}
//     </div>
//     <span>{label}</span>
//   </button>
// );

// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-2xl border text-left transition-all relative group overflow-hidden",
//       active ? "bg-slate-900 border-emerald-500/50" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60"
//     )}
//   >
//     <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
//       <Cloud className="w-20 h-20" />
//     </div>

//     <div className="text-2xl font-bold text-white relative z-10">{name.toUpperCase()}</div>
//     <p className="text-xs text-slate-400 relative z-10">{label}</p>

//     {active && (
//       <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1 relative z-10">
//         <CheckCircle className="w-3 h-3" />
//         Recommended
//       </div>
//     )}
//   </button>
// );

// /* ---------------- FILE UPLOAD (FIXED) ---------------- */
// const DragDropUpload = () => {
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => setFiles(Array.from(fileList));

//   const uploadAllFiles = async () => {
//     if (!files.length) {
//       toast.error("No files selected");
//       return;
//     }

//     setUploading(true);
//     setProgress(0);

//     let success = 0;

//     for (let i = 0; i < files.length; i++) {
//       const f = files[i];

//       try {
//         // 1. Ask backend for signed URL
//         const { data } = await api.post("/cloud/generate-upload-url", {
//           filename: f.name,
//         });

//         console.log("Got signed URL for", f.name, data);

//         // 2. Upload to Signed URL
//         // ❌ NO headers needed now to match backend
//         const res = await fetch(data.upload_url, {
//           method: "PUT",
//           body: f,
//         });

//         if (res.ok) {
//           success++;
//         } else {
//           const text = await res.text().catch(() => "");
//           console.error(
//             `Upload HTTP error for ${f.name}:`,
//             res.status,
//             res.statusText,
//             text
//           );
//           toast.error(`Upload failed: ${f.name} (status ${res.status})`);
//         }
//       } catch (err) {
//         console.error("Upload error for", f.name, err);
//         toast.error(`Failed: ${f.name}`);
//       }

//       setProgress(Math.round(((i + 1) / files.length) * 100));
//     }

//     if (success > 0) {
//       toast.success(`Uploaded ${success}/${files.length} files`);
//     }

//     setUploading(false);
//     setFiles([]);
//     setProgress(0);
//   };

//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
//       <input 
//         type="file" 
//         multiple 
//         className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" 
//         onChange={(e) => handleFiles(e.target.files)} 
//       />

//       {files.length > 0 && (
//         <div className="mt-4 space-y-2">
//           <p className="text-xs text-slate-400">{files.length} files selected</p>

//           <button
//             onClick={uploadAllFiles}
//             disabled={uploading}
//             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm w-full transition-colors"
//           >
//             {uploading ? "Uploading..." : "Start Upload"}
//           </button>

//           {uploading && (
//             <div className="mt-3 h-1 bg-slate-700 rounded overflow-hidden">
//               <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, BrainCircuit, ChevronRight
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // ------------------- API CLIENT -------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   // ✅ Keeping timeout at 5 mins to prevent "Processing Failed" errors on large files
//   timeout: 300000, 
// });

// // ------------------- UTILITY -------------------
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ✅ Helper to parse skills JSON string safely
// const parseSkills = (skillString) => {
//   try {
//     const parsed = JSON.parse(skillString);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// };

// // ------------------- HELPER COMPONENTS -------------------
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//       active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
//     }`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className="text-slate-300">{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold bg-slate-900">
//     {score}
//   </div>
// );

// // Animation variants
// const fadeIn = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

// // ======================================================
// // ◼️ MAIN APPLICATION
// // ======================================================
// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   // ✅ 1. Add Session State
//   const [sessionId, setSessionId] = useState(null);

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);

//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);

//   const [defaultSkillScore] = useState(75);

//   // -----------------------------------------------------
//   // LOAD INITIAL DATA
//   // -----------------------------------------------------
  
//   // ✅ 5. Trigger refresh only when sessionId is available
//   useEffect(() => {
//     if (sessionId) {
//       refreshData();
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   // ✅ 4. Update refreshData to pass session_id
//   const refreshData = async () => {
//     if (!sessionId) return; // Wait for session

//     try {
//       const [jdRes, candRes] = await Promise.all([
//         api.get("/jds", { params: { session_id: sessionId } }),
//         api.get("/candidates", { params: { session_id: sessionId } }),
//       ]);

//       setJds(jdRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);

//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`, {
//         params: { session_id: sessionId }
//       });
  
//       setMappedCandidates(res.data.candidates || []);
//     } catch (err) {
//       console.error("Error loading JD mappings:", err);
//       toast.error("Failed loading candidates for JD.");
//     }
//   };

//   // -----------------------------------------------------
//   // CLOUD SETUP
//   // -----------------------------------------------------
//   // ✅ 2. Update handleSetup to store session_id
//   const handleSetup = async (provider) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider } });
//       setSetupData(res.data);
      
//       // Store Session ID from Backend
//       if (res.data.session_id) {
//         setSessionId(res.data.session_id);
//         toast.success(`Session started: ${res.data.session_id.slice(0,8)}...`);
//       } else {
//         toast.success("Cloud setup complete.");
//       }
//     } catch {
//       toast.error("Setup failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // PROCESS FILES
//   // -----------------------------------------------------
//   // ✅ 3. Update handleProcess to send session_id
//   const handleProcess = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider: "gcp", session_id: sessionId },
//       });

//       setProcessLogs(res.data);
//       toast.success("Processing completed.");
      
//       // Refresh data for this session
//       await refreshData();
      
//       if (res.data.details.length > 0) {
//         setTimeout(() => setActivePhase(3), 1500); 
//       }

//     } catch (err) {
//       if (err.code === 'ECONNABORTED') {
//         toast.warning("Processing is taking a while. Moving to workspace...");
//         setTimeout(() => {
//             refreshData();
//             setActivePhase(3);
//         }, 2000);
//       } else {
//         console.error(err);
//         toast.error("Processing failed.");
//       }
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // MAP CANDIDATE
//   // -----------------------------------------------------
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");

//     setLoadingId(candidateId);

//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//       });

//       toast.success("Candidate mapped.");
//       fetchMappedCandidates(selectedJdId);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // -----------------------------------------------------
//   // SHORTLIST / EVALUATE
//   // -----------------------------------------------------
//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;

//     setLoadingId(candidateId);

//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore),
//       });

//       setEvaluations((prev) => ({
//         ...prev,
//         [candidateId]: res.data,
//       }));

//       toast.success("Evaluation completed.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ======================================================
//   // ◼️ UI LAYOUT
//   // ======================================================
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
//       <Toaster richColors position="top-right" />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-white">TalentFlow <span className="text-emerald-400">AI</span></h1>
//               <p className="text-[10px] text-slate-500 font-medium tracking-wide">END-TO-END PIPELINE v1.0</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             {sessionId && (
//               <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
//                 SESSION: {sessionId.slice(0, 8)}
//               </div>
//             )}
//             <StatusBadge
//               active={backendOnline}
//               label={backendOnline ? "System Online" : "System Offline"}
//             />
//           </div>
//         </div>
//       </header>

//       {/* STEPS NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-12 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-12 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">

//           {/* ============ PHASE 1 — INFRASTRUCTURE ============ */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-4xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-6 text-white">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* <ProviderCard name="aws" label="AWS S3" onClick={() => toast.info("Coming soon")} /> */}
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => handleSetup("aws")} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => handleSetup("azure")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active onClick={() => handleSetup("gcp")} loading={loading} />
//                   {/* <ProviderCard name="azure" label="Azure Blob" onClick={() => toast.info("Coming soon")} /> */}
//                 </div>
//               ) : (
//                 <div className="p-8 bg-slate-900/50 rounded-2xl border border-emerald-500/20 text-center">
//                   <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
//                     <CheckCircle className="w-8 h-8 text-emerald-400" />
//                   </div>
//                   <h3 className="text-xl font-bold text-white mb-2">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded mb-6 text-left max-w-md mx-auto">
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                     {sessionId && <LogLine label="Session ID" value={sessionId} />}
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
//                   >
//                     Proceed to Ingestion
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 2 — UPLOAD + PROCESS ============ */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                  <div className="text-center p-12 border border-slate-800 rounded-2xl bg-slate-900/20">
//                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
//                    <h3 className="text-lg font-semibold text-slate-400">Environment Not Ready</h3>
//                    <button onClick={() => setActivePhase(1)} className="text-emerald-400 hover:underline mt-2 text-sm">Return to Step 1</button>
//                  </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">
//                   {/* Upload */}
//                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
//                     <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Documents
//                     </h3>
//                     <DragDropUpload />
//                   </div>

//                   {/* Process */}
//                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
//                     <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Pipeline
//                     </h3>
//                     {!processLogs ? (
//                       <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl">
//                         <p className="text-slate-500 mb-4 text-sm">Files uploaded to <b>incoming/</b> will be classified.</p>
//                         <button
//                           onClick={handleProcess}
//                           disabled={loading}
//                           className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-all font-medium disabled:opacity-50"
//                         >
//                           {loading ? "Running AI Models..." : "Run Classification"}
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="bg-black/40 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto font-mono text-xs">
//                         <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
//                            <span className="text-slate-400">PIPELINE LOGS</span>
//                            {/* <span className="text-emerald-400">{processLogs.total_files} processed</span> */}
//                            <span className="text-emerald-400">{processLogs.details.length} processed</span>

//                         </div>
//                         {processLogs.details.map((l, i) => (
//                           <div key={i} className="mb-2 flex items-center gap-2">
//                              <div className={`w-1.5 h-1.5 rounded-full ${l.type === 'UNKNOWN' ? 'bg-red-500' : 'bg-emerald-500'}`} />
//                              <span className="text-slate-300">{l.file}</span>
//                              <span className="text-slate-600">→</span>
//                              <span className="text-purple-400">{l.type}</span>
//                           </div>
//                         ))}
//                         <button 
//                           onClick={() => setActivePhase(3)} 
//                           className="w-full mt-4 bg-emerald-600/20 text-emerald-400 py-2 rounded border border-emerald-500/20 text-xs hover:bg-emerald-600/30 font-medium"
//                         >
//                             Go to Workspace
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 3 — RECRUITER WORKSPACE ============ */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[85vh]">

//               {/* LEFT PANEL — Job Descriptions */}
//               <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col">
//                 <h3 className="font-semibold mb-4 flex gap-2 items-center text-slate-300 px-2">
//                   <FileText className="w-4 h-4 text-blue-400" /> Available Roles
//                 </h3>

//                 <div className="overflow-y-auto flex-1 space-y-2 pr-2">
//                   {jds.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">No JDs classified yet.</div>}
//                   {jds.map((jd) => (
//                     <div
//                       key={jd.jd_id}
//                       onClick={() => setSelectedJdId(jd.jd_id)}
//                       className={`p-4 rounded-xl cursor-pointer border transition-all group ${
//                         selectedJdId === jd.jd_id
//                           ? "border-blue-500/50 bg-blue-500/10 shadow-lg"
//                           : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
//                       }`}
//                     >
//                       {/* ✅ FIX 1: Show Job Title or Filename */}
//                       <div className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors text-sm">
//                         {jd.job_title || jd.filename || jd.file_name}
//                       </div>
//                       <div className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
//                         {/* {(jd.text || jd.extracted_text || "").slice(0, 100)}... */}
//                         {/* {(jd.extracted_text || "").slice(0, 100)}... */}
//                         {(jd.text || "").slice(0, 100)}...


//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* RIGHT PANEL — Candidates */}
//               <div className="md:col-span-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col">
//                 <h3 className="font-semibold mb-4 flex gap-2 items-center text-slate-300 px-2">
//                   <Users className="w-4 h-4 text-emerald-400" /> Pipeline
//                 </h3>

//                 <div className="overflow-y-auto flex-1 pr-2">
//                    {!selectedJdId ? (
//                       <div className="h-full flex flex-col items-center justify-center text-slate-600">
//                          <FileText className="w-12 h-12 mb-2 opacity-20" />
//                          <p>Select a Job Role to start screening</p>
//                       </div>
//                    ) : (
//                       <>
//                         {/* MAPPED CANDIDATES */}
//                         {mappedCandidates.map((cand) => {
//                           const evalData = evaluations[cand.candidate_id] || {};
//                           // const hasEval = !!evalData.final_verdict;
//                           const hasEval = !!(evalData.final_verdict || evalData.status);
//                           const score = evalData.score || evalData.skills_match_score || 0;

//                           return (
//                             <div key={cand.candidate_id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-3 flex flex-col md:flex-row gap-4 relative overflow-hidden group">
//                               {/* Selection Indicator */}
//                               <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasEval ? (evalData.final_verdict || evalData.status === 'SELECTED' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-700'}`} />
                              
//                               <div className="flex-1 pl-3">
//                                 {/* ✅ FIX 2: Correct Name and Skills */}
//                                 <div className="flex justify-between items-start">
//                                     <div className="font-semibold text-lg text-slate-200">
//                                       {cand.candidate_name || cand.filename || cand.file_name}
//                                     </div>
//                                     {hasEval && (
//                                       <span className={`text-[10px] px-2 py-0.5 rounded border ${evalData.final_verdict || evalData.status === 'SELECTED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
//                                         {/* {evalData.final_verdict || evalData.status} */}
//                                         {evalData.final_verdict}

//                                       </span>
//                                     )}
//                                 </div>

//                                 <div className="text-xs text-slate-500 mt-1">
//                                   {parseSkills(cand.skills).slice(0, 6).join(" • ") || "Skills pending extraction..."}
//                                 </div>

//                                 {/* ✅ FIX 4: Detailed Evaluation Card */}
//                                 {hasEval ? (
//                                   <div className="mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
//                                       <div className="mb-2 text-sm text-slate-300">
//                                         {evalData.reasoning || evalData.reason || "Analysis complete."}
//                                       </div>
//                                       <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 border-t border-slate-800/50 pt-2 mt-2">
//                                         <span>Experience: <span className="text-slate-200">{evalData.experience_score || 0}/100</span></span>
//                                         <span>Skills: <span className="text-slate-200">{evalData.skills_score || 0}/100</span></span>
//                                         <span>Role Fit: <span className="text-slate-200">{evalData.role_alignment_score || 0}/100</span></span>
//                                       </div>
//                                   </div>
//                                 ) : (
//                                   <div className="mt-2 text-xs text-slate-500 line-clamp-2 italic">
//                                     {(cand.text || "").slice(0, 150)}...
                                    
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="flex flex-col items-center justify-center min-w-[100px] border-l border-slate-800 pl-4">
//                                 {hasEval ? (
//                                     <>
//                                         <ScoreRing score={score} />
//                                         <span className="text-[10px] text-slate-500 mt-2">Match Score</span>
//                                     </>
//                                 ) : (
//                                     <button 
//                                       onClick={() => handleShortlist(cand.candidate_id)}
//                                       disabled={loadingId === cand.candidate_id}
//                                       className="w-full py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
//                                     >
//                                       {loadingId === cand.candidate_id ? "Analysing..." : "Evaluate"}
//                                     </button>
//                                 )}
//                               </div>
//                             </div>
//                           );
//                         })}
                        
//                         {/* UNMAPPED SECTION */}
//                         <div className="mt-8 mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
//                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unmapped Candidates Pool</span>
//                             <span className="text-xs text-slate-600">{candidates.length - mappedCandidates.length} available</span>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                              {candidates
//                                 .filter(c => !mappedCandidates.find(m => m.candidate_id === c.candidate_id))
//                                 .map(cand => (
//                                     <div key={cand.candidate_id} className="p-3 border border-slate-800 rounded-lg bg-slate-900/30 flex justify-between items-center group hover:border-slate-700 transition-colors">
//                                         <div className="flex flex-col overflow-hidden">
//                                           {/* ✅ FIX 5: Correct Unmapped Name */}
//                                           <span className="text-xs text-slate-300 font-medium truncate">
//                                             {cand.candidate_name || cand.filename || cand.file_name}
//                                           </span>
//                                           <span className="text-[10px] text-slate-500 truncate">
//                                             {parseSkills(cand.skills).slice(0, 3).join(", ")}
//                                           </span>
//                                         </div>
//                                         <button 
//                                             onClick={() => handleMap(cand.candidate_id)}
//                                             disabled={loadingId === cand.candidate_id}
//                                             className="p-1.5 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-400 rounded transition-colors"
//                                         >
//                                             <ChevronRight className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 ))
//                              }
//                         </div>
//                       </>
//                    )}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // ------------------- SUB COMPONENTS -------------------
// const StepButton = ({ phase, current, onClick, label }) => {
//   const isActive = current === phase;
//   const isDone = current > phase;
  
//   return (
//     <button
//       onClick={() => onClick(phase)}
//       className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm transition-all ${
//         isActive ? "bg-slate-800 text-white shadow-lg ring-1 ring-slate-700" : "text-slate-500 hover:text-slate-300"
//       }`}
//     >
//       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
//         isActive ? "bg-emerald-500 text-slate-900" : isDone ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-800 border border-slate-700"
//       }`}>
//         {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : phase}
//       </div>
//       <span className={isActive ? "font-medium" : ""}>{label}</span>
//     </button>
//   );
// };

// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-xl border text-left transition-all relative group overflow-hidden",
//       active ? "bg-slate-900 border-emerald-500/50 shadow-xl" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700"
//     )}
//   >
//     <Cloud className="absolute -right-4 -top-4 w-24 h-24 text-slate-800/50 group-hover:text-slate-800 transition-colors" />
//     <div className="relative z-10">
//         <div className="text-xl font-bold text-white mb-1">{name.toUpperCase()}</div>
//         <p className="text-xs text-slate-400">{label}</p>
//         {active && (
//         <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
//             <CheckCircle className="w-3 h-3" /> ACTIVE
//         </div>
//         )}
//     </div>
//   </button>
// );

// /* ---------------- FILE UPLOAD (FIXED) ---------------- */
// const DragDropUpload = () => {
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => setFiles(Array.from(fileList));

//   const uploadAllFiles = async () => {
//     if (!files.length) return toast.error("No files selected");
//     setUploading(true);
//     setProgress(0);

//     let success = 0;

//     for (let i = 0; i < files.length; i++) {
//       const f = files[i];
//       try {
//         // 1. Get URL
//         const { data } = await api.post("/cloud/generate-upload-url", { filename: f.name });
        
//         // 2. Upload with explicit header matching backend signature
//         const res = await fetch(data.upload_url, {
//           method: "PUT",
//           body: f,
//           headers: { "Content-Type": "application/octet-stream" },
//         });

//         if (res.ok) {
//           success++;
//         } else {
//           // Log detailed error from Google
//           const errText = await res.text();
//           console.error(`GCS Error for ${f.name}:`, errText);
//           toast.error(`Upload failed: ${f.name}`);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error(`Network error: ${f.name}`);
//       }
//       setProgress(Math.round(((i + 1) / files.length) * 100));
//     }

//     if(success > 0) toast.success(`Uploaded ${success}/${files.length} files`);
//     setUploading(false);
//     setFiles([]);
//     setProgress(0);
//   };

//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 bg-slate-900/20 hover:bg-slate-900/40 transition-colors text-center">
//       <input type="file" multiple className="hidden" id="file-upload" onChange={(e) => handleFiles(e.target.files)} />
      
//       {!files.length ? (
//           <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
//              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 text-emerald-400">
//                 <Upload className="w-6 h-6" />
//              </div>
//              <span className="text-sm font-medium text-slate-300">Click to browse</span>
//              <span className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT supported</span>
//           </label>
//       ) : (
//           <div className="space-y-4">
//              <div className="text-sm text-slate-300 font-medium">{files.length} files selected</div>
//              <div className="flex flex-col gap-2">
//                  <button onClick={uploadAllFiles} disabled={uploading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
//                     {uploading ? `Uploading... ${progress}%` : "Start Upload"}
//                  </button>
//                  {uploading && <div className="h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
//              </div>
//           </div>
//       )}
//     </div>
//   );
// };


// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Cloud, Upload, FileText, Users, CheckCircle,
//   AlertCircle, BrainCircuit, ChevronRight
// } from "lucide-react";
// import { Toaster, toast } from "sonner";
// import axios from "axios";

// // ------------------- API CLIENT -------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   // ✅ Keeping timeout at 5 mins to prevent "Processing Failed" errors on large files
//   timeout: 300000, 
// });

// // ------------------- UTILITY -------------------
// const cn = (...classes) => classes.filter(Boolean).join(" ");

// // ✅ Helper to parse skills JSON string safely
// const parseSkills = (skillString) => {
//   try {
//     const parsed = JSON.parse(skillString);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// };

// // ------------------- HELPER COMPONENTS -------------------
// const StatusBadge = ({ active, label }) => (
//   <div
//     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//       active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
//     }`}
//   >
//     {label}
//   </div>
// );

// const LogLine = ({ label, value }) => (
//   <div className="flex justify-between text-xs">
//     <span className="text-slate-500">{label}</span>
//     <span className="text-slate-300">{value}</span>
//   </div>
// );

// const ScoreRing = ({ score }) => (
//   <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold bg-slate-900">
//     {score}
//   </div>
// );

// // Animation variants
// const fadeIn = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

// // ======================================================
// // ◼️ MAIN APPLICATION
// // ======================================================
// export default function App() {
//   const [activePhase, setActivePhase] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [backendOnline, setBackendOnline] = useState(false);

//   // ✅ 1. Add Session & Provider State
//   const [sessionId, setSessionId] = useState(null);
//   const [provider, setProvider] = useState("gcp"); // Default to GCP

//   const [jds, setJds] = useState([]);
//   const [candidates, setCandidates] = useState([]);

//   const [setupData, setSetupData] = useState(null);
//   const [processLogs, setProcessLogs] = useState(null);

//   const [selectedJdId, setSelectedJdId] = useState(null);
//   const [mappedCandidates, setMappedCandidates] = useState([]);

//   const [evaluations, setEvaluations] = useState({});
//   const [loadingId, setLoadingId] = useState(null);

//   const [defaultSkillScore] = useState(75);

//   // -----------------------------------------------------
//   // LOAD INITIAL DATA
//   // -----------------------------------------------------
  
//   useEffect(() => {
//     if (sessionId) {
//       refreshData();
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     if (selectedJdId) fetchMappedCandidates(selectedJdId);
//   }, [selectedJdId]);

//   const refreshData = async () => {
//     if (!sessionId) return; 

//     try {
//       const [jdRes, candRes] = await Promise.all([
//         api.get("/jds", { params: { session_id: sessionId } }),
//         api.get("/candidates", { params: { session_id: sessionId } }),
//       ]);

//       setJds(jdRes.data.jds || []);
//       setCandidates(candRes.data.candidates || []);

//       setBackendOnline(true);
//     } catch {
//       setBackendOnline(false);
//     }
//   };

//   const fetchMappedCandidates = async (jdId) => {
//     try {
//       const res = await api.get(`/jd/${jdId}/candidates`, {
//         params: { session_id: sessionId }
//       });
  
//       setMappedCandidates(res.data.candidates || []);
//     } catch (err) {
//       console.error("Error loading JD mappings:", err);
//       toast.error("Failed loading candidates for JD.");
//     }
//   };

//   // -----------------------------------------------------
//   // CLOUD SETUP
//   // -----------------------------------------------------
//   // ✅ 2. Handle Setup with dynamic provider
//   const handleSetup = async (providerName) => {
//     setLoading(true);
//     try {
//       const res = await api.get("/cloud/setup", { params: { provider: providerName } });
//       setSetupData(res.data);
//       setProvider(providerName); // 👈 Store selected provider

//       // Store Session ID from Backend
//       if (res.data.session_id) {
//         setSessionId(res.data.session_id);
//         toast.success(`Session started: ${res.data.session_id.slice(0,8)}...`);
//       } else {
//         toast.success("Cloud setup complete.");
//       }
//     } catch {
//       toast.error("Setup failed.");
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // PROCESS FILES
//   // -----------------------------------------------------
//   // ✅ 3. Use provider state when processing
//   const handleProcess = async () => {
//     if (!sessionId) return toast.error("No session. Please run setup first.");
//     setLoading(true);
//     try {
//       const res = await api.post("/cloud/process-files", null, {
//         params: { provider, session_id: sessionId }, // 👈 dynamic provider
//       });

//       setProcessLogs(res.data);
//       toast.success("Processing completed.");
      
//       await refreshData();
      
//       if (res.data.details && res.data.details.length > 0) {
//         setTimeout(() => setActivePhase(3), 1500); 
//       }

//     } catch (err) {
//       if (err.code === 'ECONNABORTED') {
//         toast.warning("Processing is taking a while. Moving to workspace...");
//         setTimeout(() => {
//             refreshData();
//             setActivePhase(3);
//         }, 2000);
//       } else {
//         console.error(err);
//         toast.error("Processing failed.");
//       }
//     }
//     setLoading(false);
//   };

//   // -----------------------------------------------------
//   // MAP CANDIDATE
//   // -----------------------------------------------------
//   const handleMap = async (candidateId) => {
//     if (!selectedJdId) return toast.warning("Select a JD first.");

//     setLoadingId(candidateId);

//     try {
//       await api.post("/map-candidate-to-jd", {
//         jd_id: selectedJdId,
//         candidate_id: candidateId,
//       });

//       toast.success("Candidate mapped.");
//       fetchMappedCandidates(selectedJdId);
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // -----------------------------------------------------
//   // SHORTLIST / EVALUATE
//   // -----------------------------------------------------
//   const handleShortlist = async (candidateId) => {
//     if (!selectedJdId) return;

//     setLoadingId(candidateId);

//     try {
//       const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
//         candidate_id: candidateId,
//         skills_match_score: Number(defaultSkillScore),
//       });

//       setEvaluations((prev) => ({
//         ...prev,
//         [candidateId]: res.data,
//       }));

//       toast.success("Evaluation completed.");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ======================================================
//   // ◼️ UI LAYOUT
//   // ======================================================
//   return (
//     <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
//       <Toaster richColors position="top-right" />

//       {/* HEADER */}
//       <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
//               <BrainCircuit className="w-6 h-6 text-emerald-400" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-white">TalentFlow <span className="text-emerald-400">AI</span></h1>
//               <p className="text-[10px] text-slate-500 font-medium tracking-wide">END-TO-END PIPELINE v1.0</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             {sessionId && (
//               <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-2">
//                 <Cloud className="w-3 h-3" /> {provider.toUpperCase()} SESSION: {sessionId.slice(0, 8)}
//               </div>
//             )}
//             <StatusBadge
//               active={backendOnline}
//               label={backendOnline ? "System Online" : "System Offline"}
//             />
//           </div>
//         </div>
//       </header>

//       {/* STEPS NAV */}
//       <div className="border-b border-slate-800 bg-[#020617]/60 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
//           <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
//           <div className="w-12 h-px bg-slate-800" />
//           <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
//           <div className="w-12 h-px bg-slate-800" />
//           <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
//         </div>
//       </div>

//       {/* MAIN */}
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <AnimatePresence mode="wait">

//           {/* ============ PHASE 1 — INFRASTRUCTURE ============ */}
//           {activePhase === 1 && (
//             <motion.div key="p1" {...fadeIn} className="max-w-4xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-6 text-white">Cloud Infrastructure</h2>

//               {!setupData ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <ProviderCard name="aws" label="AWS S3" onClick={() => handleSetup("aws")} />
//                   <ProviderCard name="gcp" label="Google Cloud" active={provider === "gcp"} onClick={() => handleSetup("gcp")} loading={loading} />
//                   <ProviderCard name="azure" label="Azure Blob" onClick={() => handleSetup("azure")} />
//                 </div>
//               ) : (
//                 <div className="p-8 bg-slate-900/50 rounded-2xl border border-emerald-500/20 text-center">
//                   <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
//                     <CheckCircle className="w-8 h-8 text-emerald-400" />
//                   </div>
//                   <h3 className="text-xl font-bold text-white mb-2">Environment Ready</h3>

//                   <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded mb-6 text-left max-w-md mx-auto">
//                     <LogLine label="Provider" value={provider.toUpperCase()} />
//                     <LogLine label="Bucket" value={setupData.bucket_name} />
//                     <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
//                     {sessionId && <LogLine label="Session ID" value={sessionId} />}
//                   </div>

//                   <button
//                     onClick={() => setActivePhase(2)}
//                     className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
//                   >
//                     Proceed to Ingestion
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 2 — UPLOAD + PROCESS ============ */}
//           {activePhase === 2 && (
//             <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
//               {!setupData ? (
//                  <div className="text-center p-12 border border-slate-800 rounded-2xl bg-slate-900/20">
//                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
//                    <h3 className="text-lg font-semibold text-slate-400">Environment Not Ready</h3>
//                    <button onClick={() => setActivePhase(1)} className="text-emerald-400 hover:underline mt-2 text-sm">Return to Step 1</button>
//                  </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 gap-8">
//                   {/* Upload */}
//                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
//                     <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
//                       <Upload className="w-5 h-5 text-emerald-400" /> Upload Documents
//                     </h3>
//                     {/* ✅ Pass provider to Upload Component */}
//                     <DragDropUpload provider={provider} />
//                   </div>

//                   {/* Process */}
//                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
//                     <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
//                       <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Pipeline
//                     </h3>
//                     {!processLogs ? (
//                       <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl">
//                         <p className="text-slate-500 mb-4 text-sm">Files uploaded to <b>incoming/</b> will be classified.</p>
//                         <button
//                           onClick={handleProcess}
//                           disabled={loading}
//                           className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-all font-medium disabled:opacity-50"
//                         >
//                           {loading ? "Running AI Models..." : "Run Classification"}
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="bg-black/40 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto font-mono text-xs">
//                         <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
//                            <span className="text-slate-400">PIPELINE LOGS</span>
//                            <span className="text-emerald-400">{processLogs.details ? processLogs.details.length : 0} processed</span>
//                         </div>
//                         {processLogs.details && processLogs.details.map((l, i) => (
//                           <div key={i} className="mb-2 flex items-center gap-2">
//                              <div className={`w-1.5 h-1.5 rounded-full ${l.type === 'UNKNOWN' ? 'bg-red-500' : 'bg-emerald-500'}`} />
//                              <span className="text-slate-300">{l.file}</span>
//                              <span className="text-slate-600">→</span>
//                              <span className="text-purple-400">{l.type}</span>
//                           </div>
//                         ))}
//                         <button 
//                           onClick={() => setActivePhase(3)} 
//                           className="w-full mt-4 bg-emerald-600/20 text-emerald-400 py-2 rounded border border-emerald-500/20 text-xs hover:bg-emerald-600/30 font-medium"
//                         >
//                             Go to Workspace
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ============ PHASE 3 — RECRUITER WORKSPACE ============ */}
//           {activePhase === 3 && (
//             <motion.div key="p3" {...fadeIn} className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[85vh]">

//               {/* LEFT PANEL — Job Descriptions */}
//               <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col">
//                 <h3 className="font-semibold mb-4 flex gap-2 items-center text-slate-300 px-2">
//                   <FileText className="w-4 h-4 text-blue-400" /> Available Roles
//                 </h3>

//                 <div className="overflow-y-auto flex-1 space-y-2 pr-2">
//                   {jds.length === 0 && <div className="text-center py-10 text-slate-600 text-sm">No JDs classified yet.</div>}
//                   {jds.map((jd) => (
//                     <div
//                       key={jd.jd_id}
//                       onClick={() => setSelectedJdId(jd.jd_id)}
//                       className={`p-4 rounded-xl cursor-pointer border transition-all group ${
//                         selectedJdId === jd.jd_id
//                           ? "border-blue-500/50 bg-blue-500/10 shadow-lg"
//                           : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
//                       }`}
//                     >
//                       <div className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors text-sm">
//                         {jd.job_title || jd.filename || jd.file_name}
//                       </div>
//                       <div className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
//                         {(jd.text || jd.extracted_text || "").slice(0, 100)}...
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* RIGHT PANEL — Candidates */}
//               <div className="md:col-span-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col">
//                 <h3 className="font-semibold mb-4 flex gap-2 items-center text-slate-300 px-2">
//                   <Users className="w-4 h-4 text-emerald-400" /> Pipeline
//                 </h3>

//                 <div className="overflow-y-auto flex-1 pr-2">
//                    {!selectedJdId ? (
//                       <div className="h-full flex flex-col items-center justify-center text-slate-600">
//                          <FileText className="w-12 h-12 mb-2 opacity-20" />
//                          <p>Select a Job Role to start screening</p>
//                       </div>
//                    ) : (
//                       <>
//                         {/* MAPPED CANDIDATES */}
//                         {mappedCandidates.map((cand) => {
//                           const evalData = evaluations[cand.candidate_id] || {};
//                           const hasEval = !!(evalData.final_verdict || evalData.status);
//                           const score = evalData.score || evalData.skills_match_score || 0;

//                           return (
//                             <div key={cand.candidate_id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-3 flex flex-col md:flex-row gap-4 relative overflow-hidden group">
//                               <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasEval ? (evalData.final_verdict === 'SELECTED' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-700'}`} />
                              
//                               <div className="flex-1 pl-3">
//                                 <div className="flex justify-between items-start">
//                                     <div className="font-semibold text-lg text-slate-200">
//                                       {cand.candidate_name || cand.filename || cand.file_name}
//                                     </div>
//                                     {hasEval && (
//                                       <span className={`text-[10px] px-2 py-0.5 rounded border ${evalData.final_verdict === 'SELECTED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
//                                         {evalData.final_verdict}
//                                       </span>
//                                     )}
//                                 </div>

//                                 <div className="text-xs text-slate-500 mt-1">
//                                   {parseSkills(cand.skills).slice(0, 6).join(" • ") || "Skills pending extraction..."}
//                                 </div>

//                                 {hasEval ? (
//                                   <div className="mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
//                                       <div className="mb-2 text-sm text-slate-300">
//                                         {evalData.reasoning || evalData.reason || "Analysis complete."}
//                                       </div>
//                                       <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 border-t border-slate-800/50 pt-2 mt-2">
//                                         <span>Experience: <span className="text-slate-200">{evalData.experience_score || 0}/100</span></span>
//                                         <span>Skills: <span className="text-slate-200">{evalData.skills_score || 0}/100</span></span>
//                                         <span>Role Fit: <span className="text-slate-200">{evalData.role_alignment_score || 0}/100</span></span>
//                                       </div>
//                                   </div>
//                                 ) : (
//                                   <div className="mt-2 text-xs text-slate-500 line-clamp-2 italic">
//                                     {(cand.text || cand.extracted_text || "").slice(0, 150)}...
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="flex flex-col items-center justify-center min-w-[100px] border-l border-slate-800 pl-4">
//                                 {hasEval ? (
//                                     <>
//                                         <ScoreRing score={score} />
//                                         <span className="text-[10px] text-slate-500 mt-2">Match Score</span>
//                                     </>
//                                 ) : (
//                                     <button 
//                                       onClick={() => handleShortlist(cand.candidate_id)}
//                                       disabled={loadingId === cand.candidate_id}
//                                       className="w-full py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
//                                     >
//                                       {loadingId === cand.candidate_id ? "Analysing..." : "Evaluate"}
//                                     </button>
//                                 )}
//                               </div>
//                             </div>
//                           );
//                         })}
                        
//                         {/* UNMAPPED SECTION */}
//                         <div className="mt-8 mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
//                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unmapped Candidates Pool</span>
//                             <span className="text-xs text-slate-600">{candidates.length - mappedCandidates.length} available</span>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                              {candidates
//                                 .filter(c => !mappedCandidates.find(m => m.candidate_id === c.candidate_id))
//                                 .map(cand => (
//                                     <div key={cand.candidate_id} className="p-3 border border-slate-800 rounded-lg bg-slate-900/30 flex justify-between items-center group hover:border-slate-700 transition-colors">
//                                         <div className="flex flex-col overflow-hidden">
//                                           <span className="text-xs text-slate-300 font-medium truncate">
//                                             {cand.candidate_name || cand.filename || cand.file_name}
//                                           </span>
//                                           <span className="text-[10px] text-slate-500 truncate">
//                                             {parseSkills(cand.skills).slice(0, 3).join(", ")}
//                                           </span>
//                                         </div>
//                                         <button 
//                                             onClick={() => handleMap(cand.candidate_id)}
//                                             disabled={loadingId === cand.candidate_id}
//                                             className="p-1.5 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-400 rounded transition-colors"
//                                         >
//                                             <ChevronRight className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 ))
//                              }
//                         </div>
//                       </>
//                    )}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>
//       </main>
//     </div>
//   );
// }

// // ------------------- SUB COMPONENTS -------------------
// const StepButton = ({ phase, current, onClick, label }) => {
//   const isActive = current === phase;
//   const isDone = current > phase;
  
//   return (
//     <button
//       onClick={() => onClick(phase)}
//       className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm transition-all ${
//         isActive ? "bg-slate-800 text-white shadow-lg ring-1 ring-slate-700" : "text-slate-500 hover:text-slate-300"
//       }`}
//     >
//       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
//         isActive ? "bg-emerald-500 text-slate-900" : isDone ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-800 border border-slate-700"
//       }`}>
//         {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : phase}
//       </div>
//       <span className={isActive ? "font-medium" : ""}>{label}</span>
//     </button>
//   );
// };

// const ProviderCard = ({ name, label, active, onClick, loading }) => (
//   <button
//     onClick={onClick}
//     disabled={loading}
//     className={cn(
//       "p-6 rounded-xl border text-left transition-all relative group overflow-hidden",
//       active ? "bg-slate-900 border-emerald-500/50 shadow-xl" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700"
//     )}
//   >
//     <Cloud className="absolute -right-4 -top-4 w-24 h-24 text-slate-800/50 group-hover:text-slate-800 transition-colors" />
//     <div className="relative z-10">
//         <div className="text-xl font-bold text-white mb-1">{name.toUpperCase()}</div>
//         <p className="text-xs text-slate-400">{label}</p>
//         {active && (
//         <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
//             <CheckCircle className="w-3 h-3" /> ACTIVE
//         </div>
//         )}
//     </div>
//   </button>
// );

// // ----------------- FILE UPLOAD ----------------
// const DragDropUpload = ({ provider }) => { // ✅ Accept provider prop
//   const [files, setFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const handleFiles = (fileList) => setFiles(Array.from(fileList));

//   const uploadAllFiles = async () => {
//     if (!files.length) return toast.error("No files selected");
//     if (!provider) return toast.error("Cloud provider not selected");

//     setUploading(true);
//     setProgress(0);

//     let success = 0;

//     for (let i = 0; i < files.length; i++) {
//       const f = files[i];
//       try {
//         // 1. Get Signed URL (Provider Aware)
//         const { data } = await api.post(
//           "/cloud/generate-upload-url", 
//           { filename: f.name },
//           { params: { provider } } // ✅ Pass provider
//         );
        
//         // 2. Upload (No Headers, strictly body)
//         const res = await fetch(data.upload_url, {
//           method: "PUT",
//           body: f,
//           // headers: { "Content-Type": "application/octet-stream" } // Explicitly removed to prevent signature issues
//         });

//         if (res.ok) {
//           success++;
//         } else {
//           const errText = await res.text();
//           console.error(`${provider.toUpperCase()} Upload Error for ${f.name}:`, errText);
//           toast.error(`Upload failed: ${f.name}`);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error(`Network error: ${f.name}`);
//       }
//       setProgress(Math.round(((i + 1) / files.length) * 100));
//     }

//     if(success > 0) toast.success(`Uploaded ${success}/${files.length} files`);
//     setUploading(false);
//     setFiles([]);
//     setProgress(0);
//   };

//   return (
//     <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 bg-slate-900/20 hover:bg-slate-900/40 transition-colors text-center">
//       <input type="file" multiple className="hidden" id="file-upload" onChange={(e) => handleFiles(e.target.files)} />
      
//       {!files.length ? (
//           <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
//              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 text-emerald-400">
//                 <Upload className="w-6 h-6" />
//              </div>
//              <span className="text-sm font-medium text-slate-300">Click to browse</span>
//              <span className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT supported</span>
//           </label>
//       ) : (
//           <div className="space-y-4">
//              <div className="text-sm text-slate-300 font-medium">{files.length} files selected</div>
//              <div className="flex flex-col gap-2">
//                  <button onClick={uploadAllFiles} disabled={uploading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
//                     {uploading ? `Uploading... ${progress}%` : "Start Upload"}
//                  </button>
//                  {uploading && <div className="h-1 bg-slate-800 rounded overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
//              </div>
//           </div>
//       )}
//     </div>
//   );
// };

/* --- TalentFlow AI: Full Updated App.jsx --- */
/* Includes Correct AWS/GCP/Azure Upload Handling */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, Upload, FileText, Users, CheckCircle,
  AlertCircle, BrainCircuit, ChevronRight
} from "lucide-react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import AzureCloudSelector from "./components/AzureCloudSelector";

// ------------------- API CLIENT -------------------
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 300000,
});

// ------------------- UTILITY -------------------
const cn = (...classes) => classes.filter(Boolean).join(" ");
const parseSkills = (str) => {
  try {
    const p = JSON.parse(str);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

// ------------------- REUSABLE COMPONENTS -------------------
const StatusBadge = ({ active, label }) => (
  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
    active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
  }`}>
    {label}
  </div>
);

const LogLine = ({ label, value }) => (
  <div className="flex justify-between text-xs">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-300">{value}</span>
  </div>
);

const ScoreRing = ({ score }) => (
  <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-bold bg-slate-900">
    {score}
  </div>
);

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// ======================================================
// ◼️ MAIN APPLICATION
// ======================================================
export default function App() {
  const [activePhase, setActivePhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [provider, setProvider] = useState("gcp");

  const [jds, setJds] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [setupData, setSetupData] = useState(null);
  const [processLogs, setProcessLogs] = useState(null);

  const [selectedJdId, setSelectedJdId] = useState(null);
  const [mappedCandidates, setMappedCandidates] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const [defaultSkillScore] = useState(75);

  // AUTO LOAD
  useEffect(() => { if (sessionId) refreshData(); }, [sessionId]);
  useEffect(() => { if (selectedJdId) loadMapped(selectedJdId); }, [selectedJdId]);

  const refreshData = async () => {
    if (!sessionId) return;

    try {
      const [jRes, cRes] = await Promise.all([
        api.get("/jds", { params: { session_id: sessionId } }),
        api.get("/candidates", { params: { session_id: sessionId } }),
      ]);
      setJds(jRes.data.jds || []);
      setCandidates(cRes.data.candidates || []);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const loadMapped = async (jdId) => {
    try {
      const res = await api.get(`/jd/${jdId}/candidates`, {
        params: { session_id: sessionId }
      });
      setMappedCandidates(res.data.candidates || []);
    } catch {
      toast.error("Failed loading candidates.");
    }
  };

  // CLOUD SETUP
  const handleSetup = async (prov) => {
    setLoading(true);
    try {
      const res = await api.get("/cloud/setup", { params: { provider: prov } });
      setSetupData(res.data);
      setProvider(prov);

      if (res.data.session_id) {
        setSessionId(res.data.session_id);
        toast.success(`Session started: ${res.data.session_id.slice(0, 8)}...`);
      }
    } catch {
      toast.error("Setup failed.");
    }
    setLoading(false);
  };

  // PROCESS FILES
  const handleProcess = async () => {
    if (!sessionId) return toast.error("No session. Run setup first.");
    setLoading(true);
    try {
      const res = await api.post("/cloud/process-files", null, {
        params: { provider, session_id: sessionId }
      });

      setProcessLogs(res.data);
      toast.success("Processing done.");
      await refreshData();
      if (res.data.details?.length) setTimeout(() => setActivePhase(3), 1200);

    } catch (err) {
      toast.error("Processing failed.");
    }
    setLoading(false);
  };

  // MAP CANDIDATES
  const handleMap = async (cid) => {
    if (!selectedJdId) return toast.warning("Select JD first");
    setLoadingId(cid);

    try {
      await api.post("/map-candidate-to-jd", {
        jd_id: selectedJdId,
        candidate_id: cid,
      });
      loadMapped(selectedJdId);
      toast.success("Mapped.");
    } finally {
      setLoadingId(null);
    }
  };

  // SHORTLIST
  const handleShortlist = async (cid) => {
    if (!selectedJdId) return;

    setLoadingId(cid);
    try {
      const res = await api.post(`/jd/${selectedJdId}/shortlist`, {
        candidate_id: cid,
        skills_match_score: Number(defaultSkillScore),
      });

      setEvaluations((p) => ({ ...p, [cid]: res.data }));
      toast.success("Evaluation done.");
    } finally {
      setLoadingId(null);
    }
  };

  // ======================================================
  // RENDER UI
  // ======================================================
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Toaster richColors position="top-right" />

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TalentFlow <span className="text-emerald-400">AI</span></h1>
              <p className="text-[10px] text-slate-500">END-TO-END PIPELINE v1.0</p>
            </div>
          </div>

          {sessionId && (
            <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <Cloud className="w-3 h-3 inline-block mr-1" />
              {provider.toUpperCase()} | {sessionId.slice(0, 8)}
            </div>
          )}
          <StatusBadge active={backendOnline} label={backendOnline ? "Online" : "Offline"} />
        </div>
      </header>

      {/* STEPPER */}
      <div className="border-b border-slate-800 bg-[#020617]/60">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <StepButton phase={1} current={activePhase} onClick={setActivePhase} label="Infrastructure" />
          <div className="w-12 h-px bg-slate-800" />
          <StepButton phase={2} current={activePhase} onClick={setActivePhase} label="Ingest & Classify" />
          <div className="w-12 h-px bg-slate-800" />
          <StepButton phase={3} current={activePhase} onClick={setActivePhase} label="Recruiter Workspace" />
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* PHASE 1 */}
          {activePhase === 1 && (
            <motion.div key="p1" {...fadeIn} className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-white">Cloud Infrastructure</h2>

              {!setupData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* <ProviderCard name="aws" label="AWS S3"  active={provider === "aws"} onClick={() => handleSetup("aws")} />
                  <ProviderCard name="gcp" label="Google Cloud" active={provider==="gcp"} onClick={() => handleSetup("gcp")} />
                  <ProviderCard name="azure" label="Azure Blob" onClick={() => handleSetup("azure")} /> */}
                  <ProviderCard
                      name="aws"
                      label="AWS S3"
                      active={provider === "aws"}
                      onClick={() => handleSetup("aws")}
                  />

                  <ProviderCard
                      name="gcp"
                      label="Google Cloud"
                      active={provider === "gcp"}
                      onClick={() => handleSetup("gcp")}
                  />

                  {/* Replaced Azure ProviderCard with specialized selector */}
                  <div className="p-6 rounded-xl border bg-slate-900/40 border-slate-800 flex flex-col justify-center items-center">
                      <div className="text-xl font-bold mb-4 text-white">AZURE</div>
                      <AzureCloudSelector />
                  </div>

                </div>
              ) : (
                <div className="p-8 bg-slate-900/50 rounded-2xl border border-emerald-500/20">
                  <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold">Environment Ready</h3>

                  <div className="mt-4 bg-slate-950 p-4 border border-slate-800 rounded text-left max-w-md mx-auto">
                    <LogLine label="Provider" value={provider.toUpperCase()} />
                    <LogLine label="Bucket/Container" value={setupData.bucket_name} />
                    <LogLine label="Folders" value={JSON.stringify(setupData.folders_created)} />
                    {sessionId && <LogLine label="Session ID" value={sessionId} />}
                  </div>

                  <button
                    onClick={() => setActivePhase(2)}
                    className="mt-4 bg-emerald-600 text-white px-8 py-2.5 rounded-lg shadow-lg">
                    Continue
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE 2 */}
          {activePhase === 2 && (
            <motion.div key="p2" {...fadeIn} className="max-w-5xl mx-auto">
              {!setupData ? (
                <div className="text-center p-12 border border-slate-800 bg-slate-900/20 rounded-2xl">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>Environment not ready.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">

                  {/* Upload */}
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                      <Upload className="w-5 h-5 text-emerald-400" /> Upload Documents
                    </h3>
                    <DragDropUpload provider={provider} />
                  </div>

                  {/* Process */}
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                    <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Pipeline
                    </h3>

                    {!processLogs ? (
                      <div className="h-64 flex flex-col justify-center items-center border-2 border-dashed border-slate-700 rounded-lg">
                        <p className="text-slate-500 mb-4">Files in incoming/ will be classified.</p>
                        <button
                          onClick={handleProcess}
                          className="px-6 py-2 bg-slate-800 text-white rounded-lg">
                          {loading ? "Processing..." : "Run Classification"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-black/40 p-4 border border-slate-800 rounded-lg h-64 overflow-y-auto text-xs">
                        <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
                          <span className="text-slate-400">PIPELINE LOGS</span>
                          <span className="text-emerald-400">{processLogs.details?.length || 0} processed</span>
                        </div>

                        {processLogs.details?.map((l, i) => (
                          <div key={i} className="flex gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              l.type === 'UNKNOWN' ? 'bg-red-500' : 'bg-emerald-500'
                            }`} />
                            <span>{l.file}</span>
                            <span className="text-purple-400">{l.type}</span>
                          </div>
                        ))}

                        <button
                          onClick={() => setActivePhase(3)}
                          className="w-full mt-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs">
                          Go to Workspace
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE 3 */}
          {activePhase === 3 && (
            <motion.div key="p3" {...fadeIn} className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[85vh]">

              {/* LEFT PANEL */}
              <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex flex-col">
                <h3 className="mb-3 text-slate-300 flex gap-2 items-center">
                  <FileText className="w-4 h-4 text-blue-400" /> Available Roles
                </h3>
                <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                  {jds.map((jd) => (
                    <div
                      key={jd.jd_id}
                      onClick={() => setSelectedJdId(jd.jd_id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        selectedJdId === jd.jd_id
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}>
                      <div className="text-sm font-semibold">{jd.job_title || jd.filename}</div>
                      <div className="text-xs text-slate-500 mt-1 italic">
                        {(jd.text || "").slice(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="md:col-span-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden">
                <h3 className="mb-3 flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-emerald-400" /> Pipeline
                </h3>

                <div className="overflow-y-auto flex-1 pr-1">

                  {!selectedJdId ? (
                    <div className="text-center text-slate-600 mt-20">
                      <FileText className="w-16 h-16 mx-auto opacity-10 mb-3" />
                      <p>Select a Job Role to start screening.</p>
                    </div>
                  ) : (
                    <>
                      {mappedCandidates.map(c => {
                        const evalData = evaluations[c.candidate_id] || {};
                        const hasEval = !!evalData.final_verdict;
                        const score = evalData.skills_match_score || 0;

                        return (
                          <div key={c.candidate_id}
                            className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-3 flex gap-4 relative">

                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div className="text-slate-200 font-semibold">
                                  {c.candidate_name || c.filename}
                                </div>
                                {hasEval && (
                                  <span className={`px-2 py-1 text-[10px] rounded border ${
                                    evalData.final_verdict === "SELECTED"
                                      ? "text-emerald-400 border-emerald-500/20"
                                      : "text-red-400 border-red-500/20"
                                  }`}>
                                    {evalData.final_verdict}
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-500 mt-1">
                                {parseSkills(c.skills).join(" • ")}
                              </div>

                              {!hasEval && (
                                <div className="text-xs text-slate-600 mt-2 italic">
                                  {(c.text || "").slice(0, 140)}...
                                </div>
                              )}

                              {hasEval && (
                                <div className="mt-3 bg-slate-900/40 p-3 rounded border border-slate-800 text-xs">
                                  <div className="text-slate-300 mb-2">
                                    {evalData.reasoning || evalData.reason}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-center justify-center border-l border-slate-800 pl-3">
                              {hasEval ? (
                                <>
                                  <ScoreRing score={score} />
                                  <span className="text-[10px] mt-1 text-slate-500">Match</span>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleShortlist(c.candidate_id)}
                                  className="px-3 py-1 text-xs rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                                  Evaluate
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}

                      {/* Unmapped */}
                      <div className="mt-6 text-slate-500 text-xs font-bold tracking-wide">
                        UNMAPPED CANDIDATES
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {candidates
                          .filter(c => !mappedCandidates.some(m => m.candidate_id === c.candidate_id))
                          .map(c => (
                            <div key={c.candidate_id}
                              className="p-3 bg-slate-900/40 border border-slate-800 rounded flex justify-between">
                              <div className="text-xs">
                                <div className="text-slate-300">{c.filename}</div>
                                <div className="text-slate-500 text-[10px]">
                                  {parseSkills(c.skills).slice(0, 3).join(", ")}
                                </div>
                              </div>
                              <button
                                onClick={() => handleMap(c.candidate_id)}
                                className="p-1 rounded hover:bg-emerald-600/20 text-slate-500 hover:text-emerald-400">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>

                    </>
                  )}

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// ------------------- SUB COMPONENTS -------------------
const StepButton = ({ phase, current, onClick, label }) => {
  const active = current === phase;
  const done = current > phase;

  return (
    <button
      onClick={() => onClick(phase)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        active ? "bg-slate-800 text-white" : "text-slate-600"
      }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
        active ? "bg-emerald-500 text-slate-900" :
        done ? "bg-emerald-900/40 text-emerald-400" :
        "bg-slate-800 border border-slate-700"
      }`}>
        {done ? <CheckCircle className="w-3 h-3" /> : phase}
      </div>
      {label}
    </button>
  );
};

const ProviderCard = ({ name, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-xl border relative overflow-hidden ${
      active ? "bg-slate-900 border-emerald-500/50 shadow-lg" :
      "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60"
    }`}>
    <Cloud className="absolute -right-4 -top-4 w-24 h-24 text-slate-800/40" />
    <div className="relative">
      <div className="text-xl font-bold mb-1 text-white">{name.toUpperCase()}</div>
      <p className="text-xs text-slate-400">{label}</p>
      {active && (
        <div className="mt-3 px-2 py-1 text-[10px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded flex gap-1 items-center">
          <CheckCircle className="w-3 h-3" /> ACTIVE
        </div>
      )}
    </div>
  </button>
);

// ============= FIXED UPLOAD COMPONENT =============
const DragDropUpload = ({ provider }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (f) => setFiles(Array.from(f));

  const uploadAllFiles = async () => {
    if (!files.length) return toast.error("No files selected");

    setUploading(true);
    setProgress(0);

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];

      try {
        // 1. Get presigned URL
        const { data } = await api.post(
          "/cloud/generate-upload-url",
          { filename: f.name },
          { params: { provider } }
        );

        // 2. Correct headers per-cloud
        let headers = {};

        if (provider === "azure") {
          headers["x-ms-blob-type"] = "BlockBlob";
          headers["Content-Type"] = "application/octet-stream";
        } else if (provider === "aws" || provider === "gcp") {
          headers["Content-Type"] = "application/octet-stream";
        }

        // 3. Upload file
        const res = await fetch(data.upload_url, {
          method: "PUT",
          body: f,
          headers,
        });

        if (res.ok) successCount++;
        else toast.error(`Upload failed: ${f.name}`);

      } catch (err) {
        toast.error(`Network error: ${f.name}`);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    if (successCount > 0)
      toast.success(`Uploaded ${successCount}/${files.length} files`);

    setUploading(false);
    setFiles([]);
    setProgress(0);
  };

  return (
    <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-900/20">

      <input type="file" multiple className="hidden" id="uploader"
        onChange={(e) => handleFiles(e.target.files)} />

      {!files.length ? (
        <label htmlFor="uploader" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-sm text-slate-300">Click to browse</span>
          <span className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT supported</span>
        </label>
      ) : (
        <div>
          <div className="text-sm text-slate-300 mb-3">{files.length} selected</div>

          <button
            onClick={uploadAllFiles}
            className="bg-emerald-600 px-4 py-2 text-sm rounded text-white">
            {uploading ? `Uploading... ${progress}%` : "Start Upload"}
          </button>

          {uploading && (
            <div className="h-1 w-full bg-slate-800 rounded mt-2 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-emerald-500 transition-all" />
            </div>
          )}
        </div>
      )}

    </div>
  );
};