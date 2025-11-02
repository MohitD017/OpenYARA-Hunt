
import React from 'react';
import { Shield, Bot, BookOpen, Info, Library } from 'lucide-react';

interface SideNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
};

const SideNav: React.FC<SideNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col justify-between h-full border-r border-gray-700">
      <div>
        <div className="flex items-center mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="ml-2 text-xl font-bold text-white">OpenYARA-Hunt</h1>
        </div>
        <div className="space-y-2">
          <NavItem
            icon={<Shield size={20} />}
            label="Hunt Simulator"
            isActive={activeView === 'hunt'}
            onClick={() => setActiveView('hunt')}
          />
          <NavItem
            icon={<Bot size={20} />}
            label="AI Rule Generator"
            isActive={activeView === 'ai-generator'}
            onClick={() => setActiveView('ai-generator')}
          />
          <NavItem
            icon={<Library size={20} />}
            label="Rule Library"
            isActive={activeView === 'library'}
            onClick={() => setActiveView('library')}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Playbooks"
            isActive={activeView === 'playbooks'}
            onClick={() => setActiveView('playbooks')}
          />
          <NavItem
            icon={<Info size={20} />}
            label="Documentation"
            isActive={activeView === 'docs'}
            onClick={() => setActiveView('docs')}
          />
        </div>
      </div>
      <div className="text-center text-xs text-gray-500">
          <p>&copy; 2024 Mohit A. Dhabuwala</p>
      </div>
    </nav>
  );
};

export default SideNav;
