
import React, { useState } from 'react';
import SideNav from './components/SideNav.tsx';
import HuntSimulator from './components/HuntSimulator.tsx';
import AiRuleGenerator from './components/AiRuleGenerator.tsx';
import PlaybookViewer from './components/PlaybookViewer.tsx';
import Documentation from './components/Documentation.tsx';
import RuleLibrary from './components/RuleLibrary.tsx';
import { SAMPLE_RULES } from './constants.ts';
import { HuntResult, YaraRule } from './types.ts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('hunt');
  const [rules, setRules] = useState<YaraRule[]>(SAMPLE_RULES);
  const [huntResult, setHuntResult] = useState<HuntResult | null>(null);

  const addRule = (newRule: YaraRule) => {
    setRules(prevRules => [...prevRules, newRule]);
    setActiveView('library');
  };

  const renderView = () => {
    switch (activeView) {
      case 'hunt':
        return <HuntSimulator rules={rules} huntResult={huntResult} setHuntResult={setHuntResult} />;
      case 'ai-generator':
        return <AiRuleGenerator onRuleGenerated={addRule} />;
      case 'library':
        return <RuleLibrary rules={rules} setRules={setRules} setActiveView={setActiveView} />;
      case 'playbooks':
        return <PlaybookViewer />;
      case 'docs':
        return <Documentation />;
      default:
        return <HuntSimulator rules={rules} huntResult={huntResult} setHuntResult={setHuntResult} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <SideNav activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div key={activeView} className="main-content-enter">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;