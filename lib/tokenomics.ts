const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const APRX_PER_USDC = 2_138_291

export const PUBLIC_TOURNAMENT_PRIZE_POOL_USD = 10
export const PUBLIC_TOURNAMENT_PRIZES_USD = [2.1, 2.0, 1.5, 1.3, 1.1, 1.0, 1.0]

export const NFT_TOURNAMENT_PRIZE_POOL_USD = 20
export const NFT_TOURNAMENT_PRIZES_USD = [4.4, 3.0, 2.5, 2.2, 1.8, 1.5, 1.3, 1.2, 1.1, 1.0]

export function usdToAprx(usd: number): number {
  return Math.round(usd * APRX_PER_USDC)
}

export function formatAprxAmount(usd: number): string {
  const aprxAmount = usdToAprx(usd)
  return `${compactFormatter.format(aprxAmount)} APRX`
}

export function getOrdinalLabel(rank: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const remainder = rank % 100
  if (remainder >= 11 && remainder <= 13) {
    return `${rank}th`
  }
  const suffix = suffixes[rank % 10] || 'th'
  return `${rank}${suffix}`
}

export function buildPrizeMap(amounts: number[]): Record<string, string> {
  return amounts.reduce((acc, amount, index) => {
    const key = getOrdinalLabel(index + 1)
    acc[key] = formatAprxAmount(amount)
    return acc
  }, {} as Record<string, string>)
}


