import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';

export const ProgressScreen: React.FC = () => {
  const { testRecords } = useStore();
  const [activeFilter, setActiveFilter] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  // Map and sort chronologically (oldest to newest)
  const chartData = [...testRecords]
    .map(rec => {
      const dateParts = rec.timestamp.split(',')[0].split('/');
      // Format as Month Day (e.g. Aug 13)
      const dateObj = new Date(rec.timestamp);
      const label = isNaN(dateObj.getTime()) 
        ? rec.timestamp.split(',')[0]
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
      return {
        id: rec.id,
        rawDate: dateObj,
        dateLabel: label,
        hemoglobin: rec.hemoglobin,
        ferritin: rec.ferritin
      };
    })
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

  // Filter records based on active filter
  const getFilteredData = () => {
    const now = new Date();
    const cutoff = new Date();

    if (activeFilter === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (activeFilter === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (activeFilter === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (activeFilter === '1Y') cutoff.setFullYear(now.getFullYear() - 1);

    return chartData.filter(d => d.rawDate >= cutoff);
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Progress Analytics</h1>
          <p className="text-xs font-semibold text-text-secondary mt-1">
            Analyze historical trends of Hemoglobin and Ferritin levels
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-burgundy-light/60 p-1 rounded-full self-start sm:self-auto border border-burgundy-soft/20">
          {(['1M', '3M', '6M', '1Y'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-burgundy text-white shadow-sm'
                  : 'text-text-secondary hover:text-burgundy'
              }`}
            >
              {filter === '1M' && '1 Month'}
              {filter === '3M' && '3 Months'}
              {filter === '6M' && '6 Months'}
              {filter === '1Y' && '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white border rounded-primary p-12 text-center text-text-muted italic">
          No test measurements found within the selected timeframe.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Hemoglobin Chart */}
          <div className="bg-white rounded-primary border border-burgundy-soft/40 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider">Hemoglobin (Hb) History</h2>
              <p className="text-[10px] text-text-muted mt-0.5">Reference range: 12.0 - 16.0 g/dL</p>
            </div>
            
            <div className="h-64 w-full overflow-hidden min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                  <XAxis 
                    dataKey="dateLabel" 
                    stroke="#8A8A8A" 
                    fontSize={9} 
                    fontWeight="bold"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#8A8A8A" 
                    fontSize={9} 
                    fontWeight="bold"
                    domain={[9, 18]} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#F7E9ED', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 6px -1px rgba(122, 16, 40, 0.05)',
                      fontSize: '11px',
                      fontWeight: 'semibold'
                    }} 
                  />
                  {/* Reference line for WHO threshold 12.0 g/dL */}
                  <ReferenceLine 
                    y={12.0} 
                    stroke="#DC2626" 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: '12.0 (WHO Min)', 
                      fill: '#DC2626', 
                      fontSize: 8, 
                      fontWeight: 'bold', 
                      position: 'top' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hemoglobin" 
                    stroke="#7A1028" 
                    strokeWidth={3}
                    dot={{ fill: '#7A1028', r: 4, strokeWidth: 1 }} 
                    activeDot={{ r: 6, fill: '#5A0B1D' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ferritin Chart */}
          <div className="bg-white rounded-primary border border-burgundy-soft/40 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider">Ferritin History</h2>
              <p className="text-[10px] text-text-muted mt-0.5">Reference range: 15 - 150 ng/mL</p>
            </div>

            <div className="h-64 w-full overflow-hidden min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                  <XAxis 
                    dataKey="dateLabel" 
                    stroke="#8A8A8A" 
                    fontSize={9} 
                    fontWeight="bold"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#8A8A8A" 
                    fontSize={9} 
                    fontWeight="bold"
                    domain={[0, 150]} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#F7E9ED', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 6px -1px rgba(122, 16, 40, 0.05)',
                      fontSize: '11px',
                      fontWeight: 'semibold'
                    }} 
                  />
                  {/* Reference line for WHO threshold 15 ng/mL */}
                  <ReferenceLine 
                    y={15} 
                    stroke="#DC2626" 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: '15 (WHO Min)', 
                      fill: '#DC2626', 
                      fontSize: 8, 
                      fontWeight: 'bold', 
                      position: 'top' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ferritin" 
                    stroke="#8F1635" 
                    strokeWidth={3}
                    dot={{ fill: '#8F1635', r: 4, strokeWidth: 1 }} 
                    activeDot={{ r: 6, fill: '#A51D32' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Analytics Insight widget */}
      <div className="bg-white rounded-primary border border-burgundy-soft/40 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={16} className="text-burgundy" />
          <span>Clinical Insights & Trends</span>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Based on your historical readings, your hemoglobin levels have increased from **11.2 g/dL** (mild anemia) to **14.2 g/dL** over the last 90 days. This upward trajectory indicates a positive response to your daily **325 mg Iron Supplement** and consistent adherence. Your ferritin levels have also risen from **12 ng/mL** to **85 ng/mL**, signifying replenishment of your cellular iron stores.
        </p>
      </div>
    </div>
  );
};
export default ProgressScreen;
