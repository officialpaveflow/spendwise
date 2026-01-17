import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, 
  Filter, Download, Eye, EyeOff, ChevronDown,
  ArrowUpRight, ArrowDownRight, PieChart, Target,
  CreditCard, Calendar, MoreVertical, Edit, Trash2,
  Wallet, RefreshCw, Settings, LogOut, Bell,
  Search, Menu, X, Sparkles, Home, CreditCard as CardIcon,
  BarChart3, Wallet as WalletIcon, Brain, MessageSquare,
  Send, CheckCircle, AlertCircle, Target as TargetIcon,
  TrendingUp as TrendingUpIcon, Banknote, CreditCard as CreditCardIcon,
  Building, Coins, Shield, Zap, Cpu, Clock, SendHorizonal,
  Settings as SettingsIcon, User, Bot, Upload, FileText,
  History, BookOpen, PiggyBank, CalendarDays, Paperclip,
  Image, FileUp, Loader2, ChevronLeft, Maximize2, Minimize2
} from "lucide-react";
import { useSupabase } from "../contexts/SupabaseContext";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Categories with proper color classes
const categories = [
  { name: "Food & Dining", icon: "🍔", color: "bg-emerald-500", bgColor: "bg-emerald-500/20", textColor: "text-emerald-400" },
  { name: "Shopping", icon: "🛍️", color: "bg-purple-500", bgColor: "bg-purple-500/20", textColor: "text-purple-400" },
  { name: "Transportation", icon: "🚗", color: "bg-blue-500", bgColor: "bg-blue-500/20", textColor: "text-blue-400" },
  { name: "Entertainment", icon: "🎬", color: "bg-pink-500", bgColor: "bg-pink-500/20", textColor: "text-pink-400" },
  { name: "Groceries", icon: "🛒", color: "bg-green-500", bgColor: "bg-green-500/20", textColor: "text-green-400" },
  { name: "Utilities", icon: "💡", color: "bg-yellow-500", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400" },
  { name: "Healthcare", icon: "🏥", color: "bg-red-500", bgColor: "bg-red-500/20", textColor: "text-red-400" },
  { name: "Salary", icon: "💰", color: "bg-emerald-600", bgColor: "bg-emerald-600/20", textColor: "text-emerald-500" },
  { name: "Other", icon: "📦", color: "bg-gray-500", bgColor: "bg-gray-500/20", textColor: "text-gray-400" },
];

// Navigation items
const navItems = [
  { name: "Overview", icon: <Home className="w-5 h-5" />, key: "overview" },
  { name: "Transactions", icon: <CreditCard className="w-5 h-5" />, key: "transactions" },
  { name: "AI Finance Assistant", icon: <Brain className="w-5 h-5" />, key: "analytics" },
  { name: "Settings", icon: <Settings className="w-5 h-5" />, key: "settings" },
];

// Available free models from OpenRouter - Qwen3 Next 80B A3B Instruct
const availableModels = [
  { 
    id: "qwen/qwen3-next-80b-a3b-instruct:free", 
    name: "Qwen3 Next 80B A3B", 
    provider: "qwen", 
    free: true,
    description: "Advanced 80B parameter model for comprehensive financial guidance"
  }
];

// Quick finance prompts
const quickPrompts = [
  { text: "Explain compound interest in simple terms", icon: "📈" },
  { text: "What are ETFs and how do they work?", icon: "🏦" },
  { text: "How to build good credit from scratch?", icon: "💳" },
  { text: "Best practices for emergency fund savings", icon: "🛡️" },
  { text: "Difference between stocks and bonds", icon: "📊" },
  { text: "How to read a stock market chart?", icon: "📉" }
];

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { 
      id: 1, 
      text: "Welcome to your AI Finance Assistant powered by Qwen3 Next 80B!\n\nI'm your comprehensive financial expert ready to help with ALL your finance questions, including:\n\nFinancial Education:\n- Basic concepts and terminology\n- Investment principles\n- Banking and credit\n- Tax fundamentals\n- Retirement planning\n\nPersonal Finance:\n- Budgeting and saving\n- Debt management\n- Financial goal setting\n- Money psychology\n- Risk assessment\n\nAdvanced Topics:\n- Market analysis\n- Portfolio theory\n- Economic indicators\n- Financial planning\n- Wealth management\n\nAsk me anything about finance - from beginner questions to advanced concepts!", 
      isUser: false, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: "Qwen3 Next 80B A3B",
      category: "welcome"
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentModel, setCurrentModel] = useState("Qwen3 Next 80B A3B");
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "Food & Dining",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: "expense"
  });

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [statementName, setStatementName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Use Supabase context
  const { 
    userProfile, 
    transactions, 
    chatHistory,
    statements,
    loading: supabaseLoading, 
    addTransaction, 
    deleteTransaction,
    updateProfile,
    addChatMessage,
    uploadStatement,
    analyzeStatement,
    fetchUserData
  } = useSupabase();

  // Initialize Clerk hooks
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Refs
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get user info
  const userName = user?.firstName || user?.username || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  // Calculate totals from real data
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  // Category spending
  const categorySpending = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + parseFloat(transaction.amount || 0);
      return acc;
    }, {});

  // OpenRouter API configuration for Qwen3 Next 80B A3B Instruct
  const OPENROUTER_API_KEY = "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";
  const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

  // Enhanced system prompt for comprehensive finance AI
  const getFinanceSystemPrompt = (userData) => {
    return `You are Qwen3 Next 80B A3B, an expert financial AI assistant with comprehensive knowledge in ALL areas of finance.

EXPERTISE AREAS:
1. PERSONAL FINANCE: Budgeting, saving, debt management, credit scores, banking
2. INVESTMENTS: Stocks, bonds, ETFs, mutual funds, crypto, real estate
3. RETIREMENT PLANNING: 401(k), IRA, Roth IRA, pension plans, Social Security
4. TAXES: Tax planning, deductions, credits, filing strategies, tax-advantaged accounts
5. INSURANCE: Life, health, auto, home, disability insurance
6. EDUCATION FINANCE: Student loans, 529 plans, scholarships, financial aid
7. ECONOMICS: Macroeconomics, microeconomics, market trends, monetary policy
8. FINANCIAL MARKETS: Stock market, bonds market, forex, commodities
9. CAREER FINANCE: Salary negotiation, benefits, retirement accounts
10. BEHAVIORAL FINANCE: Psychology of money, financial habits, decision-making

USER'S FINANCIAL DATA (if available):
- Total Balance: ${formatCurrency(userData.balance)}
- Total Income: ${formatCurrency(userData.totalIncome)}
- Total Expenses: ${formatCurrency(userData.totalExpenses)}
- Net Cash Flow: ${formatCurrency(userData.balance)}
- Savings Rate: ${userData.totalIncome > 0 ? `${((userData.balance / userData.totalIncome) * 100).toFixed(1)}%` : '0%'}
- Top Spending Categories: ${Object.entries(userData.categorySpending).slice(0, 3).map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`).join(', ')}

RESPONSE GUIDELINES:
1. Answer ALL finance-related questions comprehensively
2. Explain concepts clearly for all knowledge levels
3. Provide practical, actionable advice
4. Include real-world examples when helpful
5. Mention risks and considerations
6. Be educational and empowering
7. Reference user data only when relevant
8. Never use asterisks or markdown formatting

TONE: Knowledgeable, patient, encouraging, and clear. Aim to educate and empower.`;
  };

  // Detect finance category from text
  const detectFinanceCategory = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('budget') || lowerText.includes('spend') || lowerText.includes('expense') || lowerText.includes('saving')) return 'personal_finance';
    if (lowerText.includes('invest') || lowerText.includes('stock') || lowerText.includes('crypto') || lowerText.includes('portfolio') || lowerText.includes('etf') || lowerText.includes('bond')) return 'investment';
    if (lowerText.includes('retire') || lowerText.includes('401k') || lowerText.includes('ira') || lowerText.includes('pension') || lowerText.includes('social security')) return 'retirement';
    if (lowerText.includes('tax') || lowerText.includes('irs') || lowerText.includes('deduction') || lowerText.includes('credit')) return 'tax';
    if (lowerText.includes('credit') || lowerText.includes('loan') || lowerText.includes('debt') || lowerText.includes('mortgage') || lowerText.includes('score')) return 'credit_debt';
    if (lowerText.includes('insurance')) return 'insurance';
    if (lowerText.includes('econom') || lowerText.includes('market') || lowerText.includes('inflation') || lowerText.includes('recession')) return 'economics';
    if (lowerText.includes('student') || lowerText.includes('education') || lowerText.includes('college') || lowerText.includes('scholarship')) return 'education';
    if (lowerText.includes('statement') || lowerText.includes('pdf') || lowerText.includes('upload') || lowerText.includes('analyze')) return 'statement_analysis';
    if (lowerText.includes('career') || lowerText.includes('salary') || lowerText.includes('benefit') || lowerText.includes('negotiat')) return 'career';
    return 'general_finance';
  };

  // Handle add transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      alert("Please fill in amount and description");
      return;
    }

    try {
      const newTransaction = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type
      };

      const result = await addTransaction(newTransaction);
      
      if (result) {
        // Success - reset form
        setFormData({
          amount: "",
          category: "Food & Dining",
          description: "",
          date: new Date().toISOString().split('T')[0],
          type: "expense"
        });
        
        // Refresh data
        fetchUserData();
        
        // Show success message
        const successMessage = {
          id: Date.now(),
          text: `Transaction added successfully!\n${formData.type === 'income' ? 'Income: +' : 'Expense: -'}${formatCurrency(parseFloat(formData.amount))}\n${formData.description}\nCategory: ${formData.category}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: "System",
          category: "transaction"
        };
        
        if (activeTab === 'analytics') {
          setAiMessages(prev => [...prev, successMessage]);
        }
      } else {
        alert("Failed to add transaction. Please try again.");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction. Please check your input.");
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      fetchUserData();
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  // Main AI API call handler for all finance questions
  const callFinanceAI = async (userMessage, promptText) => {
    setIsAiThinking(true);

    try {
      const model = availableModels[0];
      
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://spendwise.com",
          "X-Title": "Finance AI Assistant",
          "X-Tracking": "true"
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            {
              role: "system",
              content: getFinanceSystemPrompt({
                balance,
                totalIncome,
                totalExpenses,
                transactionCount: transactions.length,
                categorySpending,
                monthlyLimit: userProfile?.monthly_limit || 2500
              })
            },
            {
              role: "user",
              content: promptText
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Clean response - remove asterisks
      const cleanedResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

      const aiMessage = {
        id: Date.now() + 1,
        text: cleanedResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: model.name,
        category: detectFinanceCategory(promptText)
      };

      setAiMessages(prev => [...prev, aiMessage]);
      await addChatMessage({
        content: cleanedResponse,
        is_user: false,
        model_used: model.name,
        category: aiMessage.category
      });

    } catch (error) {
      console.error("Error calling Finance AI API:", error);
      
      // Enhanced fallback response for various finance topics
      const category = detectFinanceCategory(promptText);
      let fallbackResponse = "";
      
      switch(category) {
        case 'investment':
          fallbackResponse = `Investment Education\n\nSince I'm having trouble accessing advanced resources, here's fundamental investment knowledge:\n\n1. Stocks: Ownership shares in companies\n2. Bonds: Loans to governments/corporations\n3. ETFs: Baskets of securities traded like stocks\n4. Mutual Funds: Professionally managed investment pools\n5. Risk vs Return: Higher potential returns = higher risk\n\nBasic Strategy:\n- Start with index funds (S&P 500)\n- Dollar-cost average regularly\n- Diversify across asset classes\n- Think long-term (5+ years)\n\nFor personalized advice based on your ${formatCurrency(balance)} balance, please try again in a moment.`;
          break;
        case 'retirement':
          fallbackResponse = `Retirement Planning Basics\n\nKey retirement accounts:\n1. 401(k): Employer-sponsored, tax-advantaged\n2. IRA: Individual Retirement Account\n3. Roth IRA: After-tax contributions, tax-free withdrawals\n\nGeneral Guidelines:\n- Save 15% of income for retirement\n- Take full employer match if available\n- Consider target date funds for simplicity\n- Review asset allocation annually\n\nWith your current balance of ${formatCurrency(balance)}, focus on consistent contributions.`;
          break;
        case 'tax':
          fallbackResponse = `Tax Fundamentals\n\nBasic tax concepts:\n- Deductions: Reduce taxable income\n- Credits: Direct reduction of tax owed\n- Tax brackets: Progressive tax rates\n- Standard vs itemized deductions\n\nCommon Tax-Advantaged Accounts:\n- 401(k): Pre-tax contributions\n- HSA: Triple tax advantage for medical\n- 529 Plan: Education savings\n- Roth IRA: After-tax, tax-free growth\n\nConsult a tax professional for specific advice regarding your ${transactions.length} transactions.`;
          break;
        case 'credit_debt':
          fallbackResponse = `Credit and Debt Management\n\nCredit Score Factors (FICO):\n1. Payment History (35%)\n2. Amounts Owed (30%)\n3. Length of Credit History (15%)\n4. Credit Mix (10%)\n5. New Credit (10%)\n\nDebt Management Strategies:\n- Snowball Method: Smallest balances first\n- Avalanche Method: Highest interest first\n- Debt Consolidation: Combine multiple debts\n- Balance Transfers: Lower interest cards\n\nWith your current financial position, focus on building emergency savings.`;
          break;
        default:
          fallbackResponse = `Finance Assistant Response\n\nI'm here to help with all your finance questions! Based on your question about "${promptText}", here's what I can tell you:\n\nYour Current Financial Snapshot:\n- Available Balance: ${formatCurrency(balance)}\n- Monthly Income: ${formatCurrency(totalIncome)}\n- Monthly Expenses: ${formatCurrency(totalExpenses)}\n- Net Position: ${balance >= 0 ? 'Positive' : 'Negative'}\n\nGeneral Finance Advice:\n1. Track all income and expenses\n2. Build emergency fund (3-6 months)\n3. Pay high-interest debt first\n4. Invest for long-term goals\n5. Review finances monthly\n\nFor more specific advice, please rephrase your question or try again.`;
      }

      const fallbackMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: "Qwen3 Finance AI (Local)",
        category: category
      };

      setAiMessages(prev => [...prev, fallbackMessage]);
      await addChatMessage({
        content: fallbackResponse,
        is_user: false,
        model_used: "Fallback",
        category: category
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle AI prompt submit for ALL finance questions
  const handleAiPromptSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: aiPrompt,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: null,
      category: detectFinanceCategory(aiPrompt)
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    
    // Save to database
    await addChatMessage({
      content: aiPrompt,
      is_user: true,
      model_used: null,
      category: userMessage.category
    });
    
    setAiPrompt("");

    // Auto scroll to bottom
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);

    // Call the finance AI API
    await callFinanceAI(userMessage, aiPrompt);
  };

  // Handle search for finance topics
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchMessage = {
      id: Date.now(),
      text: `Search: ${searchQuery}`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: null,
      category: "search"
    };
    
    setAiMessages(prev => [...prev, searchMessage]);
    await addChatMessage({
      content: `Search: ${searchQuery}`,
      is_user: true,
      model_used: null,
      category: "search"
    });
    
    setSearchQuery("");

    // Call finance AI with search query
    await callFinanceAI(searchMessage, `Provide comprehensive information about: ${searchQuery} in finance context. Cover definitions, examples, strategies, and practical applications.`);
  };

  // Clear chat history
  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setAiMessages([
        { 
          id: 1, 
          text: "Welcome to your AI Finance Assistant powered by Qwen3 Next 80B!\n\nI'm your comprehensive financial expert ready to help with ALL your finance questions, including:\n\nFinancial Education:\n- Basic concepts and terminology\n- Investment principles\n- Banking and credit\n- Tax fundamentals\n- Retirement planning\n\nPersonal Finance:\n- Budgeting and saving\n- Debt management\n- Financial goal setting\n- Money psychology\n- Risk assessment\n\nAdvanced Topics:\n- Market analysis\n- Portfolio theory\n- Economic indicators\n- Financial planning\n- Wealth management\n\nAsk me anything about finance - from beginner questions to advanced concepts!", 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          model: availableModels[0].name,
          category: "welcome"
        }
      ]);
    }
  };

  // Calculate monthly stats
  const calculateMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const currentMonthIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const currentMonthExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const incomeChange = lastMonthIncome ? 
      ((currentMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1) : 0;
    
    const expenseChange = lastMonthExpenses ? 
      ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1) : 0;

    return {
      currentMonthIncome,
      currentMonthExpenses,
      incomeChange: parseFloat(incomeChange),
      expenseChange: parseFloat(expenseChange)
    };
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadedFile || !statementName.trim()) {
      alert("Please provide a file and statement name");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadStatement(uploadedFile, statementName);
      if (result) {
        setUploadedFile(null);
        setStatementName("");
        setShowStatementModal(false);
        
        // Add AI message about upload
        const uploadMessage = {
          id: Date.now(),
          text: `Statement Uploaded Successfully\n\nI've received "${statementName}" and will now analyze it for:\n\n1. Transaction Extraction\n2. Spending Categorization\n3. Pattern Recognition\n4. Financial Insights\n\nThe analysis will be ready shortly. You can ask me about specific findings once processing is complete.`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: "Statement Analyzer",
          category: "statement_analysis"
        };
        
        setAiMessages(prev => [...prev, uploadMessage]);
        await addChatMessage({
          content: uploadMessage.text,
          is_user: false,
          model_used: "System",
          category: "statement_analysis"
        });
        
        // Refresh data
        fetchUserData();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (!statementName.trim()) {
        setStatementName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Use quick prompt
  const useQuickPrompt = (prompt) => {
    setAiPrompt(prompt);
    // Auto-submit after a short delay
    setTimeout(() => {
      if (prompt) {
        const submitEvent = new Event('submit', { cancelable: true });
        handleAiPromptSubmit({ preventDefault: () => {} });
      }
    }, 100);
  };

  // Load chat from history
  const loadChatFromHistory = (chat) => {
    const newMessage = {
      id: Date.now(),
      text: chat.content,
      isUser: chat.is_user,
      timestamp: new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: chat.model_used || "Unknown",
      category: chat.category || "general"
    };
    
    setAiMessages(prev => [...prev, newMessage]);
    setShowChatHistory(false);
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  // Calculate monthly stats
  const monthlyStats = calculateMonthlyStats();

  // Update profile field
  const handleUpdateProfile = (field, value) => {
    updateProfile({ [field]: value });
  };

  // Render loading state
  if (!isLoaded || supabaseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Chat History Sidebar Component
  const ChatHistorySidebar = () => (
    <AnimatePresence>
      {showChatHistory && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-0"
            onClick={() => setShowChatHistory(false)}
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 lg:relative lg:inset-auto lg:w-64 lg:bg-gray-900/50 lg:backdrop-blur-xl"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chat History</h3>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">{chatHistory.length} conversations</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {chatHistory.slice(0, 20).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => loadChatFromHistory(chat)}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${
                          chat.category === 'investment' ? 'bg-blue-500/20 text-blue-400' :
                          chat.category === 'personal_finance' ? 'bg-emerald-500/20 text-emerald-400' :
                          chat.category === 'credit_debt' ? 'bg-red-500/20 text-red-400' :
                          chat.category === 'retirement' ? 'bg-purple-500/20 text-purple-400' :
                          chat.category === 'tax' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {chat.category || 'general'}
                        </span>
                      </div>
                      <p className="text-white text-sm line-clamp-2">
                        {chat.content.length > 80 ? chat.content.substring(0, 80) + '...' : chat.content}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          chat.is_user 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {chat.is_user ? 'You' : 'AI'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </button>
                  ))}
                  {chatHistory.length === 0 && (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No chat history yet</p>
                      <p className="text-gray-500 text-sm mt-2">Start a conversation with the Finance AI!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // File Upload Popover Component
  const FileUploadPopover = () => (
    <AnimatePresence>
      {showFileUpload && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setShowFileUpload(false)}
          />
          <motion.div
            initial={{ y: 10, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 z-40 bg-gray-800 border border-white/10 rounded-xl shadow-xl p-4 w-72"
          >
            <div className="space-y-3">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowFileUpload(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FileUp className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Upload File</p>
                  <p className="text-gray-400 text-sm">PDF, CSV, Excel, Images</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setShowStatementModal(true);
                  setShowFileUpload(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Analyze Statement</p>
                  <p className="text-gray-400 text-sm">Bank statements, bills, receipts</p>
                </div>
              </button>
              
              <div className="pt-2 border-t border-white/10">
                <p className="text-gray-400 text-xs text-center">
                  Files are securely analyzed by our Finance AI
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Balance */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Total Balance</h3>
                  <button 
                    onClick={() => setShowBalance(!showBalance)} 
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {showBalance ? formatCurrency(balance) : "••••••"}
                </div>
                <div className={`flex items-center text-sm ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {balance >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {showBalance ? `${monthlyStats.incomeChange >= 0 ? '+' : ''}${monthlyStats.incomeChange}% from last month` : "•••% from last month"}
                </div>
              </div>

              {/* Total Income */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium">Total Income</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{formatCurrency(totalIncome)}</div>
                <div className={`text-sm ${monthlyStats.incomeChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {monthlyStats ? `${monthlyStats.incomeChange >= 0 ? '+' : ''}${formatCurrency(monthlyStats.currentMonthIncome)} this month` : 'Loading...'}
                </div>
              </div>

              {/* Total Expenses */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium">Total Expenses</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{formatCurrency(totalExpenses)}</div>
                <div className={`text-sm ${monthlyStats.expenseChange >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {monthlyStats ? `${monthlyStats.expenseChange >= 0 ? '+' : ''}${formatCurrency(monthlyStats.currentMonthExpenses)} this month` : 'Loading...'}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab("transactions")}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => {
                  const categoryInfo = categories.find(c => c.name === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          <span className="text-2xl">{categoryInfo?.icon || "📦"}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{transaction.description}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-400 text-sm">{transaction.category}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No transactions yet.</p>
                    <button 
                      onClick={() => setActiveTab("transactions")}
                      className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      Add your first transaction
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4">Spending by Category</h3>
                <div className="space-y-4">
                  {Object.entries(categorySpending).length > 0 ? (
                    Object.entries(categorySpending).slice(0, 5).map(([category, amount]) => {
                      const categoryInfo = categories.find(c => c.name === category);
                      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${categoryInfo?.color || 'bg-gray-500'} flex items-center justify-center`}>
                                <span className="text-sm">{categoryInfo?.icon || '📦'}</span>
                              </div>
                              <span className="text-gray-300">{category}</span>
                            </div>
                            <span className="text-white font-bold">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1 }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-4">No spending data yet</p>
                  )}
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4">Monthly Overview</h3>
                <div className="space-y-4">
                  {[
                    { label: "Income", value: totalIncome, change: `${monthlyStats.incomeChange >= 0 ? '+' : ''}${monthlyStats.incomeChange}%`, color: "text-emerald-400" },
                    { label: "Expenses", value: totalExpenses, change: `${monthlyStats.expenseChange >= 0 ? '+' : ''}${monthlyStats.expenseChange}%`, color: "text-red-400" },
                    { label: "Savings", value: balance, change: balance >= 0 ? "+15.2%" : "-5.8%", color: balance >= 0 ? "text-emerald-400" : "text-red-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div>
                        <p className="text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stat.value)}</p>
                      </div>
                      <span className={`font-semibold ${stat.color}`}>{stat.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "transactions":
        return (
          <div className="space-y-6">
            {/* Add Transaction Form */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Add New Transaction</h2>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name} className={cat.textColor}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="What was this transaction for?"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: "income"})}
                        className={`flex-1 px-4 py-3 rounded-lg border transition-all ${formData.type === "income" ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: "expense"})}
                        className={`flex-1 px-4 py-3 rounded-lg border transition-all ${formData.type === "expense" ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                      >
                        Expense
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Transaction
                </button>
              </form>
            </div>

            {/* All Transactions */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">All Transactions ({transactions.length})</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const categoryInfo = categories.find(c => c.name === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo?.bgColor || 'bg-gray-500/20'}`}>
                          <span className={`text-2xl ${categoryInfo?.textColor || 'text-gray-400'}`}>{categoryInfo?.icon || "📦"}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{transaction.description}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-sm ${categoryInfo?.textColor || 'text-gray-400'}`}>{transaction.category}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No transactions yet. Add your first transaction above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-950' : 'relative'}`}>
            {/* Finance Assistant Header */}
            <div className={`${isFullscreen ? 'fixed top-0 left-0 right-0 z-10' : ''} bg-gray-900/50 backdrop-blur-sm border-b border-white/10`}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowChatHistory(!showChatHistory)}
                      className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <History className="w-5 h-5 text-white" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Finance Assistant</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                          <span className="text-emerald-400 text-sm font-medium">Ask me anything about finance!</span>
                        </div>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">Powered by Qwen3 Next 80B</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
                    </button>
                    <button
                      onClick={clearChat}
                      className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${isFullscreen ? 'pt-16 pb-32 h-screen' : 'pt-4 pb-32'}`}>
              {/* Chat Container */}
              <div 
                ref={chatContainerRef}
                className={`space-y-6 ${isFullscreen ? 'px-4 h-full overflow-y-auto' : 'max-w-4xl mx-auto px-4 lg:px-0'}`}
              >
                {/* Welcome Message */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Your Personal Finance Expert</h1>
                  <p className="text-gray-400">Ask me anything about money, investments, taxes, retirement, or financial planning</p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => useQuickPrompt(prompt.text)}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{prompt.icon}</span>
                        <span className="text-white font-medium">{prompt.text}</span>
                      </div>
                      <p className="text-gray-400 text-sm">Click for detailed explanation</p>
                    </button>
                  ))}
                </div>

                {/* Chat Messages */}
                <div className="space-y-6">
                  {aiMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 ${
                        message.isUser
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          {!message.isUser ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className={`text-sm font-medium ${message.isUser ? 'text-blue-400' : 'text-emerald-400'}`}>
                            {message.isUser ? 'You' : 'Finance AI Assistant'}
                          </span>
                          <span className="text-gray-500 text-xs ml-auto">{message.timestamp}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-white">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isAiThinking && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-emerald-400 text-sm font-medium">Finance AI Assistant</span>
                          <span className="text-gray-500 text-xs px-2 py-0.5 bg-gray-800/50 rounded">
                            Researching your finance question...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 ml-8">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className={`fixed bottom-0 left-0 right-0 z-10 ${isFullscreen ? 'lg:left-0' : 'lg:left-64'} bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4`}>
                <div className={`${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
                  {/* File Upload Popover */}
                  <div className="relative">
                    <FileUploadPopover />
                  </div>

                  <form onSubmit={handleAiPromptSubmit} className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask any finance question... (investments, taxes, retirement, etc.)"
                      rows={2}
                      className="w-full px-4 py-3 pr-24 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                      disabled={isAiThinking}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAiPromptSubmit(e);
                        }
                      }}
                    />
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    
                    {/* Action Buttons */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={isAiThinking}
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        type="submit"
                        disabled={isAiThinking || !aiPrompt.trim()}
                        className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                      >
                        {isAiThinking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <SendHorizonal className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Quick Tips */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                      Ask about any finance topic
                    </span>
                    <span>•</span>
                    <button 
                      onClick={() => setAiPrompt("What is compound interest and how does it work?")}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      📚 Learn finance basics
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => setShowStatementModal(true)}
                      className="hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload statement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History Sidebar */}
            <ChatHistorySidebar />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                    <p className="text-gray-400">Manage your account information</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-white font-medium">{userName}</div>
                    <div className="text-gray-400 text-sm">{userEmail}</div>
                  </div>
                  <UserButton 
                    appearance={{
                      elements: {
                        rootBox: "h-12 w-12",
                        avatarBox: "w-full h-full",
                        userButtonTrigger: "focus:ring-2 focus:ring-emerald-500/50"
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userProfile?.full_name || userName}
                    onChange={(e) => handleUpdateProfile('full_name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile?.phone || ""}
                    onChange={(e) => handleUpdateProfile('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Monthly Budget</label>
                  <input
                    type="number"
                    value={userProfile?.monthly_limit || 2500}
                    onChange={(e) => handleUpdateProfile('monthly_limit', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    step="100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={userProfile?.bio || ""}
                    onChange={(e) => handleUpdateProfile('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Profile Photo</h3>
                    <p className="text-gray-400 text-sm">Update your profile picture using the Clerk user button above</p>
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Account Management */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium">Account Management</h3>
                    <p className="text-gray-400 text-sm">Manage your account settings and sign out</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      View Full Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-indigo-500/10 rounded-full blur-2xl"
        />
      </div>

      {/* Mobile Header - Hidden in AI Analytics fullscreen mode */}
      {!(activeTab === "analytics" && isFullscreen) && (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-white/10 py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  SpendWise
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5 text-white" />
              </button>
              <UserButton 
                appearance={{
                  elements: {
                    rootBox: "h-10 w-10",
                    avatarBox: "w-full h-full"
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </header>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out">
            {/* Mobile Sidebar Content */}
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    SpendWise
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.key
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20 text-white border border-emerald-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-white font-medium mb-2">Monthly Limit</div>
                  <div className="text-2xl font-bold text-white mb-2">{formatCurrency(userProfile?.monthly_limit || 2500)}</div>
                  <div className="text-gray-400 text-sm">
                    {userProfile?.monthly_limit ? `${formatCurrency(Math.max(0, (userProfile.monthly_limit || 2500) - totalExpenses))} remaining` : "Set your monthly limit"}
                  </div>
                  <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ 
                      width: `${Math.min(100, (totalExpenses / (userProfile?.monthly_limit || 2500)) * 100)}%`,
                      background: totalExpenses > (userProfile?.monthly_limit || 2500) 
                        ? 'linear-gradient(to right, #ef4444, #dc2626)' 
                        : 'linear-gradient(to right, #10b981, #0d9488)'
                    }}></div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{userInitial}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{userName}</div>
                    <div className="text-gray-400 text-sm">{userEmail}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Statement Upload Modal */}
      <AnimatePresence>
        {showStatementModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowStatementModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Upload Account Statement</h3>
                    <button
                      onClick={() => setShowStatementModal(false)}
                      className="p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Statement Name</label>
                      <input
                        type="text"
                        value={statementName}
                        onChange={(e) => setStatementName(e.target.value)}
                        placeholder="e.g., Chase Bank - January 2024"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Statement File</label>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf,.csv,.xlsx,.xls,.txt"
                          className="hidden"
                          id="file-upload-modal"
                          required
                        />
                        <label htmlFor="file-upload-modal" className="cursor-pointer block">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-300">Drop your statement here or click to upload</p>
                          <p className="text-gray-400 text-sm mt-2">PDF, CSV, Excel files supported</p>
                        </label>
                        {uploadedFile && (
                          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-emerald-400 mr-2" />
                              <div className="flex-1 min-w-0">
                                <p className="text-emerald-300 truncate">{uploadedFile.name}</p>
                                <p className="text-gray-400 text-xs">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setUploadedFile(null)}
                                className="ml-2 p-1 hover:bg-red-500/20 rounded"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading & Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Analyze Statement
                        </>
                      )}
                    </button>
                    
                    <p className="text-gray-400 text-xs text-center mt-4">
                      Statements are analyzed by Finance AI for transactions, categorized, and provide insights
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="relative min-h-screen">
        {/* Desktop Sidebar - Hidden in AI Analytics fullscreen mode */}
        {!(activeTab === "analytics" && isFullscreen) && (
          <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-white/10 bg-gray-950/50 backdrop-blur-xl">
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    SpendWise
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.key
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20 text-white border border-emerald-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-white font-medium mb-2">Monthly Limit</div>
                  <div className="text-2xl font-bold text-white mb-2">{formatCurrency(userProfile?.monthly_limit || 2500)}</div>
                  <div className="text-gray-400 text-sm">
                    {userProfile?.monthly_limit ? `${formatCurrency(Math.max(0, (userProfile.monthly_limit || 2500) - totalExpenses))} remaining` : "Set your monthly limit"}
                  </div>
                  <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ 
                      width: `${Math.min(100, (totalExpenses / (userProfile?.monthly_limit || 2500)) * 100)}%`,
                      background: totalExpenses > (userProfile?.monthly_limit || 2500) 
                        ? 'linear-gradient(to right, #ef4444, #dc2626)' 
                        : 'linear-gradient(to right, #10b981, #0d9488)'
                    }}></div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{userInitial}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{userName}</div>
                    <div className="text-gray-400 text-sm">{userEmail}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`${!(activeTab === "analytics" && isFullscreen) ? 'lg:ml-64' : ''} pt-0 lg:pt-0`}>
          <div className={`${activeTab === "analytics" ? 'p-0' : 'p-4 lg:p-6'} ${activeTab === "analytics" && isFullscreen ? '' : 'pt-16 lg:pt-0'}`}>
            {/* Welcome Header - Hidden in AI Analytics */}
            {activeTab !== "analytics" && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {activeTab === "overview" && `Welcome back, ${userName}! 👋`}
                  {activeTab === "transactions" && "Transactions 💳"}
                  {activeTab === "settings" && "Settings ⚙️"}
                </h1>
                <p className="text-gray-400">
                  {activeTab === "overview" && "Here's your financial overview for today"}
                  {activeTab === "transactions" && `Manage and track all your transactions (${transactions.length} total)`}
                  {activeTab === "settings" && "Manage your profile and account settings"}
                </p>
              </div>
            )}

            {/* Render content based on active tab */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}