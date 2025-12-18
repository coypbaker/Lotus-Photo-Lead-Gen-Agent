'use client'

import { useState, useEffect, useMemo } from 'react'
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
      case 'new': return 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
      case 'contacted': return 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
      case 'replied': return 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
      case 'converted': return 'bg-green-900/50 text-green-300 border border-green-700/50'
      case 'rejected': return 'bg-[#333] text-[#888] border border-[#444]'
      default: return 'bg-[#333] text-[#888] border border-[#444]'
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
        <span className="text-[#d4af37]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <span className="text-[#555]">↕</span>
      )}
    </span>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#333] border-t-[#d4af37]"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] rounded-2xl p-5 border border-[#333] hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5]">{stats.total}</div>
              <div className="text-sm text-[#666] mt-1">Total Leads</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] rounded-2xl p-5 border border-[#333] hover:border-[#d4af37]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5]">{stats.contacted}</div>
              <div className="text-sm text-[#666] mt-1">Contacted</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] rounded-2xl p-5 border border-[#333] hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5]">{stats.replied}</div>
              <div className="text-sm text-[#666] mt-1">Replied</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] rounded-2xl p-5 border border-[#333] hover:border-green-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#f5f5f5]">{stats.converted}</div>
              <div className="text-sm text-[#666] mt-1">Converted</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Your Leads</h3>
        <button
          onClick={generateLeads}
          disabled={generating}
          className="btn-gold inline-flex items-center justify-center px-6 py-3 rounded-xl disabled:opacity-50 w-full sm:w-auto"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0f0f0f]/30 border-t-[#0f0f0f] mr-2"></div>
              Finding Leads...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find New Leads Now
            </>
          )}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-sm text-[#f5f5f5] placeholder-[#666] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-sm text-[#f5f5f5] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="replied">Replied</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-900/20 text-green-300 border border-green-700/30' 
            : 'bg-red-900/20 text-red-300 border border-red-700/30'
        }`}>
          {message.type === 'success' ? (
            <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            <p className="font-medium">{message.type === 'success' ? 'Success!' : 'Error'}</p>
            <p className="text-sm mt-0.5 opacity-80">{message.text}</p>
          </div>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-[#666] hover:text-[#f5f5f5] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#333]">
          <svg className="mx-auto h-14 w-14 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-[#f5f5f5]">No leads yet</h3>
          <p className="mt-2 text-sm text-[#666]">Click &quot;Find New Leads Now&quot; to get started.</p>
        </div>
      ) : filteredAndSortedLeads.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#333]">
          <svg className="mx-auto h-14 w-14 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-[#f5f5f5]">No matching leads</h3>
          <p className="mt-2 text-sm text-[#666]">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#333]">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider cursor-pointer hover:text-[#d4af37] transition-colors"
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider hidden sm:table-cell">Website</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th 
                  onClick={() => handleSort('score')}
                  className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider cursor-pointer hover:text-[#d4af37] transition-colors"
                >
                  Score <SortIcon field="score" />
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider cursor-pointer hover:text-[#d4af37] transition-colors"
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-[#888] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#151515] divide-y divide-[#2a2a2a]">
              {filteredAndSortedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-[#f5f5f5]">{lead.name}</div>
                    {lead.address && (
                      <div className="text-xs text-[#666] truncate max-w-[200px] sm:max-w-xs">{lead.address}</div>
                    )}
                    {/* Mobile: Show website/phone inline */}
                    <div className="sm:hidden mt-2 flex flex-wrap gap-2">
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#d4af37] hover:underline">
                          🔗 Website
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-[#d4af37] hover:underline">
                          📞 Call
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#d4af37] hover:text-[#e5c45e] hover:underline transition-colors"
                      >
                        Visit Site
                      </a>
                    ) : (
                      <span className="text-sm text-[#444]">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-sm text-[#a0a0a0] hover:text-[#d4af37] transition-colors">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-[#444]">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 sm:w-16 bg-[#333] rounded-full h-2 mr-2">
                        <div
                          className="bg-gradient-to-r from-[#d4af37] to-[#e5c45e] h-2 rounded-full"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-[#a0a0a0]">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="replied">Replied</option>
                      <option value="converted">Converted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {lead.status === 'new' ? (
                      <button
                        onClick={() => sendOutreach(lead.id)}
                        disabled={sendingOutreach === lead.id}
                        className="btn-gold inline-flex items-center px-3 sm:px-4 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
                      >
                        {sendingOutreach === lead.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#0f0f0f]/30 border-t-[#0f0f0f] mr-1.5"></div>
                            <span className="hidden sm:inline">Sending...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Send Outreach</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-[#666]">
                        {lead.status === 'contacted' ? '✓ Sent' : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
