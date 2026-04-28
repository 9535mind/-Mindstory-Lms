export type Ms12Plan = 'free' | 'pro'

export type Ms12Capabilities = {
  meetingDurationSec: number | null
  maxRecords: number
  canDownload: boolean
  canUseAI: boolean
}

export function getMs12Capabilities(plan: Ms12Plan): Ms12Capabilities {
  if (plan === 'pro') {
    return {
      meetingDurationSec: null, // unlimited
      maxRecords: Infinity,
      canDownload: true,
      canUseAI: true,
    }
  }

  return {
    meetingDurationSec: 30 * 60,
    maxRecords: 3,
    canDownload: false,
    canUseAI: false,
  }
}
