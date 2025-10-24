# AI FX Trade Idea Generator (USD/CHF)

A sophisticated multi-user web application that uses AI (Gemini 2.5 Flash) to generate USD/CHF trade ideas based on technical indicators, sentiment analysis, and macroeconomic news.

## 🚀 Features

- **AI-Powered Trade Ideas**: Generate precise trade ideas using Gemini 2.5 Flash
- **Technical Analysis**: RSI, MACD, SMA (50/200), and ATR indicators
- **Sentiment Analysis**: Real-time sentiment from macro news feeds
- **User Customization**: Configurable risk parameters and AI prompt templates
- **Multi-User Support**: Individual user profiles with personalized settings
- **Real-Time Market Data**: Live USD/CHF data from Yahoo Finance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Gemini 2.5 Flash via Vercel AI SDK
- **Market Data**: Yahoo Finance API
- **Technical Indicators**: technicalindicators npm package
- **Sentiment**: RSS Parser for news feeds

## 📋 Prerequisites

- Node.js 20+ installed
- Supabase account (free tier works)
- Gemini API key from Google AI Studio

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
cd ai-fx-trader
npm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy your project URL and API keys

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for your `.env.local` file

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses 6 main tables:

- **profiles**: User settings and risk parameters
- **user_prompts**: Custom AI prompts with versioning
- **market_data**: Cached USD/CHF market data
- **technical_indicators**: Computed technical indicators
- **sentiment_macro**: News sentiment and macro events
- **trade_ideas**: AI-generated trade ideas

See `supabase-schema.sql` for the complete schema.

## 🎯 Usage

### 1. Sign Up

Create an account at `/auth/signup`

### 2. Configure Settings

Go to Settings (`/settings`) to configure:
- Risk per trade (%)
- Pip targets (min/max)
- Analysis weights (technical, sentiment, macro)
- Alert preferences

### 3. Customize AI Prompt

Visit Prompts (`/prompts`) to:
- Edit the AI prompt template
- Create new prompt versions
- Switch between different prompts

### 4. Generate Trade Ideas

On the Dashboard (`/dashboard`):
- View market overview with live data
- Click "Generate New Idea" to create AI-powered trade ideas
- View entry, stop loss, take profit, and rationale
- Manage trade idea status

## 🔄 Automated Data Fetching

To keep market data fresh, set up a cron job or use Vercel Cron Jobs:

### Option 1: Vercel Cron (Production)

Create `app/api/cron/route.ts`:

```typescript
import { fetchMarketData } from '@/app/actions/fetchMarketData'
import { computeIndicators } from '@/app/actions/computeIndicators'
import { fetchSentimentMacro } from '@/app/actions/fetchSentimentMacro'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await fetchMarketData()
  await computeIndicators()
  await fetchSentimentMacro()

  return Response.json({ success: true })
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "*/10 * * * *"
  }]
}
```

### Option 2: Manual Data Fetch

You can also manually trigger data updates from the server actions.

## 🏗️ Project Structure

```
ai-fx-trader/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions
│   │   │   ├── fetchMarketData.ts
│   │   │   ├── computeIndicators.ts
│   │   │   ├── fetchSentimentMacro.ts
│   │   │   ├── generateTradeIdeas.ts
│   │   │   ├── userPrompts.ts
│   │   │   └── profile.ts
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Main dashboard
│   │   ├── prompts/          # Prompt editor
│   │   ├── settings/         # User settings
│   │   └── layout.tsx
│   ├── components/           # React components
│   │   ├── Header.tsx
│   │   ├── TradeIdeasList.tsx
│   │   ├── MarketOverview.tsx
│   │   ├── SettingsForm.tsx
│   │   └── PromptEditor.tsx
│   └── lib/
│       ├── supabase/         # Supabase clients
│       └── utils.ts
├── supabase-schema.sql       # Database schema
└── package.json
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Middleware protects authenticated routes
- API keys stored in environment variables

## 🚧 Roadmap / Phase 2

- [ ] Email notifications (Resend)
- [ ] WhatsApp notifications (Meta API)
- [ ] Trade performance tracking
- [ ] Historical backtest of AI ideas
- [ ] Multi-currency pair support
- [ ] Advanced charting
- [ ] Admin dashboard

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. Trading forex involves substantial risk of loss. Always do your own research and consult with a financial advisor before making trading decisions.
