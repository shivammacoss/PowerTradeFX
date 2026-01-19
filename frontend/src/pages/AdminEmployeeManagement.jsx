import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  UserCog,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Key,
  Mail,
  Calendar,
  X,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react'
import { API_URL } from '../config/api'

const AdminEmployeeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newPassword, setNewPassword] = useState('')

  const [newEmployee, setNewEmployee] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    sidebarPermissions: {
      dashboard: true,
      userManagement: false,
      tradeManagement: false,
      fundManagement: false,
      bankSettings: false,
      ibManagement: false,
      forexCharges: false,
      earningsReport: false,
      copyTrade: false,
      propFirm: false,
      accountTypes: false,
      themeSettings: false,
      emailTemplates: false,
      bonusManagement: false,
      adminManagement: false,
      employeeManagement: false,
      kycVerification: false,
      supportTickets: false
    }
  })

  const sidebarOptions = [
    { key: 'dashboard', label: 'Overview Dashboard' },
    { key: 'userManagement', label: 'User Management' },
    { key: 'tradeManagement', label: 'Trade Management' },
    { key: 'fundManagement', label: 'Fund Management' },
    { key: 'bankSettings', label: 'Bank Settings' },
    { key: 'ibManagement', label: 'IB Management' },
    { key: 'forexCharges', label: 'Forex Charges' },
    { key: 'earningsReport', label: 'Earnings Report' },
    { key: 'copyTrade', label: 'Copy Trade' },
    { key: 'propFirm', label: 'Prop Firm Challenges' },
    { key: 'accountTypes', label: 'Account Types' },
    { key: 'themeSettings', label: 'Theme Settings' },
    { key: 'emailTemplates', label: 'Email Templates' },
    { key: 'bonusManagement', label: 'Bonus Management' },
    { key: 'adminManagement', label: 'Admin Management' },
    { key: 'employeeManagement', label: 'Employee Management' },
    { key: 'kycVerification', label: 'KYC Verification' },
    { key: 'supportTickets', label: 'Support Tickets' }
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees`)
      const data = await res.json()
      if (data.success) {
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
    setLoading(false)
  }

  const handleCreateEmployee = async () => {
    if (!newEmployee.email || !newEmployee.password || !newEmployee.firstName || !newEmployee.lastName) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      return
    }

    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Employee created successfully' })
        setShowAddModal(false)
        resetNewEmployee()
        fetchEmployees()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create employee' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating employee' })
    }
  }

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return

    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: selectedEmployee.firstName,
          lastName: selectedEmployee.lastName,
          phone: selectedEmployee.phone,
          sidebarPermissions: selectedEmployee.sidebarPermissions
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Employee updated successfully' })
        setShowEditModal(false)
        fetchEmployees()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update employee' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating employee' })
    }
  }

  const handleResetPassword = async () => {
    if (!selectedEmployee || !newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees/${selectedEmployee._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Password reset successfully' })
        setShowPasswordModal(false)
        setNewPassword('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to reset password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error resetting password' })
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees/${employeeId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Employee deleted successfully' })
        fetchEmployees()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete employee' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting employee' })
    }
  }

  const handleToggleStatus = async (employee) => {
    try {
      const res = await fetch(`${API_URL}/admin-mgmt/employees/${employee._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: employee.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Employee ${employee.status === 'ACTIVE' ? 'suspended' : 'activated'} successfully` })
        fetchEmployees()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating status' })
    }
  }

  const resetNewEmployee = () => {
    setNewEmployee({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      sidebarPermissions: {
        dashboard: true,
        userManagement: false,
        tradeManagement: false,
        fundManagement: false,
        bankSettings: false,
        ibManagement: false,
        forexCharges: false,
        earningsReport: false,
        copyTrade: false,
        propFirm: false,
        accountTypes: false,
        themeSettings: false,
        emailTemplates: false,
        bonusManagement: false,
        adminManagement: false,
        employeeManagement: false,
        kycVerification: false,
        supportTickets: false
      }
    })
  }

  const selectAllPermissions = (isNew = true) => {
    const allTrue = {}
    sidebarOptions.forEach(opt => { allTrue[opt.key] = true })
    if (isNew) {
      setNewEmployee({ ...newEmployee, sidebarPermissions: allTrue })
    } else if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, sidebarPermissions: allTrue })
    }
  }

  const deselectAllPermissions = (isNew = true) => {
    const allFalse = {}
    sidebarOptions.forEach(opt => { allFalse[opt.key] = false })
    allFalse.dashboard = true // Keep dashboard always enabled
    if (isNew) {
      setNewEmployee({ ...newEmployee, sidebarPermissions: allFalse })
    } else if (selectedEmployee) {
      setSelectedEmployee({ ...selectedEmployee, sidebarPermissions: allFalse })
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPermissionCount = (sidebarPermissions) => {
    if (!sidebarPermissions) return 0
    return Object.values(sidebarPermissions).filter(v => v === true).length
  }

  if (loading) {
    return (
      <AdminLayout title="Employee Management" subtitle="Manage employees and their sidebar access">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Employee Management" subtitle="Manage employees and their sidebar access" requiredPermission="canManageEmployees">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UserCog size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-white text-xl font-bold">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Check size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-white text-xl font-bold">{employees.filter(e => e.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Suspended</p>
              <p className="text-white text-xl font-bold">{employees.filter(e => e.status === 'SUSPENDED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-gray-800">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => { resetNewEmployee(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        {/* Employee List */}
        <div className="divide-y divide-gray-800">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            filteredEmployees.map(employee => (
              <div key={employee._id} className="p-4 sm:p-5 hover:bg-dark-700/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <UserCog size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Mail size={14} />
                        {employee.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          employee.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {employee.status}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {getPermissionCount(employee.sidebarPermissions)} sidebar permissions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedEmployee(employee); setShowEditModal(true); }}
                      className="p-2 bg-dark-600 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => { setSelectedEmployee(employee); setShowPasswordModal(true); }}
                      className="p-2 bg-dark-600 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-blue-500"
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(employee)}
                      className={`p-2 bg-dark-600 rounded-lg hover:bg-dark-500 ${
                        employee.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'
                      }`}
                      title={employee.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    >
                      {employee.status === 'ACTIVE' ? <Check size={16} /> : <AlertCircle size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className="p-2 bg-dark-600 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-dark-800">
              <h3 className="text-white font-semibold text-lg">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">First Name *</label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="employee@example.com"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Password *</label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Phone</label>
                <input
                  type="text"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Sidebar Permissions</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectAllPermissions(true)}
                      className="text-xs text-blue-500 hover:text-blue-400"
                    >
                      Select All
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={() => deselectAllPermissions(true)}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-dark-700 rounded-lg p-3">
                  {sidebarOptions.map(option => (
                    <label key={option.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEmployee.sidebarPermissions[option.key] || false}
                        onChange={(e) => setNewEmployee({
                          ...newEmployee,
                          sidebarPermissions: {...newEmployee.sidebarPermissions, [option.key]: e.target.checked}
                        })}
                        className="w-4 h-4 rounded border-gray-600 bg-dark-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEmployee}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Create Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-dark-800">
              <h3 className="text-white font-semibold text-lg">Edit Employee</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">First Name</label>
                  <input
                    type="text"
                    value={selectedEmployee.firstName}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Last Name</label>
                  <input
                    type="text"
                    value={selectedEmployee.lastName}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Email (cannot be changed)</label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  disabled
                  className="w-full bg-dark-600 border border-gray-700 rounded-lg px-3 py-2 text-gray-400"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Phone</label>
                <input
                  type="text"
                  value={selectedEmployee.phone || ''}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, phone: e.target.value})}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Sidebar Permissions</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectAllPermissions(false)}
                      className="text-xs text-blue-500 hover:text-blue-400"
                    >
                      Select All
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={() => deselectAllPermissions(false)}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-dark-700 rounded-lg p-3">
                  {sidebarOptions.map(option => (
                    <label key={option.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmployee.sidebarPermissions?.[option.key] || false}
                        onChange={(e) => setSelectedEmployee({
                          ...selectedEmployee,
                          sidebarPermissions: {...selectedEmployee.sidebarPermissions, [option.key]: e.target.checked}
                        })}
                        className="w-4 h-4 rounded border-gray-600 bg-dark-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">Reset Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); }} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-gray-400 text-sm">
                Reset password for: <span className="text-white">{selectedEmployee.email}</span>
              </p>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => { setShowPasswordModal(false); setNewPassword(''); }}
                className="flex-1 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminEmployeeManagement
