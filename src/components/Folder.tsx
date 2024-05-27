"use client";

import { Folder } from '@/types/folder';
import React, { useCallback } from 'react';

interface FolderProps {
  folder: Folder;
  includeSubfolders: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number, includeSubfolders: boolean) => void;
  isSelected: boolean;
  isIndeterminate: boolean;
  isExpanded: boolean;
  onClearAndSelect: (id: number) => void;
}

const FolderComponent: React.FC<FolderProps> = ({
  folder,
  includeSubfolders,
  onToggle,
  onSelect,
  isSelected,
  isIndeterminate,
  isExpanded,
  onClearAndSelect,
}) => {
  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onToggle(folder.id);
  }, [folder.id, onToggle]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(folder.id, includeSubfolders);
  }, [folder.id, includeSubfolders, onSelect]);

  const handleClearAndSelect = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    onClearAndSelect(folder.id);
  }, [folder.id, onClearAndSelect]);

  return (
    <div className="ml-3 flex flex-col">
      <div
        className={`flex h-[32px] items-center p-2 rounded-md ${isSelected ? 'bg-[hsl(0,0%,96%)]' : ''} hover:bg-[hsl(0,0%,96%)]`}
        style={{ color: 'hsl(195,3%,24%)' }}
        onClick={handleClearAndSelect}
      >
        <input
          type="checkbox"
          className="mr-2 w-[16px] h-[16px]"
          checked={isSelected}
          onChange={handleCheckboxChange}
          ref={(input) => {
            if (input) input.indeterminate = isIndeterminate;
          }}
        />
        <span className="cursor-pointer select-none flex-grow text-[12px]">{folder.name || 'Unnamed Folder'}</span>
        {folder.children && folder.children.length > 0 && (
          <div className="pr-[10px]">
            <button onClick={handleToggle}>
              <p>{isExpanded ? '⌄' : '⌃'}</p>
            </button>
          </div>
        )}
      </div>
      {isExpanded &&
        folder.children?.map((child) => (
          <FolderComponent
            key={child.id}
            folder={child}
            includeSubfolders={includeSubfolders}
            onToggle={onToggle}
            onSelect={onSelect}
            isSelected={isSelected}
            isIndeterminate={isIndeterminate}
            isExpanded={isExpanded}
            onClearAndSelect={onClearAndSelect}
          />
        ))}
    </div>
  );
};

export default React.memo(FolderComponent);
