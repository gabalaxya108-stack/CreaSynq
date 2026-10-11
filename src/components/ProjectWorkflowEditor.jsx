// src/components/ProjectWorkflowEditor.jsx
// Dynamic, User-Filled Creative Workflow Builder for Portfolio Items
// The application provides the structured layout and input fields; the creator supplies all content.
// Features: Workflow title, overview, dynamic add/edit/delete/reorder steps with stable IDs, validation.

import React, { useState } from 'react';
import { 
  Layers, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, X, 
  HelpCircle, AlertCircle, Wrench, Terminal, Sliders, LogIn, LogOut, FileText, CheckCircle2
} from 'lucide-react';

export default function ProjectWorkflowEditor({
  workflowData = null,
  workflowStages = [], // Legacy fallback or direct array of steps
  workflowTitle = '',
  workflowOverview = '',
  projectId = '',
  projectTitle = '',
  onChange,
  onSave,
  onCancel,
  isSaving = false
}) {
  // Normalize initial data
  const initialTitle = workflowData?.title || workflowTitle || '';
  const initialOverview = workflowData?.overview || workflowOverview || workflowData?.description || '';
  const initialSteps = Array.isArray(workflowData?.steps) 
    ? workflowData.steps 
    : (Array.isArray(workflowStages) ? workflowStages : []);

  // Internal state
  const [title, setTitle] = useState(initialTitle);
  const [overview, setOverview] = useState(initialOverview);
  const [steps, setSteps] = useState(() => {
    return initialSteps.map((s, idx) => ({
      id: s.id || `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      order: s.order || idx + 1,
      stepName: s.stepName || s.title || s.stageName || '',
      description: s.description || '',
      tools: Array.isArray(s.tools) ? s.tools : (s.tools ? String(s.tools).split(',').map(t => t.trim()).filter(Boolean) : []),
      prompt: s.prompt || s.instructions || '',
      settings: s.settings || s.parameters || '',
      input: s.input || '',
      output: s.output || '',
      notes: s.notes || s.processNotes || ''
    }));
  });

  const [expandedStepId, setExpandedStepId] = useState(() => steps[0]?.id || null);
  const [newToolInputMap, setNewToolInputMap] = useState({});
  const [errors, setErrors] = useState({});

  // Notify parent of updates whenever title, overview, or steps change (if onChange is supplied)
  const notifyChanges = (newTitle, newOverview, newSteps) => {
    if (onChange) {
      onChange({
        title: newTitle,
        overview: newOverview,
        steps: newSteps
      }, newSteps);
    }
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (errors.title) setErrors(prev => ({ ...prev, title: null }));
    notifyChanges(val, overview, steps);
  };

  const handleOverviewChange = (val) => {
    setOverview(val);
    notifyChanges(title, val, steps);
  };

  // Add Step: Creates a new blank step with empty fields
  const handleAddStep = (e) => {
    if (e) e.preventDefault();
    const nextOrder = steps.length + 1;
    const newStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      order: nextOrder,
      stepName: '',
      description: '',
      tools: [],
      prompt: '',
      settings: '',
      input: '',
      output: '',
      notes: ''
    };
    const updated = [...steps, newStep];
    setSteps(updated);
    setExpandedStepId(newStep.id);
    notifyChanges(title, overview, updated);
  };

  // Update field of an individual step
  const handleUpdateStep = (stepId, patch) => {
    const updated = steps.map(st => st.id === stepId ? { ...st, ...patch } : st);
    setSteps(updated);
    if (patch.stepName && errors[`step_${stepId}`]) {
      setErrors(prev => ({ ...prev, [`step_${stepId}`]: null }));
    }
    notifyChanges(title, overview, updated);
  };

  // Delete Step with confirmation
  const handleDeleteStep = (e, stepId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const filtered = steps.filter(st => st.id !== stepId);
    const reordered = filtered.map((st, idx) => ({ ...st, order: idx + 1 }));
    setSteps(reordered);
    if (expandedStepId === stepId) {
      setExpandedStepId(reordered[0]?.id || null);
    }
    notifyChanges(title, overview, reordered);
  };

  // Reorder steps up / down
  const handleMoveStep = (e, stepIndex, direction) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetIdx = stepIndex + direction;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(stepIndex, 1);
    reordered.splice(targetIdx, 0, moved);
    const finalized = reordered.map((st, idx) => ({ ...st, order: idx + 1 }));
    setSteps(finalized);
    notifyChanges(title, overview, finalized);
  };

  // Tools chip management for each step
  const handleAddTool = (stepId) => {
    const toolText = (newToolInputMap[stepId] || '').trim();
    if (!toolText) return;
    const targetStep = steps.find(st => st.id === stepId);
    if (!targetStep) return;
    const tools = targetStep.tools || [];
    if (!tools.includes(toolText)) {
      handleUpdateStep(stepId, { tools: [...tools, toolText] });
    }
    setNewToolInputMap(prev => ({ ...prev, [stepId]: '' }));
  };

  const handleRemoveTool = (stepId, toolToRemove) => {
    const targetStep = steps.find(st => st.id === stepId);
    if (!targetStep) return;
    const tools = (targetStep.tools || []).filter(t => t !== toolToRemove);
    handleUpdateStep(stepId, { tools });
  };

  // Save handler with validation
  const handleSaveWorkflow = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    // Validate step names
    steps.forEach((st, idx) => {
      if (!st.stepName || !st.stepName.trim()) {
        newErrors[`step_${st.id}`] = `Step ${idx + 1} requires a step name.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto expand the first invalid step
      const firstInvalid = steps.find(st => !st.stepName || !st.stepName.trim());
      if (firstInvalid) setExpandedStepId(firstInvalid.id);
      return;
    }

    const payload = {
      title: title.trim(),
      overview: overview.trim(),
      projectId: projectId || '',
      steps: steps.map((st, idx) => ({
        ...st,
        order: idx + 1,
        stepName: st.stepName.trim(),
        description: (st.description || '').trim(),
        tools: st.tools || [],
        prompt: (st.prompt || '').trim(),
        settings: (st.settings || '').trim(),
        input: (st.input || '').trim(),
        output: (st.output || '').trim(),
        notes: (st.notes || '').trim()
      }))
    };

    if (onSave) {
      onSave(payload, payload.steps);
    }
  };

  return (
    <div className="creative-workflow-builder-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* 1. Workflow Header & Project Association Details */}
      <div style={{
        background: '#FAF8F5',
        border: '1px solid rgba(226, 232, 240, 0.95)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-lavender-deep, #7C3AED)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Layers size={13} />
              Creative Workflow Details
            </span>
            <h4 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Project Creative Workflow
            </h4>
          </div>

          {/* Project Association Badge: derived automatically from selected project */}
          <div style={{
            fontSize: '0.78rem',
            padding: '5px 12px',
            borderRadius: '100px',
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.22)',
            color: '#6D28D9',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>Linked Project:</span>
            <strong>{projectTitle || projectId || 'Selected Portfolio Item'}</strong>
          </div>
        </div>

        {/* Workflow Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Workflow Title (Optional)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter a descriptive workflow title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{ fontSize: '0.88rem', padding: '9px 12px', width: '100%', borderRadius: '10px' }}
          />
        </div>

        {/* Workflow Overview */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Workflow Overview (Optional)
          </label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Explain the overarching creative process and methodology for this project"
            value={overview}
            onChange={(e) => handleOverviewChange(e.target.value)}
            style={{ fontSize: '0.86rem', padding: '10px 12px', width: '100%', borderRadius: '10px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* 2. Workflow Steps Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Workflow Steps</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '100px',
                background: 'rgba(124, 58, 237, 0.1)',
                color: '#7C3AED'
              }}>
                {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Document the step-by-step creative workflow. All fields except step name are optional.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddStep}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#FFFFFF',
              borderColor: 'rgba(124, 58, 237, 0.3)',
              color: '#6D28D9',
              fontWeight: 600
            }}
          >
            <Plus size={14} />
            <span>Add Step</span>
          </button>
        </div>

        {/* Steps List */}
        {steps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step, idx) => {
              const isExpanded = expandedStepId === step.id;
              const stepError = errors[`step_${step.id}`];
              const stepNumber = String(step.order || idx + 1).padStart(2, '0');

              return (
                <div 
                  key={step.id}
                  style={{
                    background: '#FFFFFF',
                    border: stepError 
                      ? '1px solid #EF4444' 
                      : (isExpanded ? '1px solid rgba(124, 58, 237, 0.45)' : '1px solid rgba(226, 232, 240, 0.9)'),
                    borderRadius: '14px',
                    boxShadow: isExpanded ? '0 4px 14px rgba(124, 58, 237, 0.06)' : 'none',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  {/* Step Card Summary Strip */}
                  <div
                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                    style={{
                      padding: '12px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(245, 243, 255, 0.45)' : '#FFFFFF',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(124, 58, 237, 0.2)'
                      }}>
                        {stepNumber}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.92rem',
                          fontWeight: 600,
                          color: step.stepName ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          fontStyle: step.stepName ? 'normal' : 'italic',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {step.stepName || 'Unnamed Step'}
                        </div>
                        {step.tools && step.tools.length > 0 && (
                          <div style={{ fontSize: '0.74rem', color: '#7C3AED', marginTop: '2px' }}>
                            {step.tools.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => handleMoveStep(e, idx, -1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: idx === 0 ? '#CBD5E1' : '#64748B',
                          cursor: idx === 0 ? 'default' : 'pointer',
                          padding: '5px',
                          borderRadius: '4px'
                        }}
                        title="Move Step Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === steps.length - 1}
                        onClick={(e) => handleMoveStep(e, idx, 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: idx === steps.length - 1 ? '#CBD5E1' : '#64748B',
                          cursor: idx === steps.length - 1 ? 'default' : 'pointer',
                          padding: '5px',
                          borderRadius: '4px'
                        }}
                        title="Move Step Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteStep(e, step.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '5px',
                          borderRadius: '4px',
                          marginLeft: '2px'
                        }}
                        title="Delete Step"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '5px',
                          marginLeft: '2px'
                        }}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Step Input Fields */}
                  {isExpanded && (
                    <div style={{
                      padding: '18px 20px',
                      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      background: '#FFFFFF'
                    }}>
                      {/* Step Name (Required) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                          Step Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter a name for this step"
                          value={step.stepName}
                          onChange={(e) => handleUpdateStep(step.id, { stepName: e.target.value })}
                          style={{
                            fontSize: '0.84rem',
                            padding: '8px 12px',
                            width: '100%',
                            borderColor: stepError ? '#EF4444' : undefined
                          }}
                        />
                        {stepError && (
                          <span style={{ fontSize: '0.74rem', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            <span>{stepError}</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          Description
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="Describe what you did in this step"
                          value={step.description}
                          onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                          style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%', resize: 'vertical' }}
                        />
                      </div>

                      {/* Tools and Models */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          Tools and models used
                        </label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter the tools or models you actually used"
                            value={newToolInputMap[step.id] || ''}
                            onChange={(e) => setNewToolInputMap(prev => ({ ...prev, [step.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTool(step.id);
                              }
                            }}
                            style={{ fontSize: '0.82rem', padding: '6px 12px', flex: 1 }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleAddTool(step.id)}
                            style={{ flexShrink: 0 }}
                          >
                            <Plus size={12} />
                            <span>Add Tool</span>
                          </button>
                        </div>

                        {/* Tools Tags */}
                        {step.tools && step.tools.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {step.tools.map((t, toolIdx) => (
                              <span
                                key={toolIdx}
                                style={{
                                  fontSize: '0.74rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(124, 58, 237, 0.08)',
                                  border: '1px solid rgba(124, 58, 237, 0.25)',
                                  color: '#7C3AED',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>{t}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTool(step.id, t)}
                                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                                  title={`Remove ${t}`}
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Prompt or Instructions */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          Prompt or instructions
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          placeholder="Add your prompt or instructions, if applicable"
                          value={step.prompt}
                          onChange={(e) => handleUpdateStep(step.id, { prompt: e.target.value })}
                          style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%', resize: 'vertical' }}
                        />
                      </div>

                      {/* Settings and Parameters */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          Settings and parameters
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter relevant settings or parameters"
                          value={step.settings}
                          onChange={(e) => handleUpdateStep(step.id, { settings: e.target.value })}
                          style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
                        />
                      </div>

                      {/* Input & Output Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            Input
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Describe the input used"
                            value={step.input}
                            onChange={(e) => handleUpdateStep(step.id, { input: e.target.value })}
                            style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            Output
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Describe the result produced"
                            value={step.output}
                            onChange={(e) => handleUpdateStep(step.id, { output: e.target.value })}
                            style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                          Notes
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter additional process notes or observations"
                          value={step.notes}
                          onChange={(e) => handleUpdateStep(step.id, { notes: e.target.value })}
                          style={{ fontSize: '0.84rem', padding: '8px 12px', width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{
            textAlign: 'center',
            padding: '36px 20px',
            background: '#FAF8F5',
            borderRadius: '16px',
            border: '1px dashed rgba(203, 213, 225, 0.9)'
          }}>
            <Layers size={32} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
            <h5 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Workflow Steps Created
            </h5>
            <p style={{ margin: '0 auto 16px', maxWidth: '440px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Document the creative workflow for this project. Start by adding your first blank step.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddStep}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                borderRadius: '100px',
                padding: '8px 20px',
                fontWeight: 600
              }}
            >
              <Plus size={14} />
              <span>Add Your First Step</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Action Controls (Save / Cancel) if onSave / onCancel are provided directly */}
      {(onSave || onCancel) && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light, #E2E8F0)'
        }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveWorkflow}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={14} />
              <span>{isSaving ? 'Saving Workflow...' : 'Save Workflow'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
