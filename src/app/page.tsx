'use client';

import FolderComponent from '@/components/Folder';
import useFoldersData from '@/hooks/useFolderData';
import { Folder } from '@/types/folder';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

/**
 * Home component.
 * Renders the interactive folder selector page.
 */
const Home: React.FC = () => {
  const { folders, error } = useFoldersData();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [includeSubfolders, setIncludeSubfolders] = useState(false);

  const defaultExpandedIds = useMemo(() => new Set(folders.filter((folder) => new Date(folder.created) < new Date('2023-05-01')).map((folder) => folder.id)), [folders]);

  useEffect(() => {
    setExpandedIds(defaultExpandedIds);
  }, [defaultExpandedIds]);

  /**
   * Toggle the expansion state of a folder.
   * @param id - The ID of the folder to toggle.
   */
  const handleToggle = useCallback((id: number) => {
    const newSet = new Set(expandedIds);

    const toggleSelection = (id: number) => {
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    };

    toggleSelection(id);

    setExpandedIds(newSet);
  }, [expandedIds]);

  /**
   * Select or deselect a folder.
   * @param id - The ID of the folder to select or deselect.
   */
  const handleSelect = useCallback((id: number) => {
    const newSet = new Set(selectedIds);

    const toggleSelection = (id: number) => {
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    };

    /**
     * Find a folder by its ID.
     * @param folders - The array of folders to search in.
     * @param id - The ID of the folder to find.
     * @returns The folder object if found, undefined otherwise.
     */
    const findFolderById = (folders: Folder[], id: number): Folder | undefined => {
      for (const folder of folders) {
        if (folder.id === id) {
          return folder;
        }
        if (folder.children) {
          const found = findFolderById(folder.children, id);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    /**
     * Process a folder and its subfolders.
     * @param folder - The folder to process.
     */
    const processFolder = (folder: Folder | undefined) => {
      if (!folder) {
        return;
      }

      const stack = [folder];

      while (stack.length > 0) {
        const currentFolder = stack.pop();
        if (!currentFolder) {
          continue;
        }

        if (newSet.has(currentFolder.id) !== newSet.has(id)) {
          toggleSelection(currentFolder.id);
        }

        if (currentFolder.children && currentFolder.children.length > 0) {
          for (const child of currentFolder.children) {
            stack.push(child);
          }
        }
      }
    };

    /**
     * Check and update the parent folder's selection state.
     * @param id - The ID of the folder to check and update its parent.
     */
    const checkAndUpdateParent = (id: number) => {
      const folder = findFolderById(folders, id);
      if (folder && folder.parent !== null) {
        const parent = findFolderById(folders, folder.parent);
        if (parent) {
          const allChildrenSelected = parent.children?.every((child) => newSet.has(child.id)) ?? false;
          const noChildrenSelected = parent.children?.every((child) => !newSet.has(child.id)) ?? true;

          if (allChildrenSelected && !newSet.has(parent.id)) {
            toggleSelection(parent.id);
          } else if (noChildrenSelected && newSet.has(parent.id)) {
            toggleSelection(parent.id);
          }
        }
      }
    };

    toggleSelection(id);

    if (includeSubfolders) {
      const folder = findFolderById(folders, id);
      processFolder(folder);
    }

    checkAndUpdateParent(id);

    setSelectedIds(newSet);
  }, [selectedIds, includeSubfolders, folders]);

  /**
   * Clear the current selection and select a folder.
   * @param id - The ID of the folder to select.
   */
  const handleClearAndSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.clear();
      newSet.add(id);
      return newSet;
    });
  }, []);

  /**
   * Toggle the include subfolders state.
   */
  const handleIncludeSubfoldersChange = useCallback(() => {
    setIncludeSubfolders((prev) => !prev);
  }, []);

  /**
   * Check if a folder is in an indeterminate state.
   * @param folder - The folder to check.
   * @returns True if the folder is indeterminate, false otherwise.
   */
  const isIndeterminate = useCallback((folder: Folder): boolean => {
    const childrenIds = folder.children?.map((child) => child.id) || [];
    const selectedChildren = childrenIds.filter((id) => selectedIds.has(id));
    return selectedChildren.length > 0 && selectedChildren.length < childrenIds.length;
  }, [selectedIds]);

  /**
   * Check if a folder is selected.
   * @param folder - The folder to check.
   * @returns True if the folder is selected, false otherwise.
   */
  const isSelected = useCallback((folder: Folder): boolean => selectedIds.has(folder.id), [selectedIds]);

  /**
   * Check if a folder is expanded.
   * @param folder - The folder to check.
   * @returns True if the folder is expanded, false otherwise.
   */
  const isExpanded = useCallback((folder: Folder): boolean => expandedIds.has(folder.id), [expandedIds]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="p-6 w-[323px] h-[620px] flex flex-col items-center gap-4 bg-white border border-[hsl(210,0%,89%)] rounded-md">
        {error ? (
          <div className="flex justify-center items-center h-[568px] text-red-500">{error}</div>
        ) : (
          <div>
            <div className="w-[275px] h-[31px] text-left font-inter text-[12px] font-[400] leading-[14.52px] text-black">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeSubfolders}
                  onChange={handleIncludeSubfoldersChange}
                  className="mr-2"
                />
                Include subfolders
              </label>
            </div>
            <div className="w-[275px] h-[442px] overflow-auto border border-[#E3E3E3]">
              {folders.map((folder) => (
                <FolderComponent
                  key={folder.id}
                  folder={folder}
                  includeSubfolders={includeSubfolders}
                  onToggle={handleToggle}
                  onSelect={handleSelect}
                  isSelected={isSelected}
                  isIndeterminate={isIndeterminate}
                  isExpanded={isExpanded}
                  onClearAndSelect={handleClearAndSelect}
                  depth={0}
                />
              ))}
            </div>
            <div className="w-[275px]">
              <div className="h-[62px] py-[20px] text-left font-inter text-[12px] font-[400] leading-[14.52px] text-black overflow-hidden text-ellipsis">
                Selected item IDs:
                {' '}
                {Array.from(selectedIds).join(', ')}
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
        )}
      </div>
    </div>
  );
};

export default Home;
