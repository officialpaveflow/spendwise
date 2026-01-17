import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, User } from "lucide-react";
import { useState } from "react";

const reviews = [
  {
    name: "Daniel Adebayo",
    role: "Freelance Developer",
    quote: "SpendSolo finally gave me control over my finances. The AI insights helped me save 40% more each month without feeling restricted.",
    rating: 5,
    location: "Lagos, Nigeria",
    imageColor: "from-emerald-500 to-teal-400"
  },
  {
    name: "Aisha Mohammed",
    role: "Small Business Owner",
    quote: "Simple, clean, and incredibly effective. I've tried five other apps, but none compare to the clarity SpendSolo provides for my business finances.",
    rating: 5,
    location: "Abuja, Nigeria",
    imageColor: "from-blue-500 to-cyan-400"
  },
  {
    name: "Tunde Kolawole",
    role: "Medical Student",
    quote: "Perfect for budgeting on a tight allowance. The real-time alerts saved me from overspending multiple times this semester!",
    rating: 5,
    location: "Ibadan, Nigeria",
    imageColor: "from-purple-500 to-pink-400"
  },
  {
    name: "Chinwe Okonkwo",
    role: "Financial Analyst",
    quote: "As a finance professional, I'm impressed by the depth of analytics. The investment recommendations are spot-on and easy to understand.",
    rating: 5,
    location: "Port Harcourt, Nigeria",
    imageColor: "from-amber-500 to-orange-400"
  },
  {
    name: "Oluwaseun Bello",
    role: "Startup Founder",
    quote: "The multi-currency support is a game-changer for our international transactions. Saved us hours of manual conversion work.",
    rating: 4,
    location: "Accra, Ghana",
    imageColor: "from-indigo-500 to-violet-400"
  },
  {
    name: "Fatima Yusuf",
    role: "Remote Project Manager",
    quote: "Bank-level security gave me the confidence to link all my accounts. The peace of mind is worth every penny.",
    rating: 5,
    location: "Nairobi, Kenya",
    imageColor: "from-rose-500 to-red-400"
  }
];

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextReview = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

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
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-emerald-500/10 to-teal-500/5 rounded-full blur-3xl"
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
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">
              TRUSTED BY THOUSANDS
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block text-white mb-2">
              Loved by users
            </span>
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              across Africa
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Join thousands of satisfied users who have transformed their financial lives with SpendSolo.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <ReviewCard review={reviews[activeIndex]} />
          </motion.div>
          
          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={prevReview}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? 'bg-emerald-400 w-6' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextReview}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-400/10 backdrop-blur-xl border border-emerald-500/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "4.9/5", label: "Average Rating", icon: Star },
              { value: "10K+", label: "5-Star Reviews", icon: Sparkles },
              { value: "50+", label: "Countries", icon: User },
              { value: "98%", label: "Satisfaction", icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="text-sm text-gray-400 font-medium mb-6 tracking-wider">
            FEATURED IN
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {["TechCabal", "NairaMetrics", "BusinessDay", "PulseNG", "VentureBeat"].map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-gray-300 font-bold text-xl tracking-tight hover:text-white transition-colors"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ReviewCard component without TypeScript annotations
function ReviewCard({ review }) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className="group relative h-full"
    >
      {/* 3D Card effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
      
      <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 overflow-hidden">
        {/* Quote icon */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" }}
          className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-400/20 flex items-center justify-center"
        >
          <Quote className="w-6 h-6 text-emerald-300" />
        </motion.div>

        {/* User avatar */}
        <motion.div
          whileHover={{ rotateY: 180, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${review.imageColor} mb-6 overflow-hidden`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Star className={`w-5 h-5 ${
                i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
              }`} />
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <p className="text-gray-300 text-lg leading-relaxed mb-8 italic">
          "{review.quote}"
        </p>

        {/* User info */}
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-white font-bold text-lg">{review.name}</h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-emerald-400 text-sm">{review.role}</span>
            <span className="text-gray-400 text-sm">{review.location}</span>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}