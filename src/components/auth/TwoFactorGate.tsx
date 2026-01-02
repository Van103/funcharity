import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TwoFactorVerification } from './TwoFactorVerification';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { Loader2 } from 'lucide-react';

interface TwoFactorGateProps {
  children: React.ReactNode;
}

export const TwoFactorGate = ({ children }: TwoFactorGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { settings, isLoading, requires2FA, is2FAVerified } = useTwoFactorAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      setCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  // Still checking auth state
  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // User not authenticated - show children (will be redirected by route protection)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // User authenticated but 2FA not enabled or no settings
  if (!requires2FA || !settings?.is_2fa_enabled) {
    return <>{children}</>;
  }

  // User authenticated, 2FA enabled, and already verified
  if (is2FAVerified) {
    return <>{children}</>;
  }

  // User authenticated, 2FA enabled, but not verified yet - show verification screen
  if ((settings?.has_pin || settings?.has_biometric)) {
    return (
      <TwoFactorVerification
        onVerified={() => {
          // State will update automatically via hook
        }}
        onCancel={handleLogout}
      />
    );
  }

  // Default: show children
  return <>{children}</>;
};
