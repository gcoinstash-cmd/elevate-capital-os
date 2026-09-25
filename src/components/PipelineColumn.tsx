import React, { useState } from 'react';
import { Investor, PipelineStage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Building2, TrendingUp, ChevronRight, DollarSign, Edit3, Trash2, X, Check, Filter } from 'lucide-react';

interface PipelineColumnProps {
  investors: Investor[];
  onAddInvestor: (investor: Omit<Investor, 'id' | 'updated_at' | 'founder_id'>) => Promise<void>;
  onUpdateInvestor: (id: string, updates: Partial<Investor>) => Promise<void>;
  onDeleteInvestor: (id: string) => Promise<void>;
}

const STAGES: PipelineStage[] = ['Lead', 'Contacted', 'Pitch Deck', 'Due Diligence', 'Term Sheet', 'Closed'];

export default function PipelineColumn({
  investors,
  onAddInvestor,
  onUpdateInvestor,
  onDeleteInvestor
}: PipelineColumnProps) {
  const [activeStageFilter, setActiveStageFilter] = useState<PipelineStage | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Investor Form State
  const [newInvName, setNewInvName] = useState('');
  const [newInvFirm, setNewInvFirm] = useState('');
  const [newInvStage, setNewInvStage] = useState<PipelineStage>('Lead');
  const [newInvAlloc, setNewInvAlloc] = useState('500000');
  const [newInvNotes, setNewInvNotes] = useState('');

  // Editing Card Form State
  const [editName, setEditName] = useState('');
  const [editFirm, setEditFirm] = useState('');
  const [editStage, setEditStage] = useState<PipelineStage>('Lead');
  const [editAlloc, setEditAlloc] = useState('500000');
  const [editNotes, setEditNotes] = useState('');

  // Filtering logic
  const filteredInvestors = investors.filter((inv) => {
    const matchesStage = activeStageFilter === 'All' || inv.stage === activeStageFilter;
    const matchesSearch = 
      inv.investor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'Lead': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'Contacted': return 'bg-blue-950/40 text-blue-400 border-blue-900/50';
      case 'Pitch Deck': return 'bg-purple-950/40 text-purple-400 border-purple-900/50';
      case 'Due Diligence': return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'Term Sheet': return 'bg-cyan-950/40 text-cyan-400 border-cyan-900/50';
      case 'Closed': return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName || !newInvFirm) return;
    
    await onAddInvestor({
      investor_name: newInvName,
      firm: newInvFirm,
      stage: newInvStage,
      allocation_target: parseFloat(newInvAlloc) || 0,
      notes: newInvNotes
    });

    // Reset Form
    setNewInvName('');
    setNewInvFirm('');
    setNewInvStage('Lead');
    setNewInvAlloc('500000');
    setNewInvNotes('');
    setIsAdding(false);
  };

  const startEdit = (inv: Investor) => {
    setEditingId(inv.id);
    setEditName(inv.investor_name);
    setEditFirm(inv.firm);
    setEditStage(inv.stage);
    setEditAlloc(inv.allocation_target.toString());
    setEditNotes(inv.notes);
  };

  const handleSaveEdit = async (id: string) => {
    await onUpdateInvestor(id, {
      investor_name: editName,
      firm: editFirm,
      stage: editStage,
      allocation_target: parseFloat(editAlloc) || 0,
      notes: editNotes
    });
    setEditingId(null);
  };

  return (
    <div id="investor-outreach-pipeline" className="flex flex-col h-full bg-[#0c0c0e] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      {/* Header section with total metrics */}
      <div className="p-5 border-b border-[#27272a] bg-[#0c0c0e]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">STAGE I // CAPITAL ACQUISITION PIPELINE</h2>
            </div>
            <h1 className="text-lg font-bold font-sans tracking-tight text-white mt-1 uppercase">Investor Pipeline</h1>
          </div>
          <button
            id="add-investor-btn"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider font-mono tracking-widest uppercase bg-[#27272a] hover:bg-white hover:text-black text-white border border-[#3f3f46] rounded transition duration-200"
          >
            {isAdding ? <X size={14} /> : <Plus size={14} />}
            {isAdding ? 'Close' : 'Target'}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-2.5 text-[#71717a]" />
          <input
            id="investor-search-input"
            type="text"
            placeholder="Filter targets, firms or terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 placeholder-[#71717a] rounded px-3 py-2 pl-9 focus:outline-none focus:border-[#3f3f46] transition"
          />
        </div>

        {/* Stage Filters Row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          <button
            id={`filter-all`}
            onClick={() => setActiveStageFilter('All')}
            className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold tracking-wider font-mono tracking-wider uppercase rounded transition ${
              activeStageFilter === 'All'
                ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                : 'text-[#71717a] hover:text-zinc-300'
            }`}
          >
            ALL ({investors.length})
          </button>
          {STAGES.map((stage) => {
            const count = investors.filter(inv => inv.stage === stage).length;
            return (
              <button
                id={`filter-${stage.toLowerCase().replace(' ', '-')}`}
                key={stage}
                onClick={() => setActiveStageFilter(stage)}
                className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold tracking-wider font-mono tracking-wider uppercase rounded transition border ${
                  activeStageFilter === stage
                    ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                    : 'text-[#71717a] hover:text-zinc-300 border-transparent'
                }`}
              >
                {stage} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main scrolling section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0c0e]">
        <AnimatePresence mode="popLayout">
          {/* Add Investor Form Panel */}
          {isAdding && (
            <motion.form
              id="new-investor-form"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreate}
              className="bg-[#1a1a1c] border border-[#27272a] p-4 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-center pb-1 border-b border-[#27272a]">
                <span className="text-xs font-semibold tracking-wider font-mono text-[#a1a1aa] uppercase tracking-widest">LOG NEW CAPITAL INTEREST</span>
                <button type="button" onClick={() => setIsAdding(false)} className="text-[#71717a] hover:text-zinc-300">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Investor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marc Andreessen"
                    value={newInvName}
                    onChange={(e) => setNewInvName(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Firm / Fund</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. a16z"
                    value={newInvFirm}
                    onChange={(e) => setNewInvFirm(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Pipeline Stage</label>
                  <select
                    value={newInvStage}
                    onChange={(e) => setNewInvStage(e.target.value as PipelineStage)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-305 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Target Allocation ($)</label>
                  <input
                    type="number"
                    value={newInvAlloc}
                    onChange={(e) => setNewInvAlloc(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wider font-mono text-[#71717a] mb-1 uppercase">Strategic Notes</label>
                <textarea
                  placeholder="Key discussion points, requests..."
                  value={newInvNotes}
                  onChange={(e) => setNewInvNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-200 rounded p-1.5 focus:outline-none focus:border-[#3f3f46] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-base font-semibold min-h-[44px] font-mono tracking-widest uppercase rounded font-bold transition"
              >
                SUBMIT DEPOSIT RECORD
              </button>
            </motion.form>
          )}

          {/* Cards list */}
          {filteredInvestors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#27272a] rounded-lg">
              <Building2 size={24} className="text-[#71717a] mb-2" />
              <p className="text-xs font-mono text-[#71717a]">NO TARGETS MATCHING THE SELECTION</p>
            </div>
          ) : (
            filteredInvestors.map((inv) => (
              <motion.div
                id={`investor-card-${inv.id}`}
                key={inv.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`group relative glass p-4 rounded-lg transition-all ${
                  editingId === inv.id ? 'border-[#3f3f46] bg-[#27272a]/60' : 'hover:border-[#3f3f46]'
                }`}
              >
                {editingId === inv.id ? (
                  /* Edit Card Layout */
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-[#27272a] pb-1.5">
                      <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase">UPDATE TARGET FILE</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(inv.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/25 border border-emerald-900 rounded"
                          title="Save Changes"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-300 bg-zinc-950 border border-[#27272a] rounded"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-[#71717a] uppercase">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] text-xs text-white rounded p-1"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-[#71717a] uppercase">Firm</label>
                        <input
                          type="text"
                          value={editFirm}
                          onChange={(e) => setEditFirm(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] text-xs text-white rounded p-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-[#71717a] uppercase">Stage</label>
                        <select
                          value={editStage}
                          onChange={(e) => setEditStage(e.target.value as PipelineStage)}
                          className="w-full bg-[#09090b] border border-[#27272a] text-xs text-zinc-300 rounded p-1"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-[#71717a] uppercase">Allocation ($)</label>
                        <input
                          type="number"
                          value={editAlloc}
                          onChange={(e) => setEditAlloc(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] text-xs text-white rounded p-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-[#71717a] uppercase">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-[#09090b] border border-[#27272a] text-xs text-white rounded p-1 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard Card Layout */
                  <div>
                    {/* Top Row: Stage Indicator & Actions */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded-full border ${getStageColor(inv.stage)}`}>
                        {inv.stage}
                      </span>
                      
                      {/* Action buttons (hidden by default, reveal on hover) */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(inv)}
                          className="p-1 text-zinc-400 hover:text-white bg-[#09090b] border border-[#27272a] rounded transition"
                          title="Edit"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={() => onDeleteInvestor(inv.id)}
                          className="p-1 text-[#71717a] hover:text-red-400 bg-[#09090b] border border-[#27272a] hover:border-red-950 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Partner Name & Firm */}
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">{inv.investor_name}</h3>
                      <div className="flex items-center gap-1 text-xs font-semibold tracking-wider font-mono text-[#a1a1aa] mt-0.5">
                        <Building2 size={10} />
                        <span>{inv.firm}</span>
                      </div>
                    </div>

                    {/* Brief Note preview */}
                    {inv.notes && (
                      <p className="text-xs font-semibold text-[#a1a1aa] border-l border-[#27272a] pl-2 py-0.5 mb-3 leading-relaxed">
                        {inv.notes}
                      </p>
                    )}

                    {/* Allocation target status */}
                    <div className="flex justify-between items-center border-t border-[#27272a] pt-2 text-xs font-semibold tracking-wider font-mono">
                      <span className="text-[#71717a]">ALLOCATION PREFERENCE</span>
                      <span className="text-white font-medium">
                        ${inv.allocation_target.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
