import { AnalysisResult, TransactionType } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 5);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const DEMO_DATA: AnalysisResult = {
  summary: {
    totalIncome: 5200.00,
    totalExpense: 2845.30,
    netChange: 2354.70,
    currency: "USD",
    statementDateRange: "Current Month Statement"
  },
  transactions: [
    {
      id: generateId(),
      date: formatDate(today),
      description: "TECH CORP INC PAYROLL",
      amount: 4200.00,
      category: "Salary/Income",
      type: TransactionType.INCOME
    },
    {
      id: generateId(),
      date: formatDate(today),
      description: "STARBUCKS COFFEE #2043",
      amount: 6.45,
      category: "Food & Drink",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(today),
      description: "UBER TRIP K291",
      amount: 14.20,
      category: "Transport",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(yesterday),
      description: "WHOLE FOODS MARKET",
      amount: 142.80,
      category: "Groceries",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(yesterday),
      description: "SPOTIFY PREMIUM",
      amount: 11.99,
      category: "Entertainment",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(twoDaysAgo),
      description: "SHELL STATION 342",
      amount: 45.00,
      category: "Transport",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(twoDaysAgo),
      description: "AMAZON MARKETPLACE",
      amount: 89.50,
      category: "Shopping",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(lastWeek),
      description: "CITY UTILITIES ELECTRIC",
      amount: 125.40,
      category: "Utilities",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(lastWeek),
      description: "TRANSFER FROM SAVINGS",
      amount: 1000.00,
      category: "Transfer",
      type: TransactionType.INCOME
    },
    {
      id: generateId(),
      date: formatDate(lastWeek),
      description: "LUXURY APTS RENT",
      amount: 2400.00,
      category: "Housing",
      type: TransactionType.EXPENSE
    },
    {
      id: generateId(),
      date: formatDate(lastWeek),
      description: "NETFLIX.COM",
      amount: 15.99,
      category: "Entertainment",
      type: TransactionType.EXPENSE
    }
  ]
};