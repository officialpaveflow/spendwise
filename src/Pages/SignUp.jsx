import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Menu, 
  X, 
  Key,
  ArrowRight,
  Check,
  RefreshCw,
  AlertCircle,
  Database
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp, useClerk } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase"; // Import Supabase client

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [showVerification, setShowVerification] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [clerkStatus, setClerkStatus] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState("");

  // Initialize Clerk hooks
  const { isLoaded, signUp, setActive } = useSignUp();
  const clerk = useClerk();
  const navigate = useNavigate();

  // Debug Clerk and Supabase status
  useEffect(() => {
    console.log("Clerk Status:", {
      isLoaded,
      signUp: !!signUp,
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
    
    setClerkStatus(`Clerk Loaded: ${isLoaded}, SignUp: ${!!signUp}`);
    checkSupabase();
  }, [isLoaded, signUp, clerk]);

  // Redirect if already signed in
  useEffect(() => {
    if (clerk?.session) {
      console.log("User already signed in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [clerk?.session, navigate]);

  // Handle resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Create user profile in Supabase after successful Clerk signup
  const createSupabaseProfile = async (userId, userData) => {
    try {
      console.log("Creating Supabase profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: userData.name,
            email: userData.email,
            monthly_limit: 2500,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating Supabase profile:", error);
        // Don't fail the signup if Supabase fails
        return null;
      }

      console.log("Supabase profile created:", data);
      return data;
    } catch (error) {
      console.error("Exception creating Supabase profile:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    console.log("Sign up attempt with data:", { ...formData, password: "***" });
    console.log("Clerk state:", { isLoaded, signUp: !!signUp });

    if (!isLoaded) {
      setError("Authentication service is loading, please try again");
      console.error("Clerk not loaded");
      return;
    }

    if (!signUp) {
      setError("Authentication service not available. Please refresh the page.");
      console.error("SignUp object not available");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating sign up...");
      
      // Start the sign-up process using Clerk
      const result = await signUp.create({
        firstName: formData.name.split(" ")[0] || "User",
        lastName: formData.name.split(" ").slice(1).join(" ") || "",
        emailAddress: formData.email,
        password: formData.password,
      });

      console.log("Sign up result:", result);

      // Check the sign-up status
      if (result.status === "complete") {
        // If sign up is complete, set the session as active
        console.log("Sign up complete, setting active session");
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Create Supabase profile
        await createSupabaseProfile(result.createdUserId, formData);
        
        setSuccessMessage("Account created successfully! Redirecting...");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else if (result.status === "pending_verification") {
        // Show verification form
        console.log("Verification required");
        setShowVerification(true);
        setSuccessMessage("Verification code sent to your email!");
        setResendTimer(30); // 30 seconds cooldown for resend
      } else {
        console.log("Unexpected status:", result.status);
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      handleSignUpError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpError = (err) => {
    console.log("Error details:", err);
    
    if (err.errors && err.errors[0]) {
      const clerkError = err.errors[0];
      console.log("Clerk error code:", clerkError.code);
      
      switch (clerkError.code) {
        case "form_password_pwned":
          setError("This password has been compromised in a data breach. Please choose a different password.");
          break;
        case "form_password_length_too_short":
          setError("Password is too short. Please use at least 8 characters.");
          break;
        case "form_param_format_invalid":
          setError("Invalid email format. Please enter a valid email address.");
          break;
        case "form_identifier_exists":
          setError("An account with this email already exists. Please sign in instead.");
          break;
        case "form_password_no_uppercase":
          setError("Password must contain at least one uppercase letter.");
          break;
        case "form_password_no_lowercase":
          setError("Password must contain at least one lowercase letter.");
          break;
        case "form_password_no_number":
          setError("Password must contain at least one number.");
          break;
        case "form_param_nil":
          setError("Please fill in all required fields.");
          break;
        default:
          setError(clerkError.longMessage || clerkError.message || "An error occurred during sign up");
      }
    } else if (err.message) {
      setError(err.message);
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits of the verification code");
      return;
    }

    if (!isLoaded || !signUp) {
      setError("Authentication service not available. Please refresh the page.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting verification with code:", code);
      
      // Attempt to verify the email
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification result:", result);

      if (result.status === "complete") {
        // Verification successful, set active session
        console.log("Verification complete");
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Create Supabase profile after verification
        await createSupabaseProfile(result.createdUserId, formData);
        
        setSuccessMessage("Email verified successfully! Redirecting...");
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        console.log("Verification failed with status:", result.status);
        setError("Verification failed. Please check the code and try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      if (err.errors && err.errors[0]) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_code_incorrect") {
          setError("Invalid verification code. Please check and try again.");
        } else if (clerkError.code === "form_param_format_invalid") {
          setError("Invalid code format. Please enter a valid 6-digit code.");
        } else {
          setError(clerkError.message || "Verification failed. Please try again.");
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || !isLoaded || !signUp) return;
    
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      console.log("Preparing email verification resend...");
      
      // Prepare verification data
      await signUp.prepareEmailAddressVerification();
      setSuccessMessage("New verification code sent to your email!");
      setResendTimer(30);
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
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

  // Handle social sign-up
  const handleSocialSignUp = (strategy) => {
    if (!isLoaded || !signUp) return;
    
    signUp.authenticateWithRedirect({
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
            className="overflow-hidden bg-gray-900/95 backdrop-blur-xl border-b border-white/10"
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
                to="/signin"
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
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
                  
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/40 to-teal-400/40 rounded-2xl blur-xl -z-10"></div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                {showVerification ? "Verify Your Email" : "Create Account"}
              </h1>
              <p className="text-gray-400">
                {showVerification ? "Enter the code sent to your email" : "Join thousands mastering their finances"}
              </p>
            </div>

            {/* Mobile-only heading - Adjusted for navbar */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                {showVerification ? "Verify Your Email" : "Create Your Account"}
              </h1>
              <p className="text-gray-400 text-sm">
                {showVerification ? "Enter the 6-digit verification code" : "Start your financial journey in minutes"}
              </p>
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

            {/* Verification Form */}
            {showVerification ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl opacity-50" />
                
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/30">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-gray-400 text-sm">
                      We sent a 6-digit code to <span className="text-emerald-300">{formData.email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerificationSubmit} className="space-y-6">
                    {/* Verification Code Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                        Enter verification code
                      </label>
                      <div className="flex justify-center gap-2 mb-2">
                        {verificationCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={isLoading || !isLoaded}
                            className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all disabled:opacity-50"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">
                        Didn't receive a code?{" "}
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendTimer > 0 || isLoading || !isLoaded}
                          className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                          {resendTimer === 0 && <RefreshCw className="w-3 h-3 inline ml-1" />}
                        </button>
                      </p>
                    </div>

                    {/* Verify button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || verificationCode.join("").length !== 6 || !isLoaded}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>

                    {/* Back to sign up */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowVerification(false)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-300 text-sm disabled:opacity-50"
                      >
                        ← Back to sign up
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* Original Sign-up Form */
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-white/5 blur-xl opacity-50" />
                
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/30">
                  {/* Social Sign-in Buttons */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSocialSignUp("oauth_google")}
                        disabled={isLoading || !isLoaded}
                        className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        onClick={() => handleSocialSignUp("oauth_github")}
                        disabled={isLoading || !isLoaded}
                        className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </button>
                    </div>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900/80 text-gray-400">Or continue with email</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isLoading || !isLoaded}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          disabled={isLoading || !isLoaded}
                          minLength={8}
                          className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="At least 8 characters"
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
                      <p className="mt-2 text-xs text-gray-500">
                        Use at least 8 characters with a mix of letters, numbers, and symbols
                      </p>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        disabled={isLoading || !isLoaded}
                        className="w-4 h-4 rounded bg-white/5 border border-white/10 text-emerald-500 focus:ring-emerald-500/50 focus:ring-2 mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        id="acceptTerms"
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="ml-3 text-sm text-gray-300"
                      >
                        I agree to the{" "}
                        <a href="#" className="text-emerald-400 hover:text-emerald-300">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-emerald-400 hover:text-emerald-300">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Sign Up button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !formData.acceptTerms || !isLoaded}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Account...
                        </>
                      ) : !isLoaded ? (
                        "Loading..."
                      ) : (
                        <>
                          Create Account
                          <Database className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Sign in link */}
                  <div className="text-center mt-6 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/signin"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick benefits - Mobile only */}
            {!showVerification && (
              <div className="lg:hidden space-y-4 mt-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-white font-semibold text-center mb-3">Why Join SpendSolo?</h3>
                {[
                  { text: "Secure authentication with Clerk" },
                  { text: "Real-time data sync with Supabase" },
                  { text: "Bank-level security & encryption" },
                  { text: "AI-powered financial insights" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            )}
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
                  {showVerification ? "Almost There!" : "Start Your"}
                  {!showVerification && (
                    <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                      Financial Journey
                    </span>
                  )}
                </h2>
                
                <p className="text-gray-300 text-xl mb-10 leading-relaxed">
                  {showVerification 
                    ? "Verify your email to unlock all features and start managing your finances with AI-powered insights."
                    : "Join thousands who have taken control of their finances with our Clerk + Supabase powered platform."
                  }
                </p>

                {/* Tech stack info */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  
                </div>

                {/* Stats */}
                {!showVerification && (
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
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}