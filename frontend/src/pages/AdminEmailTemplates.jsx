import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { 
  Mail, 
  Save,
  Eye,
  Send,
  RefreshCw,
  Check,
  X,
  Edit3,
  FileText,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

const API_URL = 'http://localhost:5001/api'

const templateDescriptions = {
  signup_otp: 'Sent when user requests OTP during signup',
  login_otp: 'Sent when user requests OTP during login',
  deposit_request: 'Sent when user submits a deposit request',
  deposit_approved: 'Sent when admin approves a deposit',
  deposit_rejected: 'Sent when admin rejects a deposit',
  withdrawal_request: 'Sent when user submits a withdrawal request',
  withdrawal_approved: 'Sent when admin approves a withdrawal',
  withdrawal_rejected: 'Sent when admin rejects a withdrawal',
  account_banned: 'Sent when admin permanently bans an account',
  account_blocked: 'Sent when admin temporarily blocks an account',
  account_unblocked: 'Sent when admin unblocks an account',
  welcome: 'Sent after successful registration',
  password_reset: 'Sent when admin resets user password',
  kyc_approved: 'Sent when KYC is approved',
  kyc_rejected: 'Sent when KYC is rejected'
}

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [settings, setSettings] = useState({
    signupOtpEnabled: true,
    loginOtpEnabled: false,
    welcomeEmailEnabled: true,
    depositNotificationsEnabled: true,
    withdrawalNotificationsEnabled: true,
    accountStatusNotificationsEnabled: true
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchSettings()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/email-templates`)
      const data = await res.json()
      if (data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setMessage({ type: 'error', text: 'Failed to fetch email templates' })
    }
    setLoading(false)
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/email-templates/settings`)
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSetting = async (key, value) => {
    setSavingSettings(true)
    try {
      const res = await fetch(`${API_URL}/email-templates/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      })
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
        setMessage({ type: 'success', text: 'Setting updated successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update setting' })
    }
    setSavingSettings(false)
  }

  const toggleTemplate = async (templateId) => {
    try {
      const res = await fetch(`${API_URL}/email-templates/${templateId}/toggle`, {
        method: 'PUT'
      })
      const data = await res.json()
      if (data.template) {
        setMessage({ type: 'success', text: data.message })
        fetchTemplates()
        if (selectedTemplate?._id === templateId) {
          setSelectedTemplate(data.template)
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle template' })
    }
  }

  const selectTemplate = (template) => {
    setSelectedTemplate(template)
    setEditedSubject(template.subject)
    setEditedContent(template.htmlContent)
    setEditMode(false)
    setPreviewMode(false)
  }

  const saveTemplate = async () => {
    if (!selectedTemplate) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/email-templates/${selectedTemplate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editedSubject,
          htmlContent: editedContent
        })
      })
      const data = await res.json()
      if (data.template) {
        setMessage({ type: 'success', text: 'Template saved successfully' })
        setSelectedTemplate(data.template)
        setEditMode(false)
        fetchTemplates()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save template' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving template' })
    }
    setSaving(false)
  }

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return
    setSendingTest(true)
    try {
      const res = await fetch(`${API_URL}/email-templates/${selectedTemplate._id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })
      const data = await res.json()
      if (data.messageId) {
        setMessage({ type: 'success', text: 'Test email sent successfully!' })
        setTestEmail('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send test email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending test email' })
    }
    setSendingTest(false)
  }

  const resetTemplate = async (templateName) => {
    if (!confirm('Reset this template to default? Your changes will be lost.')) return
    try {
      const res = await fetch(`${API_URL}/email-templates/reset/${templateName}`, {
        method: 'POST'
      })
      const data = await res.json()
      setMessage({ type: 'success', text: data.message })
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error resetting template' })
    }
  }

  const formatTemplateName = (name) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-accent-green" />
            <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          </div>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Email Settings */}
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-accent-green" />
            <h2 className="text-lg font-semibold text-white">Email Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Signup OTP Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Signup OTP Verification</p>
                <p className="text-xs text-gray-400">Require email OTP for new signups</p>
              </div>
              <button
                onClick={() => updateSetting('signupOtpEnabled', !settings.signupOtpEnabled)}
                disabled={savingSettings}
                className="focus:outline-none"
              >
                {settings.signupOtpEnabled ? (
                  <ToggleRight className="w-10 h-10 text-accent-green" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-500" />
                )}
              </button>
            </div>

            {/* Welcome Email Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Welcome Email</p>
                <p className="text-xs text-gray-400">Send welcome email after signup</p>
              </div>
              <button
                onClick={() => updateSetting('welcomeEmailEnabled', !settings.welcomeEmailEnabled)}
                disabled={savingSettings}
                className="focus:outline-none"
              >
                {settings.welcomeEmailEnabled ? (
                  <ToggleRight className="w-10 h-10 text-accent-green" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-500" />
                )}
              </button>
            </div>

            {/* Deposit Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Deposit Notifications</p>
                <p className="text-xs text-gray-400">Email alerts for deposits</p>
              </div>
              <button
                onClick={() => updateSetting('depositNotificationsEnabled', !settings.depositNotificationsEnabled)}
                disabled={savingSettings}
                className="focus:outline-none"
              >
                {settings.depositNotificationsEnabled ? (
                  <ToggleRight className="w-10 h-10 text-accent-green" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-500" />
                )}
              </button>
            </div>

            {/* Withdrawal Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Withdrawal Notifications</p>
                <p className="text-xs text-gray-400">Email alerts for withdrawals</p>
              </div>
              <button
                onClick={() => updateSetting('withdrawalNotificationsEnabled', !settings.withdrawalNotificationsEnabled)}
                disabled={savingSettings}
                className="focus:outline-none"
              >
                {settings.withdrawalNotificationsEnabled ? (
                  <ToggleRight className="w-10 h-10 text-accent-green" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-500" />
                )}
              </button>
            </div>

            {/* Account Status Notifications Toggle */}
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div>
                <p className="text-white font-medium">Account Status Emails</p>
                <p className="text-xs text-gray-400">Ban/block notifications</p>
              </div>
              <button
                onClick={() => updateSetting('accountStatusNotificationsEnabled', !settings.accountStatusNotificationsEnabled)}
                disabled={savingSettings}
                className="focus:outline-none"
              >
                {settings.accountStatusNotificationsEnabled ? (
                  <ToggleRight className="w-10 h-10 text-accent-green" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Templates</h2>
              <p className="text-sm text-gray-400 mt-1">Select a template to edit</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : templates.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No templates found</div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template._id}
                    className={`p-4 border-b border-gray-800 hover:bg-dark-700 transition-colors ${
                      selectedTemplate?._id === template._id ? 'bg-dark-700 border-l-4 border-l-accent-green' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => selectTemplate(template)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <FileText className={`w-5 h-5 ${template.isActive ? 'text-accent-green' : 'text-gray-500'}`} />
                        <div>
                          <p className={`font-medium ${template.isActive ? 'text-white' : 'text-gray-500'}`}>{formatTemplateName(template.name)}</p>
                          <p className="text-xs text-gray-500 mt-1">{templateDescriptions[template.name] || template.name}</p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleTemplate(template._id)
                        }}
                        className="ml-2 focus:outline-none"
                        title={template.isActive ? 'Disable template' : 'Enable template'}
                      >
                        {template.isActive ? (
                          <ToggleRight className="w-8 h-8 text-accent-green" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
            {selectedTemplate ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{formatTemplateName(selectedTemplate.name)}</h2>
                    <p className="text-sm text-gray-400">{templateDescriptions[selectedTemplate.name]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        previewMode ? 'bg-accent-green text-black' : 'bg-dark-700 text-white hover:bg-dark-600'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        editMode ? 'bg-blue-600 text-white' : 'bg-dark-700 text-white hover:bg-dark-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-dark-900 rounded-lg text-white">{selectedTemplate.subject}</p>
                    )}
                  </div>

                  {/* Variables */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Available Variables</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables?.map((v) => (
                        <span key={v} className="px-2 py-1 bg-dark-700 text-accent-green text-xs rounded font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {previewMode ? 'Preview' : 'HTML Content'}
                    </label>
                    {previewMode ? (
                      <div 
                        className="bg-white rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: editMode ? editedContent : selectedTemplate.htmlContent }}
                      />
                    ) : editMode ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={15}
                        className="w-full px-4 py-2 bg-dark-700 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-accent-green"
                      />
                    ) : (
                      <pre className="px-4 py-2 bg-dark-900 rounded-lg text-gray-300 text-sm overflow-auto max-h-[300px] font-mono whitespace-pre-wrap">
                        {selectedTemplate.htmlContent}
                      </pre>
                    )}
                  </div>

                  {/* Actions */}
                  {editMode && (
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                      <button
                        onClick={saveTemplate}
                        disabled={saving}
                        className="px-4 py-2 bg-accent-green text-black font-medium rounded-lg hover:bg-accent-green/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditedSubject(selectedTemplate.subject)
                          setEditedContent(selectedTemplate.htmlContent)
                          setEditMode(false)
                        }}
                        className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => resetTemplate(selectedTemplate.name)}
                        className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors ml-auto"
                      >
                        Reset to Default
                      </button>
                    </div>
                  )}

                  {/* Test Email */}
                  <div className="pt-4 border-t border-gray-800">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Send Test Email</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 px-4 py-2 bg-dark-700 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green"
                      />
                      <button
                        onClick={sendTestEmail}
                        disabled={!testEmail || sendingTest}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Test
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a template to view and edit</p>
                <p className="text-sm mt-2">Click on any template from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEmailTemplates
