import React, { useState, useMemo, useEffect } from 'react';
import { YaraRule } from '../types';
import EditRuleModal from './EditRuleModal';
import { Bot, Pencil, Search, Trash2, Bug } from 'lucide-react';

interface RuleLibraryProps {
  rules: YaraRule[];
  setRules: React.Dispatch<React.SetStateAction<YaraRule[]>>;
  setActiveView: (view: string) => void;
}

const RuleLibrary: React.FC<RuleLibraryProps> = ({ rules, setRules, setActiveView }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<YaraRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allCategories = useMemo(() => [...new Set(rules.map(r => r.category))].sort(), [rules]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(allCategories));

  const allTags = useMemo(() => [...new Set(rules.flatMap(r => r.tags || []))].sort(), [rules]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tagFilterLogic, setTagFilterLogic] = useState<'any' | 'all'>('any');

  useEffect(() => {
    setSelectedCategories(new Set(allCategories));
  }, [allCategories]);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => {
        const newSet = new Set(prev);
        if (newSet.has(tag)) {
            newSet.delete(tag);
        } else {
            newSet.add(tag);
        }
        return newSet;
    });
  };

  const filteredRules = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return rules.filter(rule => {
      const matchesCategory = selectedCategories.has(rule.category);
      if (!matchesCategory) return false;

      if (selectedTags.size > 0) {
        const ruleTags = rule.tags || [];
        let matchesTags;
        if (tagFilterLogic === 'any') {
          // Match if the rule has AT LEAST ONE of the selected tags
          matchesTags = ruleTags.some(tag => selectedTags.has(tag));
        } else {
          // Match if the rule has ALL of the selected tags
          matchesTags = Array.from(selectedTags).every(tag => ruleTags.includes(tag));
        }
        if (!matchesTags) return false;
      }

      if (lowercasedQuery === '') return true;

      return (
        rule.name.toLowerCase().includes(lowercasedQuery) ||
        rule.author.toLowerCase().includes(lowercasedQuery) ||
        rule.content.toLowerCase().includes(lowercasedQuery) ||
        (rule.tags && rule.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))) ||
        (rule.cve && rule.cve.some(cve => cve.toLowerCase().includes(lowercasedQuery)))
      );
    });
  }, [rules, selectedCategories, selectedTags, searchQuery, tagFilterLogic]);
  
  const handleOpenEditModal = (rule: YaraRule) => {
    setRuleToEdit(rule);
    setIsEditModalOpen(true);
  };
  
  const handleSaveRule = (updatedContent: string, updatedTags: string[], updatedCves: string[]) => {
    if (!ruleToEdit) return;

    const descriptionMatch = updatedContent.match(/description\s*=\s*"([^"]+)"/);
    const newDescription = descriptionMatch ? descriptionMatch[1] : 'No description provided.';
    
    setRules(prevRules =>
      prevRules.map(r =>
        r.id === ruleToEdit.id
          ? {
              ...r,
              content: updatedContent,
              description: newDescription,
              tags: updatedTags,
              cve: updatedCves,
              author: 'Mohit A. Dhabuwala',
              lastModified: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
    setIsEditModalOpen(false);
    setRuleToEdit(null);
  };
  
  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      setRules(prevRules => prevRules.filter(r => r.id !== ruleId));
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">YARA Rule Library</h1>
          <button
            onClick={() => setActiveView('ai-generator')}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            <Bot size={16} />
            <span>Add New Rule (with AI)</span>
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, author, content, tag, or CVE..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4 mb-4 pb-4 border-b border-gray-700">
            <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Filter by Category:</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                {allCategories.map(category => (
                    <div key={category} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`cat-lib-${category}`}
                        checked={selectedCategories.has(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-blue-500 focus:ring-blue-600 cursor-pointer"
                    />
                    <label htmlFor={`cat-lib-${category}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                        {category}
                    </label>
                    </div>
                ))}
                </div>
            </div>
             {allTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Filter by Tag:</h3>
                  <div className="flex items-center space-x-4 text-xs">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="tag-logic" value="any" checked={tagFilterLogic === 'any'} onChange={() => setTagFilterLogic('any')} className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-blue-500 focus:ring-blue-600"/>
                      <span className="ml-2 text-gray-300">Match Any</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="tag-logic" value="all" checked={tagFilterLogic === 'all'} onChange={() => setTagFilterLogic('all')} className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-blue-500 focus:ring-blue-600"/>
                      <span className="ml-2 text-gray-300">Match All</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 max-h-24 overflow-y-auto">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tag-lib-${tag}`}
                        checked={selectedTags.has(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-blue-500 focus:ring-blue-600 cursor-pointer"
                      />
                      <label htmlFor={`tag-lib-${tag}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
            {filteredRules.length > 0 ? (
              filteredRules.map(rule => (
                <div key={rule.id} className="group relative bg-gray-700 p-3 rounded transition-all hover:bg-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                        <p className="font-semibold text-white">{rule.name}</p>
                        <p className="text-sm text-gray-400">{rule.category} - Last modified: {rule.lastModified}</p>
                        <p className="text-xs text-gray-500 mt-1 italic truncate">"{rule.description}"</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleOpenEditModal(rule)} className="text-gray-400 hover:text-blue-400 p-2 rounded-full bg-gray-800 hover:bg-gray-900" title="Edit Rule">
                        <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-400 hover:text-red-400 p-2 rounded-full bg-gray-800 hover:bg-gray-900" title="Delete Rule">
                        <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                   {rule.tags && rule.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {rule.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-gray-900 text-blue-300 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {rule.cve && rule.cve.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Bug size={14} className="text-red-400 flex-shrink-0" />
                            {rule.cve.map(cve => (
                                <a 
                                    href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={cve} 
                                    className="px-2 py-0.5 text-xs font-mono bg-red-900 text-red-300 rounded-full hover:bg-red-800 transition"
                                    title={`View details for ${cve}`}
                                >
                                    {cve}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                No rules match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      {ruleToEdit && (
        <EditRuleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRule}
          rule={ruleToEdit}
        />
      )}
    </>
  );
};

export default RuleLibrary;