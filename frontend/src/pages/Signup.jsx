import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { X, Mail, ChevronDown, Search, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react'
import { signup } from '../api/auth'

const API_URL = 'http://localhost:5001/api'

// OTP Input Component
const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputRefs = useRef([])
  
  const handleChange = (index, e) => {
    const val = e.target.value
    if (val.length > 1) return
    
    const newOtp = value.split('')
    newOtp[index] = val
    onChange(newOtp.join(''))
    
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    onChange(pastedData)
  }
  
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold bg-dark-600 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green transition-colors"
        />
      ))}
    </div>
  )
}

const countries = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
]

const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')
  const [activeTab, setActiveTab] = useState('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const dropdownRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: ''
  })
  
  // OTP verification states
  const [otpRequired, setOtpRequired] = useState(false)
  const [checkingSettings, setCheckingSettings] = useState(true)
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  
  // Check if OTP is required on mount
  useEffect(() => {
    const checkSignupSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/signup-settings`)
        const data = await res.json()
        setOtpRequired(data.otpRequired)
      } catch (error) {
        console.error('Error checking signup settings:', error)
        setOtpRequired(false)
      }
      setCheckingSettings(false)
    }
    checkSignupSettings()
  }, [])
  
  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])
  
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  )

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setFormData({ ...formData, countryCode: country.code })
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Send OTP to email
  const sendOtp = async () => {
    setSendingOtp(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/send-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, firstName: formData.firstName })
      })
      const data = await res.json()
      if (res.ok) {
        setStep('otp')
        setResendTimer(60)
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    }
    setSendingOtp(false)
  }

  // Verify OTP and complete signup
  const verifyOtpAndSignup = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`${API_URL}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp })
      })
      const data = await res.json()
      
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Register referral if referral code exists
        if (referralCode && data.user?._id) {
          try {
            await fetch(`${API_URL}/ib/register-referral`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user._id,
                referralCode: referralCode
              })
            })
          } catch (refError) {
            console.error('Error registering referral:', refError)
          }
        }
        
        if (isMobile) {
          navigate('/mobile')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // If OTP is required, send OTP first
    if (otpRequired) {
      await sendOtp()
      return
    }
    
    // Direct signup without OTP
    setLoading(true)
    try {
      const response = await signup(formData)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Register referral if referral code exists
      if (referralCode && response.user?._id) {
        try {
          await fetch(`${API_URL}/ib/register-referral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: response.user._id,
              referralCode: referralCode
            })
          })
          console.log('Referral registered:', referralCode)
        } catch (refError) {
          console.error('Error registering referral:', refError)
        }
      }
      
      // Redirect to mobile view on mobile devices
      if (isMobile) {
        navigate('/mobile')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl" />
      
      {/* Modal */}
      <div className="relative bg-dark-700 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-gray-800 mx-4 sm:mx-0">
        {/* Close button */}
        <button className="absolute top-4 right-4 w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center hover:bg-dark-500 transition-colors">
          <X size={16} className="text-gray-400" />
        </button>

        {/* Tabs */}
        <div className="flex bg-dark-600 rounded-full p-1 w-fit mb-8">
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'signup' ? 'bg-dark-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign up
          </button>
          <Link
            to="/user/login"
            className="px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white mb-6">
          {step === 'otp' ? 'Verify your email' : 'Create an account'}
        </h1>

        {/* OTP Verification Step */}
        {step === 'otp' ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">We sent a verification code to</p>
              <p className="text-white font-medium">{formData.email}</p>
            </div>
            
            <OTPInput value={otp} onChange={setOtp} />
            
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <button
              type="button"
              onClick={verifyOtpAndSignup}
              disabled={loading || otp.length !== 6}
              className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setError('') }}
                className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendTimer > 0 || sendingOtp}
                className="text-gray-400 hover:text-white text-sm disabled:opacity-50"
              >
                {sendingOtp ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <input
            type="text"
            name="firstName"
            placeholder="Enter your name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full bg-dark-600 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
          />

          {/* Email field */}
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          {/* Phone field with country selector */}
          <div className="flex relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center gap-1 sm:gap-2 bg-dark-600 border border-gray-700 rounded-l-lg px-2 sm:px-3 py-3 border-r-0 hover:bg-dark-500 transition-colors min-w-[70px] sm:min-w-[90px]"
            >
              <span className="text-base sm:text-lg">{selectedCountry.flag}</span>
              <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">{selectedCountry.code}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            
            {/* Country Dropdown */}
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-dark-600 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-gray-700">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full bg-dark-700 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>
                {/* Country List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredCountries.map((country, index) => (
                    <button
                      key={`${country.code}-${index}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-dark-500 transition-colors text-left"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-white text-sm flex-1">{country.name}</span>
                      <span className="text-gray-500 text-sm">{country.code}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-3">No countries found</p>
                  )}
                </div>
              </div>
            )}
            
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="flex-1 bg-dark-600 border border-gray-700 rounded-r-lg px-3 sm:px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors min-w-0"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-dark-600 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || sendingOtp}
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sendingOtp ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Sending OTP...
              </>
            ) : loading ? 'Creating account...' : otpRequired ? 'Continue' : 'Create an account'}
          </button>
        </form>
        )}

        {/* Terms */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-white hover:underline">Terms & Service</a>
        </p>
      </div>
    </div>
  )
}

export default Signup
