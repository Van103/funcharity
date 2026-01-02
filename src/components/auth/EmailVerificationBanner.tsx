import { useState } from "react";
import { AlertTriangle, X, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export const EmailVerificationBanner = ({ email, onDismiss }: EmailVerificationBannerProps) => {
  const [resending, setResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  if (dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setResending(false);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi lại email. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email đã được gửi!",
      description: "Vui lòng kiểm tra hộp thư của bạn.",
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-200">
            Email chưa được xác thực
          </p>
          <p className="text-xs text-amber-200/70 mt-1">
            Một số tính năng sẽ bị hạn chế cho đến khi bạn xác thực email. 
            Kiểm tra hộp thư <span className="font-medium">{email}</span> để xác thực.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-amber-200 hover:text-amber-100 hover:bg-amber-500/20 p-0"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail className="w-3 h-3 mr-1" />
                Gửi lại email xác thực
              </>
            )}
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-200/70 hover:text-amber-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
