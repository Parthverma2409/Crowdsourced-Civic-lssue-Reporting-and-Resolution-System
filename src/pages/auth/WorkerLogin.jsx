import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { HardHat, ArrowLeft, Loader2, Eye, EyeOff, Info, Map, Navigation, ImagePlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function WorkerLogin() {
  const { user, role, loading } = useAuth();
  const { signIn, isLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <PageLoader />;
  if (user && role === "worker") return <Navigate to="/worker/dashboard" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/worker/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-amber-500/12 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-600/8 blur-[80px]" />
      </div>

      {/* Left feature panel */}
      <div className="relative hidden w-[45%] flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-amber-400">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div>
          <div className="mb-8 inline-flex rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
            <HardHat className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="text-4xl font-black leading-tight text-white">
            Field Operations<br />
            <span className="text-amber-400">Portal.</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Your tasks, your map, your impact. Log in to view assigned issues and mark them resolved.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Map, label: "View assigned tasks on map" },
              { icon: Navigation, label: "Navigate with Google Maps" },
              { icon: ImagePlus, label: "Upload completion photos" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs leading-relaxed text-slate-400">
                Worker accounts are created and managed by administrators. Contact your supervisor if you don't have credentials.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700">CivicSense &mdash; Field Operations.</p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="mb-6 flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-white lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <HardHat className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Worker Login</h2>
                <p className="text-xs text-slate-500">Field operations portal</p>
              </div>
            </div>

            {/* Wrong role warning */}
            {user && role !== "worker" && (
              <div className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/8 px-4 py-3 text-sm text-orange-300">
                You're signed in as <strong>{role}</strong>, not a worker.{" "}
                <Link to={role === "admin" ? "/admin/dashboard" : "/helper/home"} className="underline hover:text-orange-200 cursor-pointer">
                  Go to your portal →
                </Link>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <GoogleButton onClick={() => signIn.authenticateWithRedirect({
              strategy: "oauth_google",
              redirectUrl: "/sso-callback",
              redirectUrlComplete: "/",
            })} />

            <Divider />

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="worker@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 transition-colors hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-200 hover:bg-amber-500 disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In to Field Portal
              </button>
            </form>

            {/* Mobile admin note */}
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2.5 lg:hidden">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-300/80">
                Contact your supervisor if you don't have credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
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

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
    </div>
  );
}
