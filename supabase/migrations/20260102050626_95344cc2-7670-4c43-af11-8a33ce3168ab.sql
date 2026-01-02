-- Create table for 2FA settings (PIN or biometric)
CREATE TABLE public.user_security_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    is_2fa_enabled BOOLEAN DEFAULT false,
    pin_hash TEXT,
    biometric_credential_id TEXT,
    biometric_public_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view/modify their own settings
CREATE POLICY "Users can view their own security settings"
ON public.user_security_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
ON public.user_security_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
ON public.user_security_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_security_settings_updated_at
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();