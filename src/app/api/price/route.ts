import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 })
    }

    // Fetch price from Yahoo Finance API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      throw new Error('No price data available')
    }

    const price = data.chart.result[0].meta.regularMarketPrice
    
    return NextResponse.json({
      success: true,
      price: price.toFixed(5),
      symbol: symbol,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching price:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
