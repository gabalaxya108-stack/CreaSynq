// src/components/CreatorSkillsManager.jsx
// Technical & Creative Skills Management for Creator Overview
// Allows creators to view, add, edit, and remove skills with distinct visual styling and suggestions.

import React, { useState } from 'react';
import { 
  Cpu, Palette, Plus, X, Check, Edit3, Sparkles, AlertCircle, Wrench, RefreshCw
} from 'lucide-react';
import { 
  RECOMMENDED_TECHNICAL_SKILLS, 
  RECOMMENDED_CREATIVE_SKILLS 
} from '../data/creatorSkillsData';

export default function CreatorSkillsManager({
  creator,
  onUpdateSkills,
  isEditable = true
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState(creator?.technicalSkills || []);
  const [creativeSkills, setCreativeSkills] = useState(creator?.creativeSkills || []);
  const [newTechSkill, setNewTechSkill] = useState('');
  const [newCreativeSkill, setNewCreativeSkill] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when creator prop updates
  const handleStartEdit = () => {
    setTechnicalSkills(creator?.technicalSkills || []);
    setCreativeSkills(creator?.creativeSkills || []);
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTechnicalSkills(creator?.technicalSkills || []);
    setCreativeSkills(creator?.creativeSkills || []);
    setErrorMsg('');
    setIsEditing(false);
  };

  const handleAddTechnicalSkill = (skillToAdd = null) => {
    const val = (skillToAdd || newTechSkill).trim();
    if (!val) return;
    if (technicalSkills.some(s => s.toLowerCase() === val.toLowerCase())) {
      setErrorMsg(`"${val}" is already added to Technical Skills.`);
      return;
    }
    setTechnicalSkills(prev => [...prev, val]);
    setNewTechSkill('');
    setErrorMsg('');
  };

  const handleRemoveTechnicalSkill = (skillToRemove) => {
    setTechnicalSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddCreativeSkill = (skillToAdd = null) => {
    const val = (skillToAdd || newCreativeSkill).trim();
    if (!val) return;
    if (creativeSkills.some(s => s.toLowerCase() === val.toLowerCase())) {
      setErrorMsg(`"${val}" is already added to Creative Skills.`);
      return;
    }
    setCreativeSkills(prev => [...prev, val]);
    setNewCreativeSkill('');
    setErrorMsg('');
  };

  const handleRemoveCreativeSkill = (skillToRemove) => {
    setCreativeSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSave = () => {
    if (onUpdateSkills) {
      onUpdateSkills({
        technicalSkills,
        creativeSkills
      });
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filter available suggestions that haven't been added yet
  const availableTechSuggestions = RECOMMENDED_TECHNICAL_SKILLS.filter(
    s => !technicalSkills.some(ts => ts.toLowerCase() === s.toLowerCase())
  );

  const availableCreativeSuggestions = RECOMMENDED_CREATIVE_SKILLS.filter(
    s => !creativeSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="creator-skills-manager-block" style={{ marginTop: '24px' }}>
      {/* Top Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary, #EB6E4B)'
            }}>
              Creator Capabilities & Disciplines
            </span>
            {saveSuccess && (
              <span style={{
                fontSize: '0.72rem',
                color: '#059669',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: '100px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Check size={12} />
                <span>Skills Saved</span>
              </span>
            )}
          </div>
          <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.45rem', color: 'var(--text-primary)' }}>
            Technical & Creative Expertise
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Distinguishes your AI production toolchains from your artistic direction & storytelling craft.
          </p>
        </div>

        {isEditable && (
          <div>
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleStartEdit}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Edit technical and creative skills"
              >
                <Edit3 size={13} />
                <span>Edit Skills</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Check size={14} />
                  <span>Save Skills</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{
          padding: '8px 14px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          color: '#DC2626',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout for Both Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* ========================================================
            CATEGORY 1: TECHNICAL SKILLS (AI Production & Tools)
            ======================================================== */}
        <div className="studio-card skills-category-card" style={{
          padding: '22px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(180deg, rgba(240, 253, 250, 0.5) 0%, rgba(255, 255, 255, 0.9) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#0891B2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0E7490' }}>
                  Technical Skills
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#155E75' }}>
                  AI generation, prompting, model config & pipelines
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 9px',
              borderRadius: '100px',
              background: 'rgba(6, 182, 212, 0.12)',
              color: '#0891B2'
            }}>
              {technicalSkills.length} {technicalSkills.length === 1 ? 'Skill' : 'Skills'}
            </span>
          </div>

          {/* Skill Chips List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', alignItems: 'center' }}>
            {technicalSkills.length > 0 ? (
              technicalSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#0F766E',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(6, 182, 212, 0.08)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0D9488' }} />
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnicalSkill(skill)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={`Remove ${skill}`}
                    >
                      <X size={12} className="hover:text-red-500" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                No technical skills added yet. {isEditing ? 'Add custom skills below or pick from suggestions.' : 'Click Edit Skills to add your AI production capabilities.'}
              </div>
            )}
          </div>

          {/* Edit Controls for Technical Skills */}
          {isEditing && (
            <div style={{ borderTop: '1px dashed rgba(6, 182, 212, 0.25)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter custom technical skill (e.g. Latent Upscaling)..."
                  value={newTechSkill}
                  onChange={(e) => setNewTechSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnicalSkill();
                    }
                  }}
                  style={{ fontSize: '0.84rem', padding: '7px 12px' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAddTechnicalSkill()}
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Suggestions Pills */}
              {availableTechSuggestions.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Suggested AI Capabilities:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {availableTechSuggestions.slice(0, 6).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddTechnicalSkill(sug)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '1px dashed rgba(6, 182, 212, 0.35)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          color: '#0E7490',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={10} />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            CATEGORY 2: CREATIVE SKILLS (Artistic Abilities & Direction)
            ======================================================== */}
        <div className="studio-card skills-category-card" style={{
          padding: '22px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          background: 'linear-gradient(180deg, rgba(245, 243, 255, 0.5) 0%, rgba(255, 255, 255, 0.9) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(124, 58, 237, 0.15)',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Palette size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#6D28D9' }}>
                  Creative Skills
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#5B21B6' }}>
                  Visual storytelling, cinematography, world-building & direction
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 9px',
              borderRadius: '100px',
              background: 'rgba(124, 58, 237, 0.12)',
              color: '#7C3AED'
            }}>
              {creativeSkills.length} {creativeSkills.length === 1 ? 'Skill' : 'Skills'}
            </span>
          </div>

          {/* Skill Chips List */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', alignItems: 'center' }}>
            {creativeSkills.length > 0 ? (
              creativeSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    color: '#6D28D9',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(124, 58, 237, 0.08)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCreativeSkill(skill)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={`Remove ${skill}`}
                    >
                      <X size={12} className="hover:text-red-500" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                No creative skills added yet. {isEditing ? 'Add custom skills below or pick from suggestions.' : 'Click Edit Skills to add your artistic and storytelling craft.'}
              </div>
            )}
          </div>

          {/* Edit Controls for Creative Skills */}
          {isEditing && (
            <div style={{ borderTop: '1px dashed rgba(124, 58, 237, 0.25)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter custom creative skill (e.g. Narrative Pacing)..."
                  value={newCreativeSkill}
                  onChange={(e) => setNewCreativeSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCreativeSkill();
                    }
                  }}
                  style={{ fontSize: '0.84rem', padding: '7px 12px' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAddCreativeSkill()}
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Suggestions Pills */}
              {availableCreativeSuggestions.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Suggested Artistic Disciplines:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {availableCreativeSuggestions.slice(0, 6).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddCreativeSkill(sug)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '1px dashed rgba(124, 58, 237, 0.35)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          color: '#6D28D9',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={10} />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
