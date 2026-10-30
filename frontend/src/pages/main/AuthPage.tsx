import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppRoutes from "../../router/AppRoutes";
import AuthForm from "../../features/auth/components/AuthForm";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { getMe } from "../../features/auth/api";
import LoadingAnimation from "../../components/LoadingAnimation";

function AuthPage() {
  const { setUser } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const returnTo: string =
    (location.state as { from?: string } | null)?.from ?? AppRoutes.home.path;

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user);
          void navigate(returnTo);
        }
      })
      .catch(() => {
        // Cookie invalid or server down — stay on auth page
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, setUser, returnTo]);

  if (checking) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingAnimation
          messages={[{ txt: "Rechecking your session...", keepTime: 0 }]}
        />
      </div>
    );
  }

  return <AuthForm />;
}

export default AuthPage;
