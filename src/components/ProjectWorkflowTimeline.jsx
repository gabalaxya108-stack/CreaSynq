// src/components/ProjectWorkflowTimeline.jsx
// Clean, Ordered Timeline for Individual Portfolio Item AI Production Workflows
// Displays workflow title, overview, ordered steps, tools, prompt, settings, input, output, and notes.

import React from 'react';
import { 
  Layers, Cpu, Film, Wrench, CheckCircle2, Sparkles, Clock, 
  HelpCircle, ArrowRight, ShieldCheck, Compass, Info, Plus, Edit3,
  Terminal, Sliders, LogIn, LogOut, FileText
} from 'lucide-react';

export default function ProjectWorkflowTimeline({
  workflowData = null,
  workflowStages = [],
  workflowTitle = '',
  workflowOverview = '',
  projectTitle = '',
  compact = false,
  onCreateWorkflow,
  onEditWorkflow,
  canCreateWorkflow = true
}) {
  // Normalize input: workflowData or workflowStages
  const title = workflowData?.title || workflowTitle || '';
  const overview = workflowData?.overview || workflowOverview || workflowData?.description || '';
  const stages = Array.isArray(workflowData?.steps) 
    ? workflowData.steps 
    : (Array.isArray(workflowStages) ? workflowStages : []);

  if (stages.length === 0) {
    return (
      <div className="project-workflow-empty-state" style={{
        padding: '28px 24px',
        background: 'var(--bg-card-subtle, #FAF8F5)',
        border: '1px dashed rgba(226, 232, 240, 0.95)',
        borderRadius: '16px',
        textAlign: 'center',
        margin: '12px 0'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.08)',
          color: '#7C3AED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px'
        }}>
          <Layers size={18} />
        </div>
        <h5 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Dedicated Workflow Documented
        </h5>
        <p style={{ margin: '0 auto 16px', maxWidth: '440px', fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
          The creator has not documented an individual AI production workflow timeline for this specific piece.
        </p>

        {onCreateWorkflow && canCreateWorkflow && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onCreateWorkflow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              color: '#6D28D9',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              boxShadow: '0 1px 4px rgba(124, 58, 237, 0.08)',
              fontWeight: 600,
              padding: '7px 18px',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Create an individual AI production workflow for this portfolio item"
          >
            <Plus size={14} style={{ color: '#7C3AED' }} />
            <span>+ Create Workflow</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="project-workflow-timeline-container" style={{ margin: '14px 0' }}>
      {/* Timeline Header Strip */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-lavender-deep, #7C3AED)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Layers size={13} />
              AI Production Workflow
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '100px',
              background: 'rgba(124, 58, 237, 0.1)',
              color: '#7C3AED'
            }}>
              {stages.length} {stages.length === 1 ? 'Step' : 'Ordered Steps'}
            </span>
          </div>

          {title && (
            <h4 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h4>
          )}

          {overview && (
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: '640px' }}>
              {overview}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onEditWorkflow && canCreateWorkflow && (
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={onEditWorkflow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                padding: '4px 10px',
                borderRadius: '6px',
                color: '#6D28D9',
                borderColor: 'rgba(124, 58, 237, 0.25)',
                background: '#FFFFFF'
              }}
              title="Edit workflow for this project"
            >
              <Edit3 size={11} />
              <span>Edit Workflow</span>
            </button>
          )}

          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Documented by creator for this project
          </span>
        </div>
      </div>

      {/* Ordered Step-by-Step Timeline Grid */}
      <div className="workflow-steps-vertical-track" style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingLeft: '4px'
      }}>
        {stages.map((stage, idx) => {
          const stepOrderNum = String(stage.order || stage.stageNumber || idx + 1).padStart(2, '0');
          const isLast = idx === stages.length - 1;
          const stepTitle = stage.stepName || stage.title || stage.stageName || `Step ${idx + 1}`;
          const toolsList = Array.isArray(stage.tools) ? stage.tools : (stage.tools ? String(stage.tools).split(',').map(t => t.trim()).filter(Boolean) : []);

          return (
            <div 
              key={stage.id || idx}
              className="workflow-stage-card-item"
              style={{
                position: 'relative',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              {/* Left Column: Number Badge & Vertical Connector Line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                  zIndex: 2
                }}>
                  {stepOrderNum}
                </div>
                {!isLast && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    minHeight: '26px',
                    background: 'rgba(124, 58, 237, 0.2)',
                    marginTop: '4px'
                  }} />
                )}
              </div>

              {/* Right Column: Stage Content Card */}
              <div style={{
                flex: 1,
                background: 'var(--bg-card-subtle, #F8FAFC)',
                border: '1px solid var(--border-light, #E2E8F0)',
                borderRadius: '14px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}>
                {/* Step Name */}
                <div style={{ marginBottom: '6px' }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3
                  }}>
                    {stepTitle}
                  </h4>
                </div>

                {/* Description */}
                {stage.description && (
                  <p style={{
                    margin: '0 0 10px',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)'
                  }}>
                    {stage.description}
                  </p>
                )}

                {/* Tools & Models Badges Strip */}
                {toolsList.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginBottom: (stage.prompt || stage.settings || stage.input || stage.output || stage.notes || stage.processNotes) ? '10px' : '0'
                  }}>
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontWeight: 700
                    }}>
                      Tools & Models:
                    </span>
                    {toolsList.map((t, toolIdx) => (
                      <span 
                        key={toolIdx}
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          border: '1px solid rgba(124, 58, 237, 0.25)',
                          color: '#7C3AED',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Cpu size={10} />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Optional Prompt or Instructions */}
                {stage.prompt && (
                  <div style={{
                    margin: '8px 0',
                    padding: '8px 12px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6D28D9', fontWeight: 600, marginBottom: '3px' }}>
                      <Terminal size={12} />
                      <span>Prompt / Instructions:</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                      {stage.prompt}
                    </div>
                  </div>
                )}

                {/* Optional Settings and Parameters */}
                {stage.settings && (
                  <div style={{
                    margin: '6px 0',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px'
                  }}>
                    <Sliders size={12} style={{ color: '#64748B', flexShrink: 0 }} />
                    <span><strong>Settings:</strong> {stage.settings}</span>
                  </div>
                )}

                {/* Optional Input & Output Details */}
                {(stage.input || stage.output) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    margin: '8px 0',
                    fontSize: '0.78rem'
                  }}>
                    {stage.input && (
                      <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <strong style={{ color: '#0369A1' }}>Input:</strong> <span style={{ color: 'var(--text-secondary)' }}>{stage.input}</span>
                      </div>
                    )}
                    {stage.output && (
                      <div style={{ padding: '6px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                        <strong style={{ color: '#047857' }}>Output:</strong> <span style={{ color: 'var(--text-secondary)' }}>{stage.output}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Notes / Insights */}
                {(stage.notes || stage.processNotes) && (
                  <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderLeft: '3px solid #7C3AED',
                    padding: '6px 10px',
                    borderRadius: '0 6px 6px 0',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}>
                    <Info size={12} style={{ color: '#7C3AED', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontStyle: 'italic' }}>{stage.notes || stage.processNotes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
