# Setup Guide - AI FX Trader

## Quick Start Checklist

### ✅ Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name, database password, and region
   - Wait for project to be ready (~2 minutes)

2. **Run Database Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy entire contents of `supabase-schema.sql`
   - Paste and run in SQL Editor
   - Verify all tables are created

3. **Get API Keys**
   - Go to Project Settings > API
   - Copy:
     - Project URL
     - `anon` `public` key
     - `service_role` `secret` key

### ✅ Step 2: Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in new project" or use existing
4. Copy the generated key

### ✅ Step 3: Environment Setup

Create `.env.local` file in `ai-fx-trader` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Gemini AI Configuration  
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: For Vercel Cron Jobs (Production)
CRON_SECRET=your-random-secret-string
```

### ✅ Step 4: Install & Run

```bash
cd ai-fx-trader
npm install
npm run dev
```

Visit http://localhost:3000

## First Time User Flow

### 1. Sign Up
- Go to http://localhost:3000
- You'll be redirected to `/auth/login`
- Click "Sign up"
- Enter username, email, and password
- Submit (profile will be auto-created)

### 2. Configure Settings
- Navigate to "Settings" in the header
- Set your risk parameters:
  - Risk per trade: 1-2% recommended
  - Pip targets: 30-50 pips default
  - Breakeven trigger: 20 pips
- Set analysis weights (must sum to 1.0):
  - Technical: 0.4 (40%)
  - Sentiment: 0.3 (30%)
  - Macro: 0.3 (30%)
- Click "Save Settings"

### 3. Customize AI Prompt (Optional)
- Navigate to "Prompts"
- Review the default prompt
- Edit if you want specific trading style
- Click "Save Changes"

### 4. Initialize Data
Since the cron job runs every 10 minutes, you'll need to manually fetch data first:

**Option A: Create a test page (temporary)**

Create `ai-fx-trader/src/app/test-fetch/page.tsx`:

```typescript
import { fetchMarketData } from '@/app/actions/fetchMarketData'
import { computeIndicators } from '@/app/actions/computeIndicators'
import { fetchSentimentMacro } from '@/app/actions/fetchSentimentMacro'

export default async function TestFetch() {
  const market = await fetchMarketData()
  const indicators = await computeIndicators()
  const sentiment = await fetchSentimentMacro()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Fetch Test</h1>
      <div className="space-y-4">
        <div>Market: {market.success ? '✅' : '❌'}</div>
        <div>Indicators: {indicators.success ? '✅' : '❌'}</div>
        <div>Sentiment: {sentiment.success ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}
```

Visit http://localhost:3000/test-fetch to initialize data.

**Option B: Use the API route**

If CRON_SECRET is set in `.env.local`:

```bash
curl http://localhost:3000/api/cron \
  -H "Authorization: Bearer your-cron-secret"
```

### 5. Generate First Trade Idea
- Go to Dashboard
- Click "Generate New Idea"
- Wait for AI to analyze data (~3-5 seconds)
- View your trade idea with entry, SL, TP, and rationale

## Troubleshooting

### Issue: "Failed to fetch market data"
- **Cause**: Yahoo Finance API might be rate-limited or temporarily down
- **Solution**: Wait a few minutes and try again, or check your internet connection

### Issue: "Insufficient market data for indicator calculation"
- **Cause**: Not enough historical data in database
- **Solution**: Run the market data fetcher multiple times to build up history, or wait for cron job to populate data

### Issue: "User profile not found"
- **Cause**: Profile wasn't auto-created on signup
- **Solution**: Check Supabase logs, verify the trigger function is created

### Issue: Weights don't sum to 1.0
- **Cause**: Decimal precision or user input error
- **Solution**: Adjust weights in Settings - the form validates this

### Issue: "Failed to generate trade idea"
- **Cause**: Missing Gemini API key or quota exceeded
- **Solution**: Check `.env.local` has correct GEMINI_API_KEY, verify quota at Google AI Studio

## Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Add `CRON_SECRET` variable (generate random string)
6. Deploy

### 3. Verify Cron Jobs
- Go to Project Settings > Cron Jobs
- Verify `/api/cron` is scheduled for every 10 minutes
- Check logs after first execution

## Database Maintenance

### Backup Data
```bash
# From Supabase Dashboard > Database > Backups
# Enable Point-in-Time Recovery (PITR) for automatic backups
```

### Clean Old Data (Optional)
Add cleanup queries to remove old market data:

```sql
-- Delete market data older than 90 days
DELETE FROM market_data 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Delete old sentiment data
DELETE FROM sentiment_macro 
WHERE timestamp < NOW() - INTERVAL '30 days';
```

## Support

For issues, questions, or feature requests:
1. Check this guide first
2. Review the main README.md
3. Check Supabase and Gemini API status pages
4. Open an issue on GitHub

## Security Best Practices

- Never commit `.env.local` to version control
- Rotate API keys periodically
- Use strong passwords for Supabase
- Enable 2FA on Supabase and Vercel
- Review RLS policies regularly
- Monitor API usage for both Supabase and Gemini

---

**Ready to Trade!** 🚀

Remember: This is a tool to assist with analysis. Always do your own research and never risk more than you can afford to lose.






