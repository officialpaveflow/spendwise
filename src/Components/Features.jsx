import { motion } from "framer-motion";
import { 
  PieChart, 
  TrendingUp, 
  Shield, 
  Smartphone,
  Lock,
  Zap,
  BarChart3,
  Bell,
  Target,
  Wallet,
  Users,
  Globe
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Expense Tracking",
    desc: "Log and categorize expenses automatically with machine learning. Get real-time insights into your spending habits.",
    icon: PieChart,
    color: "from-emerald-500 to-teal-400",
    delay: 0.1
  },
  {
    title: "Smart Analytics Dashboard",
    desc: "Understand exactly where your money goes with interactive charts and predictive financial forecasting.",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-400",
    delay: 0.2
  },
  {
    title: "Bank-Level Security",
    desc: "Your data is protected with 256-bit encryption, two-factor authentication, and regular security audits.",
    icon: Shield,
    color: "from-purple-500 to-pink-400",
    delay: 0.3
  },
  {
    title: "Real-Time Budget Alerts",
    desc: "Get instant notifications when you're approaching spending limits or unusual activity is detected.",
    icon: Bell,
    color: "from-amber-500 to-orange-400",
    delay: 0.4
  },
  {
    title: "Investment Recommendations",
    desc: "AI-driven investment suggestions based on your risk profile, goals, and market conditions.",
    icon: Target,
    color: "from-indigo-500 to-violet-400",
    delay: 0.5
  },
  {
    title: "Multi-Currency Support",
    desc: "Manage finances across different currencies with automatic conversion and international tracking.",
    icon: Globe,
    color: "from-rose-500 to-red-400",
    delay: 0.6
  }
];

export default function Features() {
  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }}
          />
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              POWERFUL FEATURES
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block text-white mb-2">
              Everything you need to
            </span>
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              master your finances
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Designed to feel simple, powerful, and calm. All the tools you need to take
            complete control of your financial future.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="group relative"
            >
              {/* 3D Card with gradient border */}
              <div className="relative h-full">
                {/* Card background with gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                
                <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  {/* Animated gradient overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                  />
                  
                  {/* Icon with 3D effect */}
                  <motion.div
                    whileHover={{ 
                      rotateY: 180,
                      rotateX: 10,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-6`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent" />
                    <feature.icon className="w-full h-full text-white relative z-10" />
                    
                    {/* Reflection effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl opacity-30" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Animated underline */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: feature.delay + 0.3 }}
                    className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Floating particles */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r ${feature.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -180, -360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.2 + 0.5
                  }}
                  className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-gradient-to-r ${feature.color} opacity-30 group-hover:opacity-70 transition-opacity`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: "98%", label: "User Satisfaction", icon: Users },
            { value: "4.9★", label: "App Rating", icon: TrendingUp },
            { value: "256-bit", label: "Encryption", icon: Lock },
            { value: "50K+", label: "Active Users", icon: Smartphone },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        
      </div>
    </section>
  );
}