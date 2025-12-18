'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  name: string
  website: string | null
  phone: string | null
  address: string | null
  score: number
  status: 'new' | 'contacted' | 'replied' | 'converted' | 'rejected'
  created_at: string
}

type SortField = 'name' | 'score' | 'status' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sendingOutreach, setSendingOutreach] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [stats, setStats] = useState({ total: 0, contacted: 0, converted: 0, replied: 0 })
  
  // Sorting and filtering state
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('score', { ascending: false })

      if (error) {
        console.error('Error loading leads:', error)
        return
      }

      setLeads(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const contacted = data?.filter(l => l.status === 'contacted').length || 0
      const converted = data?.filter(l => l.status === 'converted').length || 0
      const replied = data?.filter(l => l.status === 'replied').length || 0
      setStats({ total, contacted, converted, replied })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateLeads = async () => {
    setGenerating(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/leads/generate', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to generate leads' })
        return
      }
      
      setMessage({ type: 'success', text: data.message })
      await loadLeads() // Refresh the leads list
    } catch (error) {
      console.error('Error generating leads:', error)
      setMessage({ type: 'error', text: 'Failed to generate leads. Please try again.' })
    } finally {
      setGenerating(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) {
        console.error('Error updating lead:', error)
        return
      }

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const sendOutreach = async (leadId: string) => {
    setSendingOutreach(leadId)
    setMessage(null)
    
    try {
      const response = await fetch('/api/leads/send-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to send outreach' })
        return
      }
      
      setMessage({ type: 'success', text: data.message })
      
      // Update local state to reflect contacted status
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: 'contacted' as const } : lead
      ))
      
      // Update stats
      setStats(prev => ({ ...prev, contacted: prev.contacted + 1 }))
    } catch (error) {
      console.error('Error sending outreach:', error)
      setMessage({ type: 'error', text: 'Failed to send outreach. Please try again.' })
    } finally {
      setSendingOutreach(null)
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30'
      case 'contacted': return 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30'
      case 'replied': return 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
      case 'converted': return 'bg-green-900/50 text-green-300 border border-green-700/50'
      case 'rejected': return 'bg-[#2d2640] text-[#6b6480] border border-[#3d3650]'
      default: return 'bg-[#2d2640] text-[#6b6480] border border-[#3d3650]'
    }
  }

  // Sort and filter leads
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads]
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(query) ||
        lead.address?.toLowerCase().includes(query) ||
        lead.website?.toLowerCase().includes(query)
      )
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'score':
          comparison = a.score - b.score
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return result
  }, [leads, statusFilter, searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex">
      {sortField === field ? (
        <span className="text-[#14b8a6]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <span className="text-[#4d4660]">↕</span>
      )}
    </span>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, y: -4 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Analytics Cards with Gold Accents */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { value: stats.total, label: 'Total Leads', color: '#14b8a6', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { value: stats.contacted, label: 'Contacted', color: '#a855f7', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { value: stats.replied, label: 'Replied', color: '#f59e0b', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
          { value: stats.converted, label: 'Converted', color: '#f43f5e', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover="hover"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass rounded-2xl p-6 cursor-default group"
            style={{ borderColor: `${stat.color}20` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.div 
                  className="text-4xl font-bold text-[#f0eef5]"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-[#a9a4b8] mt-1">{stat.label}</div>
              </div>
              <div 
                className="h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <svg className="h-7 w-7" style={{ color: stat.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-[#2d2640] overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: stat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Header with Generate Button */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Lead Gallery</h3>
          <p className="text-sm text-[#6b6480] mt-1">Discover and manage your photography leads</p>
        </div>
        <motion.button
          onClick={generateLeads}
          disabled={generating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary inline-flex items-center justify-center px-8 py-4 rounded-2xl disabled:opacity-50 w-full sm:w-auto shadow-lg shadow-[#14b8a6]/20 hover:shadow-[#14b8a6]/40 transition-shadow"
        >
          {generating ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-5 w-5 border-2 border-[#0c0a15]/30 border-t-[#0c0a15] mr-3"
              />
              Discovering Leads...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find New Leads
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b6480]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads by name, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 glass rounded-2xl text-sm text-[#f0eef5] placeholder-[#6b6480] focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-4 glass rounded-2xl text-sm text-[#f0eef5] focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="replied">Replied</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-8 p-5 rounded-2xl flex items-start gap-4 ${
              message.type === 'success' 
                ? 'glass-teal' 
                : 'bg-red-900/20 text-red-300 border border-red-700/30'
            }`}
          >
            {message.type === 'success' ? (
              <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-[#f0eef5]">{message.type === 'success' ? 'Success!' : 'Error'}</p>
              <p className="text-sm mt-1 text-[#a9a4b8]">{message.text}</p>
            </div>
            <button 
              onClick={() => setMessage(null)}
              className="text-[#6b6480] hover:text-[#f0eef5] transition-colors p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Gallery Cards */}
      {leads.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="text-center py-20 glass rounded-3xl"
        >
          <div className="h-20 w-20 mx-auto rounded-2xl bg-[#14b8a6]/10 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-[#14b8a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>No leads yet</h3>
          <p className="mt-3 text-[#6b6480] max-w-md mx-auto">Start discovering potential photography clients by clicking the button above.</p>
        </motion.div>
      ) : filteredAndSortedLeads.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="text-center py-20 glass rounded-3xl"
        >
          <div className="h-20 w-20 mx-auto rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>No matching leads</h3>
          <p className="mt-3 text-[#6b6480]">Try adjusting your search or filter criteria.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              whileHover="hover"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass rounded-2xl p-6 cursor-default group relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#14b8a6]/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#a855f7]/20 blur-3xl rounded-full" />
              </div>

              {/* Status Badge */}
              <div className="flex items-start justify-between mb-4 relative">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    {lead.score}
                  </span>
                  <span className="text-xs text-[#6b6480]">pts</span>
                </div>
              </div>

              {/* Lead Name */}
              <h4 className="text-lg font-semibold text-[#f0eef5] mb-2 group-hover:text-[#14b8a6] transition-colors">
                {lead.name}
              </h4>

              {/* Address */}
              {lead.address && (
                <p className="text-sm text-[#6b6480] mb-4 line-clamp-2">{lead.address}</p>
              )}

              {/* Score Bar */}
              <div className="mb-5">
                <div className="h-1.5 rounded-full bg-[#2d2640] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lead.score}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#14b8a6] via-[#a855f7] to-[#f43f5e]"
                  />
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex items-center gap-3 mb-5">
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#14b8a6] hover:text-[#2dd4bf] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 text-sm text-[#a855f7] hover:text-[#c084fc] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#2d2640]">
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                  className="flex-1 text-xs font-medium px-3 py-2.5 rounded-xl bg-[#14101f] border border-[#2d2640] text-[#f0eef5] cursor-pointer focus:border-[#14b8a6] transition-colors"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {lead.status === 'new' && (
                  <motion.button
                    onClick={() => sendOutreach(lead.id)}
                    disabled={sendingOutreach === lead.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-accent px-4 py-2.5 text-xs font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingOutreach === lead.id ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send
                      </>
                    )}
                  </motion.button>
                )}

                {lead.status === 'contacted' && (
                  <span className="text-xs text-[#14b8a6] flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sent
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
