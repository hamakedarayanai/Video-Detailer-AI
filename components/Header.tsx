
import React from 'react';
import { AppLogoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <AppLogoIcon className="h-10 w-10 mr-3" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Video Detailer <span className="text-indigo-400">AI</span>
        </h1>
      </div>
    </header>
  );
};