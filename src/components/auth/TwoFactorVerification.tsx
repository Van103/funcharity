import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';

interface TwoFactorVerificationProps {
  onVerified: () => void;
  onCancel?: () => void;
}

export const TwoFactorVerification = ({ onVerified, onCancel }: TwoFactorVerificationProps) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { settings, verifyPin, verifyBiometric } = useTwoFactorAuth();

  const isBiometricSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newPin.every(d => d !== '') && newPin.join('').length === 6) {
      handlePinSubmit(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinSubmit = async (pinValue?: string) => {
    const fullPin = pinValue || pin.join('');
    if (fullPin.length !== 6) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đủ 6 số',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const isValid = await verifyPin(fullPin);
    setLoading(false);

    if (isValid) {
      toast({
        title: 'Xác thực thành công! 🔐',
        description: 'Chào mừng bạn trở lại',
      });
      onVerified();
    } else {
      toast({
        title: 'Mã PIN không đúng',
        description: 'Vui lòng thử lại',
        variant: 'destructive',
      });
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleBiometric = async () => {
    setBiometricLoading(true);
    const isValid = await verifyBiometric();
    setBiometricLoading(false);

    if (isValid) {
      toast({
        title: 'Xác thực thành công! 🔐',
        description: 'Chào mừng bạn trở lại',
      });
      onVerified();
    } else {
      toast({
        title: 'Xác thực thất bại',
        description: 'Không thể xác thực sinh trắc học. Vui lòng thử lại hoặc dùng mã PIN',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm"
    >
      <div className="w-full max-w-md mx-4">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="glass-card p-8 backdrop-blur-xl bg-card/95 luxury-border text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">Xác Thực 2 Lớp</h2>
            <p className="text-sm text-muted-foreground">
              Nhập mã PIN 6 số hoặc sử dụng vân tay để tiếp tục
            </p>
          </div>

          {/* Biometric Button */}
          {isBiometricSupported && settings?.has_biometric && (
            <div className="mb-6">
              <Button
                onClick={handleBiometric}
                disabled={biometricLoading}
                variant="outline"
                className="w-full h-16 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10"
              >
                {biometricLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6 mr-3 text-secondary" />
                    <span className="text-lg">Xác thực bằng vân tay</span>
                  </>
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Hoặc nhập mã PIN</span>
                </div>
              </div>
            </div>
          )}

          {/* PIN Input */}
          {settings?.has_pin && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-1">
                <KeyRound className="w-4 h-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Mã PIN 6 số</span>
              </div>
              
              <div className="flex justify-center gap-2">
                {pin.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-muted/50 border-2 focus:border-secondary"
                    disabled={loading}
                  />
                ))}
              </div>

              <Button
                onClick={() => handlePinSubmit()}
                disabled={loading || pin.some(d => d === '')}
                variant="hero"
                className="w-full mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác nhận'
                )}
              </Button>
            </div>
          )}

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full mt-4 text-muted-foreground"
            >
              Đăng xuất
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
