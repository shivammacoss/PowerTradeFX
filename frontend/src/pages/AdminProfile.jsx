import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  Link,
  Calendar,
  AlertCircle,
  CheckCircle,
  Wallet,
  Copy,
  Send,
  ExternalLink
} from 'lucide-react'
import { API_URL } from '../config/api'

const AdminProfile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    brandName: '',
    urlSlug: '',
    role: '',
    createdAt: ''
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [walletBalance, setWalletBalance] = useState(0)
  const [fundRequest, setFundRequest] = useState({ amount: '', description: '' })
  const [fundRequestLoading, setFundRequestLoading] = useState(false)
  const [fundRequests, setFundRequests] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchWalletBalance()
    fetchFundRequests()
  }, [])

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setWalletBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const fetchFundRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/fund-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setFundRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching fund requests:', error)
    }
  }

  const handleFundRequest = async () => {
    if (!fundRequest.amount || parseFloat(fundRequest.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' })
      return
    }
    setFundRequestLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/fund-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fundRequest)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Fund request submitted successfully!' })
        setFundRequest({ amount: '', description: '' })
        fetchFundRequests()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting fund request' })
    }
    setFundRequestLoading(false)
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/${profile.urlSlug}/signup`
    navigator.clipboard.writeText(link)
    setMessage({ type: 'success', text: 'Referral link copied to clipboard!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setProfile({
          firstName: data.admin.firstName || '',
          lastName: data.admin.lastName || '',
          email: data.admin.email || '',
          phone: data.admin.phone || '',
          brandName: data.admin.brandName || '',
          urlSlug: data.admin.urlSlug || '',
          role: data.admin.role || '',
          createdAt: data.admin.createdAt || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          brandName: profile.brandName
        })
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.admin))
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile' })
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMessage({ type: '', text: '' })

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      setSavingPassword(false)
      return
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setSavingPassword(false)
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      const data = await res.json()
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Error changing password' })
    }
    setSavingPassword(false)
  }

  if (loading) {
    return (
      <AdminLayout title="Admin Profile" subtitle="Manage your account settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Admin Profile" subtitle="Manage your account settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-xl border border-gray-800 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <span className="text-white text-3xl font-bold">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </span>
              </div>
              <h3 className="text-white text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.role === 'SUPER_ADMIN' 
                    ? 'bg-purple-500/20 text-purple-500' 
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {profile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-gray-700 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building size={16} className="text-gray-500" />
                  <span className="text-gray-400">{profile.brandName || 'No brand set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link size={16} className="text-gray-500" />
                  <span className="text-gray-400">/{profile.urlSlug}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-400">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Card (for admins only - not super admin or employee) */}
          {profile.role === 'ADMIN' && (
            <div className="bg-dark-800 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Wallet size={18} className="text-green-500" />
                  My Wallet
                </h3>
              </div>
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-green-500">${walletBalance.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Referral Link Card (for super admin and admins only - not employees) */}
          {profile.role !== 'EMPLOYEE' && (
          <div className="bg-dark-800 rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <ExternalLink size={18} className="text-blue-500" />
              User Referral Link
            </h3>
            <p className="text-gray-500 text-sm mb-3">Share this link with users to register under your brand</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/${profile.urlSlug}/signup`}
                className="flex-1 bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <div className="bg-dark-800 rounded-xl border border-gray-800">
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <User size={18} />
                Profile Details
              </h3>
              <p className="text-gray-500 text-sm mt-1">Update your personal information</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
              {message.text && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-500'
                }`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">First Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="First Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Last Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Brand Name</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={profile.brandName}
                    onChange={(e) => setProfile({...profile, brandName: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Your Trading Platform"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-dark-800 rounded-xl border border-gray-800">
            <div className="p-5 border-b border-gray-700">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Lock size={18} />
                Change Password
              </h3>
              <p className="text-gray-500 text-sm mt-1">Update your account password</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passwordMessage.text && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-500'
                }`}>
                  {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-12 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-12 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-12 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50"
                >
                  <Lock size={16} />
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Fund Request Section (for non-super admins) */}
          {profile.role !== 'SUPER_ADMIN' && profile.role !== 'EMPLOYEE' && (
            <div className="bg-dark-800 rounded-xl border border-gray-800">
              <div className="p-5 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Send size={18} className="text-purple-500" />
                  Request Funds from Super Admin
                </h3>
                <p className="text-gray-500 text-sm mt-1">Submit a request to add funds to your wallet</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Amount ($)</label>
                    <input
                      type="number"
                      value={fundRequest.amount}
                      onChange={(e) => setFundRequest({...fundRequest, amount: e.target.value})}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2.5 text-white"
                      placeholder="Enter amount"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Description (Optional)</label>
                    <input
                      type="text"
                      value={fundRequest.description}
                      onChange={(e) => setFundRequest({...fundRequest, description: e.target.value})}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2.5 text-white"
                      placeholder="Reason for request"
                    />
                  </div>
                </div>
                <button
                  onClick={handleFundRequest}
                  disabled={fundRequestLoading || !fundRequest.amount}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  <Send size={16} />
                  {fundRequestLoading ? 'Submitting...' : 'Submit Request'}
                </button>

                {/* Fund Request History */}
                {fundRequests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-gray-400 text-sm mb-3">Recent Requests</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {fundRequests.slice(0, 5).map(req => (
                        <div key={req._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                          <div>
                            <p className="text-white font-medium">${req.amount?.toLocaleString()}</p>
                            <p className="text-gray-500 text-xs">{req.description || 'No description'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            req.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                            req.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminProfile
