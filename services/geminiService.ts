import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, TransactionType } from "../types";

// Initialize the client
// Note: process.env.API_KEY is expected to be available in the build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        totalIncome: { type: Type.NUMBER, description: "Sum of all positive credit transactions" },
        totalExpense: { type: Type.NUMBER, description: "Sum of all negative debit transactions (as positive absolute value)" },
        netChange: { type: Type.NUMBER, description: "Total Income minus Total Expense" },
        currency: { type: Type.STRING, description: "ISO 4217 Currency code (e.g., USD, EUR, GBP). Default to USD if unclear." },
        statementDateRange: { type: Type.STRING, description: "The extracted date range of the statement, e.g. 'Jan 1 - Jan 31, 2023'" }
      },
      required: ["totalIncome", "totalExpense", "netChange", "currency"]
    },
    transactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Transaction date in YYYY-MM-DD format" },
          description: { type: Type.STRING, description: "Cleaned description of the transaction" },
          amount: { type: Type.NUMBER, description: "Absolute value of the transaction amount" },
          category: { type: Type.STRING, description: "Inferred category (e.g., Groceries, Utilities, Salary, Transfer)" },
          type: { type: Type.STRING, enum: ["income", "expense"] }
        },
        required: ["date", "description", "amount", "category", "type"]
      }
    }
  },
  required: ["summary", "transactions"]
};

// Helper to read file as Base64 string
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeStatement = async (file: File): Promise<AnalysisResult> => {
  // Validate file type client-side before sending
  const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Unsupported file type. Please upload a PDF or Image (PNG, JPEG, WebP).");
  }

  const filePart = await fileToGenerativePart(file);

  const prompt = `
    Analyze this bank statement document. 
    Extract all transactions row by row.
    
    For each transaction:
    1. Identify the Date, Description, and Amount.
    2. Determine if it is an 'income' (credit/deposit) or 'expense' (debit/withdrawal).
    3. Infer a clean Category based on the description (e.g., "Uber" -> "Transport", "Walmart" -> "Groceries/Shopping").
    4. Ensure the Amount is a positive number.
    
    Also calculate the summary totals based on the extracted data.
    Return the data strictly in JSON format matching the schema provided.
    Do not return markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [filePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1, // Low temperature for extraction accuracy
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini.");
    }

    const data = JSON.parse(text) as AnalysisResult;

    // Post-process: Add unique IDs to transactions for React rendering
    data.transactions = data.transactions.map((tx, index) => ({
      ...tx,
      id: `tx-${index}-${Date.now()}`
    }));

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze the statement. Please ensure the document is clear and legible.");
  }
};