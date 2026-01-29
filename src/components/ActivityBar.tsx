import { useState } from 'react';
import {
  Files,
  Search,
  GitBranch,
  Box,
  Settings,
  Play,
  Bug,
  type LucideIcon,
} from 'lucide-react';

export type ActivityView = 'explorer' | 'search' | 'sourceControl' | 'nodes' | 'run' | 'debug' | 'settings';

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
  hasChanges?: boolean;
  changesCount?: number;
}

interface ActivityItem {
  id: ActivityView;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export default function ActivityBar({
  activeView,
  onViewChange,
  hasChanges = false,
  changesCount = 0,
}: ActivityBarProps) {
  const [hoveredItem, setHoveredItem] = useState<ActivityView | null>(null);

  const topItems: ActivityItem[] = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'sourceControl', icon: GitBranch, label: 'Source Control', badge: hasChanges ? changesCount : undefined },
    { id: 'nodes', icon: Box, label: 'Node Palette' },
    { id: 'run', icon: Play, label: 'Run & Debug' },
    { id: 'debug', icon: Bug, label: 'Debug Console' },
  ];

  const bottomItems: ActivityItem[] = [
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderItem = (item: ActivityItem) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => onViewChange(item.id)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            relative w-12 h-12 flex items-center justify-center transition-colors
            ${isActive ? 'text-[#cdd6f4]' : 'text-[#6c7086] hover:text-[#a6adc8]'}
          `}
        >
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#cdd6f4] rounded-r" />
          )}

          <Icon className="w-6 h-6" />

          {/* Badge */}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium bg-blue-500 text-white rounded-full">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 px-2 py-1 bg-[#313244] text-[#cdd6f4] text-xs font-medium rounded shadow-lg whitespace-nowrap">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-12 bg-[#11111b] border-r border-[#313244] flex flex-col h-full">
      {/* Top items */}
      <div className="flex-1 flex flex-col items-center pt-1">
        {topItems.map(renderItem)}
      </div>

      {/* Bottom items */}
      <div className="flex flex-col items-center pb-2">
        {bottomItems.map(renderItem)}
      </div>
    </div>
  );
}
