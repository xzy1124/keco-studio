"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import loginImg from "@/app/assets/images/loginImg.png";
import { useSupabase } from "@/lib/SupabaseContext";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register";

type RegisterState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

type LoginState = {
  email: string;
  password: string;
};

export default function AuthForm() {
  const supabase = useSupabase();
  const [mode, setMode] = useState<Mode>("login");
  const [regForm, setRegForm] = useState<RegisterState>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState<LoginState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage(null);
    setErrorMsg(null);
  };

  const updateReg =
    (key: keyof RegisterState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setRegForm((p) => ({ ...p, [key]: e.target.value }));

  const updateLogin =
    (key: keyof LoginState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setLoginForm((p) => ({ ...p, [key]: e.target.value }));

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    const { email, username, password, confirmPassword } = regForm;
    if (!email || !username || !password) {
      setErrorMsg("Email、用户名和密码不能为空");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("两次密码输入不一致");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      setMessage("注册成功，已自动同步 profiles");
    } catch (err: any) {
      setErrorMsg(err?.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    const { email, password } = loginForm;
    if (!email || !password) {
      setErrorMsg("Email 和密码不能为空");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage("登录成功");
    } catch (err: any) {
      setErrorMsg(err?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.formSide}>
          <button className={styles.backBtn} aria-label="Back">
            ←
          </button>

          <div className={styles.logo}>K</div>
          <h1 className={styles.title}>{isRegister ? "REGISTER" : "LOGIN"}</h1>

          {isRegister ? (
            <form className={styles.form} onSubmit={handleRegister} autoComplete="off">
              {/* 隐藏的假字段来混淆浏览器自动填充 */}
              <input type="text" name="fake-email" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="fake-password" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  name="reg-email-input"
                  type="text"
                  inputMode="email"
                  placeholder="type your email..."
                  autoComplete="off"
                  value={regForm.email}
                  onChange={updateReg("email")}
                  required
                />
              </label>
              <label className={styles.label}>
                Username
                <input
                  className={styles.input}
                  name="reg-username-input"
                  type="text"
                  placeholder="type your username..."
                  autoComplete="off"
                  value={regForm.username}
                  onChange={updateReg("username")}
                  required
                />
              </label>
              <label className={styles.label}>
                Password
                <input
                  className={styles.input}
                  name="reg-password-input"
                  type="password"
                  placeholder="type your password..."
                  autoComplete="new-password"
                  value={regForm.password}
                  onChange={updateReg("password")}
                  required
                />
              </label>
              <label className={styles.label}>
                Confirm Password
                <input
                  className={styles.input}
                  name="reg-confirm-password-input"
                  type="password"
                  placeholder="type your confirm password..."
                  autoComplete="new-password"
                  value={regForm.confirmPassword}
                  onChange={updateReg("confirmPassword")}
                  required
                />
              </label>
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleLogin} autoComplete="off">
              {/* 隐藏的假字段来混淆浏览器自动填充 */}
              <input type="text" name="fake-username" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="fake-password" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
              
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  name="login-email-input"
                  type="text"
                  inputMode="email"
                  placeholder="type your email..."
                  autoComplete="off"
                  value={loginForm.email}
                  onChange={updateLogin("email")}
                  required
                />
              </label>
              <label className={styles.label}>
                Password
                <input
                  className={styles.input}
                  name="login-password-input"
                  type="password"
                  placeholder="type your password..."
                  autoComplete="new-password"
                  value={loginForm.password}
                  onChange={updateLogin("password")}
                  required
                />
              </label>
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
          {message ? <div className={styles.success}>{message}</div> : null}

          <div className={styles.footer}>
            {isRegister ? (
              <>
                <span className={styles.muted}>Have an account?</span>
                <button className={styles.link} type="button" onClick={() => switchMode("login")}>
                  Login Now
                </button>
              </>
            ) : (
              <>
                <span className={styles.muted}>Don’t have an account?</span>
                <button className={styles.link} type="button" onClick={() => switchMode("register")}>
                  Sign Up Now
                </button>
              </>
            )}
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
  );
}


