import { 
  RSI, 
  MACD, 
  BollingerBands, 
  SMA, 
  EMA, 
  ATR,
  Stochastic
} from 'technicalindicators'

export interface TechnicalIndicators {
  rsi: number | undefined
  macd: number | undefined
  macd_signal: number | undefined
  macd_histogram: number | undefined
  bb_upper: number | undefined
  bb_middle: number | undefined
  bb_lower: number | undefined
  sma_20: number | undefined
  sma_50: number | undefined
  sma_200: number | undefined
  ema_12: number | undefined
  ema_26: number | undefined
  atr: number | undefined
  stochastic_k: number | undefined
  stochastic_d: number | undefined
}

export interface PriceData {
  close: number
  high: number
  low: number
  open: number
  volume?: number
}

/**
 * Calculate all technical indicators for FX trading
 * @param priceData Array of price data (OHLC)
 * @returns TechnicalIndicators object with all calculated values
 */
export function calculateTechnicalIndicators(priceData: PriceData[]): TechnicalIndicators {
  if (!priceData || priceData.length < 200) {
    throw new Error('Insufficient price data for technical analysis. Need at least 200 candles.')
  }

  const closes = priceData.map(d => d.close)
  const highs = priceData.map(d => d.high)
  const lows = priceData.map(d => d.low)
  const opens = priceData.map(d => d.open)

  // RSI (14 period)
  const rsiValues = RSI.calculate({
    values: closes,
    period: 14
  })
  const rsi = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : undefined

  // MACD (12, 26, 9)
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  })
  const latestMACD = macdValues.length > 0 ? macdValues[macdValues.length - 1] : null
  const macd = latestMACD?.MACD
  const macd_signal = latestMACD?.signal
  const macd_histogram = latestMACD?.histogram

  // Bollinger Bands (20, 2)
  const bbValues = BollingerBands.calculate({
    values: closes,
    period: 20,
    stdDev: 2
  })
  const latestBB = bbValues.length > 0 ? bbValues[bbValues.length - 1] : null
  const bb_upper = latestBB?.upper
  const bb_middle = latestBB?.middle
  const bb_lower = latestBB?.lower

  // Simple Moving Averages
  const sma20Values = SMA.calculate({ values: closes, period: 20 })
  const sma50Values = SMA.calculate({ values: closes, period: 50 })
  const sma200Values = SMA.calculate({ values: closes, period: 200 })
  const sma_20 = sma20Values.length > 0 ? sma20Values[sma20Values.length - 1] : undefined
  const sma_50 = sma50Values.length > 0 ? sma50Values[sma50Values.length - 1] : undefined
  const sma_200 = sma200Values.length > 0 ? sma200Values[sma200Values.length - 1] : undefined

  // Exponential Moving Averages
  const ema12Values = EMA.calculate({ values: closes, period: 12 })
  const ema26Values = EMA.calculate({ values: closes, period: 26 })
  const ema_12 = ema12Values.length > 0 ? ema12Values[ema12Values.length - 1] : undefined
  const ema_26 = ema26Values.length > 0 ? ema26Values[ema26Values.length - 1] : undefined

  // ATR (14 period) - Average True Range
  const atrValues = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  })
  const atr = atrValues.length > 0 ? atrValues[atrValues.length - 1] : undefined

  // Stochastic Oscillator (14, 3, 3)
  const stochasticValues = Stochastic.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14,
    signalPeriod: 3
  })
  const latestStochastic = stochasticValues.length > 0 ? stochasticValues[stochasticValues.length - 1] : null
  const stochastic_k = latestStochastic?.k
  const stochastic_d = latestStochastic?.d

  return {
    rsi,
    macd,
    macd_signal,
    macd_histogram,
    bb_upper,
    bb_middle,
    bb_lower,
    sma_20,
    sma_50,
    sma_200,
    ema_12,
    ema_26,
    atr,
    stochastic_k,
    stochastic_d
  }
}

/**
 * Analyze technical indicators and generate a signal score (0-100)
 * Higher score = more bullish, lower score = more bearish
 */
export function analyzeTechnicalSignal(indicators: TechnicalIndicators, currentPrice: number): {
  score: number
  signals: string[]
  trend: 'bullish' | 'bearish' | 'neutral'
} {
  const signals: string[] = []
  let score = 50 // Start neutral

  // RSI Analysis (0-100)
  if (indicators.rsi !== undefined) {
    if (indicators.rsi < 30) {
      score += 15
      signals.push('RSI oversold (<30) - bullish signal')
    } else if (indicators.rsi > 70) {
      score -= 15
      signals.push('RSI overbought (>70) - bearish signal')
    } else if (indicators.rsi > 50) {
      score += 5
      signals.push('RSI above 50 - mild bullish')
    } else if (indicators.rsi < 50) {
      score -= 5
      signals.push('RSI below 50 - mild bearish')
    }
  }

  // MACD Analysis
  if (indicators.macd !== undefined && indicators.macd_signal !== undefined) {
    if (indicators.macd > indicators.macd_signal) {
      score += 10
      signals.push('MACD above signal line - bullish')
    } else {
      score -= 10
      signals.push('MACD below signal line - bearish')
    }
    
    if (indicators.macd_histogram !== undefined) {
      if (indicators.macd_histogram > 0) {
        score += 5
        signals.push('MACD histogram positive - bullish momentum')
      } else {
        score -= 5
        signals.push('MACD histogram negative - bearish momentum')
      }
    }
  }

  // Bollinger Bands Analysis
  if (indicators.bb_upper !== undefined && indicators.bb_lower !== undefined && indicators.bb_middle !== undefined) {
    const bbPosition = (currentPrice - indicators.bb_lower) / (indicators.bb_upper - indicators.bb_lower)
    
    if (bbPosition < 0.2) {
      score += 10
      signals.push('Price near lower BB - potential bounce')
    } else if (bbPosition > 0.8) {
      score -= 10
      signals.push('Price near upper BB - potential reversal')
    }
    
    if (currentPrice > indicators.bb_middle) {
      score += 5
      signals.push('Price above BB middle - bullish')
    } else {
      score -= 5
      signals.push('Price below BB middle - bearish')
    }
  }

  // Moving Average Analysis
  if (indicators.sma_20 !== undefined && indicators.sma_50 !== undefined && indicators.sma_200 !== undefined) {
    // Price vs MAs
    if (currentPrice > indicators.sma_200) {
      score += 10
      signals.push('Price above SMA200 - long-term uptrend')
    } else {
      score -= 10
      signals.push('Price below SMA200 - long-term downtrend')
    }
    
    if (currentPrice > indicators.sma_50) {
      score += 5
      signals.push('Price above SMA50 - mid-term uptrend')
    } else {
      score -= 5
      signals.push('Price below SMA50 - mid-term downtrend')
    }
    
    // Golden/Death Cross
    if (indicators.sma_50 > indicators.sma_200) {
      score += 10
      signals.push('Golden cross formation - bullish')
    } else {
      score -= 10
      signals.push('Death cross formation - bearish')
    }
  }

  // Stochastic Oscillator
  if (indicators.stochastic_k !== undefined && indicators.stochastic_d !== undefined) {
    if (indicators.stochastic_k < 20 && indicators.stochastic_d < 20) {
      score += 10
      signals.push('Stochastic oversold - bullish reversal potential')
    } else if (indicators.stochastic_k > 80 && indicators.stochastic_d > 80) {
      score -= 10
      signals.push('Stochastic overbought - bearish reversal potential')
    }
    
    if (indicators.stochastic_k > indicators.stochastic_d) {
      score += 5
      signals.push('Stochastic bullish crossover')
    } else {
      score -= 5
      signals.push('Stochastic bearish crossover')
    }
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score))

  // Determine overall trend
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  if (score >= 60) {
    trend = 'bullish'
  } else if (score <= 40) {
    trend = 'bearish'
  }

  return { score, signals, trend }
}

