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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Generation Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure how our AI agents find and qualify leads for your photography business.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="photographer_niche" className="block text-sm font-medium text-gray-700 mb-1">
                Photographer Niche
              </label>
              <input
                type="text"
                id="photographer_niche"
                value={settings.photographer_niche}
                onChange={(e) => setSettings({ ...settings, photographer_niche: e.target.value })}
                placeholder="e.g., wedding photographer, portrait photographer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                Describe your photography specialty to help us find relevant leads.
              </p>
            </div>

            <div>
              <label htmlFor="target_locations" className="block text-sm font-medium text-gray-700 mb-1">
                Target Locations
              </label>
              <input
                type="text"
                id="target_locations"
                value={settings.target_locations}
                onChange={(e) => setSettings({ ...settings, target_locations: e.target.value })}
                placeholder="e.g., California, New York, Texas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                Comma-separated list of cities, states, or regions where you want to find clients.
              </p>
            </div>

            <div>
              <label htmlFor="ideal_client_description" className="block text-sm font-medium text-gray-700 mb-1">
                Ideal Client Description
              </label>
              <textarea
                id="ideal_client_description"
                value={settings.ideal_client_description}
                onChange={(e) => setSettings({ ...settings, ideal_client_description: e.target.value })}
                placeholder="e.g., engaged couples planning luxury weddings with budgets over $5,000 for photography"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                Describe your ideal client in detail. Include budget range, event type, style preferences, etc.
              </p>
            </div>

            <div>
              <label htmlFor="daily_lead_target" className="block text-sm font-medium text-gray-700 mb-1">
                Daily Lead Target
              </label>
              <input
                type="number"
                id="daily_lead_target"
                value={settings.daily_lead_target}
                onChange={(e) => setSettings({ ...settings, daily_lead_target: parseInt(e.target.value) || 10 })}
                min={1}
                max={100}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                How many leads per day should we aim to find? (1-100)
              </p>
            </div>

            <div>
              <label htmlFor="outreach_channel" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Outreach Channel
              </label>
              <select
                id="outreach_channel"
                value={settings.outreach_channel}
                onChange={(e) => setSettings({ ...settings, outreach_channel: e.target.value as 'Email' | 'LinkedIn message' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="Email">Email</option>
                <option value="LinkedIn message">LinkedIn message</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                How would you prefer to reach out to leads?
              </p>
            </div>

            <div>
              <label htmlFor="email_signature" className="block text-sm font-medium text-gray-700 mb-1">
                Email Signature
              </label>
              <textarea
                id="email_signature"
                value={settings.email_signature}
                onChange={(e) => setSettings({ ...settings, email_signature: e.target.value })}
                placeholder="e.g.,&#10;Best regards,&#10;John Smith&#10;Smith Photography&#10;www.smithphoto.com&#10;(555) 123-4567"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your email signature that will be included in outreach messages.
              </p>
            </div>

            {/* Autonomous Mode Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Autonomous Mode</h3>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label htmlFor="autonomous_mode" className="text-sm font-medium text-gray-900">
                      Enable Daily Autonomous Lead Generation
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      When enabled, our AI will automatically find new leads and send outreach emails daily. You&apos;ll receive a summary email each day.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, autonomous_mode: !settings.autonomous_mode })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        settings.autonomous_mode ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.autonomous_mode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {settings.autonomous_mode && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <label htmlFor="daily_outreach_limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Outreach Limit
                    </label>
                    <input
                      type="number"
                      id="daily_outreach_limit"
                      value={settings.daily_outreach_limit}
                      onChange={(e) => setSettings({ ...settings, daily_outreach_limit: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={20}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum outreach emails to send per day (1-20). Respects your plan limits.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
