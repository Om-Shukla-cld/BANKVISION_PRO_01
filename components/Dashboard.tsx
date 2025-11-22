import React, { useMemo } from 'react';
import { AnalysisResult, TransactionType } from '../types';
import { TransactionList } from './TransactionList';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Calendar, CreditCard } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { summary, transactions } = data;

  // --- Charts Data Preparation ---

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const categories: Record<string, number> = {};
    
    expenses.forEach(t => {
      const cat = t.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [transactions]);

  const dailyTrendData = useMemo(() => {
    const days: Record<string, { date: string; spend: number }> = {};
    
    // Sort transactions by date first to ensure order
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTx.forEach(t => {
      if (t.type === TransactionType.EXPENSE) {
        const dateShort = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!days[dateShort]) {
          days[dateShort] = { date: dateShort, spend: 0 };
        }
        days[dateShort].spend += t.amount;
      }
    });

    return Object.values(days);
  }, [transactions]);

  // --- Styling & Formatting ---

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
  
  const formatCurrency = (val: number) => {
    try {
      // Intl.NumberFormat throws RangeError if currency code is invalid (e.g. "N/A" or symbols)
      // We check if it exists and try to use it
      const currencyCode = summary.currency && summary.currency !== 'N/A' ? summary.currency : 'USD';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
      }).format(val);
    } catch (error) {
      // Fallback to USD if the provided code causes an error
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(val);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Section: Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Balance Card */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Wallet className="w-24 h-24 text-primary-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Net Flow</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold tracking-tight ${summary.netChange >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                {summary.netChange > 0 ? '+' : ''}{formatCurrency(summary.netChange)}
              </span>
            </div>
            <div className="mt-3 text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {summary.statementDateRange || "Current Period"}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 relative overflow-hidden">
           <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Income</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(summary.totalIncome)}</p>
            <div className="mt-3 text-xs font-medium text-green-600 bg-green-50 inline-flex items-center px-2 py-1 rounded-lg">
              Inflow
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 relative overflow-hidden">
           <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Spend</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(summary.totalExpense)}</p>
            <div className="mt-3 text-xs font-medium text-slate-400">
              Across {transactions.filter(t => t.type === TransactionType.EXPENSE).length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Section: Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Daily Spend Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Spending Analysis</h3>
              <p className="text-sm text-slate-500">Daily expenditure breakdown</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#64748b'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#64748b'}} 
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), "Spent"]}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Categories</h3>
            <p className="text-sm text-slate-500">Where your money goes</p>
          </div>
          
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-slate-600 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-800">
                  {Math.round((categoryData[0]?.value / summary.totalExpense) * 100) || 0}%
                </span>
                <span className="text-xs text-slate-400 uppercase">Top Item</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Transactions List */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Transactions</h3>
            <p className="text-sm text-slate-500">Recent financial activity</p>
          </div>
        </div>
        <TransactionList transactions={transactions} currency={summary.currency} />
      </div>
    </div>
  );
};