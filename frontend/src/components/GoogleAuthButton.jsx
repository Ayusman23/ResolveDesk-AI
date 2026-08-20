import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '263358758822-319m1p38k3ns8fdhcdfs32711kqp3qfa.apps.googleusercontent.com';

const GoogleAuthButton = ({ role = 'client', text = 'Continue with Google', onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gisLoaded, setGisLoaded] = useState(false);

  // Handle genuine Google Identity Services Credential response
  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      const err = 'No authentication credential returned by Google.';
      setErrorMessage(err);
      if (onError) onError(err);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await loginWithGoogle({
        credential: response.credential,
        role,
      });

      if (res?.success) {
        if (onSuccess) onSuccess(res.user);
        else {
          if (res.user.role === 'developer') navigate('/developer');
          else if (res.user.role === 'manager') navigate('/manager');
          else navigate('/client');
        }
      } else {
        const msg = res?.message || 'Google Authentication verification failed.';
        setErrorMessage(msg);
        if (onError) onError(msg);
      }
    } catch (err) {
      const msg = err?.message || 'Error communicating with authentication server.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initialize official Google Identity Services (GIS)
  useEffect(() => {
    let checkInterval = null;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: googleBtnRef.current.offsetWidth || 340,
            });
          }
        } catch (e) {
          console.warn('Google GSI initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [role]);

  // Direct official OAuth 2.0 popup trigger
  const handleDirectGoogleLogin = () => {
    setErrorMessage('');
    if (window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setLoading(false);
              const msg = `Google OAuth: ${tokenResponse.error_description || tokenResponse.error}`;
              setErrorMessage(msg);
              if (onError) onError(msg);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                  role,
                });

                if (res?.success) {
                  if (onSuccess) onSuccess(res.user);
                  else {
                    if (res.user.role === 'developer') navigate('/developer');
                    else if (res.user.role === 'manager') navigate('/manager');
                    else navigate('/client');
                  }
                } else {
                  const msg = res?.message || 'Google OAuth verification failed on server.';
                  setErrorMessage(msg);
                  if (onError) onError(msg);
                }
              } catch (err) {
                const msg = err?.message || 'Server error verifying Google token.';
                setErrorMessage(msg);
                if (onError) onError(msg);
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setLoading(false);
        // Fallback to prompt
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      }
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setErrorMessage('Google Identity Services client is still loading. Please try again in a moment.');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Official Google Sign-In Button Container */}
      <div className="w-full flex justify-center">
        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
      </div>

      {/* Alternative Direct Trigger Button */}
      <button
        type="button"
        onClick={handleDirectGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-lg border border-white/[0.09] bg-[#080A10] hover:bg-white/[0.04] text-[#EDF1F7] text-[13px] font-mono font-medium transition-all cursor-pointer shadow-sm hover:border-[#22E6B8]/30 group disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 text-[#22E6B8] animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
        )}
        <span>{loading ? 'Authenticating with Google...' : text}</span>
      </button>

      {/* Real-time Error Notification */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-[#FF5C6C]/10 border border-[#FF5C6C]/30 flex items-center space-x-2 text-[11.5px] font-mono text-[#FF5C6C] animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
