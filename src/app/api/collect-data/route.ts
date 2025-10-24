import { fetchMarketData } from '@/app/actions/fetchMarketData'
import { computeIndicators } from '@/app/actions/computeIndicators'
import { fetchSentimentMacro } from '@/app/actions/fetchSentimentMacro'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    console.log('Starting manual data collection...')

    // Fetch market data
    const marketResult = await fetchMarketData()
    console.log('Market data fetch:', marketResult.success ? 'success' : 'failed')

    // Compute indicators
    const indicatorsResult = await computeIndicators()
    console.log('Indicators computation:', indicatorsResult.success ? 'success' : 'failed')

    // Fetch sentiment/macro data
    const sentimentResult = await fetchSentimentMacro()
    console.log('Sentiment fetch:', sentimentResult.success ? 'success' : 'failed')

    return NextResponse.json({
      success: true,
      message: 'Data collection completed successfully!',
      results: {
        market: marketResult.success,
        indicators: indicatorsResult.success,
        sentiment: sentimentResult.success,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Manual data collection error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to collect data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

