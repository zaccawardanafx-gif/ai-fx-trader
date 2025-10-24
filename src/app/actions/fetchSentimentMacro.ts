'use server'

import { createClient } from '@/lib/supabase/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const SentimentAnalysisSchema = z.object({
  sentiment_score: z.number().min(-100).max(100).describe('Sentiment score from -100 (very bearish) to +100 (very bullish)'),
  impact: z.enum(['high', 'medium', 'low']).describe('Impact level of the news/event'),
  summary: z.string().describe('Brief summary of the sentiment analysis')
})

/**
 * Fetch news from free NewsAPI alternative (using NewsData.io free tier)
 * Alternative: Use RSS feeds from major financial news sites
 */
async function fetchFinancialNews(): Promise<Array<{
  title: string;
  description: string;
  pubDate: string;
  link: string;
  source: string;
}>> {
  try {
    // Using RSS feeds as a free alternative
    // You can use newsapi.org with a free API key or RSS feeds
    
    // For now, we'll use a simple RSS parser approach
    // Install: npm install rss-parser
    const Parser = (await import('rss-parser')).default as typeof import('rss-parser')
    const parser = new Parser()
    
    const feeds = [
      'https://www.bloomberg.com/feed/podcast/etf-report.xml',
      'https://www.investing.com/rss/news.rss',
      'https://www.forexlive.com/feed/news'
    ]
    
    const allItems: Array<{
      title: string;
      description: string;
      pubDate: string;
      link: string;
      source: string;
    }> = []
    
    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl)
        const items = feed.items.slice(0, 5).map((item: { title?: string; contentSnippet?: string; description?: string; pubDate?: string; link?: string }) => ({
          title: item.title || 'No title',
          description: item.contentSnippet || item.description || 'No description',
          pubDate: item.pubDate || new Date().toISOString(),
          link: item.link || '',
          source: feedUrl
        }))
        allItems.push(...items)
      } catch (err) {
        console.error(`Error parsing feed ${feedUrl}:`, err)
      }
    }
    
    return allItems.slice(0, 10) // Return top 10 most recent
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

/**
 * Fetch Reddit posts related to forex trading (using Reddit JSON API - no auth required)
 */
async function fetchRedditPosts(subreddit: string = 'forex', limit: number = 10): Promise<Array<{
  title: string;
  description: string;
  score: number;
  comments: number;
  created: Date;
  url: string;
  source: string;
}>> {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`, {
      headers: {
        'User-Agent': 'AI-FX-Trader/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return data.data.children.map((child: { data: { title: string; selftext: string; score: number; num_comments: number; created_utc: number; permalink: string } }) => ({
      title: child.data.title,
      description: child.data.selftext,
      score: child.data.score,
      comments: child.data.num_comments,
      created: new Date(child.data.created_utc * 1000),
      url: `https://reddit.com${child.data.permalink}`,
      source: 'reddit'
    }))
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return []
  }
}

/**
 * Analyze sentiment of news/social media using Gemini
 */
async function analyzeSentiment(text: string, context: string): Promise<{
  sentiment_score: number
  impact: 'high' | 'medium' | 'low'
  summary: string
}> {
  try {
    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: SentimentAnalysisSchema,
      prompt: `You are a forex market sentiment analyzer. Analyze the following ${context} and provide:
1. A sentiment score from -100 (very bearish for USD/CHF) to +100 (very bullish for USD/CHF)
2. The impact level (high/medium/low) on forex markets
3. A brief summary

Text to analyze:
${text}

Consider:
- Central bank policies and statements
- Economic indicators (inflation, employment, GDP)
- Geopolitical events
- Market sentiment and trader positioning
- Technical factors

Focus on how this affects USD/CHF specifically.`
    })

    return result.object
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return {
      sentiment_score: 0,
      impact: 'low',
      summary: 'Unable to analyze sentiment'
    }
  }
}

/**
 * Fetch and store sentiment/macro data
 */
export async function fetchSentimentMacro() {
  try {
    const supabase = await createClient()
    
    // Fetch news and social media
    const [news, redditPosts] = await Promise.all([
      fetchFinancialNews('USD CHF forex'),
      fetchRedditPosts('forex', 5)
    ])
    
    const allSources = [...news, ...redditPosts]
    
    if (allSources.length === 0) {
      return { success: false, error: 'No sentiment sources available' }
    }
    
    // Analyze sentiment for each source
    const sentimentResults = []
    
    for (const source of allSources.slice(0, 5)) { // Limit to 5 to avoid rate limits
      const text = `${source.title}\n${source.description || ''}`
      const analysis = await analyzeSentiment(text, source.source)
      
      const { error } = await supabase
        .from('sentiment_macro')
        .insert({
          timestamp: new Date().toISOString(),
          sentiment_score: analysis.sentiment_score,
          macro_event: source.title,
          impact: analysis.impact,
          source: source.source
        })
      
      if (!error) {
        sentimentResults.push(analysis)
      }
    }
    
    return { 
      success: true, 
      data: sentimentResults,
      count: sentimentResults.length 
    }
  } catch (error) {
    console.error('Error fetching sentiment/macro data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get latest sentiment/macro data from database
 */
export async function getLatestSentimentMacro(limit: number = 20) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('sentiment_macro')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting sentiment data:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Calculate average sentiment over a time period
 */
export async function getAverageSentiment(hours: number = 24) {
  try {
    const supabase = await createClient()
    const startTime = new Date()
    startTime.setHours(startTime.getHours() - hours)
    
    const { data, error } = await supabase
      .from('sentiment_macro')
      .select('sentiment_score, impact')
      .gte('timestamp', startTime.toISOString())

    if (error) throw error

    if (!data || data.length === 0) {
      return { success: true, average: 0, count: 0 }
    }

    // Weight by impact: high=3, medium=2, low=1
    const weightedScores = data.map(item => {
      const weight = item.impact === 'high' ? 3 : item.impact === 'medium' ? 2 : 1
      return (item.sentiment_score || 0) * weight
    })

    const totalWeight = data.reduce((sum, item) => {
      return sum + (item.impact === 'high' ? 3 : item.impact === 'medium' ? 2 : 1)
    }, 0)

    const average = weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight

    return { 
      success: true, 
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: data.length 
    }
  } catch (error) {
    console.error('Error calculating average sentiment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      average: 0,
      count: 0
    }
  }
}
