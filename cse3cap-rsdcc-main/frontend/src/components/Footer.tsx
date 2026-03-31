import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 w-full py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Latrobe Observatory. All Rights Reserved.
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Designed for Remote Scientific Data Capture and Control.
        </p>
      </div>
    </footer>
  );
};

export default Footer;