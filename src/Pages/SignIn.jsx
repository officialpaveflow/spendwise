import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowLeft, 
  Sparkles, CheckCircle, Menu, X, LogIn,
  Database, AlertCircle, Check, RefreshCw
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [clerkStatus, setClerkStatus] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState("");

  // Initialize Clerk hooks
  const { isLoaded, signIn, setActive } = useSignIn();
  const clerk = useClerk();
  const navigate = useNavigate();

  // Debug Clerk and Supabase status
  useEffect(() => {
    console.log("SignIn Clerk Status:", {
      isLoaded,
      signIn: !!signIn,
      clerk: !!clerk,
      session: clerk?.session,
      user: clerk?.user
    });
    
    // Check Supabase connection
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.error("Supabase connection error:", error);
          setSupabaseStatus(`Supabase: Error - ${error.message}`);
        } else {
          console.log("Supabase connection successful");
          setSupabaseStatus("Supabase: Connected");
        }
      } catch (err) {
        console.error("Supabase check failed:", err);
        setSupabaseStatus("Supabase: Connection failed");
      }
    };
    
    setClerkStatus(`Clerk Loaded: ${isLoaded}, SignIn: ${!!signIn}`);
    checkSupabase();
  }, [isLoaded, signIn, clerk]);

  // Redirect if already signed in
  useEffect(() => {
    if (clerk?.session) {
      console.log("User already signed in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [clerk?.session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    console.log("Sign in attempt with data:", { ...formData, password: "***" });
    console.log("Clerk state:", { isLoaded, signIn: !!signIn });

    if (!isLoaded) {
      setError("Authentication service is loading, please try again");
      console.error("Clerk not loaded");
      return;
    }

    if (!signIn) {
      setError("Authentication service not available. Please refresh the page.");
      console.error("SignIn object not available");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating sign in...");
      
      // Start the sign-in process using Clerk
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      console.log("Sign in result:", result);

      // Check the sign-in status
      if (result.status === "complete") {
        // If sign in is complete, set the session as active
        console.log("Sign in complete, setting active session");
        
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Fetch user profile from Supabase to ensure it exists
        await ensureSupabaseProfile(result.userId, formData.email);
        
        setSuccessMessage("Signed in successfully! Redirecting...");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        console.log("Sign in status:", result.status);
        setError("Sign in requires additional steps. Please try again.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      handleSignInError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure user profile exists in Supabase
  const ensureSupabaseProfile = async (userId, email) => {
    try {
      console.log("Checking Supabase profile for user:", userId);
      
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log("Creating new Supabase profile");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: email,
              full_name: email.split('@')[0],
              monthly_limit: 2500,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating Supabase profile:", createError);
        } else {
          console.log("Supabase profile created:", newProfile);
        }
      } else if (error) {
        console.error("Error checking Supabase profile:", error);
      } else {
        console.log("Supabase profile found:", data);
      }
    } catch (error) {
      console.error("Exception in ensureSupabaseProfile:", error);
    }
  };

  const handleSignInError = (err) => {
    console.log("Error details:", err);
    
    if (err.errors && err.errors[0]) {
      const clerkError = err.errors[0];
      console.log("Clerk error code:", clerkError.code);
      
      switch (clerkError.code) {
        case "form_identifier_not_found":
        case "form_password_incorrect":
          setError("Invalid email or password. Please try again.");
          break;
        case "form_param_format_invalid":
          setError("Invalid email format. Please enter a valid email address.");
          break;
        case "form_param_nil":
          setError("Please fill in all required fields.");
          break;
        case "user_locked":
          setError("Account is temporarily locked. Please try again later or reset your password.");
          break;
        default:
          setError(clerkError.longMessage || clerkError.message || "An error occurred during sign in");
      }
    } else if (err.message) {
      setError(err.message);
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle social sign-in
  const handleSocialSignIn = (strategy) => {
    if (!isLoaded || !signIn) return;
    
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  // Debug info (remove in production)
  const showDebug = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      

      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-full blur-2xl lg:blur-3xl"
        />
      </div>

      {/* Mobile Navbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 to-teal-400/40 rounded-xl blur-md -z-10"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-tight">
                  SpendSolo
                </span>
                
              </div>
            </div>

            {/* Mobile menu button and navigation */}
            <div className="flex items-center gap-4">
              
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={isMenuOpen ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-gray-900/95 backdrop-blur-xl border border-white/10"
          >
            <div className="py-4 space-y-3">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium hover:opacity-90 transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Desktop Back to home button - Hidden on mobile */}
      <div className="hidden lg:block absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="h-full flex flex-col lg:flex-row pt-16 lg:pt-0">
        {/* Left Column - Form */}
        <div className="flex-1 flex items-center lg:items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Desktop Logo - Hidden on mobile */}
            <div className="hidden lg:block text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/40 to-teal-400/40 rounded-2xl blur-xl -z-10"></div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to continue your financial journey</p>
            </div>

            {/* Mobile-only heading - Adjusted for navbar */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
            </div>

            {/* System Not Ready Warning */}
            {(!isLoaded || supabaseStatus.includes("failed")) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {!isLoaded ? "Authentication service is loading..." : 
                     supabaseStatus.includes("failed") ? "Database connection issue. Some features may be limited." :
                     "System is loading..."}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {/* Form Card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl opacity-50" />
              
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/30">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading || !isLoaded}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                        disabled={isLoading || !isLoaded}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading || !isLoaded}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || !isLoaded}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={isLoading || !isLoaded}
                        className="w-4 h-4 rounded bg-white/5 border border-white/10 text-emerald-500 focus:ring-emerald-500/50 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        id="rememberMe"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-3 text-sm text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  {/* Sign In button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !isLoaded}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </>
                    ) : !isLoaded ? (
                      "Loading..."
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/80 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn("oauth_google")}
                      disabled={isLoading || !isLoaded}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialSignIn("oauth_github")}
                      disabled={isLoading || !isLoaded}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </form>

                {/* Sign up link - Hidden on mobile since we have navbar */}
                <div className="hidden lg:block text-center mt-6 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                    >
                      Sign up now
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Security features - Mobile only (below form) */}
            <div className="lg:hidden space-y-4 mt-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-white font-semibold text-center mb-3">Secure Sign In</h3>
              {[
                { text: "Clerk authentication" },
                { text: "Supabase database backend" },
                { text: "End-to-end encryption" },
                { text: "Two-factor authentication ready" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Promotional (Desktop only) */}
        <div className="hidden lg:flex flex-1 sticky top-0 h-screen overflow-hidden">
          <div className="relative w-full h-full">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20" />
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-20 right-20 w-32 h-32 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-400/20 backdrop-blur-sm border border-white/10 p-6"
            />
            
            <motion.div
              animate={{ y: [0, 30, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-32 left-16 w-40 h-40 rounded-3xl bg-gradient-to-r from-blue-500/20 to-indigo-400/20 backdrop-blur-sm border border-white/10 p-8"
            />

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-md"
              >
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                  Welcome Back to
                  <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                    SpendSolo
                  </span>
                </h2>
                
                <p className="text-gray-300 text-xl mb-10 leading-relaxed">
                  Access your financial dashboard with Clerk-powered authentication and real-time Supabase data sync.
                </p>

                {/* Tech stack info */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                    Fast
                  </div>
                  <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                    Reliable
                  </div>
                  <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                    Transperent
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {[
                    { value: "99.9%", label: "Uptime" },
                    { value: "256-bit", label: "Encryption" },
                    { value: "Realtime", label: "Sync" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20"
                >
                  <p className="text-gray-300 italic mb-4">
                    "The Clerk + Supabase integration made setting up secure authentication and data storage incredibly easy!"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Victor Adoghe</div>
                      <div className="text-emerald-400 text-sm">Full Stack Engineer</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}