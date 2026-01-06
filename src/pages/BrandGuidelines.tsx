import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/brand/Logo";
import { Check, X, Type, Palette, Heart, Sparkles, MessageCircle } from "lucide-react";

const BrandGuidelines = () => {
  const primaryColors = [
    { name: "Purple Dark", hex: "#2E0F4A", hsl: "280 60% 18%", usage: "Background chính" },
    { name: "Purple", hex: "#7c3aed", hsl: "263 70% 58%", usage: "Buttons, links" },
    { name: "Purple Light", hex: "#9333ea", hsl: "271 81% 56%", usage: "Hover states" },
  ];

  const secondaryColors = [
    { name: "Gold", hex: "#C9A23D", hsl: "43 55% 51%", usage: "Accent, highlights" },
    { name: "Gold Light", hex: "#D4B85A", hsl: "47 60% 59%", usage: "Hover accents" },
    { name: "Amber", hex: "#F59E0B", hsl: "38 92% 50%", usage: "Warnings, CTAs" },
  ];

  const accentColors = [
    { name: "Pink", hex: "#EC4899", hsl: "330 81% 60%", usage: "Hearts, love" },
    { name: "Green", hex: "#10B981", hsl: "160 84% 39%", usage: "Success, online" },
    { name: "Blue", hex: "#3B82F6", hsl: "217 91% 60%", usage: "Links, info" },
  ];

  const emojis = ["👼", "💖", "✨", "🌟", "💫", "🙏", "💕", "🥰", "🌈", "💛"];

  return (
    <>
      <Helmet>
        <title>Brand Guidelines | FUN Charity</title>
        <meta name="description" content="Hướng dẫn sử dụng thương hiệu FUN Charity - Logo, màu sắc, typography và tone of voice." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Brand Guidelines
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Hướng dẫn thương hiệu
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tài liệu chính thức về cách sử dụng logo, màu sắc, typography và giọng điệu của FUN Charity.
            </p>
          </div>

          <div className="space-y-8">
            {/* Brand Name Section */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Tên thương hiệu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center py-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                  <span className="text-4xl md:text-6xl font-display font-bold text-foreground">
                    FUN Charity
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-500 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Cách viết đúng
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="font-medium">FUN Charity</span> - Viết hoa FUN
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>funcharity.org</span> - Domain chính thức
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-500 flex items-center gap-2">
                      <X className="w-4 h-4" /> Không được viết
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2 line-through">
                        <X className="w-3 h-3 text-red-500" />
                        Fun Charity
                      </li>
                      <li className="flex items-center gap-2 line-through">
                        <X className="w-3 h-3 text-red-500" />
                        FUNCHARITY
                      </li>
                      <li className="flex items-center gap-2 line-through">
                        <X className="w-3 h-3 text-red-500" />
                        FUN Charity Hub
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Tagline</h4>
                  <p className="text-xl text-secondary font-display italic">
                    "Spread Love Through Giving" 💛
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logo Section */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Logo on dark */}
                  <div className="p-8 bg-primary rounded-xl flex items-center justify-center">
                    <Logo size="lg" />
                  </div>
                  {/* Logo on light */}
                  <div className="p-8 bg-white rounded-xl flex items-center justify-center border">
                    <Logo size="lg" />
                  </div>
                  {/* Logo small */}
                  <div className="p-8 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl flex items-center justify-center">
                    <Logo size="sm" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Kích thước tối thiểu</h4>
                    <p className="text-muted-foreground">32px chiều cao cho digital, 10mm cho print</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Khoảng cách an toàn</h4>
                    <p className="text-muted-foreground">Tối thiểu bằng chiều cao chữ "F" xung quanh logo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors Section */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Bảng màu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Colors */}
                <div>
                  <h4 className="font-semibold mb-3">Màu chính (Primary)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {primaryColors.map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-sm">
                          <p className="font-medium">{color.name}</p>
                          <p className="text-muted-foreground text-xs">{color.hex}</p>
                          <p className="text-muted-foreground text-xs">{color.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Colors */}
                <div>
                  <h4 className="font-semibold mb-3">Màu phụ (Secondary)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {secondaryColors.map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-sm">
                          <p className="font-medium">{color.name}</p>
                          <p className="text-muted-foreground text-xs">{color.hex}</p>
                          <p className="text-muted-foreground text-xs">{color.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accent Colors */}
                <div>
                  <h4 className="font-semibold mb-3">Màu accent</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {accentColors.map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="text-sm">
                          <p className="font-medium">{color.name}</p>
                          <p className="text-muted-foreground text-xs">{color.hex}</p>
                          <p className="text-muted-foreground text-xs">{color.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography Section */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Badge className="mb-2">Display Font</Badge>
                      <p className="text-3xl font-display font-bold">Plus Jakarta Sans</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Dùng cho headings, titles, và logo text
                      </p>
                    </div>
                    <div className="space-y-1 font-display">
                      <p className="text-4xl font-bold">Heading 1</p>
                      <p className="text-3xl font-bold">Heading 2</p>
                      <p className="text-2xl font-semibold">Heading 3</p>
                      <p className="text-xl font-semibold">Heading 4</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">Body Font</Badge>
                      <p className="text-3xl font-sans">Inter</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Dùng cho body text, paragraphs, và UI elements
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base">Body text - Regular 16px</p>
                      <p className="text-sm">Small text - 14px</p>
                      <p className="text-xs text-muted-foreground">Caption - 12px</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Elements */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Icons & Visual Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Emoji Style</h4>
                  <div className="flex flex-wrap gap-4 text-4xl">
                    {emojis.map((emoji, i) => (
                      <span key={i} className="hover:scale-125 transition-transform cursor-default">
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" fill="currentColor" />
                    <p className="text-sm font-medium">Heart Motifs</p>
                    <p className="text-xs text-muted-foreground">Biểu tượng yêu thương</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <span className="text-4xl block mb-2">👼</span>
                    <p className="text-sm font-medium">Angel Elements</p>
                    <p className="text-xs text-muted-foreground">Thiên thần, tâm linh</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sparkle Effects</p>
                    <p className="text-xs text-muted-foreground">Ánh sáng, năng lượng</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tone of Voice */}
            <Card className="bg-card/60 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Tone of Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-500">Đặc điểm giọng nói</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Ấm áp & Từ bi</p>
                          <p className="text-sm text-muted-foreground">Nhẹ nhàng như thiên thần</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Tích cực & Khích lệ</p>
                          <p className="text-sm text-muted-foreground">Lan tỏa năng lượng tốt đẹp</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Thân mật & Gần gũi</p>
                          <p className="text-sm text-muted-foreground">Gọi "bạn", "bạn thân yêu"</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Tiếng Việt tự nhiên</p>
                          <p className="text-sm text-muted-foreground">Dễ hiểu, không cầu kỳ</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-500">Không nên</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                        <span>Giọng điệu lạnh lùng, xa cách</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                        <span>Phán xét, chỉ trích người dùng</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                        <span>Ngôn ngữ tiêu cực, bi quan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 mt-0.5" />
                        <span>Quá formal hoặc business-like</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Ví dụ thông điệp</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-medium text-green-500 mb-1">✓ Đúng</p>
                      <p className="text-sm">"Yayyy! 💖 Cảm ơn bạn đã lan tỏa yêu thương nhé!"</p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm font-medium text-red-500 mb-1">✗ Sai</p>
                      <p className="text-sm">"Donation của bạn đã được ghi nhận."</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BrandGuidelines;
