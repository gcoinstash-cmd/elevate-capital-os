import { createClient } from '@supabase/supabase-js';
import { Profile, Investor, DataRoomDoc } from '../types';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist and are not placeholder values
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ==========================================
// SEED DATA FOR LOCAL STORAGE FALLBACK
// ==========================================
const DEFAULT_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  company_name: 'CORE WORKSPACE',
  target_raise: 5000000,
  burn_rate: 145000,
  cash_on_hand: 1250000
};

const DEFAULT_INVESTORS: Investor[] = [
  {
    id: 'inv-1',
    founder_id: '00000000-0000-0000-0000-000000000000',
    investor_name: 'Marc Andreessen',
    firm: 'Andreessen Horowitz',
    stage: 'Term Sheet',
    allocation_target: 1500000,
    notes: 'Very interested in lead position. Requested deep-dive into physical manufacturing bottlenecks.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-2',
    founder_id: '00000000-0000-0000-0000-000000000000',
    investor_name: 'Peter Thiel',
    firm: 'Founders Fund',
    stage: 'Due Diligence',
    allocation_target: 1000000,
    notes: 'Technical due diligence scheduled. Specifically keen on defense-tech applications.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-3',
    founder_id: '00000000-0000-0000-0000-000000000000',
    investor_name: 'Roelof Botha',
    firm: 'Sequoia Capital',
    stage: 'Closed',
    allocation_target: 1200000,
    notes: 'Funds wired. Formally joined the seed round. Board observer seat assigned.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-4',
    founder_id: '00000000-0000-0000-0000-000000000000',
    investor_name: 'Garry Tan',
    firm: 'Y Combinator',
    stage: 'Contacted',
    allocation_target: 500000,
    notes: 'Sent updated deck. Following up after the Q3 product milestone release.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'inv-5',
    founder_id: '00000000-0000-0000-0000-000000000000',
    investor_name: 'Rebecca Lynn',
    firm: 'Canvas Ventures',
    stage: 'Lead',
    allocation_target: 750000,
    notes: 'Introduction made by previous co-founder. Arranging introductory meeting next week.',
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_DOCS: DataRoomDoc[] = [
  {
    id: 'doc-1',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'Core FY26 Pitch Deck (Series A)',
    storage_path: 'financials/pitch_deck_v3.pdf',
    is_verified: true,
    category: 'Financials'
  },
  {
    id: 'doc-2',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'Financial Model & 5-Year Projections',
    storage_path: 'financials/projections_model.xlsx',
    is_verified: true,
    category: 'Financials'
  },
  {
    id: 'doc-3',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'Delaware C-Corp Certificate of Incorporation',
    storage_path: 'legal/coi_delaware.pdf',
    is_verified: true,
    category: 'Legal'
  },
  {
    id: 'doc-4',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'IP Assignment and Invention Agreements',
    storage_path: 'legal/ip_assignment_signed.pdf',
    is_verified: false,
    category: 'Legal'
  },
  {
    id: 'doc-5',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'Cap Table & Convertible Note Ledger',
    storage_path: 'corporate/cap_table_fy26_q2.pdf',
    is_verified: true,
    category: 'Corporate'
  },
  {
    id: 'doc-6',
    founder_id: '00000000-0000-0000-0000-000000000000',
    doc_name: 'System Architecture & Security Controls',
    storage_path: 'product/security_architecture.pdf',
    is_verified: false,
    category: 'Product'
  }
];

// Local Storage Helper functions
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`elevate_${key}`);
  if (!data) {
    localStorage.setItem(`elevate_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(`elevate_${key}`, JSON.stringify(value));
};

// ==========================================
// UNIFIED DATA SERVICE INTERFACE
// ==========================================
export const dataService = {
  // --- PROFILE METHODS ---
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching Supabase profile:', error);
      } else if (data) {
        return data as Profile;
      }
      
      // If profile doesn't exist, create default
      const { data: userData } = await supabaseClient.auth.getUser();
      const founderId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';
      const newProfile = { ...DEFAULT_PROFILE, id: founderId };
      
      const { data: inserted, error: insertError } = await supabaseClient
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (!insertError && inserted) {
        return inserted as Profile;
      }
    }
    
    return getLocalData<Profile>('profile', DEFAULT_PROFILE);
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(profile)
        .eq('id', profile.id || '')
        .select()
        .single();
        
      if (error) {
        console.error('Error updating Supabase profile:', error);
      } else if (data) {
        return data as Profile;
      }
    }

    const localProfile = getLocalData<Profile>('profile', DEFAULT_PROFILE);
    const updated = { ...localProfile, ...profile };
    setLocalData('profile', updated);
    return updated;
  },

  // --- INVESTOR PIPELINE METHODS ---
  async getInvestors(): Promise<Investor[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('investor_pipeline')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching Supabase investors:', error);
      } else if (data) {
        return data as Investor[];
      }
    }

    return getLocalData<Investor[]>('investors', DEFAULT_INVESTORS);
  },

  async addInvestor(investor: Omit<Investor, 'id' | 'updated_at' | 'founder_id'>): Promise<Investor> {
    const { data: userData } = isSupabaseConfigured && supabaseClient
      ? await supabaseClient.auth.getUser()
      : { data: { user: null } };
      
    const founderId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';
    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    
    const newInvestor: Investor = {
      ...investor,
      id: newId,
      founder_id: founderId,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('investor_pipeline')
        .insert([newInvestor])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding Supabase investor:', error);
      } else if (data) {
        return data as Investor;
      }
    }

    const localInvestors = getLocalData<Investor[]>('investors', DEFAULT_INVESTORS);
    const updatedList = [newInvestor, ...localInvestors];
    setLocalData('investors', updatedList);
    return newInvestor;
  },

  async updateInvestor(id: string, updates: Partial<Investor>): Promise<Investor> {
    const updated_at = new Date().toISOString();
    
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('investor_pipeline')
        .update({ ...updates, updated_at })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating Supabase investor:', error);
      } else if (data) {
        return data as Investor;
      }
    }

    const localInvestors = getLocalData<Investor[]>('investors', DEFAULT_INVESTORS);
    let updatedInvestor: Investor | null = null;
    
    const updatedList = localInvestors.map((inv) => {
      if (inv.id === id) {
        updatedInvestor = { ...inv, ...updates, updated_at };
        return updatedInvestor;
      }
      return inv;
    });

    setLocalData('investors', updatedList);
    return updatedInvestor || { ...DEFAULT_INVESTORS[0], ...updates, id };
  },

  async deleteInvestor(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient
        .from('investor_pipeline')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting Supabase investor:', error);
        return false;
      }
      return true;
    }

    const localInvestors = getLocalData<Investor[]>('investors', DEFAULT_INVESTORS);
    const filtered = localInvestors.filter(inv => inv.id !== id);
    setLocalData('investors', filtered);
    return true;
  },

  // --- DATA ROOM DOCUMENTS METHODS ---
  async getDataRoomDocs(): Promise<DataRoomDoc[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('data_room_docs')
        .select('*')
        .order('category', { ascending: true });
        
      if (error) {
        console.error('Error fetching Supabase docs:', error);
      } else if (data) {
        return data as DataRoomDoc[];
      }
    }

    return getLocalData<DataRoomDoc[]>('docs', DEFAULT_DOCS);
  },

  async addDoc(doc: Omit<DataRoomDoc, 'id' | 'founder_id' | 'is_verified'>): Promise<DataRoomDoc> {
    const { data: userData } = isSupabaseConfigured && supabaseClient
      ? await supabaseClient.auth.getUser()
      : { data: { user: null } };
      
    const founderId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';
    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    
    const newDoc: DataRoomDoc = {
      ...doc,
      id: newId,
      founder_id: founderId,
      is_verified: false
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('data_room_docs')
        .insert([newDoc])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding Supabase doc:', error);
      } else if (data) {
        return data as DataRoomDoc;
      }
    }

    const localDocs = getLocalData<DataRoomDoc[]>('docs', DEFAULT_DOCS);
    const updatedList = [...localDocs, newDoc];
    setLocalData('docs', updatedList);
    return newDoc;
  },

  async toggleDocVerification(id: string, is_verified: boolean): Promise<DataRoomDoc> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('data_room_docs')
        .update({ is_verified })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating Supabase doc verification:', error);
      } else if (data) {
        return data as DataRoomDoc;
      }
    }

    const localDocs = getLocalData<DataRoomDoc[]>('docs', DEFAULT_DOCS);
    let updatedDoc: DataRoomDoc | null = null;
    
    const updatedList = localDocs.map((doc) => {
      if (doc.id === id) {
        updatedDoc = { ...doc, is_verified };
        return updatedDoc;
      }
      return doc;
    });

    setLocalData('docs', updatedList);
    return updatedDoc || { ...DEFAULT_DOCS[0], is_verified, id };
  },

  async deleteDoc(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient
        .from('data_room_docs')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting Supabase doc:', error);
        return false;
      }
      return true;
    }

    const localDocs = getLocalData<DataRoomDoc[]>('docs', DEFAULT_DOCS);
    const filtered = localDocs.filter(doc => doc.id !== id);
    setLocalData('docs', filtered);
    return true;
  }
};
