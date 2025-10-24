# 🚀 Quick Start Guide

## 30-Second Setup

```bash
# 1. Install dependencies
cd ai-fx-trader
npm install

# 2. Create .env.local file with your keys
# (See .env.example or SETUP.md for details)

# 3. Run the app
npm run dev
```

## First-Time Checklist

### ☑️ Before You Start
- [ ] Supabase project created
- [ ] Database schema executed (`supabase-schema.sql`)
- [ ] Gemini API key obtained
- [ ] `.env.local` file created with all keys

### ☑️ First Run
- [ ] Navigate to http://localhost:3000
- [ ] Sign up for an account
- [ ] Visit http://localhost:3000/admin/init-data
- [ ] Click "Start Initialization" and wait for completion
- [ ] Go to Settings and configure your preferences
- [ ] (Optional) Customize AI prompt in Prompts page

### ☑️ Generate Your First Trade
- [ ] Go to Dashboard
- [ ] Click "Generate New Idea"
- [ ] Review the AI-generated trade setup
- [ ] Success! 🎉

## Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Database (Supabase Dashboard)
# Copy supabase-schema.sql → SQL Editor → Run

# Initialize Data (Development)
# Visit: http://localhost:3000/admin/init-data
# Click: "Start Initialization"
```

## Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Redirects to dashboard or login |
| Login | `/auth/login` | Sign in |
| Sign Up | `/auth/signup` | Create account |
| Dashboard | `/dashboard` | View trade ideas & market overview |
| Settings | `/settings` | Configure risk parameters |
| Prompts | `/prompts` | Customize AI prompt |
| Init Data | `/admin/init-data` | Initialize database (dev only) |

## Environment Variables (Required)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
GEMINI_API_KEY=AIzxxx...
```

## Troubleshooting

### "Failed to fetch market data"
→ Check internet connection, try again in a few minutes (API rate limit)

### "Insufficient market data"
→ Visit `/admin/init-data` to populate initial data

### "User profile not found"
→ Check Supabase logs, verify trigger function is created

### AI generation fails
→ Verify `GEMINI_API_KEY` in `.env.local`, check quota at Google AI Studio

## Next Steps After Setup

1. **Configure Settings** (`/settings`)
   - Set risk per trade: 1-2%
   - Set pip targets: 30-50
   - Adjust analysis weights (must sum to 1.0)

2. **Customize Prompt** (`/prompts`) - Optional
   - Edit the default prompt
   - Add your trading style preferences
   - Save changes

3. **Generate Ideas** (`/dashboard`)
   - Click "Generate New Idea"
   - Review entry, SL, TP, and rationale
   - Manage trade status

4. **Wait for Automation** (Production)
   - Cron job runs every 10 minutes
   - Automatically fetches market data
   - Computes indicators
   - Updates sentiment

## Pro Tips

💡 **Risk Management**: Never risk more than 1-2% per trade
💡 **Pip Targets**: Start conservative (30-50 pips)
💡 **Analysis Weights**: Balanced (0.33/0.33/0.34) works well initially
💡 **Prompt Customization**: Be specific about your trading preferences
💡 **Data History**: Let system run 24h to build sufficient data
💡 **Testing**: Always test on demo account first

## Quick Reference: Main Actions

### User Actions
```typescript
// Profile
getUserProfile(userId)
updateUserProfile(userId, updates)
createUserProfile(userId, email, username)

// Prompts
getUserPrompts(userId)
getActivePrompt(userId)
createPrompt(userId, title, promptText)
updatePrompt(promptId, title, promptText)
setActivePrompt(userId, promptId)

// Trade Ideas
generateTradeIdea(userId)
getUserTradeIdeas(userId, limit)
updateTradeIdeaStatus(ideaId, status)
```

### Data Actions
```typescript
// Market Data
fetchMarketData()
getLatestMarketData(limit)
getHistoricalData(days)

// Indicators
computeIndicators()
getLatestIndicators()

// Sentiment
fetchSentimentMacro()
getLatestSentimentMacro(limit)
getAverageSentiment(hours)
```

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Add `CRON_SECRET` variable
5. Deploy
6. Verify cron job is scheduled

### Other Platforms

- Ensure Node.js 20+ is available
- Set all environment variables
- Configure cron job or scheduled task for `/api/cron`

## Getting Help

1. 📖 Read `SETUP.md` for detailed guide
2. 📋 Check `README.md` for full documentation  
3. 📊 Review `PROJECT_SUMMARY.md` for overview
4. 🔍 Check Supabase & Gemini dashboards for errors

## License & Disclaimer

MIT License - For educational purposes only.

⚠️ **Trading involves risk of loss. Do your own research.**

---

**Ready? Let's trade! 🚀📈**






