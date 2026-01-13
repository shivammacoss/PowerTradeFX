import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, User, Wallet, Users, Copy, UserCircle, HelpCircle, FileText, LogOut,
  TrendingUp, DollarSign, UserPlus, Link, ChevronDown, ChevronRight, Award, Trophy,
  ArrowLeft, Home
} from 'lucide-react'

import { API_URL } from '../config/api'

const IBPage = () => {
  const navigate = useNavigate()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [ibProfile, setIbProfile] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [commissions, setCommissions] = useState([])
  const [downline, setDownline] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Account', icon: User, path: '/account' },
    { name: 'Wallet', icon: Wallet, path: '/wallet' },
    { name: 'IB', icon: Users, path: '/ib' },
    { name: 'Copytrade', icon: Copy, path: '/copytrade' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
    { name: 'Support', icon: HelpCircle, path: '/support' },
    { name: 'Instructions', icon: FileText, path: '/instructions' },
  ]

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchChallengeStatus()
    fetchIBProfile()
  }, [])

  const fetchChallengeStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/prop/status`)
      const data = await res.json()
      if (data.success) setChallengeModeEnabled(data.enabled)
    } catch (error) {
      console.error('Error fetching challenge status:', error)
    }
  }

  const fetchIBProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/my-profile/${user._id}`)
      const data = await res.json()
      if (data.ibUser) {
        // Merge ibUser, wallet, and stats into one profile object
        setIbProfile({
          ...data.ibUser,
          ibWalletBalance: data.wallet?.balance || 0,
          totalCommissionEarned: data.wallet?.totalEarned || 0,
          stats: data.stats || {}
        })
        // Check both status and ibStatus for compatibility
        if (data.ibUser.status === 'ACTIVE' || data.ibUser.ibStatus === 'ACTIVE') {
          fetchReferrals()
          fetchCommissions()
          fetchDownline()
        }
      }
    } catch (error) {
      console.error('Error fetching IB profile:', error)
    }
    setLoading(false)
  }

  const fetchReferrals = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/my-referrals/${user._id}`)
      const data = await res.json()
      setReferrals(data.referrals || [])
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const fetchCommissions = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/my-commissions/${user._id}`)
      const data = await res.json()
      setCommissions(data.commissions || [])
    } catch (error) {
      console.error('Error fetching commissions:', error)
    }
  }

  const fetchDownline = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/my-downline/${user._id}`)
      const data = await res.json()
      // The API returns tree with downlines array
      setDownline(data.tree?.downlines || [])
    } catch (error) {
      console.error('Error fetching downline:', error)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const res = await fetch(`${API_URL}/ib/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      })
      const data = await res.json()
      if (data.ibUser) {
        setIbProfile(data.ibUser)
        alert('IB application submitted successfully!')
      } else {
        alert(data.message || 'Failed to apply')
      }
    } catch (error) {
      console.error('Error applying:', error)
      alert('Failed to submit application')
    }
    setApplying(false)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const res = await fetch(`${API_URL}/ib/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(withdrawAmount)
        })
      })
      const data = await res.json()
      if (data.status) {
        alert(data.message)
        setWithdrawAmount('')
        fetchIBProfile()
      } else {
        alert(data.message || 'Failed to withdraw')
      }
    } catch (error) {
      console.error('Error withdrawing:', error)
      alert('Failed to process withdrawal')
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/user/signup?ref=${ibProfile?.referralCode}`
    navigator.clipboard.writeText(link)
    alert('Referral link copied!')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  const renderDownlineTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null
    return nodes.map((node, idx) => (
      <div key={node._id || idx} className="ml-4 border-l border-gray-700 pl-4 py-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${node.isIB ? 'bg-accent-green/20' : 'bg-gray-700'}`}>
            <span className={node.isIB ? 'text-accent-green' : 'text-gray-400'}>{node.firstName?.charAt(0) || '?'}</span>
          </div>
          <div>
            <p className="text-white text-sm">{node.firstName || 'Unknown'}</p>
            <p className="text-gray-500 text-xs">{node.email}</p>
          </div>
          <div className="ml-auto text-right">
            <span className={`px-2 py-1 rounded text-xs ${node.isIB ? 'bg-accent-green/20 text-accent-green' : 'bg-gray-700 text-gray-400'}`}>
              {node.isIB ? 'IB' : 'User'} • Level {(node.level || 0) + 1}
            </span>
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-dark-800 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/mobile')} className="p-2 -ml-2 hover:bg-dark-700 rounded-lg">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <h1 className="text-white font-semibold text-lg flex-1">IB Program</h1>
          <button onClick={() => navigate('/mobile')} className="p-2 hover:bg-dark-700 rounded-lg">
            <Home size={20} className="text-gray-400" />
          </button>
        </header>
      )}

      {/* Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <aside 
          className={`${sidebarExpanded ? 'w-48' : 'w-16'} bg-dark-900 border-r border-gray-800 flex flex-col transition-all duration-300`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="p-4 flex items-center gap-2">
            <img src="/powertradefx logo.png" alt="PowerTradeFX" className="w-8 h-8 object-contain flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-white font-bold text-sm whitespace-nowrap">PowerTradeFX</span>
            )}
          </div>
          <nav className="flex-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  item.name === 'IB' ? 'bg-accent-green text-black' : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarExpanded && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-gray-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg">
              <LogOut size={18} />
              {sidebarExpanded && <span className="text-sm">Log Out</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-14' : ''}`}>
        {!isMobile && (
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h1 className="text-xl font-semibold text-white">Introducing Broker (IB)</h1>
          </header>
        )}

        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : !ibProfile ? (
            /* Not an IB - Show Apply */
            <div className={`${isMobile ? '' : 'max-w-lg mx-auto'} text-center ${isMobile ? 'py-6' : 'py-12'}`}>
              <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Award size={isMobile ? 32 : 40} className="text-accent-green" />
              </div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-3`}>Become an Introducing Broker</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Earn commissions by referring traders. Get up to 5 levels of referral commissions!
              </p>
              <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-4' : 'p-6'} mb-4 text-left`}>
                <h3 className="text-white font-semibold mb-3 text-sm">Benefits:</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-accent-green flex-shrink-0" />
                    Earn commission on every trade your referrals make
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-accent-green flex-shrink-0" />
                    Multi-level commissions (up to 5 levels)
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-accent-green flex-shrink-0" />
                    Real-time commission tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-accent-green" />
                    Easy withdrawal to your wallet
                  </li>
                </ul>
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                className="bg-accent-green text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent-green/90 disabled:opacity-50"
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ) : ibProfile.status === 'PENDING' ? (
            /* Pending Approval */
            <div className={`${isMobile ? '' : 'max-w-lg mx-auto'} text-center ${isMobile ? 'py-6' : 'py-12'}`}>
              <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Award size={isMobile ? 32 : 40} className="text-yellow-500" />
              </div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-3`}>Application Pending</h2>
              <p className="text-gray-400 text-sm">
                Your IB application is under review. You will be notified once approved.
              </p>
            </div>
          ) : ibProfile.status === 'REJECTED' ? (
            /* Rejected */
            <div className={`${isMobile ? '' : 'max-w-lg mx-auto'} text-center ${isMobile ? 'py-6' : 'py-12'}`}>
              <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Award size={isMobile ? 32 : 40} className="text-red-500" />
              </div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-3`}>Application Rejected</h2>
              <p className="text-gray-400 mb-2 text-sm">Unfortunately, your IB application was not approved.</p>
              {ibProfile.rejectionReason && (
                <p className="text-red-400 text-sm">Reason: {ibProfile.rejectionReason}</p>
              )}
            </div>
          ) : (
            /* Active IB Dashboard */
            <div>
              {/* Stats Cards */}
              <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'} mb-4`}>
                <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-accent-green/20 rounded-lg flex items-center justify-center`}>
                      <DollarSign size={isMobile ? 16 : 20} className="text-accent-green" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Available Balance</p>
                  <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>${ibProfile.ibWalletBalance?.toFixed(2) || '0.00'}</p>
                </div>
                <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-500/20 rounded-lg flex items-center justify-center`}>
                      <TrendingUp size={isMobile ? 16 : 20} className="text-blue-500" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Total Earned</p>
                  <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>${ibProfile.totalCommissionEarned?.toFixed(2) || '0.00'}</p>
                </div>
                <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-purple-500/20 rounded-lg flex items-center justify-center`}>
                      <Users size={isMobile ? 16 : 20} className="text-purple-500" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Direct Referrals</p>
                  <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{ibProfile.stats?.directReferrals || 0}</p>
                </div>
                <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-orange-500/20 rounded-lg flex items-center justify-center`}>
                      <UserPlus size={isMobile ? 16 : 20} className="text-orange-500" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Total Downline</p>
                  <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{ibProfile.stats?.totalDownline || 0}</p>
                </div>
              </div>

              {/* Referral Link */}
              <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800 mb-4`}>
                <h3 className={`text-white font-semibold mb-2 ${isMobile ? 'text-sm' : ''}`}>Your Referral Link</h3>
                <div className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/user/signup?ref=${ibProfile.referralCode}`}
                    className={`flex-1 bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 ${isMobile ? 'text-xs' : ''}`}
                  />
                  <button
                    onClick={copyReferralLink}
                    className={`bg-accent-green text-black ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-2'} rounded-lg font-medium hover:bg-accent-green/90 flex items-center justify-center gap-2`}
                  >
                    <Link size={16} />
                    Copy
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">Share this link to earn commissions</p>
              </div>

              {/* Tabs */}
              <div className={`flex ${isMobile ? 'gap-1 overflow-x-auto pb-2' : 'gap-4'} mb-4`}>
                {['overview', 'referrals', 'commissions', 'downline', 'withdraw'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${isMobile ? 'px-3 py-1.5 text-xs whitespace-nowrap' : 'px-4 py-2'} rounded-lg font-medium capitalize transition-colors ${
                      activeTab === tab ? 'bg-accent-green text-black' : 'bg-dark-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-5 gap-4'}`}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-4'} border border-gray-800 text-center`}>
                      <p className="text-gray-500 text-xs mb-1">Level {level}</p>
                      <p className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{ibProfile.stats?.[`level${level}Count`] || 0}</p>
                      <p className="text-gray-600 text-xs">referrals</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'referrals' && (
                <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
                  {referrals.length === 0 ? (
                    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'} text-gray-500 text-sm`}>No referrals yet</div>
                  ) : isMobile ? (
                    <div className="divide-y divide-gray-800">
                      {referrals.map(ref => (
                        <div key={ref._id} className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-white text-sm font-medium">{ref.firstName} {ref.lastName}</p>
                            <p className="text-gray-500 text-xs">{new Date(ref.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="text-gray-400 text-xs">{ref.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-dark-700">
                        <tr>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">User</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Email</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Joined</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Volume</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map(ref => (
                          <tr key={ref._id} className="border-t border-gray-800">
                            <td className="px-4 py-3 text-white text-sm">{ref.firstName} {ref.lastName}</td>
                            <td className="px-4 py-3 text-gray-400 text-sm">{ref.email}</td>
                            <td className="px-4 py-3 text-gray-400 text-sm">{new Date(ref.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-white text-sm">-</td>
                            <td className="px-4 py-3 text-accent-green text-sm">-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'commissions' && (
                <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
                  {commissions.length === 0 ? (
                    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'} text-gray-500 text-sm`}>No commissions yet</div>
                  ) : isMobile ? (
                    <div className="divide-y divide-gray-800">
                      {commissions.map(comm => (
                        <div key={comm._id} className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-white text-sm font-medium">{comm.symbol}</p>
                            <p className="text-accent-green text-sm font-medium">${comm.commissionAmount?.toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-400 text-xs">Level {comm.level} • {comm.tradeLotSize?.toFixed(2)} lots</p>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              comm.status === 'CREDITED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>{comm.status}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{new Date(comm.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-dark-700">
                        <tr>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Date</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Trader</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Symbol</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Level</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Lots</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Commission</th>
                          <th className="text-left text-gray-400 text-xs font-medium px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map(comm => (
                          <tr key={comm._id} className="border-t border-gray-800">
                            <td className="px-4 py-3 text-gray-400 text-sm">{new Date(comm.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-white text-sm">{comm.traderUserId?.firstName || 'Unknown'}</td>
                            <td className="px-4 py-3 text-white text-sm">{comm.symbol}</td>
                            <td className="px-4 py-3 text-gray-400 text-sm">Level {comm.level}</td>
                            <td className="px-4 py-3 text-white text-sm">{comm.tradeLotSize?.toFixed(2)}</td>
                            <td className="px-4 py-3 text-accent-green text-sm">${comm.commissionAmount?.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                comm.status === 'CREDITED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                {comm.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'downline' && (
                <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-3' : 'p-5'} border border-gray-800`}>
                  {downline.length === 0 ? (
                    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'} text-gray-500 text-sm`}>No downline yet</div>
                  ) : (
                    <div>{renderDownlineTree(downline)}</div>
                  )}
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className={isMobile ? '' : 'max-w-md'}>
                  <div className={`bg-dark-800 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border border-gray-800`}>
                    <h3 className={`text-white font-semibold ${isMobile ? 'mb-3 text-sm' : 'mb-4'}`}>Withdraw Commission</h3>
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs mb-1">Available Balance</p>
                      <p className={`text-accent-green font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>${ibProfile.ibWalletBalance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-gray-400 text-xs mb-1 block">Amount</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        className={`w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white ${isMobile ? 'text-sm' : ''}`}
                      />
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                      className={`w-full bg-accent-green text-black py-2 rounded-lg font-medium hover:bg-accent-green/90 disabled:opacity-50 ${isMobile ? 'text-sm' : ''}`}
                    >
                      Request Withdrawal
                    </button>
                    {ibProfile.pendingWithdrawal > 0 && (
                      <p className="text-yellow-500 text-sm mt-3">
                        Pending withdrawal: ${ibProfile.pendingWithdrawal.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default IBPage
