import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  adminGetMobile,
  adminRegisterMobile,
  adminUpdateMobile,
  adminRequestOtp,
  adminChangePassword,
} from '../../lib/api';

export function AdminSettings() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your account security and authentication</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <MobileSection />
        <PasswordSection />
      </div>
    </div>
  );
}

/* ─────────────── Mobile Number Section ─────────────── */
function MobileSection() {
  const { user } = useAuth();
  const [mobile, setMobile] = useState('');
  const [currentMobile, setCurrentMobile] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'register' | 'update'>('register');

  // Load current mobile on mount
  useState(() => {
    if (loaded) return;
    adminGetMobile()
      .then((res) => {
        if (res.mobile) {
          setCurrentMobile(res.mobile);
          setMode('update');
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  });

  const clearMessages = () => { setSuccess(''); setError(''); };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      await adminRegisterMobile(mobile);
      setCurrentMobile(mobile);
      setMode('update');
      setMobile('');
      setSuccess('Mobile number registered successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register mobile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!/^[6-9]\d{9}$/.test(newMobile)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password) {
      setError('Current password is required to change mobile number');
      return;
    }
    setLoading(true);
    try {
      await adminUpdateMobile(newMobile, password);
      setCurrentMobile(newMobile);
      setNewMobile('');
      setPassword('');
      setSuccess('Mobile number updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mobile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
          <Phone size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-[0.02em]">Authentication Mobile</h2>
          <p className="text-[11px] text-muted-foreground">Used for OTP verification when changing password</p>
        </div>
      </div>

      <div className="p-6">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2.5 rounded-md text-xs mb-4">
            <CheckCircle size={14} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-md text-xs mb-4">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {currentMobile && (
          <div className="mb-5 px-4 py-3 bg-foreground/[0.03] rounded-md">
            <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-medium mb-1">Current Number</p>
            <p className="text-sm font-semibold tracking-wide">+91 {currentMobile.slice(0,5)} {currentMobile.slice(5)}</p>
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-xs text-muted-foreground rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Register Mobile Number
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                New Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-xs text-muted-foreground rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter new 10-digit number"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Required to verify your identity</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Update Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Change Password Section ─────────────── */
function PasswordSection() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const clearMessages = () => { setSuccess(''); setError(''); };

  const handleRequestOtp = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await adminRequestOtp();
      setOtpSent(true);
      setStep('verify');
      // In dev mode, auto-fill the OTP if returned by backend
      if (res.devOtp) {
        setOtp(res.devOtp);
      }
      setSuccess(res.message || 'OTP sent to your registered mobile number');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Make sure you have a registered mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await adminChangePassword(otp, newPassword);
      setSuccess('Password changed successfully!');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('request');
      setOtpSent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
          <Lock size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-[0.02em]">Change Password</h2>
          <p className="text-[11px] text-muted-foreground">OTP will be sent to your registered mobile</p>
        </div>
      </div>

      <div className="p-6">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2.5 rounded-md text-xs mb-4">
            <CheckCircle size={14} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-md text-xs mb-4">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {step === 'request' ? (
          <div className="space-y-4">
            <div className="px-4 py-4 bg-foreground/[0.02] rounded-md border border-gray-50">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium mb-1">Secure Password Change</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    To change your password, we'll send a one-time verification code (OTP) to your registered mobile number. 
                    Make sure you have registered a mobile number first.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Send OTP to Mobile
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm tracking-[0.3em] text-center font-mono"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-[10px] text-muted-foreground">Check your registered mobile</p>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[10px] text-foreground underline hover:opacity-70 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('request'); setOtp(''); setOtpSent(false); clearMessages(); }}
                className="flex-1 py-2.5 border border-gray-200 text-foreground text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:bg-foreground/[0.03] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
