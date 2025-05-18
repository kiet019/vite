import { useState, useEffect } from 'react';
import translations from '../utils/translations';

function FontSizeSlider({ initialValue = 1, onChange, language = 'en' }) {
  const [value, setValue] = useState(initialValue);

  // Get translations based on current interface language
  const t = translations[language];

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setValue(newValue);
      onChange(newValue);

      // Apply the change immediately for better feedback
      document.documentElement.style.setProperty('--chat-font-size', `${newValue}rem`);

      // Calculate the percentage for the slider gradient
      const min = 0.8;
      const max = 2.0;
      const percentage = ((newValue - min) / (max - min)) * 100;
      e.target.style.setProperty('--slider-value', `${percentage}%`);
    }
  };

  // Update local state if initialValue changes (e.g., when loaded from localStorage)
  useEffect(() => {
    if (initialValue !== value && !isNaN(initialValue)) {
      setValue(initialValue);
    }
  }, [initialValue, value]);

  // Set initial gradient value when component mounts
  useEffect(() => {
    // Calculate the percentage for the slider gradient
    const min = 0.8;
    const max = 2.0;
    const percentage = ((value - min) / (max - min)) * 100;

    // Find all slider elements and set the gradient
    const sliders = document.querySelectorAll('.font-size-range-input');
    sliders.forEach(slider => {
      slider.style.setProperty('--slider-value', `${percentage}%`);
    });
  }, [value]);

  return (
    <div className="header-font-size-slider">
      <span className="font-size-icon small">A</span>
      <input
        type="range"
        min="0.8"
        max="2.0"
        step="0.05"
        value={value}
        onChange={handleChange}
        title={t.fontSizeAdjustTitle}
        aria-label={t.fontSizeAdjustAriaLabel}
        className="font-size-range-input"
        aria-valuemin="0.8"
        aria-valuemax="2.0"
        aria-valuenow={value}
        role="slider"
      />
      <span className="font-size-icon large">A</span>
    </div>
  );
}

export default FontSizeSlider;
