// contexts/SupabaseContext.js - FIXED VERSION
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

const SupabaseContext = createContext({});

export const useSupabase = () => useContext(SupabaseContext);

export function SupabaseProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const clerkId = user.id;
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
      } else if (profileError?.code === 'PGRST116') {
        // Create profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              clerk_id: clerkId,
              email: user.primaryEmailAddress?.emailAddress,
              full_name: user.fullName || user.username || 'User',
              monthly_limit: 2500
            }
          ])
          .select()
          .single();

        if (!createError && newProfile) {
          setUserProfile(newProfile);
        } else if (createError) {
          console.error('Error creating profile:', createError);
        }
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clerkId)
        .order('date', { ascending: false });

      if (!transactionsError && transactionsData) {
        setTransactions(transactionsData);
      } else if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      }

      // Fetch chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', clerkId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!chatError && chatData) {
        setChatHistory(chatData);
      } else if (chatError) {
        console.error('Error fetching chat history:', chatError);
      }

      // Fetch account statements
      const { data: statementsData, error: statementsError } = await supabase
        .from('account_statements')
        .select('*')
        .eq('user_id', clerkId)
        .order('uploaded_at', { ascending: false });

      if (!statementsError && statementsData) {
        setStatements(statementsData);
      } else if (statementsError) {
        console.error('Error fetching statements:', statementsError);
      }

    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    if (!user) {
      console.error('No user found');
      return null;
    }

    try {
      console.log('Adding transaction for user:', user.id);
      console.log('Transaction data:', transaction);

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id, // Use Clerk user ID
            amount: parseFloat(transaction.amount),
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            type: transaction.type,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Transaction added successfully:', data);
      
      // Update local state immediately
      setTransactions(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error in addTransaction:', error);
      return null;
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Use Clerk user ID

      if (error) {
        console.error('Error deleting transaction:', error);
        return;
      }

      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('clerk_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addChatMessage = async (message) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([
          {
            user_id: user.id,
            content: message.content,
            is_user: message.is_user,
            model_used: message.model_used,
            category: message.category,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding chat message:', error);
        return null;
      }

      if (data) {
        setChatHistory(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error adding chat message:', error);
      return null;
    }
  };

  const uploadStatement = async (file, statementName) => {
    if (!user) return null;

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('statements')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('statements')
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from('account_statements')
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            file_url: publicUrl,
            statement_name: statementName,
            uploaded_at: new Date().toISOString(),
            processed: false
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      if (data) {
        setStatements(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error uploading statement:', error);
      return null;
    }
  };

  const analyzeStatement = async (statementId) => {
    try {
      const statement = statements.find(s => s.id === statementId);
      if (!statement) return;

      // Simulate analysis
      const mockAnalysis = {
        summary: `Analyzed ${statement.statement_name}: Found transactions and categorized spending.`,
        totalIncome: Math.random() * 5000 + 3000,
        totalExpenses: Math.random() * 4000 + 2000,
        categories: {
          'Food & Dining': Math.random() * 1000 + 500,
          'Shopping': Math.random() * 800 + 400,
          'Utilities': Math.random() * 300 + 200,
        }
      };

      const { error } = await supabase
        .from('account_statements')
        .update({
          processed: true,
          analysis: mockAnalysis.summary,
          total_income: mockAnalysis.totalIncome,
          total_expenses: mockAnalysis.totalExpenses,
          categories: mockAnalysis.categories
        })
        .eq('id', statementId)
        .eq('user_id', user.id);

      if (!error) {
        fetchUserData(); // Refresh data
      }
    } catch (error) {
      console.error('Error analyzing statement:', error);
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        userProfile,
        transactions,
        chatHistory,
        statements,
        loading,
        addTransaction,
        deleteTransaction,
        updateProfile,
        addChatMessage,
        uploadStatement,
        analyzeStatement,
        fetchUserData
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}