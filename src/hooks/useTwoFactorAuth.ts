import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorSettings {
  is_2fa_enabled: boolean;
  has_pin: boolean;
  has_biometric: boolean;
}

export const useTwoFactorAuth = () => {
  const [settings, setSettings] = useState<TwoFactorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);

  const fetchSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching 2FA settings:', error);
    }

    if (data) {
      setSettings({
        is_2fa_enabled: data.is_2fa_enabled || false,
        has_pin: !!data.pin_hash,
        has_biometric: !!data.biometric_credential_id,
      });
      setRequires2FA(data.is_2fa_enabled || false);
    } else {
      setSettings({
        is_2fa_enabled: false,
        has_pin: false,
        has_biometric: false,
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Simple hash function for PIN (in production, use bcrypt on server)
  const hashPin = (pin: string): string => {
    // This is a simple hash for demo - in production, hash on server with bcrypt
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const setupPin = async (pin: string): Promise<{ error: Error | null }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const pinHash = hashPin(pin);

    const { error } = await supabase
      .from('user_security_settings')
      .upsert({
        user_id: user.id,
        pin_hash: pinHash,
        is_2fa_enabled: true,
      }, { onConflict: 'user_id' });

    if (error) return { error: new Error(error.message) };
    
    await fetchSettings();
    return { error: null };
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_security_settings')
      .select('pin_hash')
      .eq('user_id', user.id)
      .single();

    if (error || !data?.pin_hash) return false;

    const pinHash = hashPin(pin);
    const isValid = data.pin_hash === pinHash;
    
    if (isValid) {
      setIs2FAVerified(true);
    }
    
    return isValid;
  };

  const setupBiometric = async (): Promise<{ error: Error | null }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return { error: new Error('Thiết bị không hỗ trợ xác thực sinh trắc học') };
    }

    try {
      // Create credential
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "FUN Charity",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(user.id),
          name: user.email || 'user',
          displayName: user.email || 'User',
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return { error: new Error('Không thể tạo credential') };
      }

      // Store credential ID
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          biometric_credential_id: credentialId,
          is_2fa_enabled: true,
        }, { onConflict: 'user_id' });

      if (error) return { error: new Error(error.message) };
      
      await fetchSettings();
      return { error: null };
    } catch (err) {
      console.error('Biometric setup error:', err);
      return { error: new Error('Không thể thiết lập xác thực sinh trắc học') };
    }
  };

  const verifyBiometric = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_security_settings')
      .select('biometric_credential_id')
      .eq('user_id', user.id)
      .single();

    if (error || !data?.biometric_credential_id) return false;

    try {
      const credentialId = Uint8Array.from(atob(data.biometric_credential_id), c => c.charCodeAt(0));
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: credentialId,
          type: "public-key",
          transports: ["internal"],
        }],
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        setIs2FAVerified(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Biometric verification error:', err);
      return false;
    }
  };

  const disable2FA = async (): Promise<{ error: Error | null }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('user_security_settings')
      .update({
        is_2fa_enabled: false,
        pin_hash: null,
        biometric_credential_id: null,
        biometric_public_key: null,
      })
      .eq('user_id', user.id);

    if (error) return { error: new Error(error.message) };
    
    await fetchSettings();
    setRequires2FA(false);
    return { error: null };
  };

  const skip2FAForSession = () => {
    setIs2FAVerified(true);
  };

  return {
    settings,
    isLoading,
    requires2FA,
    is2FAVerified,
    setupPin,
    verifyPin,
    setupBiometric,
    verifyBiometric,
    disable2FA,
    skip2FAForSession,
    refetch: fetchSettings,
  };
};
