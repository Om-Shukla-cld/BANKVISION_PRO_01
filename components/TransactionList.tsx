import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownLeft,
  ShoppingBag, Coffee, Car, Home, Zap, Smartphone, Briefcase, AlertCircle
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
}

// Helper for category icons
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('shop') || cat.includes('store') || cat.includes('cloth')) return <ShoppingBag className="w-4 h-4" />;
  if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) return <Coffee className="w-4 h-4" />;
  if (cat.includes('transport') || cat.includes('uber') || cat.includes('fuel') || cat.includes('gas')) return <Car className="w-4 h-4" />;
  if (cat.includes('home') || cat.includes('rent') || cat.includes('mortgage')) return <Home className="w-4 h-4" />;
  if (cat.includes('util') || cat.includes('bill') || cat.includes('electric')) return <Zap className="w-4 h-4" />;
  if (cat.includes('phone') || cat.includes('internet') || cat.includes('sub')) return <Smartphone className="w-4 h-4" />;
  if (cat.includes('salary') || cat.includes('deposit') || cat.includes('income')) return <Briefcase className="w-4 h-4" />;
  return <CreditCardIcon className="w-4 h-4" />;
};

const CreditCardIcon = ({className}: {className?: string}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // Filter logic
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(lowerTerm) || 
        t.category.toLowerCase().includes(lowerTerm) ||
        t.amount.toString().includes(lowerTerm)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    // Always sort newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [transactions, searchTerm, typeFilter]);

  // Grouping logic
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(tx => {
      // Try to parse date. If invalid, fallback to "Unknown Date"
      let dateKey = "Unknown Date";
      try {
        const dateObj = new Date(tx.date);
        if (!isNaN(dateObj.getTime())) {
          // Check if today/yesterday
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          
          if (dateObj.toDateString() === today.toDateString()) dateKey = "Today";
          else if (dateObj.toDateString() === yesterday.toDateString()) dateKey = "Yesterday";
          else dateKey = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch (e) {}
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => {
    try {
      // Use currency if valid, else fallback inside try or catch
      const currencyCode = currency && currency !== 'N/A' ? currency : 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(val);
    } catch (e) {
      // Fallback to USD for any Intl error
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(val);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search description or amount..."
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative">
            <select
              className="appearance-none block w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer transition-all"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <Filter className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List Content */}
      <div className="flex-1 overflow-auto min-h-[400px] max-h-[600px]">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map((dateGroup) => {
            const txs = groupedTransactions[dateGroup];
            return (
            <div key={dateGroup}>
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-6 py-2 border-y border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {dateGroup}
                </h4>
              </div>
              
              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {txs.map((tx) => (
                  <div key={tx.id} className="group px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon Box */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        tx.type === TransactionType.INCOME 
                          ? 'bg-green-50 border-green-100 text-green-600' 
                          : 'bg-white border-slate-100 text-slate-500'
                      }`}>
                        {tx.type === TransactionType.INCOME ? <Briefcase className="w-4 h-4" /> : getCategoryIcon(tx.category)}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                          {tx.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="capitalize">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                       <p className={`text-sm font-bold ${
                        tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-900'
                      }`}>
                        {tx.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <div className={`text-[10px] mt-0.5 font-medium flex items-center justify-end gap-1 ${
                         tx.type === TransactionType.INCOME ? 'text-green-500' : 'text-slate-400'
                      }`}>
                         {tx.type === TransactionType.INCOME ? (
                           <><ArrowDownLeft className="w-3 h-3" /> Credit</>
                         ) : (
                           <><ArrowUpRight className="w-3 h-3" /> Debit</>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )})
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No transactions found.</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};