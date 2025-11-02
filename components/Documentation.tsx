
import React, { useState } from 'react';
import { README_CONTENT, CONTRIBUTING_GUIDE } from '../constants';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('readme');

  const renderContent = () => {
    switch (activeTab) {
      case 'readme':
        return (
          <div className="prose prose-invert max-w-none prose-h1:text-white prose-p:text-gray-300 prose-li:text-gray-300">
              <pre className="whitespace-pre-wrap font-sans">{README_CONTENT}</pre>
          </div>
        );
      case 'contributing':
        return (
          <div className="prose prose-invert max-w-none prose-h1:text-white prose-p:text-gray-300">
             <pre className="whitespace-pre-wrap font-sans">{CONTRIBUTING_GUIDE}</pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Documentation</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-4 p-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('readme')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'readme' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              README.md
            </button>
            <button
              onClick={() => setActiveTab('contributing')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'contributing' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              CONTRIBUTING.md
            </button>
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Documentation;
