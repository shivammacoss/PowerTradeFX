import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  RefreshCw,
  CreditCard
} from 'lucide-react'

const API_URL = 'http://localhost:5001/api'

const AdminAccountTypes = () => {
  const [accountTypes, setAccountTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minDeposit: '',
    leverage: '1:100',
    exposureLimit: '',
    isActive: true
  })

  useEffect(() => {
    fetchAccountTypes()
  }, [])

  const fetchAccountTypes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/account-types/all`)
      const data = await res.json()
      setAccountTypes(data.accountTypes || [])
    } catch (error) {
      console.error('Error fetching account types:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.minDeposit || !formData.leverage) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const url = editingType 
        ? `${API_URL}/account-types/${editingType._id}`
        : `${API_URL}/account-types`
      
      const res = await fetch(url, {
        method: editingType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minDeposit: parseFloat(formData.minDeposit),
          exposureLimit: formData.exposureLimit ? parseFloat(formData.exposureLimit) : 0
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(editingType ? 'Account type updated!' : 'Account type created!')
        setShowModal(false)
        resetForm()
        fetchAccountTypes()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Error saving account type')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this account type?')) return

    try {
      const res = await fetch(`${API_URL}/account-types/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setSuccess('Account type deleted!')
        fetchAccountTypes()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Error deleting account type')
    }
  }

  const handleToggleActive = async (type) => {
    try {
      const res = await fetch(`${API_URL}/account-types/${type._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...type, isActive: !type.isActive })
      })
      
      if (res.ok) {
        fetchAccountTypes()
      }
    } catch (error) {
      setError('Error updating account type')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minDeposit: '',
      leverage: '1:100',
      exposureLimit: '',
      isActive: true
    })
    setEditingType(null)
    setError('')
  }

  const openEditModal = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      minDeposit: type.minDeposit.toString(),
      leverage: type.leverage,
      exposureLimit: type.exposureLimit?.toString() || '',
      isActive: type.isActive
    })
    setShowModal(true)
    setError('')
  }

  return (
    <AdminLayout title="Account Types" subtitle="Manage trading account types">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={18} /> Add Account Type
        </button>
      </div>

      <div>
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-500 flex items-center gap-2">
              <Check size={18} /> {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="text-gray-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {accountTypes.map((type) => (
                <div key={type._id} className={`bg-dark-800 rounded-xl p-5 border ${type.isActive ? 'border-gray-800' : 'border-red-500/30 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{type.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${type.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {type.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{type.description || 'No description'}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min Deposit</span>
                      <span className="text-white">${type.minDeposit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Leverage</span>
                      <span className="text-white">{type.leverage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Exposure Limit</span>
                      <span className="text-white">${type.exposureLimit || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(type)}
                      className="flex-1 flex items-center justify-center gap-1 bg-dark-700 text-white py-2 rounded-lg hover:bg-dark-600 transition-colors text-sm"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(type)}
                      className={`flex-1 py-2 rounded-lg transition-colors text-sm ${type.isActive ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                    >
                      {type.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(type._id)}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {accountTypes.length === 0 && (
                <div className="col-span-3 bg-dark-800 rounded-xl p-8 border border-gray-800 text-center">
                  <CreditCard size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No account types created yet</p>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">
                {editingType ? 'Edit Account Type' : 'Create Account Type'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard, Premium, VIP"
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Account type description"
                  rows={2}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Min Deposit ($) *</label>
                  <input
                    type="number"
                    value={formData.minDeposit}
                    onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                    placeholder="100"
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Leverage *</label>
                  <select
                    value={formData.leverage}
                    onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="1:50">1:50</option>
                    <option value="1:100">1:100</option>
                    <option value="1:200">1:200</option>
                    <option value="1:500">1:500</option>
                    <option value="1:1000">1:1000</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Exposure Limit ($)</label>
                <input
                  type="number"
                  value={formData.exposureLimit}
                  onChange={(e) => setFormData({ ...formData, exposureLimit: e.target.value })}
                  placeholder="0 for unlimited"
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 bg-dark-700 text-white py-3 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-red-500 text-white font-medium py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                {editingType ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminAccountTypes
