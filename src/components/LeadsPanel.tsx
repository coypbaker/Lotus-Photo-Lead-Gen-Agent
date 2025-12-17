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
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-purple-100 text-purple-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
        sortDirection === 'asc' ? '↑' : '↓'
      ) : (
        <span className="text-gray-300">↕</span>
      )}
    </span>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs sm:text-sm text-blue-600">Total Leads</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-700">{stats.contacted}</div>
              <div className="text-xs sm:text-sm text-yellow-600">Contacted</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700">{stats.replied}</div>
              <div className="text-xs sm:text-sm text-purple-600">Replied</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-700">{stats.converted}</div>
              <div className="text-xs sm:text-sm text-green-600">Converted</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Leads</h3>
        <button
          onClick={generateLeads}
          disabled={generating}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-gray-900 bg-white"
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
        <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            <p className="font-medium">{message.type === 'success' ? 'Success!' : 'Error'}</p>
            <p className="text-sm mt-0.5">{message.text}</p>
          </div>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads yet</h3>
          <p className="mt-1 text-sm text-gray-500">Click &quot;Find New Leads Now&quot; to get started.</p>
        </div>
      ) : filteredAndSortedLeads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matching leads</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Website</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th 
                  onClick={() => handleSort('score')}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Score <SortIcon field="score" />
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    {lead.address && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">{lead.address}</div>
                    )}
                    {/* Mobile: Show website/phone inline */}
                    <div className="sm:hidden mt-1 flex flex-wrap gap-2">
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600">
                          🔗 Website
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-purple-600">
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
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        Visit Site
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-sm text-gray-900 hover:text-purple-600">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(lead.status)}`}
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
                        className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                      >
                        {sendingOutreach === lead.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
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
                      <span className="text-xs text-gray-400">
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
