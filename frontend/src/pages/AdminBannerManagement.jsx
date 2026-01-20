import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { API_BASE_URL, API_URL } from '../config/api'
import { Image as ImageIcon, PlusCircle, Trash2 } from 'lucide-react'

const AdminBannerManagement = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const selectedFilePreview = useMemo(() => {
    if (!selectedFile) return null
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  const resolveImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${API_BASE_URL}${url}`
  }

  useEffect(() => {
    return () => {
      if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview)
    }
  }, [selectedFilePreview])

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser')
    if (!adminUser) {
      navigate('/admin')
      return
    }
    const parsed = JSON.parse(adminUser)
    if (parsed.role !== 'SUPER_ADMIN') {
      navigate('/admin/dashboard')
      return
    }
    fetchBanners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setBanners(data.banners || [])
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load banners' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load banners' })
    }
    setLoading(false)
  }


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setBanners(prev => prev.filter(b => b._id !== id))
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete banner' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete banner' })
    }
  }

  const handleUploadButton = () => fileInputRef.current?.click()

  const handleBannerFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    try {
      setUploadingBanner(true)
      const token = localStorage.getItem('adminToken')
      const formDataUpload = new FormData()
      formDataUpload.append('banner', file)

      const uploadRes = await fetch(`${API_URL}/upload/banner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataUpload
      })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload image')
      }

      const createRes = await fetch(`${API_URL}/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: file.name,
          subtitle: '',
          description: '',
          imageUrl: uploadData.url,
          ctaText: '',
          ctaLink: '',
          order: banners.length,
          isActive: true
        })
      })
      const createData = await createRes.json()
      if (!createData.success) {
        throw new Error(createData.message || 'Failed to create banner entry')
      }
      setMessage({ type: 'success', text: 'Banner uploaded successfully' })
      fetchBanners()
    } catch (error) {
      console.error('Banner upload error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to upload banner' })
    } finally {
      setUploadingBanner(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <AdminLayout title="Banner Management" subtitle="Create and organize homepage banners" requiredPermission="canManageBanners">
      <div className="bg-dark-800 rounded-2xl border border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-700">
          <div>
            <h2 className="text-white text-lg font-semibold">Homepage Banners</h2>
            <p className="text-gray-500 text-sm">Upload images and manage their status/order</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchBanners}
              className="px-4 py-2 text-sm text-gray-200 border border-gray-700 rounded-lg hover:bg-dark-700"
            >
              Refresh
            </button>
            <button
              onClick={handleUploadButton}
              disabled={uploadingBanner}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
            >
              <PlusCircle size={16} /> {uploadingBanner ? 'Uploading...' : 'Add Banner Image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerFileChange}
            />
          </div>
        </div>
        <div className="p-5 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {message.text}
            </div>
          )}
          {selectedFilePreview && (
            <div className="border border-gray-700 rounded-xl p-4 bg-dark-900/50">
              <p className="text-gray-400 text-sm mb-3">Selected image preview</p>
              <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-700 bg-black/30">
                <img src={selectedFilePreview} alt="Selected banner" className="w-full h-full object-cover" />
              </div>
              <p className="text-gray-500 text-xs mt-2">{selectedFile?.name}</p>
            </div>
          )}
          {loading ? (
            <p className="text-gray-500">Loading banners...</p>
          ) : banners.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 text-gray-600" />
              No banners yet. Use the button above to upload one.
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner._id} className="border border-gray-700 rounded-xl p-4 bg-dark-900/50 flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-20 rounded-lg overflow-hidden border border-gray-700 bg-black/30">
                      {banner.imageUrl ? (
                        <img src={resolveImageUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-full h-full text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">#{banner.order ?? 0}</p>
                      <h3 className="text-white font-semibold">{banner.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{banner.subtitle || banner.description}</p>
                      <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-600/20 text-gray-300'}`}>
                          {banner.isActive ? 'Active' : 'Hidden'}
                        </span>
                        {banner.ctaText && <span className="text-gray-400">CTA: {banner.ctaText}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="px-3 py-2 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminBannerManagement
