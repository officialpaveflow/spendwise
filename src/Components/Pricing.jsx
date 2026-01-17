import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Shield, Globe, Users, CreditCard, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom"; // Add this import

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    popular: false,
    gradient: "from-gray-600 to-gray-700",
    buttonColor: "bg-gray-700 hover:bg-gray-600",
    buttonText: "Get Started Free",
    features: [
      { text: "Basic expense tracking", included: true },
      { text: "30-day transaction history", included: true },
      { text: "Manual budgeting", included: true },
      { text: "Email support", included: true },
      { text: "AI-powered insights", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Multi-currency support", included: false },
      { text: "Priority support", included: false },
    ],
    description: "Perfect for getting started"
  },
  {
    name: "Pro",
    price: "₦2,500",
    period: "per month",
    popular: true,
    gradient: "from-emerald-500 to-teal-400",
    buttonColor: "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500",
    buttonText: "Start Free Trial",
    features: [
      { text: "Everything in Free", included: true },
      { text: "AI-powered insights", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Multi-currency support", included: true },
      { text: "Priority support", included: true },
      { text: "Investment tracking", included: true },
      { text: "Custom categories", included: true },
      { text: "Team collaboration", included: false },
    ],
    description: "For serious financial management"
  },
  {
    name: "Team",
    price: "₦5,000",
    period: "per month",
    popular: false,
    gradient: "from-blue-500 to-indigo-400",
    buttonColor: "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500",
    buttonText: "Start Free Trial",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team collaboration", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Custom roles & permissions", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Onboarding assistance", included: true },
      { text: "SLA & premium support", included: true },
      { text: "Custom integrations", included: true },
    ],
    description: "For businesses & organizations"
  }
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. No questions asked."
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required."
  },
  {
    question: "How secure is my data?",
    answer: "We use bank-level 256-bit encryption. Your data is always protected and never shared."
  },
  {
    question: "Can I upgrade or downgrade?",
    answer: "Absolutely. You can change your plan at any time from your account settings."
  }
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden" id="pricing">
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
            y: [0, -40, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              SIMPLE PRICING
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block text-white mb-2">
              Straightforward pricing
            </span>
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              for every budget
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            No hidden fees. Cancel anytime. Start with our free plan and upgrade when you're ready.
          </p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 mt-8 p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all relative ${
                billingPeriod === "yearly" 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 rounded-full">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Popular badge */}
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30">
                    MOST POPULAR
                  </div>
                </motion.div>
              )}

              {/* 3D Card effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className={`relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border ${
                plan.popular 
                  ? 'border-emerald-500/30' 
                  : 'border-white/10'
              } p-8 group-hover:border-white/20 transition-all duration-300 overflow-hidden`}>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.popular && (
                      <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex items-baseline mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                  
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Button */}
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-xl transition-all duration-300 ${
                      plan.buttonColor
                    } ${plan.popular ? 'shadow-emerald-500/30' : 'shadow-gray-700/30'}`}
                  >
                    {plan.buttonText}
                  </motion.button>
                </Link>

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
                className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r ${plan.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
              />
            </motion.div>
          ))}
        </div>

        {/* Trust section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              TRUSTED BY 50,000+ USERS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Shield, text: "Bank-level security" },
              { icon: Globe, text: "Multiple currencies" },
              { icon: Users, text: "24/7 support" },
              { icon: Sparkles, text: "30-day guarantee" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center p-4"
              >
                <item.icon className="w-8 h-8 text-emerald-400 mb-3" />
                <span className="text-sm text-gray-300 text-center">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Frequently asked questions
            </h3>
            <p className="text-gray-400">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <HelpCircle className={`w-5 h-5 text-emerald-400 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-gray-400">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-center mt-24"
        >
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to take control of your finances?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial lives with SpendSolo.
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 40px rgba(16, 185, 129, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
              >
                Start Your Free Trial
              </motion.button>
            </Link>
            <p className="text-gray-400 mt-6 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}