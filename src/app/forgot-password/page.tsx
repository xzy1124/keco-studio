'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import loginImg from '@/app/assets/images/loginImg.png';
import loginLeftArrowIcon from '@/app/assets/images/loginArrowIcon.svg';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleBack = () => {
    router.push('/');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement verify code logic
    // After successful verification, move to step 2
    // setStep('change');
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
  };

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
              <div className={`${styles.step} ${step === 'verify' ? styles.stepActive : styles.stepInactive}`}>
                <span className={styles.stepNumber}>①</span>
                <span className={styles.stepText}>Verify</span>
              </div>
              <div className={`${styles.step} ${step === 'change' ? styles.stepActive : styles.stepInactive}`}>
                <span className={styles.stepNumber}>②</span>
                <span className={styles.stepText}>Change password</span>
              </div>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleVerifyCode}>
              <label className={styles.label}>
                Email or username
                <input
                  className={styles.input}
                  type="text"
                  placeholder="type your email or username..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              
              <label className={styles.label}>
                Code
                <input
                  className={styles.input}
                  type="text"
                  placeholder="type your code..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className={styles.submit} disabled={!email || !code}>
                Verify code
              </button>
            </form>

            {/* Resend Code Link */}
            <div className={styles.resendSection}>
              <span className={styles.resendText}>don't receive the code?</span>
              <button 
                type="button" 
                className={styles.resendLink}
                onClick={handleResendCode}
              >
                Resend code
              </button>
            </div>
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

