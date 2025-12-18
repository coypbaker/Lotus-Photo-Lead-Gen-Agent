'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserSettings } from '@/types/database'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [settings, setSettings] = useState({
    photographer_niche: '',
    target_locations: '',
    ideal_client_description: '',
    daily_lead_target: 10,
    outreach_channel: 'Email' as 'Email' | 'LinkedIn message',
    email_signature: '',
    autonomous_mode: false,
    daily_outreach_limit: 5,
  })

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings({
          photographer_niche: data.photographer_niche || '',
          target_locations: data.target_locations || '',
          ideal_client_description: data.ideal_client_description || '',
          daily_lead_target: data.daily_lead_target || 10,
          outreach_channel: data.outreach_channel || 'Email',
          email_signature: data.email_signature || '',
          autonomous_mode: data.autonomous_mode || false,
          daily_outreach_limit: data.daily_outreach_limit || 5,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: 'You must be logged in to save settings' })
        return
      }

      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let error
      if (existing) {
        const result = await supabase
          .from('user_settings')
          .update({
            photographer_niche: settings.photographer_niche || null,
            target_locations: settings.target_locations || null,
            ideal_client_description: settings.ideal_client_description || null,
            daily_lead_target: settings.daily_lead_target,
            outreach_channel: settings.outreach_channel,
            email_signature: settings.email_signature || null,
            autonomous_mode: settings.autonomous_mode,
            daily_outreach_limit: settings.daily_outreach_limit,
          })
          .eq('user_id', user.id)
        error = result.error
      } else {
        const result = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            photographer_niche: settings.photographer_niche || null,
            target_locations: settings.target_locations || null,
            ideal_client_description: settings.ideal_client_description || null,
            daily_lead_target: settings.daily_lead_target,
            outreach_channel: settings.outreach_channel,
            email_signature: settings.email_signature || null,
            autonomous_mode: settings.autonomous_mode,
            daily_outreach_limit: settings.daily_outreach_limit,
          })
        error = result.error
      }

      if (error) {
        console.error('Error saving settings:', error)
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
      } else {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#333] border-t-[#d4af37]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-24">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Lead Generation Settings</h1>
          <p className="mt-3 text-[#a0a0a0]">
            Configure how our AI agents find and qualify leads for your photography business.
          </p>
        </div>

        <form onSubmit={handleSave} className="card p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-900/20 text-green-300 border border-green-700/30' 
                : 'bg-red-900/20 text-red-300 border border-red-700/30'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <label htmlFor="photographer_niche" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Photographer Niche
              </label>
              <input
                type="text"
                id="photographer_niche"
                value={settings.photographer_niche}
                onChange={(e) => setSettings({ ...settings, photographer_niche: e.target.value })}
                placeholder="e.g., wedding photographer, portrait photographer"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] placeholder-[#666] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              />
              <p className="mt-2 text-sm text-[#666]">
                Describe your photography specialty to help us find relevant leads.
              </p>
            </div>

            <div>
              <label htmlFor="target_locations" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Target Locations
              </label>
              <input
                type="text"
                id="target_locations"
                value={settings.target_locations}
                onChange={(e) => setSettings({ ...settings, target_locations: e.target.value })}
                placeholder="e.g., California, New York, Texas"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] placeholder-[#666] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              />
              <p className="mt-2 text-sm text-[#666]">
                Comma-separated list of cities, states, or regions where you want to find clients.
              </p>
            </div>

            <div>
              <label htmlFor="ideal_client_description" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Ideal Client Description
              </label>
              <textarea
                id="ideal_client_description"
                value={settings.ideal_client_description}
                onChange={(e) => setSettings({ ...settings, ideal_client_description: e.target.value })}
                placeholder="e.g., engaged couples planning luxury weddings with budgets over $5,000 for photography"
                rows={4}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] placeholder-[#666] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              />
              <p className="mt-2 text-sm text-[#666]">
                Describe your ideal client in detail. Include budget range, event type, style preferences, etc.
              </p>
            </div>

            <div>
              <label htmlFor="daily_lead_target" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Daily Lead Target
              </label>
              <input
                type="number"
                id="daily_lead_target"
                value={settings.daily_lead_target}
                onChange={(e) => setSettings({ ...settings, daily_lead_target: parseInt(e.target.value) || 10 })}
                min={1}
                max={100}
                className="w-32 px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              />
              <p className="mt-2 text-sm text-[#666]">
                How many leads per day should we aim to find? (1-100)
              </p>
            </div>

            <div>
              <label htmlFor="outreach_channel" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Preferred Outreach Channel
              </label>
              <select
                id="outreach_channel"
                value={settings.outreach_channel}
                onChange={(e) => setSettings({ ...settings, outreach_channel: e.target.value as 'Email' | 'LinkedIn message' })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              >
                <option value="Email">Email</option>
                <option value="LinkedIn message">LinkedIn message</option>
              </select>
              <p className="mt-2 text-sm text-[#666]">
                How would you prefer to reach out to leads?
              </p>
            </div>

            <div>
              <label htmlFor="email_signature" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                Email Signature
              </label>
              <textarea
                id="email_signature"
                value={settings.email_signature}
                onChange={(e) => setSettings({ ...settings, email_signature: e.target.value })}
                placeholder="e.g.,&#10;Best regards,&#10;John Smith&#10;Smith Photography&#10;www.smithphoto.com&#10;(555) 123-4567"
                rows={5}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-[#f5f5f5] placeholder-[#666] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
              />
              <p className="mt-2 text-sm text-[#666]">
                Your email signature that will be included in outreach messages.
              </p>
            </div>

            {/* Autonomous Mode Section */}
            <div className="pt-8 border-t border-[#333]">
              <h3 className="text-xl font-semibold text-[#f5f5f5] mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>🤖 Autonomous Mode</h3>
              
              <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#1a1a1a] rounded-2xl p-6 border border-[#d4af37]/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label htmlFor="autonomous_mode" className="text-sm font-medium text-[#f5f5f5]">
                      Enable Daily Autonomous Lead Generation
                    </label>
                    <p className="mt-2 text-sm text-[#a0a0a0]">
                      When enabled, our AI will automatically find new leads and send outreach emails daily. You&apos;ll receive a summary email each day.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, autonomous_mode: !settings.autonomous_mode })}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
                        settings.autonomous_mode ? 'bg-[#d4af37]' : 'bg-[#333]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.autonomous_mode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {settings.autonomous_mode && (
                  <div className="mt-6 pt-6 border-t border-[#d4af37]/20">
                    <label htmlFor="daily_outreach_limit" className="block text-sm font-medium text-[#f5f5f5] mb-2">
                      Daily Outreach Limit
                    </label>
                    <input
                      type="number"
                      id="daily_outreach_limit"
                      value={settings.daily_outreach_limit}
                      onChange={(e) => setSettings({ ...settings, daily_outreach_limit: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={20}
                      className="w-32 px-4 py-3 bg-[#0f0f0f] border border-[#333] rounded-xl text-[#f5f5f5] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
                    />
                    <p className="mt-2 text-sm text-[#666]">
                      Maximum outreach emails to send per day (1-20). Respects your plan limits.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-gold px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
