import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = '263358758822-5uiiebkt7gvrtr6njkls117r03j6fkmk.apps.googleusercontent.com';

const GoogleAuthButton = ({ role = 'client', text = 'Continue with Google', onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      setLoading(true);
      try {
        const res = await loginWithGoogle(response.credential, null, role);
        if (res.success) {
          if (onSuccess) onSuccess(res.user);
          else {
            if (res.user.role === 'developer') navigate('/developer');
            else if (res.user.role === 'manager') navigate('/manager');
            else navigate('/client');
          }
        } else {
          if (onError) onError(res.message);
        }
      } catch (err) {
        if (onError) onError(err.message || 'Google Auth Error');
      } finally {
        setLoading(false);
      }
    };

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 340,
            text: text === 'Sign up with Google' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      } catch (err) {
        console.warn('Google Identity Initialization Warning:', err);
      }
    }
  }, [role, text, loginWithGoogle, navigate, onSuccess, onError]);

  // Fallback simulator click
  const handleSimulatedGoogleClick = async () => {
    setLoading(true);
    // If real Google prompt available, trigger prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Direct mock payload for local test
      const sampleEmail = `user.${Math.random().toString(36).substring(2, 7)}@gmail.com`;
      const res = await loginWithGoogle(null, {
        name: 'Google Enterprise User',
        email: sampleEmail,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      }, role);
      if (res.success) {
        if (onSuccess) onSuccess(res.user);
        else {
          if (res.user.role === 'developer') navigate('/developer');
          else if (res.user.role === 'manager') navigate('/manager');
          else navigate('/client');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      {/* Official Google Button Render Target */}
      <div ref={googleBtnRef} className="w-full flex justify-center min-h-[42px]">
        {/* Styled Fallback Google Button while loading or if script is delayed */}
        <button
          type="button"
          onClick={handleSimulatedGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Authenticating with Google...' : text}</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthButton;
