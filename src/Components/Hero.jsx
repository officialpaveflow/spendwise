import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Create a motion-enhanced Link component
const MotionLink = motion(Link);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-32 lg:pt-24 pb-12 md:pb-20 lg:pb-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {/* Gradient orbs */}
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
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/15 to-teal-500/10 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 0.4
          }}
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-blue-500/12 to-indigo-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="block text-white mb-2">
                Smart finance,
              </span>
              <span className="block">
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  zero stress.
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-xl"
            >
              AI-powered personal finance that helps you save more, 
              spend smarter, and grow your wealth all in one beautiful app.
            </motion.p>

            {/* Feature list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 mb-10"
            >
              {[
                { icon: CheckCircle, text: "Track expenses automatically", color: "text-emerald-400" },
                { icon: CheckCircle, text: "AI-powered savings insights", color: "text-emerald-400" },
                { icon: CheckCircle, text: "Real-time budget alerts", color: "text-emerald-400" },
                { icon: CheckCircle, text: "Investment recommendations", color: "text-emerald-400" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-gray-200 text-base sm:text-lg">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              {/* Get Started Free Button - Links to Signup Page */}
              <MotionLink
                to="/signUp"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-xl shadow-emerald-500/30 inline-block text-center"
              >
                <span className="flex items-center justify-center gap-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </MotionLink>

              {/* Watch Demo Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-semibold text-white text-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <PlayCircle className="w-5 h-5 text-emerald-300" />
                  Watch Demo
                </span>
              </motion.button>
            </motion.div>

            {/* Trust indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-sm text-gray-400 flex flex-wrap items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} />
                  ))}
                </div>
                <span>4.9/5 Rating</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div>50,000+ Users</div>
              <div className="hidden sm:block">•</div>
              <div>No Credit Card Required</div>
            </motion.div>
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden lg:block relative h-full w-full"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Phone mockup */}
              <div className="relative w-full max-w-[500px]">
                {/* Phone frame */}
                <div className="relative">
                  <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[2.5rem] p-3 shadow-2xl shadow-black/50 border-[14px] border-gray-900">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
                    
                    {/* Screen content */}
                    <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 h-[550px]">
                      <div className="p-6 h-full">
                        {/* Top bar */}
                        <div className="flex justify-between items-center mb-8">
                          <div className="text-white text-xl font-semibold">Financial Dashboard</div>
                          <div className="text-emerald-400 text-lg font-medium">$4,589.23</div>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {[
                            { label: "Monthly Income", value: "$3,240", color: "bg-emerald-500/20", trend: "+12%" },
                            { label: "Total Savings", value: "$1,024", color: "bg-blue-500/20", trend: "+8%" },
                            { label: "Invested Amount", value: "$2,580", color: "bg-purple-500/20", trend: "+15%" },
                            { label: "Monthly Spent", value: "$835", color: "bg-amber-500/20", trend: "-3%" },
                          ].map((stat, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ delay: i * 0.2, duration: 3, repeat: Infinity }}
                              className={`${stat.color} rounded-xl p-4 backdrop-blur-sm border border-white/10`}
                            >
                              <div className="text-sm text-gray-300 mb-1">{stat.label}</div>
                              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                              <div className={`text-xs ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stat.trend}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Chart section */}
                        <div className="bg-gray-800/50 rounded-xl p-5 mb-6 border border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-white font-medium text-lg">Spending Trend This Month</div>
                            <div className="text-emerald-400 text-base">+12.5%</div>
                          </div>
                          <div className="h-40 relative">
                            <svg className="w-full h-full" viewBox="0 0 400 120">
                              <motion.path
                                d="M0,80 C60,70 120,40 180,60 C240,80 300,20 360,40"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: 1 }}
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#0ea5e9" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>

                        {/* Recent transactions */}
                        <div>
                          <div className="text-white font-medium text-lg mb-4">Recent Transactions</div>
                          <div className="space-y-3">
                            {[
                              { name: "Netflix Subscription", amount: "-$15.99", time: "Today", category: "Entertainment", icon: "🎬" },
                              { name: "Starbucks Coffee", amount: "-$5.75", time: "Today", category: "Food & Drink", icon: "☕" },
                              { name: "Monthly Salary", amount: "+$3,240.00", time: "Yesterday", category: "Income", icon: "💰" },
                              { name: "Amazon Purchase", amount: "-$89.99", time: "2 days ago", category: "Shopping", icon: "🛒" },
                            ].map((transaction, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                    transaction.category === 'Income' ? 'bg-emerald-500/20' :
                                    transaction.category === 'Entertainment' ? 'bg-purple-500/20' :
                                    transaction.category === 'Food & Drink' ? 'bg-amber-500/20' :
                                    'bg-blue-500/20'
                                  }`}>
                                    {transaction.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-white font-medium">{transaction.name}</div>
                                    <div className="text-gray-400 text-sm">{transaction.category} • {transaction.time}</div>
                                  </div>
                                </div>
                                <div className={`text-lg font-semibold ${
                                  transaction.amount.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                  {transaction.amount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reflection effect */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Star icon component
function Star() {
  return (
    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}