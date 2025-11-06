
import React, { useState, useEffect } from 'react';
import { YaraRule } from '../types.ts';
import { validateYaraRule } from '../services/yaraValidationService.ts';
import { X } from 'lucide-react';

interface EditRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContent: string, updatedTags: string[], updatedCves: string[]) => void;
  rule: YaraRule | null;
}

const EditRuleModal: React.FC<EditRuleModalProps> = ({ isOpen, onClose, onSave, rule }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [cves, setCves] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (rule) {
      setContent(rule.content);
      setTags(rule.tags?.join(', ') || '');
      setCves(rule.cve?.join(', ') || '');
    }
    setValidationErrors([]); // Clear errors when modal opens or rule changes
  }, [rule]);

  if (!isOpen || !rule) {
    return null;
  }

  const handleSave = () => {
    const validationResult = validateYaraRule(content);
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }
    setValidationErrors([]);

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const cveArray = cves.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
    onSave(content, tagsArray, cveArray);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Edit Rule: <span className="text-blue-400">{rule.name}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="YARA rule content"
          />
          {validationErrors.length > 0 && (
            <div className="bg-red-900 border border-red-500 text-red-300 p-3 rounded-md mt-2 text-sm">
                <h4 className="font-bold mb-2">Please fix the following syntax errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
          )}
           <div>
            <label htmlFor="rule-tags" className="block text-sm font-medium text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="rule-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-900 text-gray-300 font-mono text-sm p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="YARA rule tags"
              placeholder="e.g., ransomware, crypto, evasion"
            />
          </div>
           <div>
            <label htmlFor="rule-cves" className="block text-sm font-medium text-gray-300 mb-1">
              Associated CVEs (comma-separated)
            </label>
            <input
              id="rule-cves"
              type="text"
              value={cves}
              onChange={(e) => setCves(e.target.value)}
              className="w-full bg-gray-900 text-gray-300 font-mono text-sm p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Associated CVEs"
              placeholder="e.g., CVE-2021-44228, CVE-2022-22965"
            />
          </div>
        </div>
        <div className="flex justify-end p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRuleModal;