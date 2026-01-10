'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/SupabaseContext';
import loginImg from '@/app/assets/images/loginImg.png';
import loginLeftArrowIcon from '@/app/assets/images/loginArrowIcon.svg';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  
  // Log Supabase client info for debugging
  useEffect(() => {
    console.log('ResetPasswordPage: Supabase client available');
  }, []);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if there's a valid session (token from email link)
    const checkSession = async () => {
      try {
        // Check for hash parameters in URL (Supabase redirects with hash)
        const hash = window.location.hash;
        
        if (hash && hash.includes('access_token')) {
          // Supabase hash format: #access_token=...&type=recovery&...
          // Extract and handle the hash to create session
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          console.log('Found hash in URL:', { accessToken: !!accessToken, type });
          
          // If it's a recovery token, Supabase should automatically handle it
          // Wait for Supabase to process the hash
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get session after hash processing
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            setError(`Session error: ${error.message}`);
            setIsValidSession(false);
            return;
          }
          
          if (session) {
            console.log('Session created successfully');
            setIsValidSession(true);
            // Clear the hash from URL for cleaner UX
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.error('No session after processing hash');
            setError('Invalid or expired reset link. The link may have expired. Please request a new password reset.');
            setIsValidSession(false);
          }
        } else {
          // Check if we already have a session (user refreshed page after successful reset)
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            setIsValidSession(true);
          } else {
            console.error('No hash found in URL and no existing session');
            setError('Invalid reset link. Please use the link from your email to reset your password.');
            setIsValidSession(false);
          }
        }
      } catch (err: any) {
        console.error('Error checking session:', err);
        setError('An error occurred while verifying the reset link. Please try again.');
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [supabase]);

  const handleBack = () => {
    router.push('/forgot-password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      console.log('Starting password reset process...');
      
      // Verify we still have a valid session before updating password
      console.log('Checking session before password update...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error before password update:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error('No session available for password update');
        throw new Error('Your reset session has expired. Please request a new password reset link.');
      }

      console.log('Session valid, updating password...', {
        userId: session.user.id,
        email: session.user.email,
        accessToken: session.access_token ? 'present' : 'missing',
        tokenExpiry: new Date(session.expires_at! * 1000).toISOString()
      });

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.error('Session token has expired');
        throw new Error('Your reset session has expired. Please request a new password reset link.');
      }

      console.log('Calling updateUser API...');
      
      // Update password with timeout handling
      const updatePromise = supabase.auth.updateUser({
        password: newPassword,
      });

      // Add timeout to prevent hanging (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error('Password update request timed out after 30 seconds');
          reject(new Error('Password update request timed out. Please check your network connection and try again.'));
        }, 30000);
      });

      console.log('Waiting for updateUser response...');
      const result = await Promise.race([updatePromise, timeoutPromise]);
      const { data, error } = result as any;
      
      console.log('updateUser response received:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('Password update error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Password updated successfully:', data);

      setMessage('Password reset successfully! Redirecting to login...');
      
      // Note: We don't sign out here because:
      // 1. The user should remain logged in with their new password
      // 2. The reset session is temporary and will expire naturally
      // 3. If they want to log out, they can use the logout button
      
      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        console.log('Redirecting to login page...');
        router.push('/?message=Password reset successfully');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      console.error('Error type:', typeof error);
      console.error('Error stack:', error?.stack);
      
      // More detailed error message
      let errorMessage = 'Failed to reset password. ';
      if (error?.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please try again or request a new reset link.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isValidSession === null) {
    // Still checking session
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Checking reset link...</div>
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    // Invalid session, show error
    return (
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerLogo}>
              <div className={styles.logoSmall}>K</div>
              <div className={styles.headerBrand}>
                <div className={styles.brandName}>Keco Studio</div>
                <div className={styles.brandSlogan}>for game designers</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.formSide}>
              <button 
                className={styles.backBtn} 
                aria-label="Back"
                onClick={handleBack}
              >
                <Image src={loginLeftArrowIcon} alt="Back" width={20} height={20} />
              </button>
              
              <h1 className={styles.title}>Reset Password</h1>

              <div className={styles.error}>{error}</div>
              
              <button 
                className={styles.submit}
                onClick={() => router.push('/forgot-password')}
              >
                Request New Reset Link
              </button>
            </div>

            <div className={styles.imageSide}>
              <Image
                src={loginImg}
                alt="Auth illustration"
                fill
                className={styles.image}
                priority
                sizes="(max-width: 960px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLogo}>
            <div className={styles.logoSmall}>K</div>
            <div className={styles.headerBrand}>
              <div className={styles.brandName}>Keco Studio</div>
              <div className={styles.brandSlogan}>for game designers</div>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* Empty for now, can add icons later */}
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.formSide}>
            <button 
              className={styles.backBtn} 
              aria-label="Back"
              onClick={handleBack}
            >
              <Image src={loginLeftArrowIcon} alt="Back" width={20} height={20} />
            </button>
            
            <h1 className={styles.title}>Forgot Your Password</h1>

            {/* Step Indicator */}
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${styles.stepInactive}`}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>Verify</span>
              </div>
              <div className={`${styles.step} ${styles.stepActive}`}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>Change password</span>
              </div>
            </div>

            {/* Change Password Form */}
            <form className={styles.form} onSubmit={handleResetPassword}>
              <label className={styles.label}>
                New password
                <input
                  className={styles.input}
                  type="password"
                  placeholder="type your new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              
              <label className={styles.label}>
                Confirm password
                <input
                  className={styles.input}
                  type="password"
                  placeholder="type your confirm password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>

              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              <button 
                type="submit" 
                className={styles.submit} 
                disabled={!newPassword || !confirmPassword || loading}
              >
                {loading ? 'Resetting...' : 'Confirm'}
              </button>
            </form>
          </div>

          <div className={styles.imageSide}>
            <Image
              src={loginImg}
              alt="Auth illustration"
              fill
              className={styles.image}
              priority
              sizes="(max-width: 960px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

