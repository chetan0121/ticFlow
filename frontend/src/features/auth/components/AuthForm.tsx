import { useState, type SubmitEvent } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppRoutes from "../../../router/AppRoutes";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      void navigate(AppRoutes.home.path);
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
    <section className="mx-auto flex h-full w-full max-w-5xl items-center justify-center py-6 font-['Montserrat']">
      <div className="grid w-full overflow-hidden rounded-lg border border-white/12 bg-[hsl(24,28%,11%)]/82 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-130 overflow-hidden border-r border-white/10 bg-[hsl(40,44%,16%)] md:block">
          <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 gap-3">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-md border border-white/12 bg-black/18 text-6xl font-semibold text-white/15"
              >
                {index % 3 === 0 ? "X" : index % 4 === 0 ? "O" : ""}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[hsl(18,36%,9%)] via-[hsl(18,36%,9%)]/78 to-transparent px-8 pt-24 pb-8">
            <h1 className="font-['Oswald'] text-5xl leading-none font-semibold text-white">
              TicFlow
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/68">
              Sign in once and keep your game identity ready across matches.
            </p>
          </div>
        </div>

        <div className="flex min-h-130 flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-7">
            <p className="text-sm font-semibold text-[hsl(38,95%,68%)]">
              {isSignup ? "Create account" : "Welcome back"}
            </p>
            <h2 className="mt-2 font-['Oswald'] text-4xl leading-tight font-semibold text-white">
              {isSignup ? "Start your profile" : "Login to TicFlow"}
            </h2>
          </div>

          <div className="relative mb-6 grid grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-black/18 p-1">
            <span
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-sm bg-[hsl(38,95%,58%)] shadow-[0_10px_28px_rgba(251,179,47,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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

          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <div
              className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSignup
                  ? "mb-0 grid-rows-[1fr] opacity-100"
                  : "-mb-4 grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white/72">
                    Username
                  </span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required={isSignup}
                    disabled={!isSignup}
                    minLength={3}
                    maxLength={24}
                    autoComplete="username"
                    className="h-12 w-full rounded-md border border-white/12 bg-black/24 px-4 text-white transition-colors outline-none placeholder:text-white/28 focus:border-[hsl(38,95%,62%)]"
                    placeholder="Username"
                  />
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/72">
                {isSignup ? "Email" : "Email or username"}
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type={isSignup ? "email" : "text"}
                autoComplete={isSignup ? "email" : "username"}
                className="h-12 w-full rounded-md border border-white/12 bg-black/24 px-4 text-white transition-colors outline-none placeholder:text-white/28 focus:border-[hsl(38,95%,62%)]"
                placeholder={
                  isSignup ? "you@example.com" : "you@example.com or Username"
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/72">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="h-12 w-full rounded-md border border-white/12 bg-black/24 px-4 text-white transition-colors outline-none placeholder:text-white/28 focus:border-[hsl(38,95%,62%)]"
                placeholder="At least 8 characters"
              />
            </label>

            {error && (
              <div className="rounded-md border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[hsl(38,95%,58%)] font-bold text-[hsl(24,33%,10%)] transition-all hover:bg-[hsl(38,95%,64%)] active:scale-[0.99] disabled:opacity-65"
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
        </div>
      </div>
    </section>
  );
}

export default AuthForm;
