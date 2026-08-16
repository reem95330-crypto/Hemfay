import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, FileText, MessageSquare, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const ResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { testRecords } = useStore();

  const record = testRecords[0] || null;

  if (!record) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-xs text-text-muted italic">No recent test records found.</p>
        <button
          onClick={() => navigate('/test')}
          className="bg-burgundy text-white font-bold text-xs px-6 py-2.5 rounded-primary cursor-pointer"
        >
          Start Blood Test
        </button>
      </div>
    );
  }

  const isHbNormal = record.hemoglobin >= 12.0;
  const isFerritinNormal = record.ferritin >= 15;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button and Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full border border-burgundy-soft/40 hover:bg-burgundy-light text-burgundy transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text-primary">Diagnostic Results</h1>
          <p className="text-[10px] text-text-muted mt-0.5">Recorded on {record.timestamp}</p>
        </div>
      </div>

      {/* Main Results Showcase */}
      <div className="bg-white rounded-primary border border-burgundy-soft/40 p-6 space-y-6 shadow-sm">
        
        {/* Color-Coded Header Bar */}
        <div className={`p-4 rounded-primary border flex items-start gap-3 ${
          isHbNormal && isFerritinNormal 
            ? 'bg-success/5 border-success/20 text-success' 
            : 'bg-warning/5 border-warning/20 text-warning'
        }`}>
          {isHbNormal && isFerritinNormal ? (
            <CheckCircle className="shrink-0 mt-0.5" size={18} />
          ) : (
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          )}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {isHbNormal && isFerritinNormal ? 'Optimal Blood Levels' : 'Borderline or Low Levels Detected'}
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {record.summary}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Hemoglobin Detail */}
          <div className="space-y-3 p-4 rounded-primary border border-burgundy-soft/20 bg-burgundy-light/10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-secondary">Hemoglobin (Hb)</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isHbNormal ? 'bg-success/15 text-success' : 'bg-error/15 text-error animate-pulse'
              }`}>
                {isHbNormal ? 'Normal' : 'Low'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-burgundy">{record.hemoglobin}</span>
              <span className="text-xs font-bold text-text-muted">g/dL</span>
            </div>
            
            {/* Visual Slider Reference Range */}
            <div className="space-y-1 pt-2">
              <div className="h-1.5 w-full bg-burgundy-soft rounded-full relative overflow-hidden">
                {/* Reference Area Overlay: green between 12.0 and 16.0 (approx mapping) */}
                <div 
                  className="absolute h-full bg-success opacity-30" 
                  style={{ left: '40%', width: '50%' }} 
                />
                {/* User value cursor pin marker */}
                <div 
                  className="absolute h-full w-1.5 bg-burgundy" 
                  style={{ left: `${Math.min(Math.max((record.hemoglobin / 20) * 100, 5), 95)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase">
                <span>0.0</span>
                <span className="text-success">12.0 (WHO Min)</span>
                <span>20.0</span>
              </div>
            </div>
          </div>

          {/* Ferritin Detail */}
          <div className="space-y-3 p-4 rounded-primary border border-burgundy-soft/20 bg-burgundy-light/10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-secondary">Ferritin (Iron Stores)</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isFerritinNormal ? 'bg-success/15 text-success' : 'bg-error/15 text-error animate-pulse'
              }`}>
                {isFerritinNormal ? 'Normal' : 'Low'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-burgundy">{record.ferritin}</span>
              <span className="text-xs font-bold text-text-muted">ng/mL</span>
            </div>

            {/* Visual Slider Reference Range */}
            <div className="space-y-1 pt-2">
              <div className="h-1.5 w-full bg-burgundy-soft rounded-full relative overflow-hidden">
                {/* Reference Area Overlay: green between 15 and 150 */}
                <div 
                  className="absolute h-full bg-success opacity-30" 
                  style={{ left: '15%', width: '70%' }} 
                />
                {/* User value cursor pin marker */}
                <div 
                  className="absolute h-full w-1.5 bg-burgundy" 
                  style={{ left: `${Math.min(Math.max((record.ferritin / 180) * 100, 5), 95)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase">
                <span>0</span>
                <span className="text-success">15 (WHO Min)</span>
                <span>180</span>
              </div>
            </div>
          </div>

        </div>

        {/* Clinical Guidelines References Excerpt */}
        <div className="space-y-2.5 border-t border-burgundy-soft/20 pt-5">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Clinical Guidance Summary</h4>
          <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4 leading-relaxed">
            <li>
              **Anemia Threshold:** WHO defines anemia for adult females as hemoglobin &lt; 12.0 g/dL, and for adult males as &lt; 13.0 g/dL.
            </li>
            <li>
              **Iron Deficiency:** WHO Guideline (2020) establishes a population diagnostic cut-off of ferritin &lt; 15 ng/mL to declare iron deficiency in healthy adults.
            </li>
            <li>
              **Supplement Adherence:** Guidelines strongly advise daily oral iron supplements if iron stores are depleted, followed by monitoring every 2-3 months.
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/report')}
          className="bg-white border border-burgundy text-burgundy hover:bg-burgundy-light font-bold text-xs py-3.5 rounded-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText size={16} />
          <span>View Full Report</span>
        </button>
        <button
          onClick={() => navigate('/ai')}
          className="bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs py-3.5 rounded-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-burgundy/10"
        >
          <MessageSquare size={16} />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Standard medical safety notice */}
      <div className="bg-burgundy-light/60 border border-burgundy-soft/40 rounded-primary p-4 flex items-start gap-2.5">
        <Info className="text-burgundy shrink-0 mt-0.5" size={16} />
        <p className="text-[10px] text-text-muted leading-relaxed">
          **Demo Notice:** These measurements are generated in demonstration mode. This information is intended for educational purposes and does not substitute professional medical diagnosis, advice, or treatment. Please discuss these measurements with a medical professional.
        </p>
      </div>
    </div>
  );
};
export default ResultsScreen;
