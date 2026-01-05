import React, { useState, useRef } from 'react';
import { wallpaperPresets } from '../../lib/wallpaperPresets';
import { wallpaperHelpers } from '../../lib/supabase';

function WallpaperPicker({ 
  userId, 
  currentSettings, 
  onSave, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('gradients');
  const [selectedType, setSelectedType] = useState(currentSettings?.type || 'gradient');
  const [selectedValue, setSelectedValue] = useState(currentSettings?.value || 'sunset');
  const [blur, setBlur] = useState(currentSettings?.blur || 0);
  const [brightness, setBrightness] = useState(currentSettings?.brightness || 100);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handlePresetSelect = (type, value) => {
    setSelectedType(type);
    setSelectedValue(value);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { url, error } = await wallpaperHelpers.uploadWallpaper(userId, file);
      
      if (error) throw error;
      
      setSelectedType('image');
      setSelectedValue(url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const settings = {
        type: selectedType,
        value: selectedValue,
        blur: blur,
        brightness: brightness
      };

      const { error } = await wallpaperHelpers.updateWallpaperSettings(userId, settings);
      
      if (error) throw error;
      
      onSave(settings);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setUploadError('Failed to save settings');
    }
  };

  return (
    <div className="wallpaper-picker">
      <div className="wallpaper-tabs">
        <button
          className={`tab-button ${activeTab === 'gradients' ? 'active' : ''}`}
          onClick={() => setActiveTab('gradients')}
        >
          🌈 Gradients
        </button>
        <button
          className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          ⚡ Patterns
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📸 Upload
        </button>
      </div>

      <div className="wallpaper-content">
        {activeTab === 'gradients' && (
          <div className="wallpaper-grid">
            {wallpaperPresets.gradients.map((preset) => (
              <button
                key={preset.id}
                className={`wallpaper-option ${
                  selectedType === 'gradient' && selectedValue === preset.id ? 'selected' : ''
                }`}
                onClick={() => handlePresetSelect('gradient', preset.id)}
                style={{ background: preset.thumbnail }}
              >
                <span className="wallpaper-name">{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="wallpaper-grid">
            {wallpaperPresets.patterns.map((preset) => (
              <button
                key={preset.id}
                className={`wallpaper-option ${
                  selectedType === 'pattern' && selectedValue === preset.id ? 'selected' : ''
                }`}
                onClick={() => handlePresetSelect('pattern', preset.id)}
                style={{
                  background: preset.value,
                  backgroundSize: preset.backgroundSize,
                  backgroundColor: preset.backgroundColor
                }}
              >
                <span className="wallpaper-name">{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            <button
              className="btn btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? '⏳ Uploading...' : '📤 Choose Image'}
            </button>

            {uploadError && (
              <div className="upload-error">⚠️ {uploadError}</div>
            )}

            {selectedType === 'image' && (
              <div
                className="image-preview"
                style={{ backgroundImage: `url(${selectedValue})` }}
              >
                <span className="preview-label">Current Image</span>
              </div>
            )}

            <p className="upload-hint">
              Recommended: 1920x1080 or higher<br />
              Max size: 5MB • JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      <div className="wallpaper-controls">
        <div className="control-group">
          <label className="control-label">
            Blur: {blur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <div className="control-group">
          <label className="control-label">
            Brightness: {brightness}%
          </label>
          <input
            type="range"
            min="30"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <div className="wallpaper-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Apply Wallpaper
        </button>
      </div>
    </div>
  );
}

export default WallpaperPicker;