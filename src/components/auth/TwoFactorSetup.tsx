import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { 
  Fingerprint, 
  KeyRound, 
  Loader2, 
  ShieldCheck, 
  ShieldOff,
  Check,
  X
} from 'lucide-react';

interface TwoFactorSetupProps {
  onClose?: () => void;
}

export const TwoFactorSetup = ({ onClose }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<'choose' | 'pin' | 'confirm-pin' | 'biometric'>('choose');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { settings, setupPin, setupBiometric, disable2FA, isLoading, refetch } = useTwoFactorAuth();

  const isBiometricSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const handlePinChange = (
    index: number, 
    value: string, 
    isConfirm: boolean = false
  ) => {
    if (!/^\d*$/.test(value)) return;
    
    const setter = isConfirm ? setConfirmPin : setPin;
    const current = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    
    const newPin = [...current];
    newPin[index] = value.slice(-1);
    setter(newPin);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number, 
    e: React.KeyboardEvent, 
    isConfirm: boolean = false
  ) => {
    const current = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    
    if (e.key === 'Backspace' && !current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePinSetup = () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đủ 6 số',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm-pin');
    setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
  };

  const handleConfirmPin = async () => {
    const fullPin = pin.join('');
    const fullConfirmPin = confirmPin.join('');
    
    if (fullPin !== fullConfirmPin) {
      toast({
        title: 'Mã PIN không khớp',
        description: 'Vui lòng nhập lại mã PIN',
        variant: 'destructive',
      });
      setConfirmPin(['', '', '', '', '', '']);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    const { error } = await setupPin(fullPin);
    setLoading(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thiết lập thành công! 🔐',
      description: 'Mã PIN 6 số đã được kích hoạt',
    });
    setStep('choose');
    setPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
  };

  const handleBiometricSetup = async () => {
    setLoading(true);
    const { error } = await setupBiometric();
    setLoading(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thiết lập thành công! 🔐',
      description: 'Xác thực vân tay đã được kích hoạt',
    });
    setStep('choose');
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    const { error } = await disable2FA();
    setLoading(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Đã tắt xác thực 2 lớp',
      description: 'Bạn có thể bật lại bất cứ lúc nào',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold">Xác Thực 2 Lớp (2FA)</h3>
          <p className="text-sm text-muted-foreground">
            Bảo vệ tài khoản bằng vân tay hoặc mã PIN
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Current Status */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái 2FA</span>
                <span className={`text-sm font-medium ${settings?.is_2fa_enabled ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {settings?.is_2fa_enabled ? 'Đã bật' : 'Chưa bật'}
                </span>
              </div>
              
              {settings?.has_pin && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  Mã PIN 6 số đã thiết lập
                </div>
              )}
              
              {settings?.has_biometric && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  Xác thực vân tay đã thiết lập
                </div>
              )}
            </div>

            {/* Setup Options */}
            <div className="space-y-3">
              {/* PIN Option */}
              <Button
                onClick={() => {
                  setStep('pin');
                  setTimeout(() => inputRefs.current[0]?.focus(), 100);
                }}
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <KeyRound className="w-5 h-5 mr-3 text-secondary" />
                <div className="text-left">
                  <div className="font-medium">
                    {settings?.has_pin ? 'Thay đổi mã PIN' : 'Thiết lập mã PIN 6 số'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nhập mã PIN mỗi khi đăng nhập
                  </div>
                </div>
              </Button>

              {/* Biometric Option */}
              {isBiometricSupported && (
                <Button
                  onClick={() => setStep('biometric')}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                >
                  <Fingerprint className="w-5 h-5 mr-3 text-secondary" />
                  <div className="text-left">
                    <div className="font-medium">
                      {settings?.has_biometric ? 'Cập nhật vân tay' : 'Thiết lập vân tay'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sử dụng vân tay hoặc Face ID để đăng nhập
                    </div>
                  </div>
                </Button>
              )}

              {/* Disable 2FA */}
              {settings?.is_2fa_enabled && (
                <Button
                  onClick={handleDisable2FA}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={loading}
                >
                  <ShieldOff className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Tắt xác thực 2 lớp</div>
                    <div className="text-xs opacity-70">
                      Không khuyến khích vì lý do bảo mật
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'pin' && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h4 className="font-medium mb-1">Nhập mã PIN mới</h4>
              <p className="text-sm text-muted-foreground">
                Tạo mã PIN 6 số để bảo vệ tài khoản
              </p>
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
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep('choose');
                  setPin(['', '', '', '', '', '']);
                }}
                variant="outline"
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePinSetup}
                variant="hero"
                className="flex-1"
                disabled={pin.some(d => d === '')}
              >
                Tiếp tục
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'confirm-pin' && (
          <motion.div
            key="confirm-pin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h4 className="font-medium mb-1">Xác nhận mã PIN</h4>
              <p className="text-sm text-muted-foreground">
                Nhập lại mã PIN để xác nhận
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {confirmPin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { confirmInputRefs.current[index] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value, true)}
                  onKeyDown={(e) => handleKeyDown(index, e, true)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-muted/50 border-2 focus:border-secondary"
                  disabled={loading}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep('pin');
                  setConfirmPin(['', '', '', '', '', '']);
                }}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleConfirmPin}
                variant="hero"
                className="flex-1"
                disabled={loading || confirmPin.some(d => d === '')}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Xác nhận'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'biometric' && (
          <motion.div
            key="biometric"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-secondary" />
              </div>
              <h4 className="font-medium mb-1">Thiết lập vân tay</h4>
              <p className="text-sm text-muted-foreground">
                Sử dụng vân tay hoặc Face ID để đăng nhập nhanh chóng và an toàn
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep('choose')}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleBiometricSetup}
                variant="hero"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    Bắt đầu
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
