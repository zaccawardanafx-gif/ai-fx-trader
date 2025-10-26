# 📖 AI FX Trader - User Guide

Welcome to AI FX Trader! This guide will help you get started and make the most of the app.

## 🚀 Getting Started

### First Time Setup

1. **Sign Up** - Create your account at the signup page
2. **Configure Your Settings** - Go to Settings and set your preferences:
   - Risk per trade (recommended: 1-2%)
   - Pip targets (recommended: 30-50 pips)
   - Analysis weights (keep balanced: 0.33 each)
   - Timezone for auto-generation
3. **Set Up Auto-Generation** (Optional but recommended):
   - Go to Settings → Auto-Generation
   - Choose your interval (hourly, daily, weekly)
   - Set your preferred time
   - Select your timezone
   - Click "Save Settings"

### Generate Your First Trade Idea

1. Go to the **Dashboard**
2. Click the **"Generate New Idea"** button
3. Wait for the AI to analyze market data and create a trade idea
4. Review the generated idea:
   - Entry price
   - Stop loss
   - Take profit
   - Rationale (AI's explanation)

## 📊 Understanding the Dashboard

The dashboard is your main workspace where you can:

### Market Overview
- **Current Price**: Live USD/CHF exchange rate
- **Price Change**: 24-hour price movement in pips
- **Market Status**: Current market sentiment
- **RSI**: Relative Strength Index (indicator)
- **MACD**: Moving Average Convergence Divergence (indicator)

### Trade Ideas Section
- **Active Ideas**: Currently open trades
- **Closed Ideas**: Completed trades
- **Idea Cards** show:
  - Direction (BUY or SELL)
  - Entry, Stop Loss, Take Profit prices
  - Status badges
  - Rationale summary

### Auto-Generation Countdown
- Shows time until next automatic trade idea generation
- Click the gear icon to pause/resume or change settings
- Get notified when new ideas are generated

## ⚙️ Key Features

### 1. **Settings Page** (`/settings`)

Configure your trading preferences:
- **Risk Parameters**:
  - Risk per trade (% of account)
  - Minimum/Maximum pip targets
  - Breakeven settings
- **Analysis Weights** (must sum to 1.0):
  - Technical analysis weight
  - Sentiment analysis weight
  - Macro analysis weight
- **Auto-Generation Settings**:
  - Enable/disable auto-generation
  - Set interval (hourly, 4h, 6h, 8h, 12h, daily, weekly)
  - Configure time and timezone
  - Pause/Resume functionality

### 2. **Prompts Page** (`/prompts`)

Customize the AI's trading style:
- **Edit Default Prompt**: Modify how the AI generates trade ideas
- **Create New Prompts**: Add your own custom prompts
- **Switch Between Prompts**: Activate different prompts
- Add your trading preferences to the prompt for better results

### 3. **Notifications System** 🔔

Stay informed about your trades:
- **Bell Icon** (top right): Shows unread notification count
- **Notification Types**:
  - ✅ Success: Trade idea generated successfully
  - ⚠️ Error: Generation failed (with retry)
  - 🔄 Retry: System is retrying generation
- **Mark as Read**: Click individual notifications or "Mark All Read"

### 4. **Language Support** 🌍

Switch between English and French:
- **Globe Icon** (top right): Click to switch languages
- All interface elements translate automatically
- Your data remains unchanged

## 📈 Daily Workflow

### Morning Routine
1. Check Dashboard for market overview
2. Review any new auto-generated trade ideas
3. Read AI rationale for each idea
4. Execute trades on your broker platform

### Throughout the Day
1. Monitor active trades
2. Check notifications for new ideas
3. Review market sentiment changes
4. Update trade statuses as needed

### Evening Review
1. Check closed trades performance
2. Review AI accuracy
3. Adjust settings if needed

## 🎯 Tips for Best Results

### Settings Configuration
- **Risk Management**: Never risk more than 1-2% per trade
- **Pip Targets**: Start conservative (30-50 pips for intraday)
- **Analysis Weights**: Balanced approach works well (0.33 each)
- **Auto-Generation**: Use daily or weekly for quality over quantity

### Prompt Customization
- Be specific about your trading style (scalping, swing, etc.)
- Mention risk aversion level
- Include preferred trading times
- Add any specific market conditions you avoid

### Trade Idea Evaluation
Always verify the AI's suggestions:
- Check entry price against current market
- Verify stop loss and take profit are reasonable
- Read the rationale carefully
- Consider your own analysis before executing

### Managing Trades
- **Mark as Active**: When you've opened a position
- **Mark as Closed**: When position is closed
- **Mark as Cancelled**: If you decide not to take the trade
- Track your P&L manually on your broker platform

## ⏰ Auto-Generation Explained

### How It Works
- The system generates trade ideas automatically at your set interval
- It analyzes the latest market data, indicators, and sentiment
- You receive a notification when a new idea is ready
- Ideas appear in your dashboard automatically

### Setting It Up
1. Go to Settings
2. Scroll to "Auto-Generation Settings"
3. Enable auto-generation
4. Choose your interval and time
5. Save settings

### Controlling It
- **Pause**: Temporarily stop auto-generation (settings saved)
- **Resume**: Resume with same settings
- **Edit**: Change interval or time anytime
- **Disable**: Turn off completely

## 📱 Navigation

### Header Menu
- **Dashboard**: View trade ideas and market data
- **Settings**: Configure preferences
- **Prompts**: Edit AI prompts
- **Language**: Switch between English/French
- **Notifications**: View alerts and updates
- **Logout**: Sign out

### Quick Actions
- **Generate New Idea**: Manually trigger trade generation
- **View All Ideas**: See all your trade history
- **Notification Bell**: Check latest updates
- **Language Switcher**: Change interface language

## 🔔 Understanding Notifications

### Notification Types

1. **Success Notifications**
   - "Trade idea generated successfully"
   - Green badge
   - Click to view details

2. **Error Notifications**
   - "Failed to generate trade idea"
   - Red badge
   - System will retry automatically

3. **Retry Notifications**
   - "Retrying trade idea generation"
   - Yellow badge
   - Usually resolves on its own

### Managing Notifications
- Click bell icon to view all notifications
- Click individual notification to mark as read
- Click "Mark All Read" to clear all
- Notifications auto-update every 30 seconds

## ⚠️ Important Reminders

### Risk Management
- ⚠️ **Never risk more than you can afford to lose**
- ⚠️ **AI suggestions are for information only**
- ⚠️ **Always do your own research**
- ⚠️ **Test with demo account first**

### Data Accuracy
- Market data updates every 10 minutes
- Indicators calculate automatically
- Sentiment updates from news feeds
- Historical data improves over time

### Performance
- Let the system run for at least 24 hours for best results
- More historical data = better AI suggestions
- Review and learn from past ideas
- Adjust settings based on results

## 🐛 Troubleshooting

### No Trade Ideas Generated
- Check if you have sufficient market data
- Verify AI prompt is active
- Check API quota limits
- Review notifications for errors

### Auto-Generation Not Working
- Verify auto-generation is enabled in settings
- Check timezone is set correctly
- Ensure it's not paused
- Review last generation time

### Data Not Updating
- Wait a few minutes (updates every 10 mins)
- Check internet connection
- Verify API keys are valid
- Check Supabase dashboard for errors

### Notifications Not Showing
- Click the bell icon to open dropdown
- Refresh the page
- Check if notifications exist in database
- Clear browser cache if needed

## 📞 Need Help?

### Documentation
- `README.md` - Full project documentation
- `QUICK_START.md` - Quick setup guide
- `SETUP.md` - Detailed setup instructions

### Common Questions

**Q: How often should I generate new ideas?**
A: With auto-generation, once a day or week is recommended for quality.

**Q: Are these guaranteed winning trades?**
A: No, these are AI-generated suggestions. Always do your own analysis.

**Q: Can I use this with other currency pairs?**
A: Currently optimized for USD/CHF only.

**Q: How accurate is the AI?**
A: Accuracy improves with more historical data. Track performance yourself.

**Q: What if auto-generation fails?**
A: The system retries automatically. Check notifications for details.

## 🎓 Best Practices

1. **Start Conservative**: Begin with low risk (0.5-1%) until comfortable
2. **Keep Records**: Track which ideas worked and why
3. **Adjust Settings**: Fine-tune based on your results
4. **Stay Informed**: Keep up with financial news
5. **Practice First**: Use a demo account for initial testing
6. **Review Regularly**: Check your trade performance weekly
7. **Trust but Verify**: AI is a tool, not a replacement for judgment

## 📊 Understanding the Analysis

### Technical Analysis
- RSI: Shows if market is overbought (>70) or oversold (<30)
- MACD: Shows momentum and trend direction
- SMA: Moving averages show trend direction
- ATR: Shows market volatility

### Sentiment Analysis
- Analyzes news from Fed, ECB, and Reuters
- Assigns positive, neutral, or negative sentiment
- Considers recent macro events

### Macro Analysis
- Tracks economic indicators
- Monitors central bank announcements
- Watches for major economic events

## 🚀 Ready to Trade!

You're all set to start using AI FX Trader. Remember:
- ✅ Configure your settings first
- ✅ Understand the risks
- ✅ Start with small positions
- ✅ Review AI suggestions carefully
- ✅ Track your performance

**Happy Trading! 📈**

---

*Last Updated: October 2024*

