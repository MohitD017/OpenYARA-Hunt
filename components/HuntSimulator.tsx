
import React, { useState, useCallback, useEffect } from 'react';
import { YaraRule, HuntResult } from '../types';
import { runHunt } from '../services/yaraService';
import ResultsDashboard from './ResultsDashboard';
import { FileUp, Search, X, Loader, Save, FolderOpen, Info } from 'lucide-react';

interface HuntSimulatorProps {
  rules: YaraRule[];
  huntResult: HuntResult | null;
  setHuntResult: React.Dispatch<React.SetStateAction<HuntResult | null>>;
}

const HuntSimulator: React.FC<HuntSimulatorProps> = ({ rules, huntResult, setHuntResult }) => {
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set(rules.map(r => r.id)));
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('openYaraHuntConfig')) {
      setIsConfigSaved(true);
    }
  }, []);

  // Sync selectedRules when rules prop changes (e.g., after deleting a rule from the library)
  useEffect(() => {
    const ruleIds = new Set(rules.map(r => r.id));
    setSelectedRules(prev => {
        const newSelected = new Set(prev);
        for (const id of newSelected) {
            if (!ruleIds.has(id)) {
                newSelected.delete(id);
            }
        }
        return newSelected;
    });
  }, [rules]);

  const handleRuleSelection = (ruleId: string) => {
    setSelectedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFiles(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleRemoveFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleRunHunt = async () => {
    setStatus(null);
    if (selectedRules.size === 0) {
      setStatus({ message: "Please select at least one YARA rule.", type: 'error' });
      return;
    }
    if (files.length === 0) {
      setStatus({ message: "Please upload at least one file for the test corpus.", type: 'error' });
      return;
    }

    setIsLoading(true);
    setHuntResult(null);
    try {
      const activeRules = rules.filter(r => selectedRules.has(r.id));
      const result = await runHunt(activeRules, files);
      setHuntResult(result);
    } catch (err) {
      setStatus({ message: "An error occurred during the hunt simulation.", type: 'error' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    try {
      const config = {
        selectedRuleIds: Array.from(selectedRules),
      };
      localStorage.setItem('openYaraHuntConfig', JSON.stringify(config));
      setIsConfigSaved(true);
      setStatus({ message: 'Hunt configuration saved successfully!', type: 'success' });
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ message: 'Failed to save configuration.', type: 'error' });
    }
  };

  const handleLoadConfig = () => {
    const savedConfigJSON = localStorage.getItem('openYaraHuntConfig');
    if (savedConfigJSON) {
      try {
        const savedConfig = JSON.parse(savedConfigJSON);
        setSelectedRules(new Set(savedConfig.selectedRuleIds || []));
        setStatus({ message: 'Hunt configuration loaded!', type: 'success' });
        setTimeout(() => setStatus(null), 3000);
      } catch (e) {
        setStatus({ message: 'Failed to load configuration. It may be corrupted.', type: 'error' });
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Threat Hunt Simulator</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* YARA Rules Column */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col">
            <h2 className="text-xl font-semibold mb-3">1. Select YARA Rules for this Hunt</h2>
            <div className="text-sm text-gray-400 bg-gray-900 p-2 rounded-md mb-3 flex items-center gap-2">
                <Info size={16} className="text-blue-400 flex-shrink-0" />
                <span>Manage your ruleset in the <span className="font-bold text-gray-300">Rule Library</span> tab.</span>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto pr-2 h-64 md:h-auto">
              {rules.length > 0 ? rules.map(rule => (
                <div key={rule.id} className="flex items-center bg-gray-700 p-2 rounded">
                  <input
                    type="checkbox"
                    id={`hunt-${rule.id}`}
                    checked={selectedRules.has(rule.id)}
                    onChange={() => handleRuleSelection(rule.id)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-blue-500 focus:ring-blue-600"
                  />
                  <label htmlFor={`hunt-${rule.id}`} className="ml-3 block text-sm font-medium text-gray-300 cursor-pointer">
                    {rule.name} <span className="text-xs text-gray-400">({rule.category})</span>
                  </label>
                </div>
              )) : (
                  <div className="text-center text-gray-500 py-10">
                      No rules found in library.
                  </div>
              )}
            </div>
          </div>

          {/* Test Corpus Column */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">2. Upload Test Corpus (Benign Files)</h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
            >
              <FileUp className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">
                <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
              </p>
              <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
            </div>
            {files.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto">
                <ul className="divide-y divide-gray-700">
                  {files.map(file => (
                    <li key={file.name} className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-300">{file.name}</span>
                      <button onClick={() => handleRemoveFile(file.name)} className="text-gray-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Action and Results */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 hover:text-white transition"
              title="Save selected rules to your browser's local storage."
            >
              <Save size={16} />
              <span>Save Config</span>
            </button>
            <button
              onClick={handleLoadConfig}
              disabled={!isConfigSaved}
              className="flex items-center gap-2 bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Load a previously saved hunt configuration."
            >
              <FolderOpen size={16} />
              <span>Load Config</span>
            </button>
          </div>

          <div className="text-center">
            {status && (
              <p className={`mb-4 ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {status.message}
              </p>
            )}
            <button
              onClick={handleRunHunt}
              disabled={isLoading}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Running...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={20} />
                  Run Hunt
                </>
              )}
            </button>
          </div>
        </div>

        {huntResult && <ResultsDashboard result={huntResult} />}
      </div>
    </>
  );
};

export default HuntSimulator;
