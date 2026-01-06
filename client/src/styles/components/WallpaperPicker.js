import React, { useState } from 'react';
import { wallpaperPresets } from '../../lib/wallpaperPresets';
import { wallpaperHelpers } from '../../lib/supabase';

function WallpaperPicker({ 
  userId, 
  currentSettings, 
  onSave, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('images');
  const [selectedType, setSelectedType] = useState(currentSettings?.type || 'image');
  const [selectedValue, setSelectedValue] = useState(currentSettings?.value || 'abstract-waves');
  const [blur, setBlur] = useState(currentSettings?.blur || 0);
  const [brightness, setBrightness] = useState(currentSettings?.brightness || 100);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handlePresetSelect = (type, value) => {
    setSelectedType(type);
    setSelectedValue(value);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

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
      setError('Failed to save wallpaper. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="wallpaper-picker">
      {/* Tabs */}
      <div className="wallpaper-tabs">
        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          📸 Images
        </button>
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
      </div>

      {/* Content */}
      <div className="wallpaper-content">
        {/* Gradients Tab */}
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

        {/* Patterns Tab */}
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

        {/* Images Tab - NEW (replaces Upload) */}
        {activeTab === 'images' && (
          <div className="wallpaper-grid">
            {wallpaperPresets.images.map((preset) => (
              <button
                key={preset.id}
                className={`wallpaper-option wallpaper-image ${
                  selectedType === 'image' && selectedValue === preset.id ? 'selected' : ''
                }`}
                onClick={() => handlePresetSelect('image', preset.id)}
                style={{
                  backgroundImage: `url(${preset.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <span className="wallpaper-name">{preset.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="wallpaper-controls">
        <div className="control-group">
          <label className="control-label">
            <span>Blur</span>
            <span className="control-value">{blur}px</span>
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
            <span>Brightness</span>
            <span className="control-value">{brightness}%</span>
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

      {/* Error Message */}
      {error && (
        <div className="wallpaper-error">
          ⚠️ {error}
        </div>
      )}

      {/* Actions */}
      <div className="wallpaper-actions">
        <button 
          className="btn btn-secondary" 
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Applying...' : 'Apply Wallpaper'}
        </button>
      </div>
    </div>
  );
}

export default WallpaperPicker;