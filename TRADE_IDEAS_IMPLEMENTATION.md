# Trade Ideas Widget Implementation

## Overview
This document describes the comprehensive trade ideas system that has been implemented, including AI-powered trade generation, execution, position tracking, and P&L monitoring.

## Features Implemented

### 1. **Enhanced Database Schema** ✅
- **New Profile Fields**: Weekly pip targets, risk limits, currency pair selection, leverage settings
- **Trade Ideas Table**: Enhanced with direction, scores, confidence, currency pair support
- **Trade Log Table**: Tracks executed trades with entry/exit prices and P&L
- **Positions Table**: Real-time tracking of open positions
- **P&L Summary Table**: Aggregated performance metrics by period

### 2. **Trading Strategy Parameters** ✅
Users can now configure:
- **Weekly Pip Targets**: Min/Max (default: 80-120 pips)
- **Max Risk per Trade**: In pips (default: 15-20)
- **Weekly Trade Limit**: Max trades per week (default: 3-5)
- **Pip Target per Rotation**: Target per trade (default: 30-50)
- **Breakeven Trigger**: Auto-move stop to BE at +X pips (default: 20)
- **Trading Volume**: In CHF (default: 1M)
- **Leverage**: Enable/disable with max ratio settings
- **Currency Pair**: Select from 10 major FX pairs

### 3. **Multi-Currency Support** ✅
- Support for 10 major currency pairs (USD/CHF, EUR/USD, GBP/USD, etc.)
- Real-time price data from Yahoo Finance
- Automatic pair-specific technical analysis
- Currency pair selection in settings

### 4. **Advanced Technical Analysis** ✅
Implemented comprehensive FX indicators:
- **RSI** (14 period)
- **MACD** (12, 26, 9)
- **Bollinger Bands** (20, 2)
- **Moving Averages**: SMA 20, 50, 200 and EMA 12, 26
- **ATR** (14 period) for volatility
- **Stochastic Oscillator** (14, 3, 3)
- **Technical Scoring**: 0-100 score with trend analysis

### 5. **Sentiment & Macro Analysis** ✅
Free data sources integrated:
- **Reddit API**: Forex subreddit sentiment
- **RSS Feeds**: Bloomberg, Investing.com, ForexLive
- **AI-Powered Analysis**: Gemini analyzes each source for market impact
- **Weighted Scoring**: High/medium/low impact classification
- **24-hour Average**: Time-weighted sentiment aggregation

### 6. **AI Trade Idea Generation** ✅
Using Gemini 2.0 Flash:
- **Multi-Factor Analysis**: Technical + Sentiment + Macro weighted by user preferences
- **Rule Compliance**: Respects all user-defined risk parameters
- **Weekly Limit**: Prevents overtrading (max 3-5 trades/week)
- **Quality Focus**: Only suggests high-conviction setups (60%+ confidence)
- **Detailed Rationale**: Multi-paragraph explanation with technical/sentiment/macro breakdown
- **Customizable Prompts**: Users can edit the AI prompt in markdown format

### 7. **Compact Trade Ideas Widget** ✅
Beautiful, responsive widget featuring:
- **Mini-List View**: Shows 5 most recent active ideas
- **Key Metrics**: Entry, target pips, confidence, direction
- **Score Visualization**: Progress bars for technical/sentiment/macro scores
- **Click to Expand**: Opens detailed modal with full information
- **Auto-Refresh**: Updates every 30 seconds
- **Generate Button**: Create new ideas with one click

### 8. **Trade Idea Detail Modal** ✅
Comprehensive trade breakdown:
- **Trade Setup**: Entry, stop loss, take profit with pip calculations
- **Risk/Reward Ratio**: Calculated automatically
- **Analysis Breakdown**: Visual scores for technical, sentiment, and macro
- **Full AI Rationale**: Complete reasoning with formatting
- **Expiry Date**: When the trade idea expires
- **Action Buttons**: Execute or Cancel the trade idea

### 9. **Trade Execution System** ✅
One-click execution:
- **Market Execution**: Executes at current market price
- **Trade Log Creation**: Records all trade details
- **Position Tracking**: Creates open position entry
- **Status Updates**: Trade idea marked as "executed"
- **Leverage Application**: Uses configured leverage settings

### 10. **Position Management** ✅
Real-time position tracking:
- **Live P&L Calculation**: Updates with current market prices
- **Pip Tracking**: Shows unrealized P&L in both CHF and pips
- **Auto Stop-Out**: Closes position if stop loss hit
- **Auto Take-Profit**: Closes position if target reached
- **Manual Close**: Users can manually close positions

### 11. **P&L Summary** ✅
Performance analytics:
- **Period Types**: Daily, Weekly, Monthly
- **Win Rate**: Percentage of winning trades
- **Average Win/Loss**: In pips
- **Total Pips**: Net pips for the period
- **Total P&L**: Net profit/loss in CHF
- **Largest Wins/Losses**: Track extremes

### 12. **Drag-and-Drop Dashboard** ✅
Fully customizable layout:
- **React Grid Layout**: Professional drag-and-drop system
- **Responsive**: Works on desktop, tablet, and mobile
- **Persistent**: Saves layout to localStorage
- **Reset Option**: One-click reset to default layout
- **Three Widgets**: Chart, Trade Ideas, Market Overview
- **Visual Indicators**: Hover to see drag handles

### 13. **Enhanced Settings Page** ✅
Comprehensive configuration:
- **Profile Settings**: Username
- **Trading Strategy**: All trading parameters in one place
- **Currency Pair Selection**: Dropdown of available pairs
- **Volume & Leverage**: Full control over position sizing
- **Analysis Weights**: Visual sliders showing distribution
- **Real-time Validation**: Ensures weights sum to 100%
- **Notifications**: Email and WhatsApp (coming soon)

### 14. **Prompt Editor** ✅
Customize AI behavior:
- **Markdown Support**: Structured prompts with headings, bold, bullets
- **Version Control**: Create and switch between prompt versions
- **Active Prompt**: Mark which prompt to use for generation
- **Default Template**: Professional markdown template provided
- **Writing Guide**: In-app tips for effective prompt engineering
- **Role/Context/Task/Format**: Structured prompt methodology

## Technical Implementation

### Data Flow
1. **Market Data**: Yahoo Finance → Database (every 5 seconds possible)
2. **Technical Analysis**: Historical data → Indicators → Scoring
3. **Sentiment Analysis**: Reddit + RSS → AI Analysis → Weighted Score
4. **Trade Generation**: All data + User Prompt → Gemini 2.5 Pro → Trade Idea
5. **Execution**: Trade Idea → Market Price → Trade Log + Position
6. **Position Update**: Current Price → P&L Calc → Database Update

### API Integrations
- **Yahoo Finance**: Free, real-time FX quotes and historical data
- **Reddit JSON API**: No auth required, free sentiment data
- **RSS Feeds**: Free financial news from major outlets
- **Gemini 2.0 Flash**: AI analysis and trade generation
- **Supabase**: Real-time database with row-level security

### Performance Optimizations
- **Parallel Data Fetching**: All data sources fetched simultaneously
- **Database Indexing**: Optimized queries for fast retrieval
- **Client-Side Caching**: Trade ideas cached on widget
- **Auto-Refresh**: Minimal data transfer with targeted updates
- **Lazy Loading**: Components load as needed

## User Workflow

### Setting Up
1. Go to Settings → Configure trading parameters
2. Go to Prompts → Customize AI trading strategy (optional)
3. Dashboard → Drag widgets to preferred layout

### Generating Trade Ideas
1. Click "Generate New Idea" in Trade Ideas widget
2. AI analyzes current market conditions (5-10 seconds)
3. Trade idea appears with full rationale and scores
4. Review technical/sentiment/macro breakdown
5. Check risk/reward ratio and confidence level

### Executing Trades
1. Click on trade idea to open detail modal
2. Review full rationale and setup details
3. Click "Execute Trade" button
4. Trade executes at current market price
5. Position appears in positions tracker
6. P&L updates in real-time

### Monitoring Performance
1. Open positions show live P&L
2. Closed trades logged in trade history
3. P&L summary shows weekly/monthly stats
4. Win rate and average pips tracked automatically

## Configuration Examples

### Conservative Trader
```
Weekly Target: 50-80 pips
Max Risk: 10 pips
Weekly Limit: 3 trades
Technical Weight: 50%
Sentiment Weight: 30%
Macro Weight: 20%
Leverage: Disabled
```

### Aggressive Trader
```
Weekly Target: 120-200 pips
Max Risk: 25 pips
Weekly Limit: 8 trades
Technical Weight: 40%
Sentiment Weight: 35%
Macro Weight: 25%
Leverage: Enabled (1:10)
```

### Macro-Focused Trader
```
Weekly Target: 80-120 pips
Max Risk: 15 pips
Weekly Limit: 4 trades
Technical Weight: 25%
Sentiment Weight: 25%
Macro Weight: 50%
Leverage: Enabled (1:5)
```

## Next Steps (Future Enhancements)

### Phase 2 Features
- [ ] Real-time price streaming (WebSocket)
- [ ] Automatic breakeven trigger execution
- [ ] Email/WhatsApp notifications
- [ ] Trade history analytics dashboard
- [ ] Backtesting with historical data
- [ ] Multiple position sizing strategies
- [ ] Advanced chart integration (custom indicators)
- [ ] Social trading (share trade ideas)
- [ ] API access for algorithmic trading
- [ ] Mobile app (React Native)

### Potential Improvements
- [ ] Machine learning for prediction enhancement
- [ ] Correlation analysis between pairs
- [ ] Economic calendar integration
- [ ] Order book data analysis
- [ ] Volatility-based position sizing
- [ ] Portfolio risk management
- [ ] Multi-timeframe analysis
- [ ] Custom indicator creation
- [ ] Trade journaling with screenshots
- [ ] Performance attribution analysis

## Notes

- All timestamps are in UTC
- Pip calculations assume 4-digit quotes (0.0001 = 1 pip)
- P&L includes spread simulation (to be added)
- Positions auto-close on stop/target
- Trade ideas expire after configured hours
- Weekly limits reset on Sunday 00:00 UTC
- Free tier APIs have rate limits (handled gracefully)

## Support

For issues or questions:
1. Check the in-app help tooltips
2. Review this documentation
3. Check the prompt writing guide in Prompts page
4. Verify all settings are correctly configured
5. Ensure sufficient historical data is available (minimum 200 candles)

