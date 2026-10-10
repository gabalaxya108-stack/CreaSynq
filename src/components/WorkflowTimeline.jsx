// src/components/WorkflowTimeline.jsx
// Editorial Visual Timeline for Creative Workflows
// Displays ordered steps, tools, human involvement notes, and supporting evidence.
// Follows Alloy's warm ivory & champagne aesthetic with clear distinction of creator-provided vs verified evidence.

import React from 'react';
import { 
  Sparkles, CheckCircle2, ArrowRight, Wrench, UserCheck, 
  Layers, Clock, ShieldCheck, FileText, ExternalLink, Cpu, Compass
} from 'lucide-react';

export default function WorkflowTimeline({ 
  workflow, 
  onSelectProject = null, 
  isReadOnly = true,
  onEdit = null,
  compact = false 
}) {
  if (!workflow) return null;

  const steps = workflow.steps || [];
  const isPublished = workflow.visibility === 'published' || workflow.status === 'Published';

  return (
    <div className={`creative-workflow-timeline-card ${compact ? 'compact-timeline' : ''}`} style={{
      background: 'var(--bg-card, #FFFFFF)',
      border: '1px solid var(--border-light, #E2E8F0)',
      borderRadius: '20px',
      padding: compact ? '20px 24px' : '32px 36px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      position: 'relative'
    }}>
      {/* Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary, #EB6E4B)'
            }}>
              Production Pipeline • {workflow.specialization || 'Creative Specialization'}
            </span>

            {/* Visibility Status Badge */}
            <span style={{
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '100px',
              fontWeight: 600,
              background: isPublished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.12)',
              color: isPublished ? '#059669' : '#B45309',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPublished ? '#10B981' : '#F59E0B' }} />
              <span>{isPublished ? 'Published Workflow' : 'Draft (Private)'}</span>
            </span>

            {workflow.isDemo && (
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '100px',
                background: 'rgba(100, 116, 139, 0.1)',
                color: '#64748B',
                fontWeight: 600
              }}>
                Demo Sample
              </span>
            )}
          </div>

          <h3 className="font-editorial" style={{
            fontSize: compact ? '1.3rem' : '1.65rem',
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            lineHeight: 1.3
          }}>
            {workflow.title}
          </h3>

          {workflow.description && (
            <p style={{
              fontSize: '0.94rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '780px'
            }}>
              {workflow.description}
            </p>
          )}
        </div>

        {/* Edit Action if allowed in creator view */}
        {!isReadOnly && onEdit && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onEdit}
            style={{ alignSelf: 'flex-start' }}
          >
            Edit Workflow
          </button>
        )}
      </div>

      {/* Linked Portfolio Item Association (if linked) */}
      {workflow.linkedProjectId && (
        <div style={{
          marginBottom: '26px',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(253, 247, 237, 0.7) 0%, rgba(243, 237, 247, 0.5) 100%)',
          border: '1px solid rgba(235, 110, 75, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={16} style={{ color: 'var(--accent-primary, #EB6E4B)' }} />
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Linked Portfolio Project: <strong style={{ color: 'var(--text-primary)' }}>{workflow.linkedProjectTitle || 'Case Study Project'}</strong>
            </span>
          </div>

          {onSelectProject && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectProject(workflow.linkedProjectId)}
              style={{ fontSize: '0.78rem', padding: '4px 12px' }}
            >
              <span>Inspect Linked Work</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Human Involvement & Artistry Notes (if present) */}
      {workflow.humanInvolvementNotes && (
        <div style={{
          marginBottom: '28px',
          padding: '16px 20px',
          background: 'var(--bg-card-subtle, #F8F9FA)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '12px',
          borderLeft: '4px solid var(--accent-primary, #EB6E4B)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <UserCheck size={15} style={{ color: 'var(--accent-primary, #EB6E4B)' }} />
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--text-primary)' }}>
              Human Involvement & Artistic Direction
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            {workflow.humanInvolvementNotes}
          </p>
        </div>
      )}

      {/* Ordered Timeline Steps */}
      <div className="workflow-steps-timeline-container" style={{ position: 'relative' }}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const stepNumStr = step.stepNumber || String(index + 1).padStart(2, '0');

          return (
            <div 
              key={step.id || index}
              className="workflow-timeline-step-row"
              style={{
                display: 'flex',
                gap: '20px',
                position: 'relative',
                paddingBottom: isLast ? '0' : '28px'
              }}
            >
              {/* Left Column: Number Node and Connecting Line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: '42px'
              }}>
                {/* Step Circle Node */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary, #F4EFEA)',
                  border: '2px solid rgba(235, 110, 75, 0.4)',
                  color: 'var(--accent-primary, #EB6E4B)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  {stepNumStr}
                </div>

                {/* Connecting Line to next step */}
                {!isLast && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: 'linear-gradient(to bottom, rgba(235, 110, 75, 0.35), rgba(226, 232, 240, 0.8))',
                    margin: '6px 0',
                    zIndex: 1
                  }} />
                )}
              </div>

              {/* Right Column: Step Content Card */}
              <div style={{
                flex: 1,
                background: 'var(--bg-card-subtle, #FAF9F6)',
                border: '1px solid var(--border-light, #EBE5DF)',
                borderRadius: '14px',
                padding: '18px 22px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}>
                    {step.title}
                  </h4>

                  {step.humanRole && (
                    <span style={{
                      fontSize: '0.74rem',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: 'rgba(235, 110, 75, 0.08)',
                      color: 'var(--accent-primary, #EB6E4B)',
                      fontWeight: 600
                    }}>
                      Role: {step.humanRole}
                    </span>
                  )}
                </div>

                {/* Step Description */}
                <p style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: '0 0 14px 0'
                }}>
                  {step.description}
                </p>

                {/* Tools & AI Models Used at this step */}
                {step.tools && step.tools.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: step.evidence ? '12px' : '0' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary, #64748B)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Wrench size={12} />
                      <span>Tools / Models:</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(Array.isArray(step.tools) ? step.tools : String(step.tools).split(',')).map((tool, ti) => (
                        <span key={ti} style={{
                          fontSize: '0.78rem',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid var(--border-light, #E2E8F0)',
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}>
                          {tool.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Supporting Evidence Callout */}
                {step.evidence && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: '#065F46',
                    lineHeight: 1.5
                  }}>
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontWeight: 600 }}>Supporting Evidence: </strong>
                      <span>{step.evidence}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Trust Indicator: Clear Distinction */}
      <div style={{
        marginTop: '28px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-light, #E2E8F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.78rem',
        color: 'var(--text-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={15} style={{ color: 'var(--accent-primary, #EB6E4B)' }} />
          <span>
            <strong>Provenance:</strong> Creator-documented production pipeline. Demonstrates actual workflow methodology and human-in-the-loop artistry.
          </span>
        </div>

        <span>
          Total Production Steps: <strong>{steps.length}</strong>
        </span>
      </div>
    </div>
  );
}
