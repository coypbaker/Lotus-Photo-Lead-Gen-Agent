'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Users, Target, Mail, Signature, Bot, ChevronDown, Sparkles, Check, AlertCircle, Sun, Moon, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'
import type { UserSettings } from '@/types/database'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>('profile')
  const { theme, setTheme } = useTheme()
  
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

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const sections = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      color: '#a855f7',
      description: 'Customize your portal experience',
    },
    {
      id: 'profile',
      title: 'Photography Profile',
      icon: Camera,
      color: '#14b8a6',
      description: 'Define your niche and ideal clients',
    },
    {
      id: 'location',
      title: 'Target Markets',
      icon: MapPin,
      color: '#c084fc',
      description: 'Set your geographic focus areas',
    },
    {
      id: 'outreach',
      title: 'Outreach Settings',
      icon: Mail,
      color: '#f59e0b',
      description: 'Configure how you reach leads',
    },
    {
      id: 'automation',
      title: 'AI Automation',
      icon: Bot,
      color: '#f43f5e',
      description: 'Autonomous lead generation',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0a15] flex items-center justify-center pt-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-2 border-[#2d2640] border-t-[#14b8a6]"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0c0a15] pt-24"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#14b8a6] via-[#a855f7] to-[#f43f5e] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Settings
              </h1>
              <p className="text-[#6b6480]">Configure your lead generation preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-5 rounded-2xl flex items-center gap-4 ${
                message.type === 'success' 
                  ? 'glass-teal' 
                  : 'bg-red-900/20 border border-red-700/30'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {message.type === 'success' ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <span className="flex-1 text-[#f0eef5]">{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-[#6b6480] hover:text-[#f0eef5]">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave}>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#1e1830]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300"
                      style={{ backgroundColor: `${section.color}15` }}
                    >
                      <section.icon className="h-6 w-6" style={{ color: section.color }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-[#f0eef5]">{section.title}</h3>
                      <p className="text-sm text-[#6b6480]">{section.description}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: activeSection === section.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-[#6b6480]" />
                  </motion.div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {activeSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        {/* Elegant Divider */}
                        <div className="h-px w-full mb-6" style={{ background: `linear-gradient(to right, transparent, ${section.color}40, transparent)` }} />
                        
                        {section.id === 'appearance' && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-4 flex items-center gap-2">
                                <Palette className="h-4 w-4" style={{ color: section.color }} />
                                Theme
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                {/* Dark Mode Option */}
                                <motion.button
                                  type="button"
                                  onClick={() => setTheme('dark')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    theme === 'dark'
                                      ? 'border-[#a855f7] bg-[#a855f7]/10 shadow-lg shadow-[#a855f7]/20'
                                      : 'border-[#2d2640] bg-[#0c0a15] hover:border-[#a855f7]/50'
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                                      theme === 'dark' ? 'bg-[#a855f7]/20' : 'bg-[#1e1830]'
                                    }`}>
                                      <Moon className={`h-7 w-7 ${theme === 'dark' ? 'text-[#a855f7]' : 'text-[#6b6480]'}`} />
                                    </div>
                                    <span className={`font-medium ${theme === 'dark' ? 'text-[#f0eef5]' : 'text-[#a9a4b8]'}`}>
                                      Dark Mode
                                    </span>
                                    <span className="text-xs text-[#6b6480]">Elegant & mysterious</span>
                                  </div>
                                  {theme === 'dark' && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#a855f7] flex items-center justify-center"
                                    >
                                      <Check className="h-4 w-4 text-white" />
                                    </motion.div>
                                  )}
                                </motion.button>

                                {/* Light Mode Option */}
                                <motion.button
                                  type="button"
                                  onClick={() => setTheme('light')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    theme === 'light'
                                      ? 'border-[#f59e0b] bg-[#f59e0b]/10 shadow-lg shadow-[#f59e0b]/20'
                                      : 'border-[#2d2640] bg-[#0c0a15] hover:border-[#f59e0b]/50'
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                                      theme === 'light' ? 'bg-[#f59e0b]/20' : 'bg-[#1e1830]'
                                    }`}>
                                      <Sun className={`h-7 w-7 ${theme === 'light' ? 'text-[#f59e0b]' : 'text-[#6b6480]'}`} />
                                    </div>
                                    <span className={`font-medium ${theme === 'light' ? 'text-[#f0eef5]' : 'text-[#a9a4b8]'}`}>
                                      Light Mode
                                    </span>
                                    <span className="text-xs text-[#6b6480]">Clean & bright</span>
                                  </div>
                                  {theme === 'light' && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#f59e0b] flex items-center justify-center"
                                    >
                                      <Check className="h-4 w-4 text-white" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              </div>
                              <p className="mt-4 text-xs text-[#6b6480] text-center">
                                Your preference is saved automatically
                              </p>
                            </div>
                          </div>
                        )}

                        {section.id === 'profile' && (
                          <div className="space-y-6">
                            <div className="group">
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <Camera className="h-4 w-4" style={{ color: section.color }} />
                                Photography Niche
                              </label>
                              <input
                                type="text"
                                value={settings.photographer_niche}
                                onChange={(e) => setSettings({ ...settings, photographer_niche: e.target.value })}
                                placeholder="e.g., wedding photographer, portrait photographer"
                                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                              />
                            </div>
                            <div className="group">
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" style={{ color: section.color }} />
                                Ideal Client Description
                              </label>
                              <textarea
                                value={settings.ideal_client_description}
                                onChange={(e) => setSettings({ ...settings, ideal_client_description: e.target.value })}
                                placeholder="Describe your dream clients..."
                                rows={4}
                                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300 resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {section.id === 'location' && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" style={{ color: section.color }} />
                                Target Locations
                              </label>
                              <input
                                type="text"
                                value={settings.target_locations}
                                onChange={(e) => setSettings({ ...settings, target_locations: e.target.value })}
                                placeholder="e.g., California, New York, Texas"
                                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300"
                              />
                              <p className="mt-2 text-xs text-[#6b6480]">Comma-separated list of cities, states, or regions</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <Target className="h-4 w-4" style={{ color: section.color }} />
                                Daily Lead Target
                              </label>
                              <input
                                type="number"
                                value={settings.daily_lead_target}
                                onChange={(e) => setSettings({ ...settings, daily_lead_target: parseInt(e.target.value) || 10 })}
                                min={1}
                                max={100}
                                className="w-32 px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}

                        {section.id === 'outreach' && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4" style={{ color: section.color }} />
                                Outreach Channel
                              </label>
                              <select
                                value={settings.outreach_channel}
                                onChange={(e) => setSettings({ ...settings, outreach_channel: e.target.value as 'Email' | 'LinkedIn message' })}
                                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 transition-all duration-300 cursor-pointer"
                              >
                                <option value="Email">Email</option>
                                <option value="LinkedIn message">LinkedIn Message</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#a9a4b8] mb-2 flex items-center gap-2">
                                <Signature className="h-4 w-4" style={{ color: section.color }} />
                                Email Signature
                              </label>
                              <textarea
                                value={settings.email_signature}
                                onChange={(e) => setSettings({ ...settings, email_signature: e.target.value })}
                                placeholder="Your professional signature..."
                                rows={5}
                                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20 focus:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {section.id === 'automation' && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#f43f5e]/10 to-transparent border border-[#f43f5e]/20">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-[#f43f5e]/20 flex items-center justify-center">
                                  <Bot className="h-6 w-6 text-[#f43f5e]" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-[#f0eef5]">Autonomous Mode</h4>
                                  <p className="text-sm text-[#6b6480]">AI finds and contacts leads daily</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, autonomous_mode: !settings.autonomous_mode })}
                                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ${
                                  settings.autonomous_mode ? 'bg-[#f43f5e]' : 'bg-[#2d2640]'
                                }`}
                              >
                                <motion.span
                                  animate={{ x: settings.autonomous_mode ? 24 : 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  className="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg"
                                />
                              </button>
                            </div>
                            
                            <AnimatePresence>
                              {settings.autonomous_mode && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div>
                                    <label className="block text-sm font-medium text-[#a9a4b8] mb-2">
                                      Daily Outreach Limit
                                    </label>
                                    <input
                                      type="number"
                                      value={settings.daily_outreach_limit}
                                      onChange={(e) => setSettings({ ...settings, daily_outreach_limit: parseInt(e.target.value) || 5 })}
                                      min={1}
                                      max={20}
                                      className="w-32 px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all duration-300"
                                    />
                                    <p className="mt-2 text-xs text-[#6b6480]">Max emails per day (1-20)</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex justify-end"
          >
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden group px-10 py-4 rounded-2xl font-semibold text-[#0c0a15] bg-gradient-to-r from-[#14b8a6] via-[#2dd4bf] to-[#14b8a6] bg-[length:200%_100%] disabled:opacity-50 shadow-lg shadow-[#14b8a6]/25 hover:shadow-[#14b8a6]/40 transition-shadow"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                {saving ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-[#0c0a15]/30 border-t-[#0c0a15] rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Save Settings
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  )
}
