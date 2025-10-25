import { fetchMarketData } from '@/app/actions/fetchMarketData'
import { computeIndicators } from '@/app/actions/computeIndicators'
import { fetchSentimentMacro } from '@/app/actions/fetchSentimentMacro'
import { processAutoGeneration } from '@/app/actions/autoGeneration'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting scheduled data fetch...')

    // Fetch market data
    const marketResult = await fetchMarketData()
    console.log('Market data fetch:', marketResult.success ? 'success' : 'failed')

    // Compute indicators
    const indicatorsResult = await computeIndicators()
    console.log('Indicators computation:', indicatorsResult.success ? 'success' : 'failed')

    // Fetch sentiment/macro data
    const sentimentResult = await fetchSentimentMacro()
    console.log('Sentiment fetch:', sentimentResult.success ? 'success' : 'failed')

    // Process auto-generation for all users
    const autoGenResult = await processAutoGeneration()
    console.log('Auto-generation:', autoGenResult.success ? 'success' : 'failed', 
      `processed: ${autoGenResult.processed}, errors: ${autoGenResult.errors}`)

    return NextResponse.json({
      success: true,
      results: {
        market: marketResult.success,
        indicators: indicatorsResult.success,
        sentiment: sentimentResult.success,
        autoGeneration: autoGenResult.success,
      },
      autoGeneration: {
        processed: autoGenResult.processed,
        errors: autoGenResult.errors,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






