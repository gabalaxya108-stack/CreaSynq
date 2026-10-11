// src/components/JudgeDemoWalkthrough.jsx
// ALLOY — Interactive Judge Demo Walkthrough & Evaluation Companion
// Polished, lightweight, 6-stage guided tour showcasing Alloy's core capabilities.

import React, { useState, useEffect } from 'react';
import { 
  Compass,
  Target,
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ExternalLink, 
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Users,
  Filter
} from 'lucide-react';
import { TOUR_STEPS } from '../data/judgeTourSteps';

export { TOUR_STEPS };

const ICON_MAP = {
  Compass,
  Target,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Lock,
  Users,
  Filter
};

const STORAGE_TOUR_COMPLETED = 'alloy_judge_tour_completed';
const STORAGE_TOUR_DISMISSED = 'alloy_judge_tour_dismissed';
const STORAGE_TOUR_STEP = 'alloy_judge_tour_step';

export default function JudgeDemoWalkthrough({
  isOpen,
  onClose,
  onNavigate,
  onOpenMessages,
  onEnableDemoCreator,
  currentView
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TOUR_STEP);
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 && parsed < TOUR_STEPS.length ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const [isMinimized, setIsMinimized] = useState(false);

  // Sync current step to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TOUR_STEP, String(currentStepIndex));
    } catch {
      // Ignore storage errors
    }
  }, [currentStepIndex]);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = (currentStep?.iconName && ICON_MAP[currentStep.iconName]) || currentStep?.icon || Sparkles;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleExecute = () => {
    if (typeof currentStep.executeAction === 'function') {
      currentStep.executeAction({
        onNavigate,
        onOpenMessages,
        onEnableDemoCreator
      });
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(STORAGE_TOUR_COMPLETED, 'true');
    } catch { }
    if (onClose) onClose();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(STORAGE_TOUR_DISMISSED, 'true');
    } catch { }
    if (onClose) onClose();
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsMinimized(false);
  };

  if (!isOpen) return null;

  // Minimized Floating Badge View (Allows judges to view the screen while keeping the tour docked)
  if (isMinimized) {
    return (
      <div 
        className="judge-tour-minimized-pill"
        id="judge-tour-minimized-pill"
        onClick={() => setIsMinimized(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsMinimized(false)}
        title="Click to expand Judge Demo Walkthrough"
      >
        <div className="judge-tour-min-icon">
          <Sparkles size={14} className="text-bronze" />
        </div>
        <div className="judge-tour-min-content">
          <span className="judge-tour-min-tag">Judge Tour • Step {currentStepIndex + 1}/{TOUR_STEPS.length}</span>
          <span className="judge-tour-min-title">{currentStep.title}</span>
        </div>
        <button
          type="button"
          className="judge-tour-min-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          aria-label="Expand tour"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="judge-tour-card-container" id="judge-tour-card">
      {/* Header with Step Indicator & Controls */}
      <div className="judge-tour-header">
        <div className="judge-tour-header-left">
          <div className="judge-tour-badge">
            <Sparkles size={12} className="text-bronze" />
            <span>Judge Evaluation Walkthrough</span>
          </div>
          <span className="judge-tour-step-counter">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>
        </div>

        <div className="judge-tour-header-actions">
          {currentStepIndex > 0 && (
            <button
              type="button"
              className="judge-tour-header-btn"
              onClick={handleRestart}
              title="Restart tour from Step 1"
              aria-label="Restart tour"
            >
              <RotateCcw size={13} />
            </button>
          )}

          <button
            type="button"
            className="judge-tour-header-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimize guide card (dock to bottom)"
            aria-label="Minimize tour"
          >
            <Minimize2 size={13} />
          </button>

          <button
            type="button"
            className="judge-tour-header-btn"
            onClick={handleSkip}
            title="Close tour"
            aria-label="Close tour"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress Dots / Bar */}
      <div className="judge-tour-progress-bar">
        {TOUR_STEPS.map((step, idx) => (
          <button
            key={step.stepId}
            type="button"
            className={`judge-tour-progress-dot ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
            onClick={() => setCurrentStepIndex(idx)}
            title={`Go to Step ${idx + 1}: ${step.title}`}
            aria-label={`Step ${idx + 1}`}
          />
        ))}
      </div>

      {/* Step Body */}
      <div className="judge-tour-body">
        <div className="judge-tour-step-meta">
          <div className="judge-tour-step-icon-wrap">
            <StepIcon size={18} className="judge-tour-step-icon" />
          </div>
          <div>
            <span className="judge-tour-step-tag">{currentStep.tag}</span>
            <h3 className="judge-tour-step-title font-editorial">{currentStep.title}</h3>
          </div>
        </div>

        <p className="judge-tour-step-desc">{currentStep.description}</p>

        {/* Feature Highlights Checklist */}
        <div className="judge-tour-highlights">
          {currentStep.highlights.map((item, idx) => (
            <div key={idx} className="judge-tour-highlight-item">
              <CheckCircle2 size={13} className="judge-tour-check-icon shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Action Button: Directly open the feature */}
        <div className="judge-tour-feature-action-box">
          <button
            type="button"
            className="judge-tour-feature-btn"
            id={`judge-tour-action-${currentStep.stepId}`}
            onClick={handleExecute}
          >
            <span>{currentStep.actionLabel}</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="judge-tour-footer">
        <button
          type="button"
          className="judge-tour-skip-btn"
          onClick={handleSkip}
        >
          <span>Skip Tour</span>
        </button>

        <div className="judge-tour-nav-buttons">
          <button
            type="button"
            className="judge-tour-nav-btn judge-tour-prev-btn"
            onClick={handlePrev}
            disabled={isFirstStep}
            aria-label="Previous step"
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            className="judge-tour-nav-btn judge-tour-next-btn"
            id="judge-tour-next-btn"
            onClick={handleNext}
          >
            <span>{isLastStep ? 'Finish' : 'Next'}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
