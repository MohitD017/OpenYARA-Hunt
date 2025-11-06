import React, { useState } from 'react';
import { ETHICAL_USE_GUIDE, CONTRIBUTING_GUIDE } from '../constants/documentation.ts';

/**
 * A simple component to render Markdown-like text into React elements.
 * This supports a limited subset of Markdown:
 * - `# Heading 1`
 * - `### Heading 3`
 * - `**bold text**`
 * - ``code``
 * - List items starting with `-` or a number.
 * - Horizontal rules with `---`
 */
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={elements.length} className="list-disc list-inside space-y-2 my-4">
                    {listItems.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            );
            listItems = [];
        }
    };
    
    lines.forEach((line, i) => {
        // Bold and Code formatting
        const formattedLine = line
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-900 text-blue-300 px-1.5 py-0.5 rounded-md font-mono text-sm">$1</code>');

        if (formattedLine.startsWith('# ')) {
            flushList();
            elements.push(<h1 key={i} className="text-2xl font-bold mb-4 text-white">{formattedLine.substring(2)}</h1>);
        } else if (formattedLine.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={i} className="text-xl font-semibold mt-6 mb-2 text-gray-200">{formattedLine.substring(4)}</h3>);
        } else if (formattedLine.startsWith('- ') || /^\d+\.\s/.test(formattedLine)) {
            listItems.push(formattedLine.replace(/^\s*-\s*|^\d+\.\s*/, ''));
        } else if (formattedLine.trim() === '---') {
            flushList();
            elements.push(<hr key={i} className="my-6 border-gray-700" />);
        } else if (formattedLine.trim() !== '') {
            flushList();
            elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} className="text-gray-300 leading-relaxed my-2" />);
        }
    });

    flushList(); // Ensure the last list is rendered
    return <>{elements}</>;
};


const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ethical-use');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Documentation</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-4 p-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ethical-use')}
              className={`px-3 py-2 font-medium text-sm rounded-md ${
                activeTab === 'ethical-use' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Ethical Use Guide
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
          <div className="max-w-none">
             <SimpleMarkdownRenderer content={activeTab === 'ethical-use' ? ETHICAL_USE_GUIDE : CONTRIBUTING_GUIDE} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;