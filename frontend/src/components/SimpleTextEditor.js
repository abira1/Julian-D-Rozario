import React from 'react';

const SimpleTextEditor = ({ value, onChange, placeholder, style }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="simple-text-editor">
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
        style={{ minHeight: '300px', ...style }}
        rows={12}
      />
    </div>
  );
};

export default SimpleTextEditor;