const supabase = require('../lib/supabase');
const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
});

exports.sendMessage = async (req, res) => {
  try {
    const { userId, message, context } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }

    // Get user's financial data for context
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(100);

    const { data: statements } = await supabase
      .from('account_statements')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    // Calculate financial stats
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Prepare AI context
    const systemPrompt = `
    You are a financial AI assistant. The user has these financial details:
    
    Financial Summary:
    - Total Balance: $${balance.toFixed(2)}
    - Total Income: $${totalIncome.toFixed(2)}
    - Total Expenses: $${totalExpenses.toFixed(2)}
    - Number of Transactions: ${transactions.length}
    - Analyzed Statements: ${statements.length}
    
    Recent Transactions (last 5):
    ${transactions.slice(0, 5).map(t => 
      `- ${t.date}: ${t.type === 'income' ? '+' : '-'}$${t.amount} for ${t.description} (${t.category})`
    ).join('\n')}
    
    Provide detailed, actionable financial advice. Be specific and helpful.
    If asked about statements, reference the ${statements.length} statements analyzed.
    `;

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0].message.content;

    // Save conversation to database
    const { data: userMessage } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          content: message,
          is_user: true,
          model_used: 'gpt-4',
          category: 'general',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    const { data: aiMessage } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          content: aiResponse,
          is_user: false,
          model_used: 'gpt-4',
          category: 'response',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    res.json({
      success: true,
      response: aiResponse,
      conversation: {
        userMessage,
        aiMessage
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }

    res.json({
      success: true,
      messages: data.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};