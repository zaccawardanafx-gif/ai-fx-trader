# 🏗️ Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Browser                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Dashboard  │  │  Settings  │  │  Prompts   │  │   Auth    │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Next.js App Router
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 15 Server                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Server Actions                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │   │
│  │  │ Market Data  │  │  Indicators  │  │   Sentiment    │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘ │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │   │
│  │  │ Trade Ideas  │  │   Prompts    │  │    Profile     │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Middleware                              │   │
│  │              (Auth & Route Protection)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────┬────────────────┬──────────────┘
               │                  │                │
               ▼                  ▼                ▼
    ┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
    │    Supabase      │ │   Gemini    │ │  Yahoo Finance   │
    │  (PostgreSQL)    │ │ 2.5 Flash   │ │       API        │
    │                  │ │     API     │ │                  │
    │ • Auth           │ │             │ │ • Market Data    │
    │ • Database       │ │ • Trade     │ │ • Real-time      │
    │ • RLS Policies   │ │   Ideas     │ │   Quotes         │
    └──────────────────┘ └─────────────┘ └──────────────────┘
```

## Component Hierarchy

```
App
├── Layout (Quicksand font, global styles)
│
├── Auth Pages
│   ├── /auth/login
│   └── /auth/signup
│
├── Protected Pages (requires auth)
│   │
│   ├── /dashboard
│   │   ├── Header
│   │   ├── MarketOverview
│   │   │   ├── Current Price
│   │   │   ├── RSI Indicator
│   │   │   ├── MACD Indicator
│   │   │   └── Sentiment Score
│   │   └── TradeIdeasList
│   │       └── Trade Idea Cards
│   │
│   ├── /settings
│   │   ├── Header
│   │   └── SettingsForm
│   │       ├── Profile Section
│   │       ├── Risk Parameters
│   │       ├── Analysis Weights
│   │       └── Notifications
│   │
│   ├── /prompts
│   │   ├── Header
│   │   └── PromptEditor
│   │       ├── Prompt History Sidebar
│   │       └── Editor Panel
│   │
│   └── /admin/init-data
│       └── Data Initialization UI
│
└── API Routes
    └── /api/cron (automated data fetching)
```

## Data Flow Diagram

### Trade Idea Generation Flow

```
1. User clicks "Generate New Idea"
   │
   ▼
2. Client → Server Action: generateTradeIdea(userId)
   │
   ▼
3. Fetch User Data
   ├─→ Get user profile (risk settings, weights)
   └─→ Get active prompt template
   │
   ▼
4. Fetch Market Context
   ├─→ Latest market data (price, OHLC)
   ├─→ Technical indicators (RSI, MACD, SMA, ATR)
   └─→ Sentiment data (24h average, recent events)
   │
   ▼
5. Build AI Prompt
   ├─→ User's custom prompt template
   ├─→ Market data JSON
   ├─→ Technical indicators JSON
   ├─→ Sentiment data JSON
   └─→ User risk parameters
   │
   ▼
6. Call Gemini API
   │ Model: gemini-2.0-flash-exp
   │ Mode: generateObject (structured output)
   │ Schema: { entry, stop_loss, take_profit, expiry_hours, rationale }
   │
   ▼
7. Process AI Response
   ├─→ Validate output structure
   ├─→ Calculate expiry timestamp
   └─→ Add metadata (prompt version, weights)
   │
   ▼
8. Save to Database
   │ Table: trade_ideas
   │ Status: active
   │
   ▼
9. Return to Client
   └─→ Display trade idea card on dashboard
```

### Automated Data Update Flow

```
Every 10 minutes (Vercel Cron)
   │
   ▼
1. Trigger: /api/cron endpoint
   │ Auth: Bearer token (CRON_SECRET)
   │
   ▼
2. Fetch Market Data
   ├─→ Yahoo Finance: quote('USDCHF=X')
   ├─→ Extract price, OHLC, volume
   └─→ Insert into market_data table
   │
   ▼
3. Compute Indicators
   ├─→ Get latest 250 data points
   ├─→ Calculate RSI (14), MACD (12,26,9)
   ├─→ Calculate SMA (50, 200), ATR (14)
   └─→ Insert into technical_indicators table
   │
   ▼
4. Fetch Sentiment
   ├─→ Parse RSS feeds (Fed, ECB, Reuters)
   ├─→ Analyze sentiment (-1 to 1 scale)
   ├─→ Determine impact (high/medium/low)
   └─→ Insert into sentiment_macro table
   │
   ▼
5. Data Ready
   └─→ Available for next trade idea generation
```

## Database Schema Overview

```sql
┌──────────────────┐
│   auth.users     │ (Supabase managed)
└────────┬─────────┘
         │ 1:1
         ▼
┌──────────────────┐
│    profiles      │ User settings & risk params
│ ----------------│
│ • risk_per_trade │
│ • pip_targets    │
│ • weights        │
│ • notifications  │
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│  user_prompts    │ Versioned AI prompts
│ ----------------│
│ • version        │
│ • prompt_text    │
│ • is_active      │
└──────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│   trade_ideas    │ AI-generated trades
│ ----------------│
│ • entry          │
│ • stop_loss      │
│ • take_profit    │
│ • rationale      │
│ • status         │
└──────────────────┘

┌──────────────────┐
│   market_data    │ USD/CHF price data
│ ----------------│
│ • timestamp      │
│ • price          │
│ • OHLC           │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│technical_indics  │ Computed indicators
│ ----------------│
│ • rsi, macd      │
│ • sma, atr       │
└──────────────────┘

┌──────────────────┐
│ sentiment_macro  │ News & sentiment
│ ----------------│
│ • sentiment_score│
│ • macro_event    │
│ • impact         │
└──────────────────┘
```

## Security Model

### Row Level Security (RLS) Policies

```
profiles:
  ✓ Users can SELECT their own profile
  ✓ Users can UPDATE their own profile
  ✓ Users can INSERT their own profile (on signup)

user_prompts:
  ✓ Users can SELECT own prompts
  ✓ Users can INSERT own prompts
  ✓ Users can UPDATE own prompts

trade_ideas:
  ✓ Users can SELECT own trade ideas
  ✓ Users can INSERT own trade ideas
  ✓ Users can UPDATE own trade ideas

market_data:
  ✓ All authenticated users can SELECT (public read)

technical_indicators:
  ✓ All authenticated users can SELECT (public read)

sentiment_macro:
  ✓ All authenticated users can SELECT (public read)
```

### Authentication Flow

```
1. User visits protected route
   │
   ▼
2. Middleware checks auth cookie
   │
   ├─→ No session: Redirect to /auth/login
   │
   └─→ Valid session: Continue to route
       │
       ▼
3. Server Component: getUser() from Supabase
   │
   ├─→ No user: Redirect to /auth/login
   │
   └─→ User found: Render page with user data
```

## API Integration Points

### External APIs

1. **Yahoo Finance API**
   - Endpoint: `quote('USDCHF=X')`
   - Rate Limit: ~2000 requests/hour (free tier)
   - Fallback: Cache last known value

2. **Gemini 2.5 Flash**
   - Model: `gemini-2.0-flash-exp`
   - Rate Limit: Depends on quota
   - Cost: Free tier available
   - Timeout: 30 seconds

3. **RSS Feeds**
   - Federal Reserve: press releases
   - Reuters: business news
   - ECB: economic data
   - Fallback: Neutral sentiment if feeds fail

## Performance Considerations

### Optimization Strategies

1. **Data Caching**
   - Market data cached in database
   - Indicators computed once per update cycle
   - Sentiment aggregated over time windows

2. **Efficient Queries**
   - Indexed columns for fast lookups
   - Limit results with pagination
   - Fetch only required fields

3. **AI Response Time**
   - Gemini 2.5 Flash: ~2-3 seconds average
   - Structured output reduces parsing time
   - Error handling with retries

4. **Client-Side**
   - React Server Components for initial render
   - Client components only for interactivity
   - Lazy loading of non-critical components

## Scalability

### Current Capacity
- Single USD/CHF pair
- ~100 concurrent users (free tier limits)
- 10-minute update cycle
- Unlimited trade ideas per user

### Scale-Up Options
1. **Horizontal Scaling**
   - Vercel auto-scales frontend
   - Supabase can scale DB size
   - Add CDN for static assets

2. **Vertical Scaling**
   - Upgrade Supabase tier for more connections
   - Increase Gemini quota
   - Add Redis for caching

3. **Feature Scaling**
   - Add more currency pairs
   - Real-time WebSocket updates
   - Distributed cron jobs

## Error Handling

### Levels of Fallback

```
1. API Call Fails
   ├─→ Log error
   ├─→ Return last cached data
   └─→ Show user-friendly message

2. Database Error
   ├─→ Log error with context
   ├─→ Rollback transaction if needed
   └─→ Return error response to client

3. AI Generation Fails
   ├─→ Log prompt and error
   ├─→ Use fallback prompt (if applicable)
   └─→ Suggest retry to user

4. Validation Error
   ├─→ Display field-specific errors
   └─→ Prevent submission until fixed
```

## Monitoring & Logging

### Key Metrics to Track

- API call success rates (Yahoo, Gemini, RSS)
- Trade idea generation time
- Database query performance
- User signup/login rates
- Cron job execution status

### Logging Points

- All server action calls
- API errors with context
- Database query errors
- Authentication failures
- Cron job results

## Deployment Architecture

```
GitHub Repository
   │
   ▼
Vercel Platform
   │
   ├─→ Build (Next.js)
   │   ├─→ Static pages
   │   └─→ Server functions
   │
   ├─→ Deploy to Edge Network
   │   └─→ Global CDN
   │
   └─→ Schedule Cron Jobs
       └─→ /api/cron every 10 min

External Services:
   ├─→ Supabase (Database + Auth)
   ├─→ Google AI (Gemini)
   └─→ Yahoo Finance (Market Data)
```

---

**Architecture designed for**:
- ✅ Scalability
- ✅ Maintainability  
- ✅ Security
- ✅ Performance
- ✅ Developer Experience







