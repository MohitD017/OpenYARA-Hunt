import React, { useState, useRef } from 'react';
import { generateYaraRule } from '../services/geminiService.ts';
import { validateYaraRule } from '../services/yaraValidationService.ts';
import { YaraRule } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { Bot, Sparkles, Loader, Scissors, Copy, ClipboardPaste, Check } from 'lucide-react';

interface AiRuleGeneratorProps {
  onRuleGenerated: (rule: YaraRule) => void;
}

const AiRuleGenerator: React.FC<AiRuleGeneratorProps> = ({ onRuleGenerated }) => {
  const [description, setDescription] = useState('');
  const [generatedRule, setGeneratedRule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [descriptionError, setDescriptionError] = useState(false);
  const [isRuleCopied, setIsRuleCopied] = useState(false);
  
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please enter a threat description.");
      setDescriptionError(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setDescriptionError(false);
    setGeneratedRule('');
    setValidationErrors([]);
    try {
      const ruleContent = await generateYaraRule(description);
      setGeneratedRule(ruleContent);
      
      const validationResult = validateYaraRule(ruleContent);
      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during rule generation.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = () => {
    if (!generatedRule.trim()) return;

    // Extract rule name from content
    const nameMatch = generatedRule.match(/rule\s+(\w+)/);
    const ruleName = nameMatch ? nameMatch[1] : `AI_Generated_${uuidv4().split('-')[0]}`;
    
    // Extract description from meta section
    const descriptionMatch = generatedRule.match(/description\s*=\s*"([^"]+)"/);
    const ruleDescription = descriptionMatch ? descriptionMatch[1] : 'No description provided.';

    const newRule: YaraRule = {
      id: uuidv4(),
      name: ruleName,
      category: 'AI-Generated',
      content: generatedRule,
      author: 'AI Assistant',
      lastModified: new Date().toISOString().split('T')[0],
      description: ruleDescription,
      tags: [],
      cve: [],
    };
    onRuleGenerated(newRule);
    setGeneratedRule('');
    setDescription('');
    setValidationErrors([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        handleGenerate();
      }
    }
  };

  const handleCopyRule = () => {
    if (!generatedRule) return;
    navigator.clipboard.writeText(generatedRule).then(() => {
      setIsRuleCopied(true);
      setTimeout(() => setIsRuleCopied(false), 2000);
    });
  };
  
  const handleTextareaAction = async (action: 'cut' | 'copy' | 'paste') => {
    const textarea = descriptionTextareaRef.current;
    if (!textarea) return;

    textarea.focus();

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = textarea.value.substring(selectionStart, selectionEnd);

    switch (action) {
      case 'copy':
        if (selectedText) {
          await navigator.clipboard.writeText(selectedText);
        }
        break;
      case 'cut':
        if (selectedText) {
          await navigator.clipboard.writeText(selectedText);
          const newValue = textarea.value.substring(0, selectionStart) + textarea.value.substring(selectionEnd);
          setDescription(newValue);
          // Set cursor position after re-render
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart;
          }, 0);
        }
        break;
      case 'paste':
        try {
            const textToPaste = await navigator.clipboard.readText();
            const newValue = textarea.value.substring(0, selectionStart) + textToPaste + textarea.value.substring(selectionEnd);
            setDescription(newValue);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + textToPaste.length;
            }, 0);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            setError('Could not paste from clipboard. Please ensure you have granted permission.');
        }
        break;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bot size={32} className="text-blue-400" />
        <h1 className="text-3xl font-bold text-white">AI-Assisted YARA Rule Generator</h1>
      </div>
      <p className="text-gray-400">
        Describe the characteristics of the malware or threat you want to detect. The AI will generate a YARA rule based on your input. Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 border border-gray-300 rounded-md">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 border border-gray-300 rounded-md">Enter</kbd> to generate.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="threat-description" className="block text-lg font-semibold">
              Threat Description
            </label>
            <div className="flex items-center space-x-1">
                <button onClick={() => handleTextareaAction('cut')} title="Cut (Ctrl+X)" className="text-gray-400 hover:text-white transition p-1.5 rounded-md hover:bg-gray-700"><Scissors size={16} /></button>
                <button onClick={() => handleTextareaAction('copy')} title="Copy (Ctrl+C)" className="text-gray-400 hover:text-white transition p-1.5 rounded-md hover:bg-gray-700"><Copy size={16} /></button>
                <button onClick={() => handleTextareaAction('paste')} title="Paste (Ctrl+V)" className="text-gray-400 hover:text-white transition p-1.5 rounded-md hover:bg-gray-700"><ClipboardPaste size={16} /></button>
            </div>
        </div>
        <textarea
          id="threat-description"
          ref={descriptionTextareaRef}
          onKeyDown={handleKeyDown}
          rows={4}
          className={`w-full bg-gray-900 border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono ${
            descriptionError ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="e.g., A file that drops 'svchost.exe' in the Temp directory and contains the IP address 8.8.8.8"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.trim()) {
              setDescriptionError(false);
              setError(null);
            }
          }}
        />
        {error && <p className="text-red-400 mt-2">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 flex items-center"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" size={20} />
              Generate Rule
            </>
          )}
        </button>
      </div>

      {generatedRule && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-fade-in">
           <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Generated Rule</h2>
            <button
                onClick={handleCopyRule}
                className="flex items-center gap-2 bg-gray-700 text-gray-300 font-semibold py-1 px-3 rounded-lg hover:bg-gray-600 hover:text-white transition text-sm disabled:text-green-400 disabled:cursor-default"
                disabled={isRuleCopied}
            >
                {isRuleCopied ? (
                    <>
                        <Check size={16} className="text-green-400" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy size={16} />
                        Copy
                    </>
                )}
            </button>
          </div>
          {validationErrors.length > 0 && (
            <div className="bg-yellow-900 border border-yellow-500 text-yellow-300 p-3 rounded-md mb-4 text-sm">
                <h4 className="font-bold mb-2">AI-Generated Rule Warning</h4>
                <p className="mb-2">This rule may have syntax issues. Review it carefully in the library after adding it.</p>
                <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
          )}
          <div className="bg-gray-900 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {generatedRule}
            </pre>
          </div>
          <button
            onClick={handleAddRule}
            className="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition"
          >
            Add to Rule Library
          </button>
        </div>
      )}
    </div>
  );
};

export default AiRuleGenerator;