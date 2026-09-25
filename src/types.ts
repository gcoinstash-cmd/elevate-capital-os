export interface Profile {
  id: string;
  company_name: string;
  target_raise: number;
  burn_rate: number;
  cash_on_hand: number;
}

export type PipelineStage = 'Lead' | 'Contacted' | 'Pitch Deck' | 'Due Diligence' | 'Term Sheet' | 'Closed';

export interface Investor {
  id: string;
  founder_id: string;
  investor_name: string;
  firm: string;
  stage: PipelineStage;
  allocation_target: number;
  notes: string;
  updated_at: string;
}

export type DocCategory = 'Financials' | 'Legal' | 'Corporate' | 'Product' | 'Team';

export interface DataRoomDoc {
  id: string;
  founder_id: string;
  doc_name: string;
  storage_path: string;
  is_verified: boolean;
  category: DocCategory;
}
