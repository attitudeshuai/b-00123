import { useEffect } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const matchesShift = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const matchesAlt = shortcut.altKey ? e.altKey : !e.altKey;
        const matchesMeta = shortcut.metaKey ? e.metaKey : !e.metaKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const keyboardShortcutsHelp: KeyboardShortcut[] = [
  { key: 'n', ctrlKey: true, action: () => {}, description: '新建任务' },
  { key: 'f', ctrlKey: true, action: () => {}, description: '搜索任务' },
  { key: '1', action: () => {}, description: '切换到任务页面' },
  { key: '2', action: () => {}, description: '切换到番茄钟页面' },
  { key: '3', action: () => {}, description: '切换到统计页面' },
  { key: 'Escape', action: () => {}, description: '关闭弹窗' },
];
