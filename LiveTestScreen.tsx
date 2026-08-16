import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { bluetoothService } from '../services/bluetoothService';
import { Smartphone, ChevronRight, Activity, FlaskConical, Droplet, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveTestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { deviceState, addTestRecord, addToast } = useStore();
  
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const isConnected = deviceState === 'Connected';

  const handleStartAnalysis = async () => {
    if (!isConnected) {
      addToast('Please connect your Hemafy Analyzer device first.', 'warning');
      navigate('/connect');
      return;
    }

    setTesting(true);
    setProgress(0);
    setCurrentStep('Preparing test chamber...');

    try {
      const results = await bluetoothService.runAnalysis((percent, stepText) => {
        setProgress(percent);
        setCurrentStep(stepText);
      });

      // Save to global store
      addTestRecord(results.hemoglobin, results.ferritin);
      addToast('Test completed successfully.', 'success');
      navigate('/results');
    } catch (err: any) {
      setTesting(false);
      addToast('Analysis aborted: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary">Live Blood Analysis</h1>
        <p className="text-xs font-semibold text-text-secondary mt-1">
          Perform a real-time diagnostics measurement using the Hemafy Analyzer device
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-primary border border-burgundy-soft/40 p-6 space-y-6 shadow-sm">
        <AnimatePresence mode="wait">
          {/* NOT CONNECTED STATE */}
          {!isConnected && !testing && (
            <motion.div
              key="not-connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-burgundy-light/60 text-burgundy flex items-center justify-center mx-auto">
                <Smartphone size={32} />
              </div>
              <div className="space-y-2 max-w-xs mx-auto">
                <h2 className="text-sm font-bold text-text-primary">Analyzer Disconnected</h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  You must establish a Bluetooth connection with your Hemafy Analyzer device before initiating an analysis.
                </p>
              </div>
              <button
                onClick={() => navigate('/connect')}
                className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs px-6 py-3 rounded-primary transition-all cursor-pointer shadow-md shadow-burgundy/10"
              >
                <span>Connect Analyzer</span>
                <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* CONNECTED & READY TO TEST */}
          {isConnected && !testing && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Instructions steps */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-burgundy uppercase tracking-wider">Test Instructions</h2>
                
                <div className="space-y-3">
                  <div className="flex gap-4 p-3 rounded-primary bg-burgundy-light/10 border border-burgundy-soft/10">
                    <div className="w-8 h-8 rounded-full bg-burgundy text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Prepare Test Strip</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Slide a fresh Hemafy test strip into the slot on your analyzer.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 rounded-primary bg-burgundy-light/10 border border-burgundy-soft/10">
                    <div className="w-8 h-8 rounded-full bg-burgundy text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Apply Blood Drop</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Prick your fingertip gently and apply a single small drop of blood to the target circle on the strip.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 rounded-primary bg-burgundy-light/10 border border-burgundy-soft/10">
                    <div className="w-8 h-8 rounded-full bg-burgundy text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">Insert and Begin</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Ensure the strip is securely positioned and click Start Analysis below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={handleStartAnalysis}
                className="w-full bg-burgundy hover:bg-burgundy-dark text-white font-bold text-xs py-3.5 rounded-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-burgundy/10"
              >
                <Activity size={16} />
                <span>Start Analysis</span>
              </button>
            </motion.div>
          )}

          {/* ACTIVE TESTING PROGRESS */}
          {testing && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-8"
            >
              {/* Circular Progress Ring */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#F7E9ED"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#7A1028"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * progress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                
                {/* Center text */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-burgundy">{progress}%</span>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide mt-1">Analyzing</span>
                </div>

                {/* Pulse Glow outer */}
                <div className="absolute w-36 h-36 rounded-full border border-burgundy/10 animate-ping pointer-events-none" />
              </div>

              {/* Log messages */}
              <div className="space-y-2 max-w-xs mx-auto">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Clinical Telemetry Logs</h3>
                <p className="text-xs font-semibold text-burgundy h-6 animate-pulse">
                  {currentStep}
                </p>
              </div>

              {/* Graphical diagnostic wave overlay */}
              <div className="flex justify-center items-center gap-1.5 h-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: 'easeInOut'
                    }}
                    className="w-1.5 rounded-full bg-burgundy"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety instructions Footer */}
      <div className="bg-[#FAFAFA] border border-burgundy-soft/30 rounded-primary p-4 text-left flex items-start gap-3">
        <FlaskConical className="text-burgundy shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Clinical Diagnostic Standard</h4>
          <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
            Hemafy test strips are single-use disposable bio-sensors. Dispose of the strip safely after measurement is completed. Ensure your hands are clean and disinfected before pricking.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LiveTestScreen;
