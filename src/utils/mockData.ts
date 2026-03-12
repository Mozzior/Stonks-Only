import type { KLineData } from 'klinecharts'

export function generateMockData(count: number = 1000, startPrice: number = 150): KLineData[] {
  const data: KLineData[] = []
  let timestamp = new Date().getTime() - count * 24 * 60 * 60 * 1000
  let currentPrice = startPrice
  
  // Volatility and trend parameters
  const volatility = 0.02 // 2% daily volatility
  const trend = 0.0005 // Slight upward trend
  
  for (let i = 0; i < count; i++) {
    // Random walk with drift
    const changePercent = (Math.random() - 0.5) * 2 * volatility + trend
    const nextPrice = currentPrice * (1 + changePercent)
    
    // Generate OHLC
    const open = currentPrice
    const close = nextPrice
    
    // High and Low based on open/close with some noise
    const max = Math.max(open, close)
    const min = Math.min(open, close)
    const range = max - min
    
    const high = max + Math.random() * range * 0.5 + Math.random() * currentPrice * 0.005
    const low = min - Math.random() * range * 0.5 - Math.random() * currentPrice * 0.005
    
    // Volume usually correlates with volatility
    const volumeBase = 1000000
    const volumeNoise = Math.random() * 500000
    const volumeSpike = Math.abs(changePercent) > volatility ? 1000000 : 0
    const volume = Math.floor(volumeBase + volumeNoise + volumeSpike)
    
    data.push({
      timestamp,
      open,
      close,
      high,
      low,
      volume,
      turnover: (open + close + high + low) / 4 * volume
    })
    
    currentPrice = close
    timestamp += 24 * 60 * 60 * 1000
  }
  
  return data
}
