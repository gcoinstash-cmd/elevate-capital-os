import React, { useState } from 'react';
import { Profile, Investor } from '../types';
import { Flame, Landmark, Save, Calendar } from 'lucide-react';

interface AnalyticsCenterProps {
  profile: Profile;
  investors: Investor[];
  onUpdateProfile: (profile: Partial<Profile>) => Promise<void>;
}

export default function AnalyticsCenter({
  profile,
  investors,
  onUpdateProfile
}: AnalyticsCenterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<Profile>({ ...profile });
  const [scenario, setScenario] = useState<'Conservative' | 'Base' | 'Aggressive'>('Base');

  // Compute stats
  const cashOnHand = profile.cash_on_hand;
  const burnRate = profile.burn_rate;
  const targetRaise = profile.target_raise;

  // Calculate dynamic months of runway
  const monthsOfRunway = burnRate > 0 ? cashOnHand / burnRate : 0;

  // Scenario-based probabilities
  const stageProbabilities = {
    Conservative: {
      'Lead': 0.0,
      'Contacted': 0.05,
      'Pitch Deck': 0.25,
      'Due Diligence': 0.45,
      'Term Sheet': 0.65,
      'Closed': 1.0,
    },
    Base: {
      'Lead': 0.1,
      'Contacted': 0.2,
      'Pitch Deck': 0.4,
      'Due Diligence': 0.6,
      'Term Sheet': 0.8,
      'Closed': 1.0,
    },
    Aggressive: {
      'Lead': 0.25,
      'Contacted': 0.35,
      'Pitch Deck': 0.55,
      'Due Diligence': 0.75,
      'Term Sheet': 0.95,
      'Closed': 1.0,
    }
  };

  const probabilities = stageProbabilities[scenario];

  // Capital Commitments & Math Extensions
  const closedCapitalOnly = investors
    .filter((inv) => inv.stage === 'Closed')
    .reduce((sum, inv) => sum + inv.allocation_target, 0);

  const termSheetCapital = investors
    .filter((inv) => inv.stage === 'Term Sheet')
    .reduce((sum, inv) => sum + inv.allocation_target, 0);

  const softCircledCapital = investors
    .filter((inv) => inv.stage === 'Due Diligence' || inv.stage === 'Pitch Deck')
    .reduce((sum, inv) => sum + inv.allocation_target, 0);

  const weightedProbableCapital = investors.reduce((sum, inv) => {
    const prob = probabilities[inv.stage] || 0;
    return sum + inv.allocation_target * prob;
  }, 0);

  const remainingGap = Math.max(0, targetRaise - closedCapitalOnly);

  // Existing Progress Ring calculations (using traditional Closed + Term Sheet as committed progress)
  const committedCapital = closedCapitalOnly + termSheetCapital;
  const progressPercent = targetRaise > 0 ? (committedCapital / targetRaise) * 100 : 0;
  const closedPercent = targetRaise > 0 ? (closedCapitalOnly / targetRaise) * 100 : 0;

  // Visual metrics thresholds for Runway
  const getRunwayStatus = (months: number) => {
    if (months < 6) return { label: 'CRITICAL RUNWAY', color: 'text-red-400 border-red-950/50 bg-red-950/20', desc: 'Raise urgency is maximum. Less than 6 months remaining.' };
    if (months < 12) return { label: 'STABLE WORKSPACE', color: 'text-amber-400 border-amber-950/50 bg-amber-950/20', desc: 'Runway is healthy, finalize outreach pipeline soon.' };
    return { label: 'SECURE POSITION', color: 'text-emerald-400 border-emerald-950/50 bg-emerald-950/20', desc: 'Excellent financial posture. Focus on growth and terms.' };
  };

  const status = getRunwayStatus(monthsOfRunway);

  // Risk matrix indicators
  const runwayRisk = monthsOfRunway < 6.0;
  const concentrationRisk = targetRaise > 0 && investors.some(inv => inv.allocation_target > 0.4 * targetRaise);
  const bottleneckRisk = investors.filter(inv => inv.stage === 'Due Diligence').length > 3;
  const hasAnyRisk = runwayRisk || concentrationRisk || bottleneckRisk;

  // Advanced temporal projections
  let estCompletionDate = "ROUND SECURED";
  if (remainingGap > 0) {
    let daysToComplete = 90;
    investors.forEach(inv => {
      if (inv.stage === 'Term Sheet') daysToComplete -= 12;
      if (inv.stage === 'Due Diligence') daysToComplete -= 8;
      if (inv.stage === 'Pitch Deck') daysToComplete -= 4;
    });
    daysToComplete = Math.max(15, Math.min(150, daysToComplete));
    const compDate = new Date();
    compDate.setDate(compDate.getDate() + daysToComplete);
    estCompletionDate = compDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }

  let runwayExhaustionDate = "N/A (INFINITY)";
  if (burnRate > 0) {
    const exhDate = new Date();
    const totalExhDays = Math.round(monthsOfRunway * 30.4375);
    exhDate.setDate(exhDate.getDate() + totalExhDays);
    runwayExhaustionDate = exhDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }

  // SVG Progress Ring calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Progress stroke offset (for combined Closed + Term Sheet committed)
  const strokeDashoffset = circumference - (Math.min(progressPercent, 100) / 100) * circumference;
  // Progress stroke offset (for Closed only)
  const closedStrokeDashoffset = circumference - (Math.min(closedPercent, 100) / 100) * circumference;

  const handleSliderChange = async (key: keyof Profile, value: number) => {
    const updated = { ...profile, [key]: value };
    await onUpdateProfile(updated);
  };

  return (
    <div id="financial-analytics-center" className="flex flex-col h-full bg-[#0c0c0e] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      {/* Upper header section */}
      <div className="p-5 border-b border-[#27272a] bg-[#0c0c0e] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">STAGE II // ANALYTICS</h2>
          </div>
          <h1 className="text-lg font-bold font-sans tracking-tight text-white mt-1 uppercase">
            Capital Workspace
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase">ACTIVE WORKSPACE</span>
          <div className="text-xs font-semibold text-white font-mono tracking-tight">
            {profile.company_name}
          </div>
        </div>
      </div>

      {/* Analytics Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Scenario Presets Row */}
        <div className="flex items-center justify-between bg-[#09090b] border border-[#27272a] rounded-xl p-2.5">
          <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase tracking-wider">SCENARIO ENGINE:</span>
          <div className="flex gap-1">
            {(['Conservative', 'Base', 'Aggressive'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setScenario(sc)}
                className={`px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase transition-all duration-150 rounded border ${
                  scenario === sc
                    ? 'bg-white text-black border-white font-bold shadow-sm'
                    : 'text-[#71717a] hover:text-[#a1a1aa] bg-[#0c0c0e] border-[#27272a]'
                }`}
              >
                {sc === 'Base' ? 'BASE CASE' : sc}
              </button>
            ))}
          </div>
        </div>

        {/* RUNWAY GAUGE & TARGET PROGRESS IN AN IMMERSIVE BENTO GRID ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Circular Target Raise Ring */}
          <div id="target-raise-progress-ring" className="md:col-span-5 glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold tracking-wider font-mono tracking-widest text-[#71717a] uppercase mb-3">RAISE ALLOCATION</span>
            
            <div className="relative flex items-center justify-center w-40 h-40">
              {/* Outer circle track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-[#27272a] fill-transparent"
                  strokeWidth="8"
                />
                {/* Committed Capital (Closed + Term Sheet) - Blue/White line */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-[#71717a] fill-transparent transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
                {/* Closed Capital only - Emerald wire */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-emerald-400 fill-transparent transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={closedStrokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Absolute Center Content */}
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white tracking-tight">
                  {Math.round(progressPercent)}%
                </span>
                <span className="text-[9px] font-mono text-[#71717a] uppercase mt-0.5">Committed</span>
              </div>
            </div>

            <div className="w-full mt-3 grid grid-cols-2 gap-1 border-t border-[#27272a] pt-3 text-xs font-semibold tracking-wider font-mono">
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[#a1a1aa]">CLOSED</span>
                </div>
                <div className="text-white font-bold mt-0.5">${closedCapitalOnly.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]" />
                  <span className="text-[#a1a1aa]">TERM SHEET</span>
                </div>
                <div className="text-white font-bold mt-0.5">
                  ${termSheetCapital.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Months of Runway Box */}
          <div id="months-of-runway-status" className="md:col-span-7 glass rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-wider font-mono tracking-widest text-[#71717a] uppercase">RUNWAY FORECAST</span>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-5xl font-extrabold tracking-tighter text-white">
                  {monthsOfRunway.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">Months remaining</span>
              </div>
              
              <p className="text-xs text-[#a1a1aa] mt-4 font-sans leading-relaxed">
                {status.desc} Calculated based on dynamic cash depletion against monthly burns.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#27272a] grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa]">
                  <Landmark size={14} />
                </div>
                <div>
                  <div className="text-[9px] font-mono text-[#71717a] uppercase">Cash Available</div>
                  <div className="font-semibold text-white">${cashOnHand.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa]">
                  <Flame size={14} />
                </div>
                <div>
                  <div className="text-[9px] font-mono text-[#71717a] uppercase">Monthly Burn</div>
                  <div className="font-semibold text-white">${burnRate.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* METRIC LEDGER */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#27272a]">
            <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase tracking-widest">PREDICTIVE LEDGER ({scenario === 'Base' ? 'BASE CASE' : scenario.toUpperCase()})</span>
            <span className="text-[9px] font-mono text-emerald-400">PROBABILITY-WEIGHTED</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Closed Commitments */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[#a1a1aa] uppercase">Closed Commitments</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold tabular-nums">${closedCapitalOnly.toLocaleString()}</span>
                <span className="text-xs font-semibold tracking-wider text-[#71717a] ml-2">({Math.round(probabilities['Closed'] * 100)}%)</span>
              </div>
            </div>

            {/* Term Sheet Pending */}
            <div className="flex items-center justify-between py-1 border-t border-[#27272a]/40">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]" />
                <span className="text-[#a1a1aa] uppercase">Term Sheet Pending</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold tabular-nums">${termSheetCapital.toLocaleString()}</span>
                <span className="text-xs font-semibold tracking-wider text-[#71717a] ml-2">({Math.round(probabilities['Term Sheet'] * 100)}%)</span>
              </div>
            </div>

            {/* Soft-Circled Engagements */}
            <div className="flex items-center justify-between py-1 border-t border-[#27272a]/40">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-[#a1a1aa] uppercase">Soft-Circled (DD/Pitch)</span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold tabular-nums">${softCircledCapital.toLocaleString()}</span>
                <span className="text-xs font-semibold tracking-wider text-[#71717a] ml-2">({Math.round(probabilities['Due Diligence'] * 100)}% / {Math.round(probabilities['Pitch Deck'] * 100)}%)</span>
              </div>
            </div>

            {/* Weighted Probable Capital */}
            <div className="flex items-center justify-between py-2 border-t border-[#27272a] bg-[#09090b] px-2 rounded">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[#a1a1aa] font-semibold uppercase">Weighted Probable Total</span>
              </div>
              <span className="text-indigo-300 font-bold tabular-nums">${Math.round(weightedProbableCapital).toLocaleString()}</span>
            </div>

            {/* Series Raise Target */}
            <div className="flex items-center justify-between py-1 border-t border-[#27272a]/40">
              <span className="text-[#71717a] uppercase">Series Raise Target</span>
              <span className="text-[#a1a1aa] tabular-nums">${targetRaise.toLocaleString()}</span>
            </div>

            {/* Remaining Gap */}
            <div className="flex items-center justify-between py-1.5 border-t border-[#27272a] text-xs">
              <span className="text-[#71717a] uppercase font-semibold">Remaining Gap to Target</span>
              <span className={`font-bold tabular-nums ${remainingGap === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${remainingGap.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* RISK MATRIX & ADVANCED FORECAST OUTPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Risk Matrix Indicators */}
          <div className="glass rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="border-b border-[#27272a] pb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase tracking-widest">ROUND COMPLIANCE & RISK METRICS</span>
              <span className={`w-2 h-2 rounded-full ${hasAnyRisk ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
            </div>

            <div className="flex flex-col gap-2 flex-1 justify-center">
              {!hasAnyRisk ? (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs font-semibold tracking-wider font-mono text-emerald-400 font-bold uppercase tracking-wider">STATUS // ALL CLEAR</span>
                  <span className="text-[9px] font-mono text-[#71717a] uppercase mt-1">No operational impediments detected</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {runwayRisk && (
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-red-950/40 bg-red-950/10 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-widest">RUNWAY RISK &lt; 6.0M</span>
                    </div>
                  )}
                  {concentrationRisk && (
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-amber-950/40 bg-amber-950/10 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-widest">CONCENTRATION RISK &gt; 40%</span>
                    </div>
                  )}
                  {bottleneckRisk && (
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-yellow-950/40 bg-yellow-950/10 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-yellow-400 font-bold uppercase tracking-widest">BOTTLENECK STALLED &gt; 3</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Forecast Outputs */}
          <div className="glass rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="border-b border-[#27272a] pb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase tracking-widest">PROJECTED CLOSING SCHEDULES</span>
              <span className="text-[9px] font-mono text-[#71717a] uppercase">ACTIVE</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs py-1">
              <div>
                <div className="text-[8px] text-[#71717a] uppercase tracking-wider">Est. Completion Date</div>
                <div className="text-white font-bold mt-0.5 tracking-tight flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#71717a]" />
                  <span>{estCompletionDate}</span>
                </div>
              </div>
              <div>
                <div className="text-[8px] text-[#71717a] uppercase tracking-wider">Runway Exhaustion Date</div>
                <div className={`font-bold mt-0.5 tracking-tight ${runwayRisk ? 'text-red-400' : 'text-amber-400'}`}>
                  {runwayExhaustionDate}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE CONTROLS FOR WHAT-IF ANALYSIS */}
        <div id="financial-modeling-controls" className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <div>
              <span className="text-xs font-semibold tracking-wider font-mono text-[#71717a] uppercase tracking-widest">FINANCIAL RUNWAY MODELING</span>
              <h3 className="text-xs font-semibold text-white mt-0.5 uppercase tracking-wide">Instant What-If Financial Modeling</h3>
            </div>
            {isEditing ? (
              <button
                onClick={async () => {
                  await onUpdateProfile({ company_name: tempProfile.company_name });
                  setIsEditing(false);
                }}
                className="p-1 text-xs text-black bg-white hover:bg-zinc-200 rounded flex items-center gap-1 px-2 py-1 font-mono tracking-wider transition"
              >
                <Save size={12} />
                <span>SAVE</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTempProfile({ ...profile });
                  setIsEditing(true);
                }}
                className="text-xs font-semibold tracking-wider font-mono text-[#71717a] hover:text-white underline transition uppercase"
              >
                Rename Workspace
              </button>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 bg-[#0c0c0e] p-3 rounded border border-[#27272a]">
              <input
                type="text"
                value={tempProfile.company_name}
                onChange={(e) => setTempProfile({ ...tempProfile, company_name: e.target.value.toUpperCase() })}
                className="bg-[#09090b] border border-[#27272a] text-xs text-white px-2 py-1.5 rounded focus:outline-none focus:border-[#3f3f46] flex-1 font-mono"
                placeholder="COMPANY NAME"
              />
            </div>
          )}

          {/* Slider 1: Cash On Hand */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                CASH ON HAND
              </span>
              <span className="text-white font-bold">${cashOnHand.toLocaleString()}</span>
            </div>
            <input
              id="cash-on-hand-slider"
              type="range"
              min="10000"
              max="10000000"
              step="25000"
              value={cashOnHand}
              onChange={(e) => handleSliderChange('cash_on_hand', parseInt(e.target.value))}
              className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#71717a]">
              <span>$10K</span>
              <span>$5M</span>
              <span>$10M</span>
            </div>
          </div>

          {/* Slider 2: Monthly Burn Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                MONTHLY BURN RATE
              </span>
              <span className="text-white font-bold">${burnRate.toLocaleString()}</span>
            </div>
            <input
              id="burn-rate-slider"
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={burnRate}
              onChange={(e) => handleSliderChange('burn_rate', parseInt(e.target.value))}
              className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#71717a]">
              <span>$5K</span>
              <span>$250K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Slider 3: Target Raise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                TARGET SERIES RAISE
              </span>
              <span className="text-white font-bold">${targetRaise.toLocaleString()}</span>
            </div>
            <input
              id="target-raise-slider"
              type="range"
              min="500000"
              max="20000000"
              step="100000"
              value={targetRaise}
              onChange={(e) => handleSliderChange('target_raise', parseInt(e.target.value))}
              className="w-full h-1 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#71717a]">
              <span>$500K</span>
              <span>$10M</span>
              <span>$20M</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
