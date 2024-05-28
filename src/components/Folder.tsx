'use client';

import { Folder } from '@/types/folder';
import React, { useCallback } from 'react';

interface FolderProps {
  folder: Folder;
  includeSubfolders: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number, includeSubfolders: boolean) => void;
  isSelected: (folder: Folder) => boolean;
  isIndeterminate: (folder: Folder) => boolean;
  isExpanded: (folder: Folder) => boolean;
  onClearAndSelect: (id: number) => void;
  depth: number;
}

/**
 * Represents a folder component.
 * @param folder - The folder object.
 * @param includeSubfolders - Indicates whether to include subfolders.
 * @param onToggle - The callback function for toggling the folder.
 * @param onSelect - The callback function for selecting the folder.
 * @param isSelected - Indicates whether the folder is selected.
 * @param isIndeterminate - Indicates whether the folder is in an indeterminate state.
 * @param isExpanded - Indicates whether the folder is expanded.
 * @param onClearAndSelect - The callback function for clearing and selecting the folder.
 * @param depth - The depth of the folder in the hierarchy.
 */
const FolderComponent: React.FC<FolderProps> = ({
  folder,
  includeSubfolders,
  onToggle,
  onSelect,
  isSelected,
  isIndeterminate,
  isExpanded,
  onClearAndSelect,
  depth,
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
    <div className="flex flex-col" style={{ paddingLeft: `${depth * 10}px` }}>
      <div className="hover:bg-[hsl(0,0%,96%)]">
        <div
          className={`flex h-[32px] items-center p-2 rounded-md ${isSelected(folder) ? 'bg-[hsl(0,0%,96%)]' : ''}`}
          style={{ color: 'hsl(195,3%,24%)' }}
          onClick={handleClearAndSelect}
        >
          <input
            type="checkbox"
            className="mr-2 w-[16px] h-[16px]"
            checked={isSelected(folder)}
            onChange={handleCheckboxChange}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate(folder);
            }}
          />
          <span className="cursor-pointer select-none flex-grow text-[12px]">{folder.name || 'Unnamed Folder'}</span>
          {folder.children && folder.children.length > 0 && (
            <div className="pr-[10px]">
              <button onClick={handleToggle}>
                <p>{isExpanded(folder) ? <span>&#8963;</span> : <span>&#8964;</span>}</p>
              </button>
            </div>
          )}
        </div>
      </div>
      {isExpanded(folder) && folder.children?.map((child) => (
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
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

export default React.memo(FolderComponent);
