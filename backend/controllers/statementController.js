const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const supabase = require('../lib/supabase');
const { OpenAI } = require('openai');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|csv|xlsx|xls|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, CSV, Excel, and text files are allowed'));
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
});

exports.uploadStatement = [
  upload.single('statement'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { userId, statementName } = req.body;
      
      if (!userId || !statementName) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'User ID and statement name are required' });
      }

      // Parse the uploaded file
      let extractedText = '';
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      try {
        if (fileExt === '.pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(dataBuffer);
          extractedText = pdfData.text;
        } else if (fileExt === '.csv') {
          const results = [];
          await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
              .pipe(csv())
              .on('data', (data) => results.push(data))
              .on('end', () => {
                extractedText = JSON.stringify(results, null, 2);
                resolve();
              })
              .on('error', reject);
          });
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          extractedText = JSON.stringify(data, null, 2);
        } else if (fileExt === '.txt') {
          extractedText = fs.readFileSync(filePath, 'utf8');
        }
      } catch (parseError) {
        console.error('Error parsing file:', parseError);
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Failed to parse file' });
      }

      // Analyze with AI
      let analysis = '';
      let transactions = [];
      
      try {
        const prompt = `
        Analyze this financial statement and extract key information:
        
        ${extractedText.substring(0, 10000)} // Limit to first 10k chars
        
        Provide:
        1. Summary of the statement
        2. List of transactions with dates, amounts, descriptions
        3. Total income and expenses
        4. Categories of spending
        5. Financial insights and recommendations
        
        Format as JSON with this structure:
        {
          "summary": "Brief summary",
          "totalIncome": 0,
          "totalExpenses": 0,
          "transactions": [
            {"date": "YYYY-MM-DD", "amount": 0, "description": "", "category": ""}
          ],
          "categories": {"Category1": 0, "Category2": 0},
          "insights": ["insight1", "insight2"],
          "recommendations": ["rec1", "rec2"]
        }
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a financial analysis AI. Extract and analyze financial data from statements. Return valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Try to parse JSON response
        try {
          const parsed = JSON.parse(aiResponse);
          analysis = parsed.summary;
          transactions = parsed.transactions || [];
        } catch {
          analysis = aiResponse;
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        analysis = 'AI analysis failed. Manual review required.';
      }

      // Save to database
      const { data, error } = await supabase
        .from('account_statements')
        .insert([
          {
            user_id: userId,
            file_name: req.file.originalname,
            file_path: req.file.path,
            file_url: `/uploads/${req.file.filename}`,
            statement_name: statementName,
            extracted_text: extractedText.substring(0, 5000), // Store first 5k chars
            analysis: analysis,
            transactions: transactions,
            total_income: 0, // Will be calculated from transactions
            total_expenses: 0, // Will be calculated from transactions
            processed: true,
            uploaded_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: 'Failed to save statement' });
      }

      // Auto-add transactions to database if extracted
      if (transactions.length > 0) {
        const transactionPromises = transactions.map(tx => 
          supabase.from('transactions').insert({
            user_id: userId,
            amount: tx.amount,
            category: tx.category || 'Other',
            description: tx.description,
            date: tx.date || new Date().toISOString().split('T')[0],
            type: tx.amount >= 0 ? 'income' : 'expense',
            created_at: new Date().toISOString(),
            source: 'statement_import'
          })
        );
        
        await Promise.all(transactionPromises);
      }

      res.status(201).json({
        success: true,
        message: 'Statement uploaded and analyzed successfully',
        statement: data,
        analysis: analysis,
        transactionsAdded: transactions.length
      });

    } catch (error) {
      console.error('Error uploading statement:', error);
      
      // Clean up file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

exports.getStatements = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('account_statements')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch statements' });
    }

    res.json({
      success: true,
      statements: data
    });
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};