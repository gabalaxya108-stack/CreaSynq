// src/components/WorkflowEditorModal.jsx
// Interactive Creative Workflow Editor & Preview Modal for Creator Studio
// Allows creators to create, edit, reorder, preview, save, publish, and unpublish production workflows.

import React, { useState } from 'react';
import { 
  X, Plus, Trash2, ArrowUp, ArrowDown, Eye, CheckCircle2, 
  Sparkles, Layers, Wrench, FileText, UserCheck, ShieldCheck,
  Save, Globe, Lock, Edit3
} from 'lucide-react';
import { WORKFLOW_SPECIALIZATIONS, createBlankWorkflow } from '../data/workflowsData';
import WorkflowTimeline from './WorkflowTimeline';

export default function WorkflowEditorModal({
  workflow = null,
  creatorId,
  portfolioProjects = [],
  onSave,
  onClose
}) {
  // Initialize with existing workflow or fresh template
  const [formData, setFormData] = useState(() => {
    if (workflow) {
      return JSON.parse(JSON.stringify(workflow));
    }
    return createBlankWorkflow(creatorId);
  });

  const [activeStepEditIndex, setActiveStepEditIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Step editing inline buffer
  const [newStepBuffer, setNewStepBuffer] = useState({
    title: '',
    description: '',
    tools: '',
    evidence: '',
    humanRole: ''
  });
  const [isAddingStepInline, setIsAddingStepInline] = useState(false);

  // Field change handler
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Reordering steps
  const handleMoveStep = (index, direction) => {
    const steps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;

    // Recalculate step numbers
    const renumbered = steps.map((s, i) => ({
      ...s,
      stepNumber: String(i + 1).padStart(2, '0')
    }));

    setFormData(prev => ({ ...prev, steps: renumbered }));
  };

  // Deleting a step
  const handleDeleteStep = (index) => {
    if (formData.steps.length <= 1) {
      alert('A workflow must have at least one step.');
      return;
    }
    const updated = formData.steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({
        ...s,
        stepNumber: String(i + 1).padStart(2, '0')
      }));
    setFormData(prev => ({ ...prev, steps: updated }));
    if (activeStepEditIndex === index) setActiveStepEditIndex(null);
  };

  // Save edited step
  const handleUpdateStep = (index, updatedStep) => {
    const updated = formData.steps.map((s, i) => i === index ? { ...s, ...updatedStep } : s);
    setFormData(prev => ({ ...prev, steps: updated }));
    setActiveStepEditIndex(null);
  };

  // Add new step
  const handleCommitNewStep = () => {
    if (!newStepBuffer.title.trim()) {
      alert('Step title is required');
      return;
    }
    const newStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stepNumber: String(formData.steps.length + 1).padStart(2, '0'),
      title: newStepBuffer.title.trim(),
      description: newStepBuffer.description.trim() || 'Work performed during this production stage.',
      tools: newStepBuffer.tools ? newStepBuffer.tools.split(',').map(t => t.trim()).filter(Boolean) : [],
      evidence: newStepBuffer.evidence.trim(),
      humanRole: newStepBuffer.humanRole.trim()
    };

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setNewStepBuffer({ title: '', description: '', tools: '', evidence: '', humanRole: '' });
    setIsAddingStepInline(false);
  };

  // Form Validation & Save
  const handleSave = (publishImmediately = null) => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Workflow title is required';
    if (!formData.description.trim()) newErrors.description = 'Short description is required';
    if (formData.steps.length === 0) newErrors.steps = 'At least one step is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setPreviewMode(false);
      return;
    }

    let finalVisibility = formData.visibility || 'draft';
    let finalStatus = formData.status || 'Draft';

    if (publishImmediately === true) {
      finalVisibility = 'published';
      finalStatus = 'Published';
    } else if (publishImmediately === false) {
      finalVisibility = 'draft';
      finalStatus = 'Draft';
    }

    // Resolve linked project title if linked
    let linkedProjectTitle = '';
    if (formData.linkedProjectId) {
      const matched = portfolioProjects.find(p => p.id === formData.linkedProjectId);
      if (matched) linkedProjectTitle = matched.title;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      visibility: finalVisibility,
      status: finalStatus,
      linkedProjectTitle,
      updatedAt: 'Just now'
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content workflow-editor-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '20px',
          padding: '0',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1px solid var(--border-light, #E2E8F0)'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-light, #E2E8F0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card, #FFFFFF)',
          zIndex: 10
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary, #EB6E4B)', fontWeight: 700 }}>
              Creator Studio • Workflow Engine
            </span>
            <h2 className="font-editorial" style={{ margin: '4px 0 0 0', fontSize: '1.6rem', color: 'var(--text-primary)' }}>
              {workflow ? 'Edit Creative Workflow' : 'Build New Creative Workflow'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className={`btn ${previewMode ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setPreviewMode(!previewMode)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={15} />
              <span>{previewMode ? 'Back to Editor' : 'Live Timeline Preview'}</span>
            </button>

            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={onClose}
              aria-label="Close modal"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: Editor vs Preview */}
        <div style={{ padding: '32px' }}>
          {previewMode ? (
            <div>
              <div style={{ marginBottom: '20px', padding: '14px 20px', background: 'rgba(235, 110, 75, 0.08)', borderRadius: '12px', border: '1px solid rgba(235, 110, 75, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-primary, #EB6E4B)' }} />
                <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  This is how brands will experience your published timeline in your creator profile and linked case studies.
                </span>
              </div>

              <WorkflowTimeline 
                workflow={formData}
                isReadOnly={true}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. Basic Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Title */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                    Workflow Title <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g., Premium Skincare Campaign Workflow"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)' }}
                  />
                  {errors.title && <span style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
                </div>

                {/* Specialization */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                    Creative Specialization
                  </label>
                  <select
                    className="form-input"
                    value={formData.specialization}
                    onChange={(e) => handleFieldChange('specialization', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: '#FFFFFF' }}
                  >
                    {WORKFLOW_SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                  Short Description & Executive Summary <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Explain the overarching production objective, visual tone, and unique pipeline characteristics..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', resize: 'vertical' }}
                />
                {errors.description && <span style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>{errors.description}</span>}
              </div>

              {/* Linked Portfolio Item & Visibility Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Linked Portfolio Project */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                    Optional Linked Portfolio Project
                  </label>
                  <select
                    className="form-input"
                    value={formData.linkedProjectId || ''}
                    onChange={(e) => handleFieldChange('linkedProjectId', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: '#FFFFFF' }}
                  >
                    <option value="">None (General Specialty Workflow)</option>
                    {portfolioProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category || 'Portfolio'})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Associates this workflow directly with a specific case study in your portfolio.
                  </span>
                </div>

                {/* Visibility Controls */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                    Visibility & Publishing Status
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('visibility', 'published');
                        handleFieldChange('status', 'Published');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: (formData.visibility === 'published' || formData.status === 'Published') 
                          ? '2px solid #059669' 
                          : '1px solid var(--border-light)',
                        background: (formData.visibility === 'published' || formData.status === 'Published')
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'var(--bg-secondary)',
                        color: (formData.visibility === 'published' || formData.status === 'Published')
                          ? '#059669'
                          : 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Globe size={15} />
                      <span>Published (Brand-Facing)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('visibility', 'draft');
                        handleFieldChange('status', 'Draft');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: (formData.visibility === 'draft' || formData.status === 'Draft') 
                          ? '2px solid #D97706' 
                          : '1px solid var(--border-light)',
                        background: (formData.visibility === 'draft' || formData.status === 'Draft')
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'var(--bg-secondary)',
                        color: (formData.visibility === 'draft' || formData.status === 'Draft')
                          ? '#D97706'
                          : 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Lock size={15} />
                      <span>Draft (Private)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Human Involvement Notes */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem' }}>
                  Human Involvement & Artistry Notes (Optional)
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.humanInvolvementNotes || ''}
                  onChange={(e) => handleFieldChange('humanInvolvementNotes', e.target.value)}
                  placeholder="Detail where human taste, manual retouching, lighting supervision, or prompt curation directly shaped the outcome..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', resize: 'vertical' }}
                />
              </div>

              {/* 2. Production Steps Manager */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Production Timeline Steps ({formData.steps.length})
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      Order, edit, or customize steps to match your authentic creative workflow.
                    </span>
                  </div>

                  {!isAddingStepInline && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsAddingStepInline(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>Add Step</span>
                    </button>
                  )}
                </div>

                {/* Steps List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {formData.steps.map((step, idx) => {
                    const isEditing = activeStepEditIndex === idx;

                    return (
                      <div 
                        key={step.id || idx}
                        style={{
                          background: 'var(--bg-card-subtle, #FAF9F6)',
                          border: isEditing ? '2px solid var(--accent-primary, #EB6E4B)' : '1px solid var(--border-light, #E2E8F0)',
                          borderRadius: '14px',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Step Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--bg-secondary, #F4EFEA)',
                              border: '1px solid rgba(235, 110, 75, 0.4)',
                              color: 'var(--accent-primary, #EB6E4B)',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {step.stepNumber || String(idx + 1).padStart(2, '0')}
                            </span>
                            
                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {step.title}
                            </strong>
                          </div>

                          {/* Reorder and Action Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="modal-icon-control-btn"
                              disabled={idx === 0}
                              onClick={() => handleMoveStep(idx, 'up')}
                              title="Move step up"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#FFFFFF', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ArrowUp size={14} />
                            </button>

                            <button
                              type="button"
                              className="modal-icon-control-btn"
                              disabled={idx === formData.steps.length - 1}
                              onClick={() => handleMoveStep(idx, 'down')}
                              title="Move step down"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#FFFFFF', cursor: idx === formData.steps.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === formData.steps.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ArrowDown size={14} />
                            </button>

                            <button
                              type="button"
                              className="modal-icon-control-btn"
                              onClick={() => setActiveStepEditIndex(isEditing ? null : idx)}
                              title="Edit step details"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isEditing ? 'var(--accent-primary)' : 'inherit' }}
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              type="button"
                              className="modal-icon-control-btn"
                              onClick={() => handleDeleteStep(idx)}
                              title="Delete step"
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Step Details or Inline Editor */}
                        {isEditing ? (
                          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Step Title</label>
                              <input 
                                type="text"
                                className="form-input"
                                value={step.title}
                                onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                                style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description of Work</label>
                              <textarea 
                                className="form-input"
                                rows={2}
                                value={step.description}
                                onChange={(e) => handleUpdateStep(idx, { description: e.target.value })}
                                style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tools / Models (comma-separated)</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={Array.isArray(step.tools) ? step.tools.join(', ') : (step.tools || '')}
                                  onChange={(e) => handleUpdateStep(idx, { tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                  placeholder="e.g. Midjourney v6, Photoshop"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Human Role / Involvement</label>
                                <input 
                                  type="text"
                                  className="form-input"
                                  value={step.humanRole || ''}
                                  onChange={(e) => handleUpdateStep(idx, { humanRole: e.target.value })}
                                  placeholder="e.g. Precision Inpainting & Retouching"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                                />
                              </div>
                            </div>

                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Supporting Evidence (Optional)</label>
                              <input 
                                type="text"
                                className="form-input"
                                value={step.evidence || ''}
                                onChange={(e) => handleUpdateStep(idx, { evidence: e.target.value })}
                                placeholder="e.g. 16-bit TIFF color grading curve with high-pass separation"
                                style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setActiveStepEditIndex(null)}
                              >
                                Done Editing Step
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {step.description}
                            </p>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {step.tools && (Array.isArray(step.tools) ? step.tools : [step.tools]).length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {(Array.isArray(step.tools) ? step.tools : String(step.tools).split(',')).map((tool, ti) => (
                                    <span key={ti} style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', background: '#FFFFFF', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                                      {tool.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {step.evidence && (
                                <span style={{ fontSize: '0.74rem', color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={12} />
                                  <span>Has Supporting Evidence</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Step Form */}
                {isAddingStepInline && (
                  <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(235, 110, 75, 0.04)', border: '1px dashed var(--accent-primary, #EB6E4B)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      New Step {String(formData.steps.length + 1).padStart(2, '0')}
                    </h5>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Step Title *</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="e.g. Brief Analysis or AI Generation"
                        value={newStepBuffer.title}
                        onChange={(e) => setNewStepBuffer(prev => ({ ...prev, title: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description of Work Performed</label>
                      <textarea 
                        className="form-input"
                        rows={2}
                        placeholder="Describe the activities, creative goals, and techniques..."
                        value={newStepBuffer.description}
                        onChange={(e) => setNewStepBuffer(prev => ({ ...prev, description: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tools / Models (comma-separated)</label>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="e.g. Midjourney v6.1, ComfyUI"
                          value={newStepBuffer.tools}
                          onChange={(e) => setNewStepBuffer(prev => ({ ...prev, tools: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Human Role / Craft</label>
                        <input 
                          type="text"
                          className="form-input"
                          placeholder="e.g. Art Direction, Lighting Design"
                          value={newStepBuffer.humanRole}
                          onChange={(e) => setNewStepBuffer(prev => ({ ...prev, humanRole: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Supporting Evidence (Optional)</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="e.g. Moodboard slide count, pass resolution, test seeds"
                        value={newStepBuffer.evidence}
                        onChange={(e) => setNewStepBuffer(prev => ({ ...prev, evidence: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsAddingStepInline(false)}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleCommitNewStep}
                      >
                        Add to Steps
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid var(--border-light, #E2E8F0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-card, #FFFFFF)',
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSave(false)}
              title="Save as private draft"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave(true)}
              title="Publish workflow to make visible to brands"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Globe size={15} />
              <span>Save & Publish Workflow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
