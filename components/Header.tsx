import React from 'react';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { ArrowRightOnRectangleIcon } from './icons/ArrowRightOnRectangleIcon.tsx';

interface HeaderProps {
    isAuthenticated: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-tight">
              Cube Quality Analysis Report
            </h1>
          </div>
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
