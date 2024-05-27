"use client";

import FolderComponent from '@/components/Folder';
import useFolderData from '@/hooks/useFolderData';
import { Folder } from '@/types/folder';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const Home: React.FC = () => {
  const folders = useFolderData();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [includeSubfolders, setIncludeSubfolders] = useState(false);

  const folderMap = useMemo(() => {
    const map = new Map<number, Folder>();
    folders.forEach(folder => map.set(folder.id, folder));
    return map;
  }, [folders]);

  const defaultExpandedIds = useMemo(() => {
    return new Set(folders.filter(folder => new Date(folder.created) < new Date('2023-05-01')).map(folder => folder.id));
  }, [folders]);

  useEffect(() => {
    setExpandedIds(defaultExpandedIds);
  }, [defaultExpandedIds]);

  const getParentIds = (id: number): number[] => {
    const parents: number[] = [];
    let current = folderMap.get(id);

    while (current && current.parent !== null) {
      parents.push(current.parent);
      current = folderMap.get(current.parent);
    }

    return parents;
  };

  const getDirectParentId = (id: number): number | null => {
    const folder = folderMap.get(id);
    return folder ? folder.parent : null;
  };

  const handleToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelect = useCallback((id: number, includeSubfolders: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      const folder = folderMap.get(id);
      if (!folder) return newSet;

      const selectFolder = (folder: Folder) => {
        newSet.add(folder.id);
        if (includeSubfolders && folder.children) {
          folder.children.forEach(selectFolder);
        }
      };

      const deselectFolder = (folder: Folder) => {
        newSet.delete(folder.id);
        if (includeSubfolders && folder.children) {
          folder.children.forEach(deselectFolder);
        }
      };

      if (newSet.has(id)) {
        deselectFolder(folder);
      } else {
        selectFolder(folder);
      }

      return newSet;
    });
  }, [folderMap]);

  const handleClearAndSelect = useCallback((id: number) => {
    setSelectedIds(new Set([id]));
  }, []);

  const handleIncludeSubfoldersChange = () => {
    setIncludeSubfolders(!includeSubfolders);
  };

  const isIndeterminate = useCallback((folder: Folder): boolean => {
    if (!folder.children) return false;
    const childSelected = folder.children.some(child => selectedIds.has(child.id));
    const childNotSelected = folder.children.some(child => !selectedIds.has(child.id));
    return childSelected && childNotSelected;
  }, [selectedIds]);

  const isSelected = useCallback((folder: Folder): boolean => {
    return selectedIds.has(folder.id);
  }, [selectedIds]);

  const isExpanded = useCallback((folder: Folder): boolean => {
    const createdBeforeDate = new Date(folder.created) < new Date('2023-05-01');
    return expandedIds.has(folder.id) || createdBeforeDate;
  }, [expandedIds]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="p-6 w-[323px] h-[568px] flex flex-col items-center gap-4 bg-white border border-[hsl(210,0%,89%)] rounded-md">
        <div className="w-[275px] h-[442px] overflow-auto border border-[#E3E3E3]">
          {folders.map((folder) => (
            <FolderComponent
              key={folder.id}
              folder={folder}
              includeSubfolders={includeSubfolders}
              onToggle={handleToggle}
              onSelect={handleSelect}
              isSelected={isSelected(folder)}
              isIndeterminate={isIndeterminate(folder)}
              isExpanded={isExpanded(folder)}
              onClearAndSelect={handleClearAndSelect}
            />
          ))}
        </div>
        <div className="w-[275px]">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={handleIncludeSubfoldersChange}
              className="mr-2"
            />
            Include subfolders
          </label>
          <div className="h-[15px] text-left font-inter text-[12px] font-[400] leading-[14.52px] text-black">
            Selected item IDs: {Array.from(selectedIds).join(', ')}
          </div>
          <div className="mt-4 flex justify-end w-[275px] h-[31px] gap-[10px]">
            <button
              className="w-[117px] h-[31px] px-4 py-2 text-white text-[12px] font-inter font-[400] leading-[14.52px] bg-[var(--primary-primary-600,#137CFB)] rounded-md"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
