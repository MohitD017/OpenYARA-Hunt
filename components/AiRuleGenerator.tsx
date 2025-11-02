import React, { useState } from 'react';
import { generateYaraRule } from '../services/geminiService';
import { validateYaraRule } from '../services/yaraValidationService';
import { YaraRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Bot, Sparkles, Loader } from 'lucide-react';

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
      setError("Failed to generate rule. Check API key and network connection.");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bot size={32} className="text-blue-400" />
        <h1 className="text-3xl font-bold text-white">AI-Assisted YARA Rule Generator</h1>
      </div>
      <p className="text-gray-400">
        Describe the characteristics of the malware or threat you want to detect. The AI will generate a YARA rule based on your input.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <label htmlFor="threat-description" className="block text-lg font-semibold mb-2">
          Threat Description
        </label>
        <textarea
          id="threat-description"
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
          <h2 className="text-xl font-semibold mb-3">Generated Rule</h2>
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