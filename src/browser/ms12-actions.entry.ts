/**
 * 브라우저 IIFE: public/static/js/ms12-actions.js 로 번들 (npm run build:ms12-actions)
 */
import {
  createMeeting,
  joinMeeting,
  openMeeting,
  openAppPath,
} from '../actions/meeting.actions'
import { getRecentRecords, openRecordsList, saveRecord } from '../actions/record.actions'
import { getCurrentUser, getDisplayName, isLoggedInMePayload } from '../actions/user.actions'
import { extractCode, handleCommand } from '../jarvis/jarvis-router'
import { getMs12Capabilities, type Ms12Plan } from '../lib/ms12-plan'

export type Ms12Actions = {
  createMeeting: typeof createMeeting
  joinMeeting: typeof joinMeeting
  openMeeting: typeof openMeeting
  openAppPath: typeof openAppPath
  getRecentRecords: typeof getRecentRecords
  openRecordsList: typeof openRecordsList
  saveRecord: typeof saveRecord
  getCurrentUser: typeof getCurrentUser
  getDisplayName: typeof getDisplayName
  isLoggedInMePayload: typeof isLoggedInMePayload
  jarvisExtractCode: typeof extractCode
  handleCommand: typeof handleCommand
  getMs12Capabilities: typeof getMs12Capabilities
}

const Ms12Actions: Ms12Actions = {
  createMeeting,
  joinMeeting,
  openMeeting,
  openAppPath,
  getRecentRecords,
  openRecordsList,
  saveRecord,
  getCurrentUser,
  getDisplayName,
  isLoggedInMePayload,
  jarvisExtractCode: extractCode,
  handleCommand,
  getMs12Capabilities,
}

export type { Ms12Plan }

if (typeof globalThis !== 'undefined') {
  ;(globalThis as unknown as { Ms12Actions: Ms12Actions }).Ms12Actions = Ms12Actions
}
