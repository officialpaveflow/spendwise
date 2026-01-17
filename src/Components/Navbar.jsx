import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Add this import
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);

  const navItems = [
    { label: "Home", href: "/" }, // Changed to "/"
    {
      label: "Features",
      href: "#features",
      dropdown: [
        { label: "Expense Tracking", desc: "AI-powered insights" },
        { label: "Budget Planning", desc: "Smart allocations" },
        { label: "Investment Tools", desc: "Grow your wealth" },
        { label: "Security", desc: "Bank-level protection" },
      ]
    },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-gray-950/95 backdrop-blur-xl border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Link to="/" className="flex items-center gap-3"> {/* Wrap logo with Link */}
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
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.dropdown ? (
                    <div
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="relative"
                    >
                      <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group text-sm font-medium">
                        {item.label}
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400 group-hover:rotate-180 transition-all duration-200" />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-4 w-80 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 p-3"
                          >
                            <div className="space-y-2">
                              {item.dropdown.map((subItem) => (
                                <a
                                  key={subItem.label}
                                  href="#"
                                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group"
                                >
                                  <div className="flex-1">
                                    <span className="text-white font-semibold text-sm group-hover:text-emerald-300 transition-colors">
                                      {subItem.label}
                                    </span>
                                    <span className="text-gray-400 text-xs block mt-1">
                                      {subItem.desc}
                                    </span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm font-medium relative group"
                    >
                      {item.label}
                      <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
              >
                <Link to="/signin" className="w-full h-full flex items-center justify-center">
                  Sign In
                </Link>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all relative overflow-hidden group"
              >
                <Link to="/signup" className="w-full h-full flex items-center justify-center relative z-10">
                  Register for Free
                </Link>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-gradient-to-b from-gray-900 to-gray-950 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.dropdown ? (
                      <div>
                        <button
                          onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === item.label ? null : item.label)}
                          className="w-full flex items-center justify-between py-4 px-3 text-gray-300 hover:text-white transition-colors text-base font-medium rounded-xl hover:bg-white/5"
                        >
                          <div>
                            {item.label}
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                              mobileSubmenuOpen === item.label ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {mobileSubmenuOpen === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-8 space-y-3 py-3 border-l border-white/10 pl-4"
                            >
                              {item.dropdown.map((subItem) => (
                                <a
                                  key={subItem.label}
                                  href="#"
                                  className="flex items-center gap-3 py-3 text-gray-400 hover:text-white text-sm group"
                                  onClick={() => {
                                    setIsOpen(false);
                                    setMobileSubmenuOpen(null);
                                  }}
                                >
                                  <div>
                                    <div className="text-white group-hover:text-emerald-300 transition-colors">
                                      {subItem.label}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">
                                      {subItem.desc}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className="flex items-center justify-between py-4 px-3 text-gray-300 hover:text-white transition-colors text-base font-medium rounded-xl hover:bg-white/5"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-6 space-y-4 border-t border-white/10 mt-4">
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center text-white font-medium bg-white/10 rounded-xl hover:bg-white/15 transition-colors block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 block"
                  >
                    Register for Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}