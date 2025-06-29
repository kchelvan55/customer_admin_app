
import React from 'react';
import { PanelDisplayMode, IconName } from '../types';
import Button from './Button';
import Icon from './Icon';

interface PanelControlBarProps {
  currentMode: PanelDisplayMode;
  onSetMode: (mode: PanelDisplayMode) => void;
}

const PanelControlButton: React.FC<{
  label: string;
  iconName: IconName;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, iconName, isActive, onClick }) => {
  return (
    <Button
      variant={isActive ? 'primary' : 'ghost'}
      onClick={onClick}
      className={`flex-1 sm:flex-none px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ${isActive ? 'shadow-md' : 'text-neutral-dark hover:bg-neutral-light'}`}
      title={label}
      aria-pressed={isActive}
    >
      <Icon name={iconName} className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};

const PanelControlBar: React.FC<PanelControlBarProps> = ({ currentMode, onSetMode }) => {
  return (
    // Removed: fixed bottom-0 left-0 right-0 
    // It's now a flow item at the end of app-container (flex column)
    <div className="panel-control-bar bg-neutral-light border-t border-neutral-DEFAULT shadow-t-lg z-50 print:hidden">
      <div className="max-w-md mx-auto h-12 flex items-center justify-around px-2 sm:px-4 space-x-1 sm:space-x-2">
        <PanelControlButton
          label="Focus Customer"
          iconName="layoutSidebarLeft"
          isActive={currentMode === 'customerFocus'}
          onClick={() => onSetMode('customerFocus')}
        />
        <PanelControlButton
          label="Split View"
          iconName="layoutSplit"
          isActive={currentMode === 'split'}
          onClick={() => onSetMode('split')}
        />
        <PanelControlButton
          label="Focus Admin"
          iconName="layoutSidebarRight"
          isActive={currentMode === 'adminFocus'}
          onClick={() => onSetMode('adminFocus')}
        />
      </div>
    </div>
  );
};

export default PanelControlBar;
