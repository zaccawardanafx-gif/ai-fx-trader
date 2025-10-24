-- AI FX Trader Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text,
  email text,
  -- Legacy settings (kept for backward compatibility)
  risk_per_trade numeric default 1.0,
  pip_target_min integer default 30,
  pip_target_max integer default 50,
  breakeven_trigger integer default 20,
  -- New trading parameters
  weekly_pip_target_min integer default 80,
  weekly_pip_target_max integer default 120,
  max_risk_pips_per_trade integer default 15,
  weekly_trade_limit integer default 5,
  pip_target_per_rotation integer default 40,
  breakeven_trigger_pips integer default 20,
  trading_volume_chf numeric default 1000000,
  leverage_enabled boolean default false,
  max_leverage numeric default 10,
  selected_currency_pair text default 'USD/CHF',
  -- Weighting preferences
  technical_weight numeric default 0.4,
  sentiment_weight numeric default 0.3,
  macro_weight numeric default 0.3,
  -- Notification settings
  alert_frequency text default '15min',
  notify_email boolean default true,
  notify_whatsapp boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User prompts table (versioned)
create table user_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  version integer default 1,
  title text default 'Default Trade Prompt',
  prompt_text text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Market data table (cached from Yahoo Finance)
create table market_data (
  id bigserial primary key,
  timestamp timestamptz not null,
  pair text default 'USDCHF',
  price numeric not null,
  high numeric,
  low numeric,
  open numeric,
  close numeric,
  volume bigint,
  source text default 'yahoo',
  created_at timestamptz default now()
);

-- Technical indicators table
create table technical_indicators (
  id bigserial primary key,
  timestamp timestamptz not null,
  pair text default 'USDCHF',
  rsi numeric,
  macd numeric,
  macd_signal numeric,
  macd_histogram numeric,
  sma50 numeric,
  sma200 numeric,
  atr numeric,
  created_at timestamptz default now()
);

-- Sentiment and macro data table
create table sentiment_macro (
  id bigserial primary key,
  timestamp timestamptz not null,
  sentiment_score numeric,
  macro_event text,
  impact text,
  source text,
  created_at timestamptz default now()
);

-- Trade ideas table (AI-generated)
create table trade_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt_version integer,
  currency_pair text default 'USD/CHF',
  direction text not null, -- 'BUY' or 'SELL'
  entry numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  pip_target numeric,
  expiry timestamptz,
  rationale text,
  technical_score numeric,
  sentiment_score numeric,
  macro_score numeric,
  confidence numeric, -- 0-100
  technical_weight numeric,
  sentiment_weight numeric,
  macro_weight numeric,
  status text default 'active', -- 'active', 'executed', 'closed', 'cancelled', 'expired'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trade log table (executed trades)
create table trade_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  trade_idea_id uuid references trade_ideas(id) on delete set null,
  currency_pair text not null,
  direction text not null,
  entry_price numeric not null,
  entry_timestamp timestamptz default now(),
  exit_price numeric,
  exit_timestamp timestamptz,
  volume_chf numeric not null,
  leverage numeric default 1,
  stop_loss numeric not null,
  take_profit numeric not null,
  current_stop_loss numeric not null,
  current_take_profit numeric not null,
  status text default 'open', -- 'open', 'closed', 'stopped_out', 'target_hit'
  realized_pnl_chf numeric,
  realized_pnl_pips numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Positions tracker table (current open positions)
create table positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  trade_log_id uuid references trade_log(id) on delete cascade,
  currency_pair text not null,
  direction text not null,
  entry_price numeric not null,
  current_price numeric not null,
  volume_chf numeric not null,
  leverage numeric default 1,
  stop_loss numeric not null,
  take_profit numeric not null,
  unrealized_pnl_chf numeric,
  unrealized_pnl_pips numeric,
  opened_at timestamptz not null,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- P&L summary table (aggregated performance)
create table pnl_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  period_type text not null, -- 'daily', 'weekly', 'monthly'
  period_start timestamptz not null,
  period_end timestamptz not null,
  total_trades integer default 0,
  winning_trades integer default 0,
  losing_trades integer default 0,
  total_pips numeric default 0,
  total_pnl_chf numeric default 0,
  win_rate numeric default 0,
  avg_win_pips numeric default 0,
  avg_loss_pips numeric default 0,
  largest_win_chf numeric default 0,
  largest_loss_chf numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for better query performance
create index idx_market_data_timestamp on market_data(timestamp desc);
create index idx_market_data_pair on market_data(pair, timestamp desc);
create index idx_technical_indicators_timestamp on technical_indicators(timestamp desc);
create index idx_technical_indicators_pair on technical_indicators(pair, timestamp desc);
create index idx_sentiment_macro_timestamp on sentiment_macro(timestamp desc);
create index idx_trade_ideas_user_id on trade_ideas(user_id, created_at desc);
create index idx_trade_ideas_status on trade_ideas(user_id, status, created_at desc);
create index idx_user_prompts_user_id on user_prompts(user_id, version desc);
create index idx_trade_log_user_id on trade_log(user_id, created_at desc);
create index idx_trade_log_status on trade_log(user_id, status);
create index idx_positions_user_id on positions(user_id, opened_at desc);
create index idx_pnl_summary_user_period on pnl_summary(user_id, period_type, period_start desc);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table user_prompts enable row level security;
alter table market_data enable row level security;
alter table technical_indicators enable row level security;
alter table sentiment_macro enable row level security;
alter table trade_ideas enable row level security;
alter table trade_log enable row level security;
alter table positions enable row level security;
alter table pnl_summary enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- User prompts policies
create policy "Users can view own prompts"
  on user_prompts for select
  using (auth.uid() = user_id);

create policy "Users can insert own prompts"
  on user_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own prompts"
  on user_prompts for update
  using (auth.uid() = user_id);

-- Market data policies (public read)
create policy "Anyone can view market data"
  on market_data for select
  using (true);

-- Technical indicators policies (public read/write)
create policy "Anyone can view technical indicators"
  on technical_indicators for select
  using (true);

create policy "Anyone can insert technical indicators"
  on technical_indicators for insert
  with check (true);

create policy "Anyone can update technical indicators"
  on technical_indicators for update
  using (true);

-- Sentiment macro policies (public read)
create policy "Anyone can view sentiment macro"
  on sentiment_macro for select
  using (true);

-- Trade ideas policies
create policy "Users can view own trade ideas"
  on trade_ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert own trade ideas"
  on trade_ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trade ideas"
  on trade_ideas for update
  using (auth.uid() = user_id);

-- Functions

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_trade_ideas_updated_at before update on trade_ideas
  for each row execute procedure update_updated_at_column();

create trigger update_trade_log_updated_at before update on trade_log
  for each row execute procedure update_updated_at_column();

create trigger update_pnl_summary_updated_at before update on pnl_summary
  for each row execute procedure update_updated_at_column();

-- RLS Policies for new tables

-- Trade log policies
create policy "Users can view own trade log"
  on trade_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own trade log"
  on trade_log for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trade log"
  on trade_log for update
  using (auth.uid() = user_id);

-- Positions policies
create policy "Users can view own positions"
  on positions for select
  using (auth.uid() = user_id);

create policy "Users can insert own positions"
  on positions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own positions"
  on positions for update
  using (auth.uid() = user_id);

create policy "Users can delete own positions"
  on positions for delete
  using (auth.uid() = user_id);

-- P&L summary policies
create policy "Users can view own pnl summary"
  on pnl_summary for select
  using (auth.uid() = user_id);

create policy "Users can insert own pnl summary"
  on pnl_summary for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pnl summary"
  on pnl_summary for update
  using (auth.uid() = user_id);


