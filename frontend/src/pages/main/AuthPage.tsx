import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppRoutes from "../../router/AppRoutes";
import AuthForm from "../../features/auth/components/AuthForm";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { getMe } from "../../features/auth/api";

function AuthPage() {
  const { setUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user);
          void navigate(AppRoutes.home.path, { replace: true });
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
  }, [navigate, setUser]);

  if (checking) return null;

  return <AuthForm />;
}

export default AuthPage;
