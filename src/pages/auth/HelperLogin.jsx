import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { Camera, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, MapPin, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function HelperLogin() {
  const { user, loading } = useAuth();
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/helper/home" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate("/helper/home");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setSubmitting(true);
    setError("");
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || "Sign up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate("/helper/home");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid code. Please check your email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-600/8 blur-[80px]" />
      </div>

      {/* Left feature panel */}
      <div className="relative hidden w-[45%] flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-emerald-400">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div>
          <div className="mb-8 inline-flex rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
            <Camera className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black leading-tight text-white">
            Report issues,<br />
            <span className="text-emerald-400">build better cities.</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Snap a photo, drop a pin, and let us handle the rest. Your reports reach the right workers within minutes.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Camera, label: "Geo-tagged photo capture" },
              { icon: MapPin, label: "Real-time status tracking" },
              { icon: Zap, label: "AI-powered categorization" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-xs leading-relaxed text-slate-400">
                Free to join. Your reports are anonymous by default. Help make your city better today.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700">CivicSense &mdash; Community first.</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile back link */}
          <Link to="/" className="mb-6 flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-white lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 lg:hidden inline-flex rounded-xl bg-emerald-500/10 p-2.5 ring-1 ring-emerald-500/20">
                <Camera className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {verifying ? "Check your inbox" : tab === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {verifying
                  ? `We sent a 6-digit code to ${email}`
                  : tab === "login"
                    ? "Sign in to your citizen account"
                    : "Join CivicSense for free"}
              </p>
            </div>

            {/* Tabs */}
            {!verifying && (
              <div className="mb-6 flex rounded-xl border border-white/8 bg-white/[0.03] p-1">
                {["login", "signup"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      tab === t
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Google OAuth */}
            {!verifying && (
              <>
                <GoogleButton onClick={() => signIn.authenticateWithRedirect({
                  strategy: "oauth_google",
                  redirectUrl: "/sso-callback",
                  redirectUrlComplete: "/",
                })} />
                <Divider />
              </>
            )}

            {/* Forms */}
            {verifying ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <FormField
                  label="Verification code"
                  type="text"
                  value={code}
                  onChange={setCode}
                  placeholder="Enter 6-digit code"
                  color="emerald"
                />
                <SubmitButton loading={submitting} color="emerald">
                  Verify Email
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => { setVerifying(false); setCode(""); setError(""); }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Back to sign up
                </button>
              </form>
            ) : tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" color="emerald" />
                <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} color="emerald" />
                <SubmitButton loading={submitting} color="emerald">Sign In</SubmitButton>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <FormField label="Full name" type="text" value={name} onChange={setName} placeholder="Your full name" color="emerald" />
                <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" color="emerald" />
                <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} color="emerald" />
                <SubmitButton loading={submitting} color="emerald">Create Account</SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );
}

function GoogleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:text-white cursor-pointer"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-xs text-slate-600">or</span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FormField({ label, type, value, onChange, placeholder, color }) {
  const focusBorder = { emerald: "focus:border-emerald-500", amber: "focus:border-amber-500", indigo: "focus:border-indigo-500" };
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors ${focusBorder[color]} focus:ring-0`}
        required
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, color }) {
  const focusBorder = { emerald: "focus:border-emerald-500", amber: "focus:border-amber-500", indigo: "focus:border-indigo-500" };
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors ${focusBorder[color]} focus:ring-0`}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-2.5 text-slate-500 transition-colors hover:text-slate-300 cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ children, loading, color }) {
  const colors = {
    emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
    amber: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
    indigo: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20",
  };
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer ${colors[color]}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
