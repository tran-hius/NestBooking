import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authService } from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAppStore } from "@/stores/useAppStore";
import HeaderBanner from "@/assets/HeaderBanner.jpg";
import { toast } from "sonner";

type AuthMode = "login" | "register" | "forgot_email" | "forgot_otp" | "forgot_reset";

export default function Auth() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(location.pathname === "/register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAppStore();
  const redirect = searchParams.get("redirect") || "/";
  const isRegister = mode === "register";
  const isForgot = mode.startsWith("forgot");

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpToken("");
    const query = searchParams.toString();
    navigate(`${nextMode === "login" ? "/login" : "/register"}${query ? `?${query}` : ""}`, { replace: true });
  };

  const handleLogin = async () => {
    if (!email || !password) return toast.error(t("auth.errEmailPassword"));
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const accessToken = response.data?.tokens?.accessToken || response.data?.data?.tokens?.accessToken;
      const user = response.data?.user || response.data?.data?.user;
      if (!accessToken) throw new Error("No access token received");
      setToken(accessToken);
      if (user) setUser(user);
      toast.success(t("auth.successLogin"));
      navigate(redirect, { state: location.state, replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.errLogin"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) return toast.error(t("auth.errFillAll"));
    if (password !== confirmPassword) return toast.error(t("auth.errPasswordMismatch"));
    setLoading(true);
    try {
      const response = await authService.register({ email, password, confirmPassword });
      const receivedToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (!receivedToken) throw new Error("No OTP token received");
      toast.success(t("auth.successRegister"));
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&otpToken=${receivedToken}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.errRegister"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return toast.error(t("auth.errEmailPassword"));
    setLoading(true);
    try {
      const response = await authService.sendOtp({ email });
      const receivedToken = response.data?.data?.otpToken || response.data?.otpToken;
      if (!receivedToken) throw new Error("No OTP token received");
      setOtpToken(receivedToken);
      setMode("forgot_otp");
      toast.success(t("auth.successOtpSent"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.errSendOtp"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) return toast.error(t("auth.errFillAll"));
    if (password !== confirmPassword) return toast.error(t("auth.errPasswordMismatch"));
    setLoading(true);
    try {
      await authService.resetPassword({ otp, otpToken, newPassword: password });
      toast.success(t("auth.successPasswordReset"));
      switchMode("login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.errPasswordResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") await handleLogin();
    if (mode === "register") await handleRegister();
    if (mode === "forgot_email") await handleSendOtp();
    if (mode === "forgot_otp") {
      if (otp.length !== 6) return toast.error(t("auth.errOtpLength"));
      setMode("forgot_reset");
    }
    if (mode === "forgot_reset") await handleResetPassword();
  };

  const getTitle = (m: AuthMode) => {
    if (m === "login") return t("auth.login");
    if (m === "register") return t("auth.register");
    if (m === "forgot_email") return t("auth.forgotPassword");
    if (m === "forgot_otp") return t("auth.enterOtp");
    return t("auth.setNewPassword");
  };

  const getDescription = (m: AuthMode) => {
    if (m === "login") return t("auth.loginDesc");
    if (m === "register") return t("auth.registerDesc");
    if (m === "forgot_email") return t("auth.forgotEmailDesc");
    if (m === "forgot_otp") return t("auth.forgotOtpDesc", { email });
    return t("auth.forgotResetDesc");
  };

  const getSubmitLabel = (m: AuthMode) => {
    if (m === "login") return t("auth.submitLogin");
    if (m === "register") return t("auth.submitRegister");
    if (m === "forgot_email") return t("auth.submitSendOtp");
    if (m === "forgot_otp") return t("auth.submitConfirmOtp");
    return t("auth.submitUpdatePassword");
  };

  return (
    <div className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-slate-50">
      <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
        <section className={`relative min-h-64 overflow-hidden bg-[#05285d] transition-transform duration-700 ease-in-out lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 ${isRegister ? "lg:translate-x-full" : "lg:translate-x-0"}`}>
          <img src={HeaderBanner} alt="Vietnam travel destination" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#031b3d]/95 via-[#064c87]/75 to-[#05285d]/35" />
          <div className="absolute -right-16 top-16 h-64 w-64 rounded-full border border-white/15" />
          <div className="relative flex h-full min-h-64 flex-col justify-between p-6 text-white sm:p-10 lg:min-h-full lg:p-14 xl:p-16">
            <div className="hidden lg:block"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 backdrop-blur"><Sparkles className="h-4 w-4" />{t("auth.journeyStartsHere")}</div></div>
            <div className="max-w-lg"><h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{isRegister ? t("auth.welcomeBack") : t("auth.saveJourney")}</h2><p className="mt-4 max-w-md text-sm leading-7 text-blue-100/80 sm:text-base">{isRegister ? t("auth.loginDescLeft") : t("auth.registerDescLeft")}</p><div className="mt-6 hidden space-y-3 lg:block">{[t("auth.feature1"), t("auth.feature2"), t("auth.feature3")].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-blue-50"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{item}</div>)}</div><Button type="button" variant="outline" onClick={() => switchMode(isRegister ? "login" : "register")} className="mt-7 rounded-xl border-white/25 bg-white/10 px-6 font-bold text-white backdrop-blur hover:bg-white hover:text-[#05285d]">{isRegister ? t("auth.switchToLogin") : t("auth.createNewAccount")}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
            <div className="hidden text-xs text-blue-100/45 lg:block">{t("auth.nestbookingTagline")}</div>
          </div>
        </section>

        <section className={`flex min-h-[620px] items-center justify-center px-4 py-10 transition-transform duration-700 ease-in-out sm:px-8 lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 lg:px-12 ${isRegister ? "lg:translate-x-0" : "lg:translate-x-full"}`}>
          <div className="w-full max-w-md">
            <div className="mb-7"><div className="mb-4 flex items-center justify-between"><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">{isForgot ? <KeyRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}{isForgot ? t("auth.recoverAccount") : t("auth.customerAccount")}</div>{isForgot && <button type="button" onClick={() => switchMode("login")} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />{t("auth.backToLogin")}</button>}</div><h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{getTitle(mode)}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{getDescription(mode)}</p></div>

            {!isForgot && <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => switchMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>{t("auth.submitLogin")}</button><button type="button" onClick={() => switchMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>{t("auth.submitRegister")}</button></div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {(mode === "login" || mode === "register" || mode === "forgot_email") && <AuthField label={t("auth.emailAddress")} icon={Mail}><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full bg-transparent pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" /></AuthField>}

              {mode === "forgot_otp" && <div><div className="mb-3 flex items-center justify-between"><label className="text-sm font-bold text-foreground">{t("auth.verificationCode")}</label><button type="button" onClick={() => setMode("forgot_email")} className="text-xs font-semibold text-primary hover:underline">{t("auth.changeEmail")}</button></div><InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="w-full"><InputOTPGroup className="grid w-full grid-cols-6 gap-2">{Array.from({ length: 6 }).map((_, index) => <InputOTPSlot key={index} index={index} className="h-12 w-full rounded-xl border border-input bg-background text-lg font-bold text-foreground" />)}</InputOTPGroup></InputOTP></div>}

              {(mode === "login" || mode === "register" || mode === "forgot_reset") && <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-bold text-foreground">{mode === "forgot_reset" ? t("auth.newPassword") : t("auth.password")}</label>{mode === "login" && <button type="button" onClick={() => setMode("forgot_email")} className="text-xs font-semibold text-primary hover:underline">{t("auth.forgotPasswordLink")}</button>}</div><div className="relative rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("auth.passwordPlaceholder")} className="h-12 w-full bg-transparent pl-10 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>}

              {(mode === "register" || mode === "forgot_reset") && <AuthField label={t("auth.confirmPassword")} icon={LockKeyhole}><input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t("auth.confirmPasswordPlaceholder")} className="h-12 w-full bg-transparent pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground" /></AuthField>}

              <Button disabled={loading} className="h-12 w-full rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/15">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{getSubmitLabel(mode)}</Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">{mode === "login" ? <>{t("auth.noAccount")} <button type="button" onClick={() => switchMode("register")} className="font-bold text-primary hover:underline">{t("auth.registerNow")}</button></> : mode === "register" ? <>{t("auth.haveAccount")} <button type="button" onClick={() => switchMode("login")} className="font-bold text-primary hover:underline">{t("auth.signIn")}</button></> : null}</div>
            <div className="mt-7 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">{t("auth.privacyNote")} <Link to="/support" className="font-semibold text-primary hover:underline">{t("auth.needHelp")}</Link></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthField({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-bold text-foreground">{label}</label><div className="relative rounded-xl border border-input bg-background transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20"><Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{children}</div></div>;
}
