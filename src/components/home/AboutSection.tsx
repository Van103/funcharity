import { motion } from "framer-motion";
import { Heart, Users, Globe, Target, Eye, Sparkles, HandHeart, FileCheck, MessageCircleHeart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ParticleButton } from "@/components/ui/ParticleButton";
import { Link } from "react-router-dom";

const missionItems = [
  {
    icon: Users,
    text: "Connecting kind hearts with people in need",
  },
  {
    icon: Sparkles,
    text: "Spreading the spirit of joyful giving",
  },
  {
    icon: Globe,
    text: "Building a transparent, positive, and human-centered charity community",
  },
];

const visionItems = [
  {
    icon: HandHeart,
    text: "Becoming a friendly and accessible charity platform",
  },
  {
    icon: Heart,
    text: "Inspiring real actions of love",
  },
  {
    icon: Target,
    text: "Growing into a transparent and trust-based charity ecosystem",
  },
];

const howWeWorkItems = [
  {
    icon: Target,
    title: "Clear Goals",
    text: "Each project has well-defined objectives and measurable outcomes",
  },
  {
    icon: FileCheck,
    title: "Public Updates",
    text: "Transparent tracking of all donations and their impact",
  },
  {
    icon: MessageCircleHeart,
    title: "Honest Stories",
    text: "Real stories, authentic images, and genuine results shared openly",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 via-rose-50/30 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-rose-200/30 to-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-100/20 to-pink-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Our Story</span>
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-6">
            About Fun Charity
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Fun Charity is a <span className="text-rose-500 font-semibold">joyful charity platform</span> built on 
            <span className="text-amber-600 font-semibold"> love</span>, 
            <span className="text-pink-500 font-semibold"> kindness</span>, and the 
            <span className="text-orange-500 font-semibold"> spirit of giving with happiness</span>. 
            We believe that every act of kindness, no matter how small, can create ripples of joy that transform lives.
          </p>
        </motion.div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-rose-100/50 border border-rose-100/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-300"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-rose-600">Our Mission</h3>
            </motion.div>
            <div className="space-y-4">
              {missionItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50/80 to-pink-50/80 hover:from-rose-100/80 hover:to-pink-100/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <item.icon className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-foreground/80 font-medium pt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-amber-100/50 border border-amber-100/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-600">Our Vision</h3>
            </motion.div>
            <div className="space-y-4">
              {visionItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 hover:from-amber-100/80 hover:to-orange-100/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <item.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-foreground/80 font-medium pt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <Separator className="w-24 bg-gradient-to-r from-transparent to-rose-300" />
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          <Sparkles className="w-5 h-5 text-amber-400" />
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          <Separator className="w-24 bg-gradient-to-l from-transparent to-rose-300" />
        </motion.div>

        {/* How We Work Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500">Work</span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparency and trust are at the heart of everything we do
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {howWeWorkItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100/50 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100/0 to-amber-100/0 group-hover:from-rose-100/50 group-hover:to-amber-100/50 rounded-2xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 rounded-3xl p-10 md:p-14 border border-rose-200/50"
        >
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              </motion.div>
            ))}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Join Our Community of <span className="text-rose-500">Joyful Givers</span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            Whether you want to donate, volunteer, or simply spread kindness, 
            there's a place for you in our family. Together, we can create a world 
            where giving brings joy to both the giver and the receiver.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/campaigns">
              <ParticleButton variant="default" size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200">
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Donate Now
              </ParticleButton>
            </Link>
            <Link to="/volunteer">
              <ParticleButton variant="outline" size="lg" className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50">
                <HandHeart className="w-5 h-5 mr-2" />
                Become a Volunteer
              </ParticleButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
