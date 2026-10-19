import { useState, type SubmitEvent } from "react";
import {
  AtSign,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppRoutes from "../../../router/AppRoutes";
import NotificationBar from "../../../components/NotificationBar";
import { useAuth } from "../hooks/useAuth";
import type { AuthMode } from "../types";

const modes: { key: AuthMode; label: string }[] = [
  { key: "login", label: "Login" },
  { key: "signup", label: "Signup" },
];

function AuthForm() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(username, email, password);
      } else {
        await login(email, password);
      }

      setSuccess(isSignup ? "Account created successfully." : "Signed in successfully.");
      window.setTimeout(() => void navigate(AppRoutes.home.path), 600);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Authentication failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-5xl items-center justify-center py-5 font-['Montserrat'] sm:py-8">
      {error ? (
        <NotificationBar
          type="error"
          title="Authentication failed"
          message={error}
          onClose={() => setError("")}
        />
      ) : null}
      {success ? (
        <NotificationBar type="success" title={success} />
      ) : null}
      <div className="grid w-full overflow-hidden rounded-2xl border border-white/14 bg-[hsl(24,28%,11%)]/86 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl md:grid-cols-[0.94fr_1.06fr]">
        <div className="relative hidden min-h-145 overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_20%_18%,rgba(251,191,36,0.18),transparent_34%),linear-gradient(145deg,hsl(40,44%,18%),hsl(19,38%,11%))] md:block">
          <div className="absolute -top-20 -right-18 h-64 w-64 rounded-full bg-amber-300/12 blur-3xl" />
          <div className="absolute -bottom-24 -left-18 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl" />
          <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 gap-3 opacity-90">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className={`flex items-center justify-center rounded-xl border bg-black/18 text-6xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                  index === 4
                    ? "border-amber-200/35 bg-amber-300/10 text-amber-100/75"
                    : "border-white/12 text-white/15"
                }`}
              >
                {index === 0 || index === 8
                  ? "X"
                  : index === 4 || index === 6
                    ? "O"
                    : ""}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[hsl(18,36%,9%)] via-[hsl(18,36%,9%)]/90 to-transparent px-8 pt-36 pb-8">
            <div className="mb-5 flex items-center gap-2 text-amber-200/80">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase">
                Make every move count
              </span>
            </div>
            <h1 className="font-['Oswald'] text-6xl leading-none font-semibold tracking-tight text-white">
              Tic<span className="text-amber-200">Flow</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
              Your board. Your rhythm. Pick up every match exactly where you
              left off.
            </p>
            <div className="mt-7 flex gap-2">
              {["Play", "Compete", "Flow"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white/55 uppercase"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-145 flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 lg:px-14">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-200/70 uppercase">
                {isSignup ? "Create account" : "Welcome back"}
              </p>
              <h2 className="mt-2 font-['Oswald'] text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                {isSignup ? "Start your profile" : "Login to TicFlow"}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/48">
                {isSignup
                  ? "Create your identity and bring it into every match."
                  : "Ready for another round? Your next move is waiting."}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-300/10 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.12)] sm:hidden">
              <Sparkles size={17} />
            </div>
          </div>

          <div className="relative mb-6 grid grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-black/18 p-1">
            <span
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-sm bg-orange-400 shadow-[0_10px_28px_rgba(251,146,60,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSignup ? "translate-x-full" : "translate-x-0"
              }`}
              aria-hidden="true"
            />
            {modes.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={mode === item.key}
                onClick={() => {
                  setMode(item.key);
                  setError("");
                  setShowPassword(false);
                }}
                className={`relative z-10 h-11 rounded-sm border-0 bg-transparent font-semibold transition-colors duration-300 hover:bg-transparent ${
                  mode === item.key
                    ? "text-[hsl(24,33%,10%)]"
                    : "text-white/62 hover:text-white focus-visible:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            className="space-y-5"
            autoComplete="off"
            onSubmit={(event) => void submit(event)}
          >
            <div
              className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSignup
                  ? "mb-2 grid-rows-[1fr] opacity-100"
                  : "-mb-4 grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-white/65 uppercase">
                    <AtSign size={14} className="text-amber-200/70" />
                    Username
                  </span>
                  <div className="relative">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required={isSignup}
                      disabled={!isSignup}
                      minLength={3}
                      maxLength={24}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-white/12 bg-[#130e0b] px-4 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:border-amber-200/65 focus:bg-[#130e0b] focus:ring-4 focus:ring-amber-200/8"
                      placeholder="Choose a username"
                    />
                  </div>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-white/65 uppercase">
                {isSignup ? (
                  <Mail size={14} className="text-amber-200/70" />
                ) : (
                  <AtSign size={14} className="text-amber-200/70" />
                )}
                {isSignup ? "Email" : "Email or username"}
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type={isSignup ? "email" : "text"}
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-white/12 bg-[#130e0b] px-4 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:border-amber-200/65 focus:bg-[#130e0b] focus:ring-4 focus:ring-amber-200/8"
                placeholder={
                  isSignup ? "you@example.com" : "you@example.com or Username"
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-white/65 uppercase">
                <LockKeyhole size={14} className="text-amber-200/70" />
                Password
              </span>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-xl border border-white/12 bg-[#130e0b] px-4 pr-12 text-sm text-white transition-colors outline-none placeholder:text-white/25 focus:border-amber-200/65 focus:bg-[#130e0b] focus:ring-4 focus:ring-amber-200/8"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-transparent text-white/35 transition-colors hover:border-transparent hover:bg-white/8 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-orange-400 font-bold text-[hsl(24,33%,10%)] shadow-[0_10px_24px_rgba(251,146,60,0.16)] transition-colors hover:border-transparent hover:bg-orange-300 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-orange-300/45 focus-visible:outline-none active:border-transparent active:bg-orange-500 disabled:cursor-wait disabled:opacity-65"
            >
              {isSubmitting ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : isSignup ? (
                <UserPlus size={18} />
              ) : (
                <LogIn size={18} />
              )}
              {isSignup ? "Create account" : "Login"}
            </button>
          </form>
          <p className="mt-5 text-center text-[11px] leading-5 text-white/35">
            By continuing, you agree to keep the game fair and fun for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AuthForm;
