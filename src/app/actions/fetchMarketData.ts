'use server'

import { createClient } from '@/lib/supabase/server'
import YahooFinance from 'yahoo-finance2'

// Map user-friendly currency pairs to Yahoo Finance symbols
const CURRENCY_PAIR_MAP: { [key: string]: string } = {
  'USD/CHF': 'USDCHF=X',
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'USDJPY=X',
  'AUD/USD': 'AUDUSD=X',
  'USD/CAD': 'USDCAD=X',
  'NZD/USD': 'NZDUSD=X',
  'EUR/GBP': 'EURGBP=X',
  'EUR/JPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X'
}

/**
 * Fetch real-time market data from Yahoo Finance
 * @param currencyPair User-friendly pair like 'USD/CHF'
 */
export async function fetchMarketData(currencyPair: string = 'USD/CHF') {
  try {
    const supabase = await createClient()
    const yahooSymbol = CURRENCY_PAIR_MAP[currencyPair] || 'USDCHF=X'
    
    // Fetch quote from Yahoo Finance
    const yf = new YahooFinance()
    const quote = await yf.quote(yahooSymbol)
    
    if (!quote || !quote.regularMarketPrice) {
      throw new Error(`Unable to fetch quote for ${currencyPair}`)
    }

    const price = quote.regularMarketPrice
    const high = quote.regularMarketDayHigh || price
    const low = quote.regularMarketDayLow || price
    const open = quote.regularMarketOpen || price
    const volume = quote.regularMarketVolume || 0

    // Insert market data into database
    const { data, error } = await supabase
      .from('market_data')
      .insert({
        timestamp: new Date().toISOString(),
        pair: currencyPair,
        price,
        high,
        low,
        open,
        close: price,
        volume,
        source: 'yahoo',
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get latest market data from database
 */
export async function getLatestMarketData(limit: number = 100, currencyPair?: string) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('market_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (currencyPair) {
      query = query.eq('pair', currencyPair)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting market data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Get historical data for technical analysis
 */
export async function getHistoricalData(days: number = 30, currencyPair: string = 'USD/CHF') {
  try {
    const supabase = await createClient()
    const yahooSymbol = CURRENCY_PAIR_MAP[currencyPair] || 'USDCHF=X'
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Fetch historical data from Yahoo Finance
    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: '1h' as const // 1 hour candles for FX
    }
    
    const yf = new YahooFinance()
    const historicalData = await yf.chart(yahooSymbol, queryOptions)
    
    if (!historicalData || !historicalData.quotes || historicalData.quotes.length === 0) {
      // Fallback to database if Yahoo Finance fails
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('pair', currencyPair)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    }

    // Transform Yahoo Finance data to our format
    const transformedData = historicalData.quotes.map(quote => ({
      timestamp: quote.date,
      pair: currencyPair,
      price: quote.close || 0,
      high: quote.high || 0,
      low: quote.low || 0,
      open: quote.open || 0,
      close: quote.close || 0,
      volume: quote.volume || 0,
      source: 'yahoo'
    }))

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error getting historical data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Get current price for a currency pair
 */
export async function getCurrentPrice(currencyPair: string = 'USD/CHF'): Promise<number | null> {
  try {
    const yahooSymbol = CURRENCY_PAIR_MAP[currencyPair] || 'USDCHF=X'
    const yf = new YahooFinance()
    const quote = await yf.quote(yahooSymbol)
    return quote.regularMarketPrice || null
  } catch (error) {
    console.error('Error getting current price:', error)
    return null
  }
}

/**
 * Get all available currency pairs
 */
export async function getAvailableCurrencyPairs(): Promise<string[]> {
  return Object.keys(CURRENCY_PAIR_MAP)
}
