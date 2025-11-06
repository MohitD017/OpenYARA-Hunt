import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('readme');
  const [readmeContent, setReadmeContent] = useState('');
  const [contributingContent, setContributingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        const [readmeResponse, contributingResponse] = await Promise.all([
          fetch('./README.md'),
          fetch('./CONTRIBUTING.md')
        ]);

        if (!readmeResponse.ok) {
          throw new Error(`Failed to load README.md: ${readmeResponse.statusText}`);
        }
        if (!contributingResponse.ok) {
          throw new Error(`Failed to load CONTRIBUTING.md: ${contributingResponse.statusText}`);
        }

        const readmeText = await readmeResponse.text();
        const contributingText = await contributingResponse.text();
        
        setReadmeContent(readmeText);
        setContributingContent(contributingText);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred while fetching documentation.');
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin" size={32} />
          <p className="ml-4">Loading Documentation...</p>
        </div>
      );
    }
    if (error) {
        return (
            <div className="text-red-400 bg-red-900 border border-red-500 p-4 rounded-md">
                <p className="font-bold">Error loading documentation:</p>
                <p>{error}</p>
                <p className="mt-2 text-sm text-red-300">Please ensure README.md and CONTRIBUTING.md are present in the project root and the local server is running correctly.</p>
            </div>
        );
    }

    const content = activeTab === 'readme' ? readmeContent : contributingContent;
    // Fix: Split content by the correct newline character '\n' instead of '\\n'
    return (
      <div className="prose prose-invert max-w-none prose-h1:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-pre:bg-gray-900 prose-code:text-blue-300">
        {content.split('\n').map((line, index) => (
            <p key={index} className="mb-0">{line || <br />}</p>
        ))}
      </div>
    );
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