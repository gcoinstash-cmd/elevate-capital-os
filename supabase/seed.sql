-- ELEVATE CAPITAL: Starter Seed Data for Production Verification

-- 1. Fund Profile
insert into public.profiles (id, company_name, target_raise, burn_rate, cash_on_hand)
values ('00000000-0000-0000-0000-000000000000', 'ELEVATE VENTURES I', 5000000, 145000, 1250000)
on conflict (id) do nothing;

-- 2. Investor Pipeline Roster
insert into public.investor_pipeline (investor_name, firm, stage, allocation_target, notes)
values
  ('Marc Andreessen', 'Andreessen Horowitz', 'Term Sheet', 1500000, 'Very interested in lead position. Requested deep-dive into physical manufacturing bottlenecks.'),
  ('Peter Thiel', 'Founders Fund', 'Due Diligence', 1000000, 'Technical due diligence scheduled. Specifically keen on defense-tech applications.'),
  ('Roelof Botha', 'Sequoia Capital', 'Closed', 1200000, 'Funds wired. Formally joined the seed round. Board observer seat assigned.'),
  ('Garry Tan', 'Y Combinator', 'Pitch Deck', 500000, 'Reviewed deck. Requested cohort retention breakdown and gross margin telemetry.'),
  ('Vinod Khosla', 'Khosla Ventures', 'Contacted', 800000, 'Initial outreach submitted. Awaiting partner sync on specialized compute architecture.');

-- 3. Virtual Data Room Documents
insert into public.data_room_docs (doc_name, storage_path, is_verified, category)
values
  ('Series_A_Audited_Financials_Q4.pdf', 'financials/series_a_audited_financials_q4.pdf', true, 'Financials'),
  ('Delaware_C_Corp_Restated_Articles.pdf', 'corporate/delaware_c_corp_restated_articles.pdf', true, 'Corporate'),
  ('Pro_Forma_Cap_Table_Fully_Diluted.xlsx', 'financials/pro_forma_cap_table_fully_diluted.xlsx', true, 'Financials'),
  ('Master_Services_Agreement_Enterprise.pdf', 'legal/master_services_agreement_enterprise.pdf', false, 'Legal'),
  ('Core_Technical_Whitepaper_v2.4.pdf', 'product/core_technical_whitepaper_v2_4.pdf', true, 'Product');
