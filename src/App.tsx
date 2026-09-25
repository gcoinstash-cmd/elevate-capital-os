import React, { useEffect, useState } from 'react';
import { Profile, Investor, DataRoomDoc } from './types';
import { dataService, isSupabaseConfigured } from './lib/supabase';
import PipelineColumn from './components/PipelineColumn';
import AnalyticsCenter from './components/AnalyticsCenter';
import DataRoomColumn from './components/DataRoomColumn';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Server, Copy, Check, Info, RefreshCw, Layers, ExternalLink, Calendar, Clock, Terminal, X, KeyRound, Lock, Unlock } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [docs, setDocs] = useState<DataRoomDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupDrawer, setShowSetupDrawer] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, i, d] = await Promise.all([
        dataService.getProfile(),
        dataService.getInvestors(),
        dataService.getDataRoomDocs()
      ]);
      setProfile(p);
      setInvestors(i);
      setDocs(d);
    } catch (err) {
      console.error('Error loading financial ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time clock interval
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update profile handler (Cash, Burn, Target Raise)
  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    try {
      const updated = await dataService.updateProfile({ ...profile, ...updates });
      setProfile(updated);
    } catch (err) {
      console.error('Error updating workspace profile:', err);
    }
  };

  // Investor handler operations
  const handleAddInvestor = async (newInv: Omit<Investor, 'id' | 'updated_at' | 'founder_id'>) => {
    try {
      const added = await dataService.addInvestor(newInv);
      setInvestors((prev) => [added, ...prev]);
    } catch (err) {
      console.error('Error adding investor:', err);
    }
  };

  const handleUpdateInvestor = async (id: string, updates: Partial<Investor>) => {
    try {
      const updated = await dataService.updateInvestor(id, updates);
      setInvestors((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    } catch (err) {
      console.error('Error updating investor:', err);
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    try {
      const success = await dataService.deleteInvestor(id);
      if (success) {
        setInvestors((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (err) {
      console.error('Error deleting investor:', err);
    }
  };

  // Data Room handler operations
  const handleAddDoc = async (newDoc: Omit<DataRoomDoc, 'id' | 'founder_id' | 'is_verified'>) => {
    try {
      const added = await dataService.addDoc(newDoc);
      setDocs((prev) => [...prev, added]);
    } catch (err) {
      console.error('Error adding document criteria:', err);
    }
  };

  const handleToggleDocVerification = async (id: string, is_verified: boolean) => {
    try {
      const updated = await dataService.toggleDocVerification(id, is_verified);
      setDocs((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      console.error('Error toggling doc certification:', err);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const success = await dataService.deleteDoc(id);
      if (success) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Error deleting document criteria:', err);
    }
  };

  const sqlInitializationScript = `-- ELEVATE // Capital OS
-- Database Schema Initialization Script for Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT DEFAULT 'NEW CO',
  target_raise NUMERIC DEFAULT 5000000,
  burn_rate NUMERIC DEFAULT 100000,
  cash_on_hand NUMERIC DEFAULT 1000000
);

-- 2. Create investor_pipeline table
CREATE TABLE IF NOT EXISTS public.investor_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  firm TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('Lead', 'Contacted', 'Pitch Deck', 'Due Diligence', 'Term Sheet', 'Closed')),
  allocation_target NUMERIC DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create data_room_docs table
CREATE TABLE IF NOT EXISTS public.data_room_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL CHECK (category IN ('Financials', 'Legal', 'Corporate', 'Product', 'Team'))
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_docs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Investor Pipeline Policies
CREATE POLICY "Users can view their own investor pipeline" ON public.investor_pipeline
  FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Users can insert their own investor pipeline" ON public.investor_pipeline
  FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can update their own investor pipeline" ON public.investor_pipeline
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Users can delete their own investor pipeline" ON public.investor_pipeline
  FOR DELETE USING (auth.uid() = founder_id);

-- Data Room Docs Policies
CREATE POLICY "Users can view their own data room docs" ON public.data_room_docs
  FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Users can insert their own data room docs" ON public.data_room_docs
  FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can update their own data room docs" ON public.data_room_docs
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Users can delete their own data room docs" ON public.data_room_docs
  FOR DELETE USING (auth.uid() = founder_id);

-- 6. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name, target_raise, burn_rate, cash_on_hand)
  VALUES (new.id, 'NEW ENTERPRISE', 5000000, 100000, 1000000);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlInitializationScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Dynamic formatting of date/time
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-4"
        >
          <RefreshCw size={24} className="text-zinc-400" />
        </motion.div>
        <span className="text-xs font-mono tracking-widest text-zinc-300 uppercase">SYNCHRONIZING CAPITAL OS...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-white selection:text-black font-sans flex flex-col overflow-x-hidden">
      
      {/* GLOBAL HUD / NAVBAR */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-[#27272a] bg-[#09090b] z-40">
        <div 
          onClick={() => {
            fetchData();
            setShowSetupDrawer(false);
          }}
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity duration-150 active:scale-[0.98] select-none"
          title="Reset & Refresh Dashboard"
        >
          <div className="w-8 h-8 bg-white flex items-center justify-center">
            <div className="w-4 h-4 bg-[#09090b] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-[0.2em] uppercase text-white">
              Elevate <span className="text-[#71717a] font-light">// Capital OS</span>
            </h1>
          </div>
        </div>

        {/* TIME & SECTOR CLOCKS */}
        <div className="hidden xl:flex items-center gap-6 text-xs font-semibold tracking-wider font-mono text-[#a1a1aa]">
          <div className="flex items-center gap-2 border-r border-[#27272a] pr-6">
            <Calendar size={11} className="text-[#71717a]" />
            <span className="text-[#a1a1aa] font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={11} className="text-[#71717a]" />
            <span className="text-[#a1a1aa] font-medium">{formattedTime} UTC-7</span>
          </div>
        </div>

        {/* CLOUD CONNECTION STATUS */}
        <div className="flex items-center gap-3">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider font-mono text-emerald-400 tracking-wider">SUPABASE ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-[#3f3f46] rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider font-mono text-zinc-400 tracking-wider">SANDBOX</span>
            </div>
          )}

          <button
            onClick={() => setShowAdminGate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-xs font-mono tracking-wider text-rose-300 uppercase transition rounded"
            title="Open Executive Admin Command Gate"
          >
            {adminUnlocked ? <Unlock size={12} className="text-emerald-400" /> : <Lock size={12} className="text-rose-400" />}
            <span>{adminUnlocked ? 'ADMIN: LIVE' : 'ADMIN PASS'}</span>
          </button>

          <button
            onClick={() => setShowSetupDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] text-xs font-mono tracking-wider text-white uppercase transition rounded"
          >
            <Server size={12} />
            <span>CONNECT</span>
          </button>
        </div>
      </header>

      {/* THREE-COLUMN INTEGRATION LAYOUT */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1800px] w-full mx-auto">
        {/* COLUMN 1: PipelineColumn */}
        <div className="lg:col-span-3 h-[calc(100vh-180px)] min-h-[550px] lg:h-auto">
          <PipelineColumn
            investors={investors}
            onAddInvestor={handleAddInvestor}
            onUpdateInvestor={handleUpdateInvestor}
            onDeleteInvestor={handleDeleteInvestor}
          />
        </div>

        {/* COLUMN 2: AnalyticsCenter */}
        <div className="lg:col-span-6 h-[calc(100vh-180px)] min-h-[550px] lg:h-auto">
          {profile && (
            <AnalyticsCenter
              profile={profile}
              investors={investors}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </div>

        {/* COLUMN 3: DataRoomColumn */}
        <div className="lg:col-span-3 h-[calc(100vh-180px)] min-h-[550px] lg:h-auto">
          <DataRoomColumn
            docs={docs}
            onAddDoc={handleAddDoc}
            onToggleDocVerification={handleToggleDocVerification}
            onDeleteDoc={handleDeleteDoc}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-10 px-8 border-t border-[#27272a] bg-[#0c0c0e] flex items-center justify-between text-[9px] text-[#52525b] font-mono uppercase">
        <div className="flex gap-8">
          <span>Access Control: Authorized Entrants Only</span>
          <span>Supabase-DB: {isSupabaseConfigured ? 'Connected (0.2ms)' : 'Inactive / Sandbox'}</span>
        </div>
        <div>&copy; 2026 Elevate Capital Systems // V1.0.4-Stable</div>
      </footer>

      {/* CLOUD CONNECTION & SQL SHEETS DRAWER */}
      <AnimatePresence>
        {showSetupDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSetupDrawer(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Content Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-zinc-950 border-l border-zinc-900 p-6 overflow-y-auto z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <Server className="text-zinc-400" size={18} />
                  <h2 className="text-sm font-mono tracking-widest text-white uppercase">SUPABASE DATABASE INTEGRATION</h2>
                </div>
                <button
                  onClick={() => setShowSetupDrawer(false)}
                  className="p-1 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-850 rounded"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Instructions steps */}
              <div className="space-y-6 flex-1 text-xs">
                <div>
                  <h3 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold tracking-wider">1</span>
                    Initialize Supabase Database
                  </h3>
                  <p className="text-zinc-400 mt-1.5 pl-5 leading-relaxed">
                    Create a new project in your{' '}
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-white underline inline-flex items-center gap-0.5 hover:text-zinc-300">
                      Supabase Dashboard <ExternalLink size={10} />
                    </a>
                    .
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold tracking-wider">2</span>
                    Run Schema Script in SQL Editor
                  </h3>
                  <p className="text-zinc-400 mt-1.5 pl-5 leading-relaxed">
                    Open the SQL Editor inside your Supabase project, paste the following SQL schema, and hit <b>Run</b>. This sets up the tables, Row Level Security policies, and trigger pipelines:
                  </p>
                  
                  {/* Code Block Container */}
                  <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs font-semibold text-zinc-300">
                    <div className="bg-zinc-950 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                      <span className="text-xs font-semibold tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Terminal size={12} />
                        schema_setup.sql
                      </span>
                      <button
                        type="button"
                        onClick={copySqlToClipboard}
                        className="flex items-center gap-1 text-base font-semibold min-h-[44px] font-semibold tracking-wider text-zinc-400 hover:text-white transition"
                      >
                        {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                      </button>
                    </div>
                    <pre className="p-4 max-h-60 overflow-y-auto text-zinc-300 leading-relaxed no-scrollbar select-text selection:bg-zinc-800">
                      <code>{sqlInitializationScript}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-semibold tracking-wider">3</span>
                    Register Secrets in Google AI Studio
                  </h3>
                  <p className="text-zinc-400 mt-1.5 pl-5 leading-relaxed">
                    Once the tables are created, navigate to the <b>Settings</b> menu in the upper-right of this Google AI Studio environment, locate the <b>Environment Secrets</b> section, and declare the following:
                  </p>
                  <ul className="mt-2.5 pl-5 space-y-2 font-mono text-xs font-semibold text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold text-white">VITE_SUPABASE_URL</span>
                      <span className="text-zinc-300">= Your project endpoint</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold text-white">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-zinc-300">= Your anon public key</span>
                    </li>
                  </ul>
                  <p className="text-zinc-300 mt-2 pl-5 text-xs font-semibold tracking-wider italic leading-relaxed">
                    AI Studio dynamically injects these into the build pipeline at runtime. The workspace automatically transitions to fully integrated cloud storage once detected!
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 text-center text-xs font-semibold tracking-wider font-mono text-zinc-300">
                <span>ELEVATE // COMPLIANCE LAYER ENFORCED</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1-CLICK ADMIN DEMO PASSCODE GATE */}
      <AnimatePresence>
        {showAdminGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-8 space-y-6 text-center shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowAdminGate(false);
                  setAdminError(false);
                }}
                className="absolute top-4 right-4 text-zinc-300 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
                <Lock size={26} />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg uppercase tracking-wider text-white">Executive Command Gate</h3>
                <p className="text-xs font-mono text-zinc-400">Restricted Managing Director & Partner Access</p>
              </div>

              {/* 1-Click Auto-Fill Demo Passkey */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-mono text-rose-300 font-bold uppercase tracking-wider">⚡ Demo Buyer Passkey</span>
                  <span className="text-xs font-semibold tracking-wider font-mono text-zinc-400">1-Tap Unlock</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminPasscode('elevate2026');
                    setAdminUnlocked(true);
                    setAdminError(false);
                    setTimeout(() => setShowAdminGate(false), 600);
                  }}
                  className="w-full bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800/60 text-white font-mono text-xs font-bold py-2.5 px-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>⚡ Auto-Fill Demo Passcode</span>
                  <code className="text-rose-300 bg-black/50 px-1.5 py-0.5 rounded border border-rose-800/40">elevate2026</code>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasscode.trim() === 'elevate2026') {
                    setAdminUnlocked(true);
                    setAdminError(false);
                    setShowAdminGate(false);
                  } else {
                    setAdminError(true);
                  }
                }}
                className="space-y-4 text-xs font-mono"
              >
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter Passkey"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-center font-bold tracking-widest focus:border-rose-500 outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition"
                >
                  Enter Command Tower
                </button>
              </form>

              {adminError && (
                <div className="text-xs font-mono text-rose-400">
                  Invalid Passcode. Use <code>elevate2026</code> to unlock.
                </div>
              )}

              {adminUnlocked && (
                <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                  <Check size={14} />
                  <span>Admin Terminal Unlocked &bull; Live Telemetry</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
