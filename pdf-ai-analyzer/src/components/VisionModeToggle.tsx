import React from 'react';

interface VisionModeToggleProps {
  useVisionMode: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export const VisionModeToggle: React.FC<VisionModeToggleProps> = ({
  useVisionMode,
  onToggle,
  disabled = false
}) => {
  return (
    <div style={{
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: useVisionMode ? '#e3f2fd' : '#f5f5f5',
      borderRadius: '8px',
      border: useVisionMode ? '2px solid #1976d2' : '2px solid #e0e0e0',
    }}>
      <label style={{ display: 'flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <input
          type="checkbox"
          checked={useVisionMode}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
          style={{ marginRight: '12px', width: '20px', height: '20px' }}
        />
        <div>
          <strong style={{ fontSize: '16px' }}>
            {useVisionMode ? '🖼️ Vision Mode (Recommended for Math)' : '📄 Text Extraction Mode'}
          </strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            {useVisionMode 
              ? 'Uses GPT-4 Vision to accurately read mathematical formulas from PDF images. Best for math/science documents.'
              : 'Fast text extraction but may corrupt mathematical symbols. Use for text-heavy documents without complex formulas.'}
          </p>
          {useVisionMode && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d32f2f' }}>
              ⚠️ Note: Vision mode processes each page as an image. May be slower but much more accurate for formulas.
            </p>
          )}
        </div>
      </label>
    </div>
  );
};