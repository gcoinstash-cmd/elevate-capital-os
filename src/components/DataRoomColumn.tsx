import React, { useState, useRef } from 'react';
import { DataRoomDoc, DocCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, FileText, UploadCloud, Plus, X, Trash2, FolderOpen, ArrowUpRight, HelpCircle } from 'lucide-react';

interface DataRoomColumnProps {
  docs: DataRoomDoc[];
  onAddDoc: (doc: Omit<DataRoomDoc, 'id' | 'founder_id' | 'is_verified'>) => Promise<void>;
  onToggleDocVerification: (id: string, is_verified: boolean) => Promise<void>;
  onDeleteDoc: (id: string) => Promise<void>;
}

const CATEGORIES: DocCategory[] = ['Financials', 'Legal', 'Corporate', 'Product', 'Team'];

export default function DataRoomColumn({
  docs,
  onAddDoc,
  onToggleDocVerification,
  onDeleteDoc
}: DataRoomColumnProps) {
  const [activeCategory, setActiveCategory] = useState<DocCategory | 'All'>('All');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  
  // Add Document form state
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocCategory>('Financials');
  const [newDocPath, setNewDocPath] = useState('');

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group and filter
  const filteredDocs = docs.filter((doc) => {
    return activeCategory === 'All' || doc.category === activeCategory;
  });

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const path = newDocPath || `${newDocCategory.toLowerCase()}/${newDocName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    
    await onAddDoc({
      doc_name: newDocName,
      category: newDocCategory,
      storage_path: path
    });

    setNewDocName('');
    setNewDocPath('');
    setIsAddingDoc(false);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = (fileName: string) => {
    setUploadingFile(fileName);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Actually create the document after upload simulation completes
          const fileCategory: DocCategory = 'Financials';
          onAddDoc({
            doc_name: fileName.replace(/\.[^/.]+$/, ""), // remove extension
            category: fileCategory,
            storage_path: `uploads/${fileName.toLowerCase()}`
          }).then(() => {
            setUploadingFile(null);
            setUploadProgress(0);
          });
          
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateUpload(file.name);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="virtual-data-room" className="flex flex-col h-full bg-[#0c0c0e] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      {/* Header section */}
      <div className="p-5 border-b border-[#27272a] bg-[#0c0c0e]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">STAGE III // INVESTOR DUE DILIGENCE</h2>
            </div>
            <h1 className="text-lg font-bold font-sans tracking-tight text-white mt-1 uppercase">Virtual Data Room</h1>
          </div>
          <button
            id="add-doc-btn"
            onClick={() => setIsAddingDoc(!isAddingDoc)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider font-mono tracking-widest uppercase bg-[#27272a] hover:bg-white hover:text-black text-white border border-[#3f3f46] rounded transition duration-200"
          >
            {isAddingDoc ? <X size={14} /> : <Plus size={14} />}
            {isAddingDoc ? 'Close' : 'Req File'}
          </button>
        </div>

        {/* Category Filters Row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          <button
            id={`filter-doc-all`}
            onClick={() => setActiveCategory('All')}
            className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold tracking-wider font-mono tracking-wider uppercase rounded transition ${
              activeCategory === 'All'
                ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                : 'text-[#71717a] hover:text-zinc-300'
            }`}
          >
            ALL ({docs.length})
          </button>
          {CATEGORIES.map((category) => {
            const count = docs.filter(d => d.category === category).length;
            return (
              <button
                id={`filter-doc-${category.toLowerCase()}`}
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold tracking-wider font-mono tracking-wider uppercase rounded transition border ${
                  activeCategory === category
                    ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                    : 'text-[#71717a] hover:text-zinc-300 border-transparent'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main scrolling section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0c0c0e]">
        
        {/* DRAG AND DROP SECURE AREA */}
        <div 
          id="secure-dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all ${
            dragActive 
              ? 'border-white bg-[#27272a]/60' 
              : 'border-[#27272a] hover:border-[#3f3f46] bg-[#09090b]'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />

          {uploadingFile ? (
            <div className="space-y-2 py-2">
              <span className="text-xs font-semibold tracking-wider font-mono text-[#a1a1aa] uppercase tracking-widest block">UPLOADING ENCRYPTED FILE</span>
              <p className="text-xs font-semibold text-white truncate max-w-xs">{uploadingFile}</p>
              <div className="w-48 bg-[#27272a] h-1 rounded overflow-hidden mx-auto mt-2">
                <div 
                  className="bg-white h-full transition-all duration-150" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-[#71717a]">{uploadProgress}% Complete</span>
            </div>
          ) : (
            <div onClick={onButtonClick} className="cursor-pointer group flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-[#09090b] border border-[#27272a] text-[#a1a1aa] group-hover:text-white group-hover:border-[#3f3f46] transition mb-2">
                <UploadCloud size={16} />
              </div>
              <p className="text-xs font-semibold text-zinc-300">Drag & drop files to upload</p>
              <p className="text-xs font-semibold tracking-wider font-mono text-[#71717a] mt-1 uppercase">OR CLICK TO BROWSE SECURE DRIVE</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {/* Add Doc Form Panel */}
          {isAddingDoc && (
            <motion.form
              id="new-document-form"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateDoc}
              className="bg-[#1a1a1c] border border-[#27272a] p-4 rounded-lg space-y-3 text-xs"
            >
              <div className="flex justify-between items-center pb-1 border-b border-[#27272a]">
                <span className="text-xs font-semibold tracking-wider font-mono text-[#a1a1aa] uppercase tracking-widest">REQUEST NEW DOCUMENTS</span>
                <button type="button" onClick={() => setIsAddingDoc(false)} className="text-[#71717a] hover:text-zinc-300">
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY26 Q3 Cap Table"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Category</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as DocCategory)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-300 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">File Path (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. legal/cap_table.pdf"
                    value={newDocPath}
                    onChange={(e) => setNewDocPath(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-base font-semibold min-h-[44px] font-mono tracking-widest uppercase rounded font-bold transition"
              >
                LOG COMPLIANCE TARGET
              </button>
            </motion.form>
          )}

          {/* List of Data Room Docs */}
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#27272a] rounded-lg">
              <FolderOpen size={24} className="text-[#71717a] mb-2" />
              <p className="text-xs font-mono text-[#71717a]">NO SECURE DOCS IN THIS CATEGORY</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <motion.div
                id={`document-row-${doc.id}`}
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group flex items-center justify-between p-3.5 glass hover:bg-zinc-900 border border-[#27272a] hover:border-[#3f3f46] rounded-lg transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Verification checkbox button */}
                  <button
                    id={`toggle-verify-btn-${doc.id}`}
                    onClick={() => onToggleDocVerification(doc.id, !doc.is_verified)}
                    className={`mt-0.5 p-1 rounded border transition-colors ${
                      doc.is_verified
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                        : 'bg-[#09090b] text-[#71717a] border-[#27272a] hover:text-zinc-400 hover:border-[#3f3f46]'
                    }`}
                    title={doc.is_verified ? 'Verified Document. Click to unverify.' : 'Verify Document'}
                  >
                    {doc.is_verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  </button>

                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-200 tracking-tight truncate pr-2">
                      {doc.doc_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider font-mono text-[#a1a1aa] mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[9px] uppercase tracking-wider text-[#a1a1aa]">
                        {doc.category}
                      </span>
                      <span className="truncate max-w-[150px]">{doc.storage_path}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Simulated download anchor link */}
                  <a
                    href={`#`}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(`SIMULATED DECRYPTED DOWNLOAD: Downloading secure file "${doc.doc_name}" via storage path "${doc.storage_path}"`);
                    }}
                    className="p-1 text-[#a1a1aa] hover:text-white bg-[#09090b] border border-[#27272a] rounded transition"
                    title="Download decrypted file"
                  >
                    <ArrowUpRight size={12} />
                  </a>
                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    className="p-1 text-[#71717a] hover:text-red-400 bg-[#09090b] border border-[#27272a] hover:border-red-950 rounded transition"
                    title="Delete Requirement"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Trust and Compliance Badge */}
      <div className="p-3 border-t border-[#27272a] bg-[#0c0c0e] text-xs font-semibold tracking-wider font-mono text-[#52525b] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Shield size={11} className="text-emerald-500" />
          <span>SECURE DATA ROOM COMPLIANCE LAYER</span>
        </span>
        <span className="flex items-center gap-1 cursor-help group relative">
          <HelpCircle size={11} />
          <span>SECURE ACCESS</span>
          {/* Tooltip */}
          <span className="absolute bottom-6 right-0 w-48 p-2 bg-[#09090b] border border-[#27272a] rounded text-[9px] leading-normal text-[#a1a1aa] hidden group-hover:block z-50 shadow-2xl">
            Virtual Data Room files are verified and securely hosted in compliance with institutional standards.
          </span>
        </span>
      </div>
    </div>
  );
}
