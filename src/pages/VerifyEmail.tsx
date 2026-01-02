import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already verified
  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        navigate("/social", { replace: true });
      }
    };

    checkVerification();

    // Listen for auth changes (when user verifies email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          toast({
            title: "Email đã xác thực!",
            description: "Chào mừng bạn đến với FUN Charity!",
          });
          navigate("/social", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;

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

    setCountdown(60); // 60 second cooldown
    toast({
      title: "Email đã được gửi!",
      description: "Vui lòng kiểm tra hộp thư của bạn.",
    });
  };

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Link to="/auth">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-light">
              <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
              Đăng Nhập
            </Button>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 backdrop-blur-xl bg-card/95 luxury-border text-center"
          >
            {/* Mail Icon Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center"
            >
              <Mail className="w-10 h-10 text-secondary" />
            </motion.div>

            {/* Title */}
            <Badge variant="gold" className="mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Xác Thực Email
            </Badge>
            
            <h1 className="font-display text-2xl font-bold mb-3">
              Kiểm Tra Hộp Thư Của Bạn
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Chúng tôi đã gửi email xác thực đến{" "}
              <span className="text-secondary font-medium">{email || "email của bạn"}</span>.
              Vui lòng click vào link trong email để hoàn tất đăng ký.
            </p>

            {/* Steps */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mở hộp thư email của bạn
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tìm email từ FUN Charity (kiểm tra cả thư rác)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-secondary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click vào link "Xác thực email" trong email
                  </p>
                </div>
              </div>
            </div>

            {/* Resend Button */}
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={handleResend}
              disabled={resending || countdown > 0 || !email}
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gửi lại sau {countdown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gửi Lại Email Xác Thực
                </>
              )}
            </Button>

            {/* Verified check info */}
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Trang này sẽ tự động chuyển hướng sau khi xác thực
            </p>
          </motion.div>

          {/* Footer links */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Đăng ký email khác?{" "}
              <Link to="/auth" className="text-secondary hover:underline">
                Quay lại đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;
