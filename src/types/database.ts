export interface UserSettings {
  id: string
  user_id: string
  photographer_niche: string | null
  target_locations: string | null
  ideal_client_description: string | null
  daily_lead_target: number
  outreach_channel: 'Email' | 'LinkedIn message'
  email_signature: string | null
  created_at: string
  updated_at: string
}

export type UserSettingsInsert = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
