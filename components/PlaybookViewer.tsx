
import React, { useState, useEffect } from 'react';
import { VELOCIRAPTOR_PLAYBOOK, HUNTBOARD_TEMPLATE } from '../constants.ts';
import { Clipboard, FileText, CheckCircle } from 'lucide-react';

const PlaybookViewer: React.FC = () => {
    const [copied, setCopied] = useState('');

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-3 mb-4">
            <FileText size={32} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Forensic Playbooks & Huntboards</h1>
        </div>
        <p className="text-gray-400">
            Operational guides and templates for structured threat hunting and incident response.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Velociraptor Playbook */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Velociraptor Playbook: Endpoint YARA Scan</h2>
             <button
                onClick={() => copyToClipboard(VELOCIRAPTOR_PLAYBOOK, 'playbook')}
                className="text-gray-400 hover:text-white transition flex items-center text-sm disabled:text-green-400"
                title="Copy to clipboard"
                disabled={copied === 'playbook'}
              >
                {copied === 'playbook' ? (
                  <>
                    <CheckCircle size={16} className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard size={16} className="mr-1" />
                    Copy
                  </>
                )}
              </button>
          </div>
          <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {VELOCIRAPTOR_PLAYBOOK}
            </pre>
          </div>
        </div>

        {/* Huntboard Template */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Huntboard Template: Suspicious Process</h2>
             <button
                onClick={() => copyToClipboard(HUNTBOARD_TEMPLATE, 'huntboard')}
                className="text-gray-400 hover:text-white transition flex items-center text-sm disabled:text-green-400"
                title="Copy to clipboard"
                disabled={copied === 'huntboard'}
             >
                {copied === 'huntboard' ? (
                  <>
                    <CheckCircle size={16} className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard size={16} className="mr-1" />
                    Copy
                  </>
                )}
             </button>
          </div>
          <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto prose prose-invert prose-sm max-w-none prose-pre:bg-gray-800">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {HUNTBOARD_TEMPLATE}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybookViewer;