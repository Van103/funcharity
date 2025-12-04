import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Users,
  Building2,
  Mail,
  Lock,
  User,
  Wallet,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState<"donor" | "volunteer" | "ngo">("donor");

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-light">
              <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 backdrop-blur-xl bg-card/95 luxury-border"
          >
            {/* Title */}
            <div className="text-center mb-6">
              <Badge variant="gold" className="mb-4">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Join FUN Charity
              </Badge>
              <h1 className="font-display text-2xl font-bold mb-2">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "login"
                  ? "Sign in to continue your impact journey"
                  : "Start making a transparent difference today"}
              </p>
            </div>

            {/* User Type Selection (for signup) */}
            {activeTab === "signup" && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground mb-3 block">
                  I want to join as
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "donor", icon: Heart, label: "Donor" },
                    { type: "volunteer", icon: Users, label: "Volunteer" },
                    { type: "ngo", icon: Building2, label: "NGO" },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setUserType(option.type as typeof userType)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          userType === option.type
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1 ${
                            userType === option.type ? "text-secondary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            userType === option.type ? "text-secondary font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auth Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6 bg-muted/50">
                <TabsTrigger value="login" className="flex-1">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button variant="hero" className="w-full">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {userType === "ngo" ? "Organization Name" : "Full Name"}
                  </Label>
                  <div className="relative mt-1">
                    {userType === "ngo" ? (
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    ) : (
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    )}
                    <Input
                      id="name"
                      placeholder={userType === "ngo" ? "Organization name" : "Your name"}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                {userType === "ngo" && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium">KYC Required</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      NGOs cần hoàn thành KYC verification để launch campaigns. Bạn sẽ được hướng dẫn sau khi đăng ký.
                    </p>
                  </div>
                )}

                <Button variant="hero" className="w-full">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Wallet Connect */}
            <Button variant="wallet" className="w-full">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Supports MetaMask, WalletConnect, and more
            </p>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6 text-primary-foreground/60 text-sm"
          >
            <p>Từ thiện là ánh sáng. Minh bạch là vàng.</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
