import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { API_URL } from '../config/api'
import { DollarSign, ClipboardList, RefreshCw, Send, Check, X } from 'lucide-react'

const AdminFundRequests = () => {
  const [fundRequest, setFundRequest] = useState({ amount: '', description: '' })
  const [fundRequestLoading, setFundRequestLoading] = useState(false)
  const [fundRequests, setFundRequests] = useState([])
  const [message, setMessage] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [processingRequestId, setProcessingRequestId] = useState(null)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser')
    if (storedAdmin) {
      try {
        setAdminUser(JSON.parse(storedAdmin))
      } catch (error) {
        console.error('Failed to parse admin user:', error)
      }
    }
    fetchFundRequests()
  }, [])

  const fetchFundRequests = async () => {
    setLoadingHistory(true)
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
    setLoadingHistory(false)
  }

  const handleApproveRequest = async (requestId) => {
    setProcessingRequestId(requestId)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/admin-mgmt/fund-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'APPROVED', remarks: 'Funded from dashboard' })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Funds added to admin wallet successfully.' })
        fetchFundRequests()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fund admin wallet' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error funding admin wallet' })
    }
    setProcessingRequestId(null)
  }

  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN'

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

  const pendingRequests = fundRequests.filter(req => req.status === 'PENDING')
  const approvedRequests = fundRequests.filter(req => req.status === 'APPROVED')
  const rejectedRequests = fundRequests.filter(req => req.status === 'REJECTED')

  const statusBadge = (status) => {
    if (status === 'APPROVED') return 'bg-green-500/20 text-green-500'
    if (status === 'REJECTED') return 'bg-red-500/20 text-red-500'
    return 'bg-yellow-500/20 text-yellow-500'
  }

  return (
    <AdminLayout title="Fund Requests" subtitle="Request funds from Super Admin">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Send size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-white text-2xl font-bold">{pendingRequests.length}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Requests awaiting approval from Super Admin</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-white text-2xl font-bold">{approvedRequests.length}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Total approved requests</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <X size={24} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-white text-2xl font-bold">{rejectedRequests.length}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Requests rejected by Super Admin</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isSuperAdmin ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        {!isSuperAdmin && (
          <div className="bg-dark-800 rounded-xl border border-gray-800">
            <div className="p-4 sm:p-5 border-b border-gray-700">
              <h2 className="text-white font-semibold text-lg">Submit Fund Request</h2>
              <p className="text-gray-500 text-sm">Fill out the details to request funds from Super Admin</p>
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {message.text}
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Amount ($)</label>
                <input
                  type="number"
                  value={fundRequest.amount}
                  onChange={(e) => setFundRequest({ ...fundRequest, amount: e.target.value })}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2.5 text-white"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Description (Optional)</label>
                <textarea
                  value={fundRequest.description}
                  onChange={(e) => setFundRequest({ ...fundRequest, description: e.target.value })}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2.5 text-white"
                  placeholder="Reason for request"
                  rows="3"
                />
              </div>
              <button
                onClick={handleFundRequest}
                disabled={fundRequestLoading || !fundRequest.amount}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {fundRequestLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bg-dark-800 rounded-xl border border-gray-800">
          <div className="p-4 sm:p-5 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">Request History</h2>
              <p className="text-gray-500 text-sm">Track the status of your previous requests</p>
            </div>
            <button
              onClick={fetchFundRequests}
              className="p-2 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <RefreshCw size={16} className={loadingHistory ? 'animate-spin text-gray-400' : 'text-gray-400'} />
            </button>
          </div>
          <div className="p-4 sm:p-5 space-y-3 max-h-[420px] overflow-y-auto">
            {loadingHistory ? (
              <div className="text-center py-10 text-gray-500">Loading requests...</div>
            ) : fundRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No fund requests yet</div>
            ) : (
              fundRequests.map((req) => (
                <div key={req._id} className="p-4 bg-dark-700 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-lg">${req.amount?.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{req.description || 'No description provided'}</p>
                  {req.processedBy && (
                    <p className="text-gray-500 text-xs mt-2">
                      Processed by: {req.processedBy?.firstName || 'Super Admin'}
                    </p>
                  )}
                  {isSuperAdmin && req.status === 'PENDING' && (
                    <button
                      onClick={() => handleApproveRequest(req._id)}
                      disabled={processingRequestId === req._id}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                    >
                      {processingRequestId === req._id ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Funding...
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} />
                          Give Money
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminFundRequests
