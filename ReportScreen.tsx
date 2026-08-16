import React from 'react';
import { useStore } from '../store/useStore';
import { HemafyLogo } from '../components/HemafyLogo';
import { Download, Share2, Mail, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const ReportScreen: React.FC = () => {
  const { user, testRecords, getWeeklyAdherence, addToast } = useStore();
  const adherence = getWeeklyAdherence();

  const latestRecord = testRecords[0] || null;

  const handleDownloadPdf = () => {
    try {
      // Direct print trigger for native PDF generation
      window.print();
      addToast('PDF download report generated successfully.', 'success');
    } catch (err) {
      addToast('Failed to generate PDF. Please check print configurations.', 'error');
    }
  };

  const handleShareEmail = () => {
    addToast('Sharing link copied to clipboard. Redirecting to mail client...', 'success');
    const subject = encodeURIComponent(`Hemafy Blood Health Report — ${user?.name || 'Patient'}`);
    const body = encodeURIComponent(`Hello,\n\nPlease find my blood-health monitoring report below.\n\nLatest Metrics:\nHemoglobin: ${latestRecord?.hemoglobin || '--'} g/dL\nFerritin: ${latestRecord?.ferritin || '--'} ng/mL\nMedication Adherence: ${adherence}%\n\nShared via Hemafy blood-health app.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto print:p-0 print:border-none print:shadow-none">
      
      {/* Title & Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Clinical Report</h1>
          <p className="text-xs font-semibold text-text-secondary mt-1">
            Download or share your official laboratory blood test report
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShareEmail}
            className="bg-white border border-burgundy text-burgundy hover:bg-burgundy-light font-bold text-xs px-4 py-2.5 rounded-primary transition-all flex items-center gap-2 cursor-pointer"
          >
            <Share2 size={14} />
            <span>Share via Email</span>
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs px-4 py-2.5 rounded-primary transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-burgundy/10"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* --- REPORT SHEET CARD --- */}
      <div className="bg-white border border-burgundy-soft/40 rounded-primary shadow-sm p-8 space-y-8 print:p-0 print:border-none">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-burgundy-soft/20 pb-6">
          <div className="space-y-2">
            <HemafyLogo size="md" />
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Smart Diagnostics Report</p>
          </div>
          
          <div className="text-left sm:text-right text-[10px] text-text-secondary space-y-1">
            <p><span className="font-bold">Report ID:</span> HMF-{Date.now().toString().slice(-6)}</p>
            <p><span className="font-bold">Date of Report:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-bold">Clinical Standard:</span> WHO, BSG, BJH</p>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-burgundy-light/20 border border-burgundy-soft/10 rounded-primary text-xs">
          <div>
            <p className="font-bold text-burgundy uppercase text-[9px] tracking-wider">Patient Name</p>
            <p className="font-semibold text-text-primary mt-1">{user?.name || '--'}</p>
          </div>
          <div>
            <p className="font-bold text-burgundy uppercase text-[9px] tracking-wider">Age / Gender</p>
            <p className="font-semibold text-text-primary mt-1">{user?.age || '--'} / {user?.gender || '--'}</p>
          </div>
          <div>
            <p className="font-bold text-burgundy uppercase text-[9px] tracking-wider">Email Address</p>
            <p className="font-semibold text-text-primary mt-1 truncate">{user?.email || '--'}</p>
          </div>
          <div>
            <p className="font-bold text-burgundy uppercase text-[9px] tracking-wider">Contact Phone</p>
            <p className="font-semibold text-text-primary mt-1">{user?.phone || '--'}</p>
          </div>
        </div>

        {/* Latest Results Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider">Latest Measured Metrics</h3>
          
          {latestRecord ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-burgundy-soft/20 rounded-primary flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">Hemoglobin (Hb)</p>
                  <p className="text-2xl font-black text-burgundy mt-1">{latestRecord.hemoglobin} <span className="text-xs font-bold text-text-muted">g/dL</span></p>
                </div>
                <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  latestRecord.hemoglobin >= 12.0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {latestRecord.hemoglobin >= 12.0 ? 'Normal' : 'Low'}
                </span>
              </div>

              <div className="p-4 border border-burgundy-soft/20 rounded-primary flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">Ferritin (Iron Stores)</p>
                  <p className="text-2xl font-black text-burgundy mt-1">{latestRecord.ferritin} <span className="text-xs font-bold text-text-muted">ng/mL</span></p>
                </div>
                <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  latestRecord.ferritin >= 15 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {latestRecord.ferritin >= 15 ? 'Normal' : 'Low'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">No measurements recorded yet.</p>
          )}
        </div>

        {/* Historical Test Logs Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider">Laboratory Historical Test Log</h3>
          
          <div className="border border-burgundy-soft/25 rounded-primary overflow-x-auto w-full">
            <table className="w-full min-w-[500px] text-xs text-left border-collapse">
              <thead>
                <tr className="bg-burgundy-light/60 border-b border-burgundy-soft/25 text-burgundy font-bold">
                  <th className="p-3">Analysis Date</th>
                  <th className="p-3">Hemoglobin</th>
                  <th className="p-3">Ferritin</th>
                  <th className="p-3">Clinical Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-soft/10">
                {testRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-burgundy-light/20 transition-colors">
                    <td className="p-3 font-semibold text-text-primary">{rec.timestamp.split(',')[0]}</td>
                    <td className="p-3 font-bold text-burgundy">{rec.hemoglobin} g/dL</td>
                    <td className="p-3 font-bold text-burgundy">{rec.ferritin} ng/mL</td>
                    <td className="p-3 font-medium text-text-secondary">{rec.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adherence Compliance Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-burgundy-soft/20 pt-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider">Medication Compliance</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-burgundy-soft flex items-center justify-center font-black text-burgundy text-xs shrink-0" style={{ borderTopColor: '#7A1028' }}>
                {adherence}%
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary">Weekly Supplement Adherence</p>
                <p className="text-[10px] text-text-muted mt-1 leading-normal">
                  Seeded compliance over the past 7 days. Higher compliance is correlated with replenishment of cellular reserves.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-burgundy uppercase tracking-wider">Clinical Guidance Summary</h3>
            <div className="text-[10px] text-text-secondary space-y-1.5 leading-relaxed bg-[#FAFAFA] p-3 rounded-primary border border-burgundy-soft/15">
              <p>• **Anemia Screening:** Follow up every 2-3 months if taking active supplements.</p>
              <p>• **Iron stores target:** Aim to raise ferritin above 30 ng/mL to declare iron store sufficiency.</p>
              <p>• **Adverse Effects:** Discuss any symptoms (gastric discomfort) with your prescribing doctor.</p>
            </div>
          </div>
        </div>

        {/* Medical signatures and disclaimer */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-t border-burgundy-soft/20 pt-6 text-[9px] text-text-muted">
          <p className="max-w-md leading-relaxed text-left">
            **Disclaimer:** This report is generated dynamically by the Hemafy diagnostic companion platform. It is based on user measurements and mock analyzer inputs. It does not replace a clinical examination or official signature of a medical laboratory pathologist.
          </p>
          <div className="text-left sm:text-right shrink-0">
            <p className="font-bold text-burgundy uppercase tracking-wide">Approved Diagnostics Companion</p>
            <p className="mt-1 font-bold text-text-primary">Hemafy Smart Analyzer Engine</p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ReportScreen;
