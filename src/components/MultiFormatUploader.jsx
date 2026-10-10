// src/components/MultiFormatUploader.jsx
// Multi-Format Creative Portfolio Uploader
// Supports Images (JPG, PNG, WebP, GIF) and Videos (MP4, WebM, MOV) with Drag & Drop, Previews, Cover Selection, and Reordering.

import React, { useState, useRef } from 'react';
import { 
  Upload, Film, Image as ImageIcon, X, Check, Star, AlertCircle, 
  Play, Pause, ArrowUp, ArrowDown, RefreshCw, FileText, CheckCircle2, Link2
} from 'lucide-react';
import { 
  validateMediaFile, 
  uploadPortfolioMedia, 
  formatBytes, 
  ACCEPTED_FILE_EXTENSIONS 
} from '../services/mediaStorage';

export default function MultiFormatUploader({ 
  media = [], 
  onChange, 
  creatorId = 'creator-1',
  maxFiles = 10 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { [filename]: number }
  const [uploadErrors, setUploadErrors] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [externalUrlType, setExternalUrlType] = useState('image');
  const fileInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadErrors([]);

    const newErrors = [];
    const filesToUpload = Array.from(fileList);

    if (media.length + filesToUpload.length > maxFiles) {
      setUploadErrors([`You can attach up to ${maxFiles} creative assets per portfolio piece.`]);
      return;
    }

    const uploadedAssets = [];

    for (const file of filesToUpload) {
      const validation = validateMediaFile(file);
      if (!validation.valid) {
        newErrors.push(validation.error);
        continue;
      }

      setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

      try {
        const asset = await uploadPortfolioMedia(file, creatorId, (pct) => {
          setUploadProgress(prev => ({ ...prev, [file.name]: pct }));
        });

        uploadedAssets.push(asset);
      } catch (err) {
        newErrors.push(`Failed to process ${file.name}: ${err.message || 'Storage error'}`);
      } finally {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }

    if (newErrors.length > 0) {
      setUploadErrors(newErrors);
    }

    if (uploadedAssets.length > 0) {
      // If no media existed yet, set the first uploaded item as cover
      const hasExistingCover = media.some(m => m.isCover);
      const updatedMedia = [...media, ...uploadedAssets.map((asset, i) => ({
        ...asset,
        isCover: !hasExistingCover && i === 0
      }))];

      onChange(updatedMedia);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (assetId) => {
    const updated = media.filter(m => m.id !== assetId);
    // If the removed item was cover, assign cover to the new first item
    if (updated.length > 0 && !updated.some(m => m.isCover)) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const handleSetCover = (assetId) => {
    const updated = media.map(m => ({
      ...m,
      isCover: m.id === assetId
    }));
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= media.length) return;
    const reordered = [...media];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onChange(reordered);
  };

  const handleAddExternalUrl = (e) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    const newAsset = {
      id: `media-url-${Date.now()}`,
      url: externalUrl.trim(),
      name: externalUrl.split('/').pop()?.split('?')[0] || 'External Creative Asset',
      size: 0,
      mimeType: externalUrlType === 'video' ? 'video/mp4' : 'image/jpeg',
      mediaType: externalUrlType,
      storageType: 'external-url',
      isCover: media.length === 0
    };

    onChange([...media, newAsset]);
    setExternalUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="multi-format-uploader-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Upload Header */}
      <div>
        <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
          Upload Your Creative Work
        </label>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Showcase your creativity with images, videos, and AI-generated content.
        </p>
      </div>

      {/* Errors Banner */}
      {uploadErrors.length > 0 && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '0.82rem',
          color: '#DC2626'
        }}>
          {uploadErrors.map((err, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--accent-primary, #EB6E4B)' : '2px dashed var(--border-medium, #CBD5E1)',
          background: isDragging ? 'rgba(235, 110, 75, 0.04)' : 'var(--bg-secondary, #F8FAFC)',
          borderRadius: '14px',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(235, 110, 75, 0.1)',
          color: 'var(--accent-primary, #EB6E4B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Upload size={22} />
        </div>

        <div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            Click to browse local files or drag & drop media here
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Supports JPG, PNG, WebP, GIF animations, MP4, WebM, and MOV (up to 100MB per file)
          </div>
        </div>

        {/* Format Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
          {['JPG', 'PNG', 'WebP', 'GIF', 'MP4', 'WebM', 'MOV'].map((fmt) => (
            <span key={fmt} style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle, #E2E8F0)',
              color: 'var(--text-secondary, #64748B)',
              fontWeight: 600
            }}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* External URL Fallback Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary, #EB6E4B)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0
          }}
        >
          <Link2 size={13} />
          <span>{showUrlInput ? 'Cancel External URL' : '+ Or attach hosted media URL'}</span>
        </button>
      </div>

      {/* External URL Input Box */}
      {showUrlInput && (
        <div style={{
          padding: '12px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select 
            className="form-input" 
            style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
            value={externalUrlType}
            onChange={(e) => setExternalUrlType(e.target.value)}
          >
            <option value="image">Image URL</option>
            <option value="video">Video URL (MP4 / WebM)</option>
          </select>
          <input 
            type="url" 
            className="form-input" 
            style={{ flex: 1, minWidth: '220px', fontSize: '0.8rem', padding: '6px 10px' }}
            placeholder="https://images.unsplash.com/... or https://...video.mp4"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleAddExternalUrl}
          >
            Attach URL
          </button>
        </div>
      )}

      {/* Uploading Progress Indicators */}
      {Object.keys(uploadProgress).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(uploadProgress).map(([filename, pct]) => (
            <div key={filename} style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{filename}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary, #EB6E4B)', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Media Assets Gallery / List */}
      {media.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Attached Media Assets ({media.length} of {maxFiles})
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Select primary cover thumbnail & reorder sequence
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {media.map((asset, index) => {
              const isVideo = asset.mediaType === 'video' || asset.mimeType?.startsWith('video/');
              return (
                <div 
                  key={asset.id} 
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: asset.isCover ? '2px solid var(--accent-primary, #EB6E4B)' : '1px solid var(--border-medium, #E2E8F0)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: asset.isCover ? '0 2px 8px rgba(235, 110, 75, 0.15)' : 'none'
                  }}
                >
                  {/* Media Preview Box */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#0F172A',
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isVideo ? (
                      <video 
                        src={asset.url} 
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img 
                        src={asset.url} 
                        alt={asset.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                    )}

                    {isVideo && (
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        color: '#FFFFFF',
                        fontSize: '0.6rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <Film size={10} />
                      </span>
                    )}
                  </div>

                  {/* Asset Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '220px'
                      }}>
                        {asset.name || 'Creative Asset'}
                      </span>

                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isVideo ? 'rgba(124, 58, 237, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isVideo ? '#7C3AED' : '#059669',
                        fontWeight: 700
                      }}>
                        {isVideo ? 'VIDEO' : 'IMAGE'}
                      </span>

                      {asset.isCover && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: 'rgba(235, 110, 75, 0.12)',
                          color: 'var(--accent-primary, #EB6E4B)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Star size={10} fill="currentColor" />
                          <span>Primary Cover</span>
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {asset.size > 0 ? formatBytes(asset.size) : 'External URL'} • {asset.mimeType || 'Standard Media'}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          color: index === 0 ? '#CBD5E1' : 'var(--text-secondary)',
                          cursor: index === 0 ? 'default' : 'pointer'
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={index === media.length - 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          color: index === media.length - 1 ? '#CBD5E1' : 'var(--text-secondary)',
                          cursor: index === media.length - 1 ? 'default' : 'pointer'
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Set Cover Button */}
                    {!asset.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(asset.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        title="Set this asset as the project primary cover image"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(asset.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        padding: '6px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
