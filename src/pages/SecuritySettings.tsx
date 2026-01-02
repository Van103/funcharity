import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-secondary" />
                Cài Đặt Bảo Mật
              </h1>
              <p className="text-sm text-muted-foreground">
                Quản lý xác thực 2 lớp và bảo mật tài khoản
              </p>
            </div>
          </div>

          {/* 2FA Setup Card */}
          <div className="glass-card p-6 backdrop-blur-xl bg-card/95 luxury-border">
            <TwoFactorSetup />
          </div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <h3 className="font-medium text-secondary mb-2">💡 Mẹo bảo mật</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Bật xác thực 2 lớp để bảo vệ tài khoản tốt hơn</li>
              <li>• Sử dụng vân tay nếu thiết bị hỗ trợ để đăng nhập nhanh hơn</li>
              <li>• Không chia sẻ mã PIN với bất kỳ ai</li>
              <li>• Đổi mã PIN định kỳ để tăng cường bảo mật</li>
            </ul>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default SecuritySettings;
