import { motion } from "framer-motion";
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Github, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Sparkles,
  ArrowUpRight,
  Globe,
  Shield,
  CreditCard
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gray-950 border-t border-white/10">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Logo and description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 to-teal-400/40 rounded-xl blur-md -z-10"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-tight">
                  SpendSolo
                </span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-wider">FINANCIAL INTELLIGENCE</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              AI-powered personal finance platform helping individuals and businesses take control of their money with confidence.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3 mb-8">
              {[
                { icon: Twitter, label: "Twitter", color: "hover:bg-sky-500/20 hover:text-sky-400" },
                { icon: Facebook, label: "Facebook", color: "hover:bg-blue-600/20 hover:text-blue-400" },
                { icon: Linkedin, label: "LinkedIn", color: "hover:bg-blue-700/20 hover:text-blue-300" },
                { icon: Instagram, label: "Instagram", color: "hover:bg-pink-500/20 hover:text-pink-400" },
                { icon: Github, label: "GitHub", color: "hover:bg-gray-700/20 hover:text-gray-300" },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href="#"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:border-white/20 transition-all ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-white font-bold text-lg mb-6">Product</h3>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "#" },
                { label: "Pricing", href: "#" },
                { label: "Use Cases", href: "#" },
                { label: "Roadmap", href: "#" },
                { label: "API Docs", href: "#" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-white font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Press", href: "#" },
                { label: "Contact", href: "#" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 text-sm flex items-center gap-2 transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
            <ul className="space-y-4 mb-8">
              {[
                { icon: Mail, text: "hello@spendsolo.com", href: "mailto:hello@spendsolo.com" },
                { icon: Phone, text: "+234 901 234 5678", href: "tel:+2349012345678" },
                { icon: MapPin, text: "Lagos, Nigeria", href: "#" },
              ].map((contact, index) => (
                <motion.li
                  key={contact.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                >
                  <a
                    href={contact.href}
                    className="text-gray-400 hover:text-emerald-400 text-sm flex items-center gap-3 transition-colors"
                  >
                    <contact.icon className="w-4 h-4 text-emerald-400" />
                    <span>{contact.text}</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "Security", href: "#" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-sm flex items-center gap-2"
          >
            <span>© {currentYear} SpendSolo. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made By <Heart className="w-3 h-3 text-red-400 fill-red-400" /> VICTOR
            </span>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>256-bit Encryption</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <CreditCard className="w-3 h-3 text-emerald-400" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>GDPR Ready</span>
            </div>
          </motion.div>

          {/* Back to top button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onClick={scrollToTop}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors text-sm flex items-center gap-2"
          >
            Back to top
            <ArrowUpRight className="w-3 h-3 rotate-90" />
          </motion.button>
        </div>

        {/* Mobile trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-white/10 sm:hidden"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CreditCard className="w-3 h-3 text-emerald-400" />
              <span>PCI DSS</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>GDPR</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}