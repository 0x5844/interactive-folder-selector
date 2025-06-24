'use client';

import { Folder } from '@/types/folder';
import React, { memo, useCallback } from 'react';

interface FolderProps {
  folder: Folder;
  depth: number;
  onToggleExpansion: (id: number) => void;
  onSelectFolder: (id: number) => void;
  onSelectItem: (id: number) => void;
  isSelected: (folder: Folder) => boolean;
  isIndeterminate: (folder: Folder) => boolean;
  isExpanded: (folder: Folder) => boolean;
  isItemSelected: (id: number) => boolean;
}

/**
 * Renders a folder and its contents (subfolders and items) in a hierarchical, expandable tree structure.
 *
 * @component
 * @param {FolderProps} props - The properties for the FolderComponent.
 * @param {Folder} props.folder - The folder object to render, containing its children and items.
 * @param {number} props.depth - The current depth in the folder tree, used for indentation.
 * @param {(folderId: string) => void} props.onToggleExpansion - Callback to toggle the expanded/collapsed state of a folder.
 * @param {(folderId: string) => void} props.onSelectFolder - Callback to select or deselect a folder.
 * @param {(itemId: string) => void} props.onSelectItem - Callback to select or deselect an item within a folder.
 * @param {(folder: Folder) => boolean} props.isSelected - Function to determine if a folder is selected.
 * @param {(folder: Folder) => boolean} props.isIndeterminate - Function to determine if a folder's selection state is indeterminate.
 * @param {(folder: Folder) => boolean} props.isExpanded - Function to determine if a folder is expanded.
 * @param {(itemId: string) => boolean} props.isItemSelected - Function to determine if an item is selected.
 *
 * @returns {JSX.Element} The rendered folder component with nested children and items.
 */
const FolderComponent: React.FC<FolderProps> = ({
  folder,
  depth,
  onToggleExpansion,
  onSelectFolder,
  onSelectItem,
  isSelected,
  isIndeterminate,
  isExpanded,
  isItemSelected,
}) => {
  const selected = isSelected(folder);
  const indeterminate = isIndeterminate(folder);
  const expanded = isExpanded(folder);

  const isExpandable =
    (folder.children && folder.children.length > 0) ||
    (folder.items && folder.items.length > 0);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isExpandable) {
        onToggleExpansion(folder.id);
      }
    },
    [folder.id, onToggleExpansion, isExpandable]
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent) => {
      e.stopPropagation();
      onSelectFolder(folder.id);
    },
    [folder.id, onSelectFolder]
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectFolder(folder.id);
    },
    [folder.id, onSelectFolder]
  );

  return (
    <div className="folder-container">
      <div
        className="folder-row folder"
        onClick={handleRowClick}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          ref={input => {
            if (input) input.indeterminate = indeterminate;
          }}
          className="item-checkbox"
        />

        <span className="folder-name">
          {folder.name || 'Unnamed Folder'}
        </span>

        {isExpandable && (
          <button className="expand-arrow" onClick={handleToggle}>
            {expanded ? (
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.52668 0.306664L0.466676 3.36666C0.206676 3.62666 0.206676 4.04666 0.466676 4.30666C0.726676 4.56666 1.14668 4.56666 1.40668 4.30666L4.00001 1.72L6.58668 4.30666C6.84668 4.56666 7.26668 4.56666 7.52668 4.30666C7.78668 4.04666 7.78668 3.62666 7.52668 3.36666L4.46668 0.306664C4.21334 0.0466638 3.78668 0.0466638 3.52668 0.306664Z" fill="#3B3E3F"/>
              </svg>
            ) : (
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
                <path d="M3.52668 0.306664L0.466676 3.36666C0.206676 3.62666 0.206676 4.04666 0.466676 4.30666C0.726676 4.56666 1.14668 4.56666 1.40668 4.30666L4.00001 1.72L6.58668 4.30666C6.84668 4.56666 7.26668 4.56666 7.52668 4.30666C7.78668 4.04666 7.78668 3.62666 7.52668 3.36666L4.46668 0.306664C4.21334 0.0466638 3.78668 0.0466638 3.52668 0.306664Z" fill="#3B3E3F"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {expanded && (
        <>
          {folder.items?.map(item => (
            <div
              key={item.id}
              className="folder-row item"
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
              onClick={e => {
                e.stopPropagation();
                onSelectItem(item.id);
              }}
            >
              <input
                type="checkbox"
                checked={isItemSelected(item.id)}
                onChange={e => {
                  e.stopPropagation();
                  onSelectItem(item.id);
                }}
                className="item-checkbox"
              />
              <span className="folder-name">{item.name || 'Unnamed Item'}</span>
            </div>
          ))}
          {folder.children?.map(child => (
            <FolderComponent
              key={child.id}
              folder={child}
              depth={depth + 1}
              onToggleExpansion={onToggleExpansion}
              onSelectFolder={onSelectFolder}
              onSelectItem={onSelectItem}
              isSelected={isSelected}
              isIndeterminate={isIndeterminate}
              isExpanded={isExpanded}
              isItemSelected={isItemSelected}
            />
          ))}
        </>
      )}

      <style jsx>{`
        .folder-container {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .folder-row {
          display: flex;
          align-items: center;
          padding: 4px 12px;
          cursor: pointer;
          min-height: 28px;
          user-select: none;
          position: relative;
        }
        .folder-row:hover {
          background-color: #f5f5f5;
        }
        .expand-arrow {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-left: auto;
          font-size: 12px;
          color: #666;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .expand-arrow:hover {
          color: #333;
        }
        .item-checkbox {
          margin: 4px 10px 4px 16px;
          cursor: pointer;
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }
        .item-checkbox:indeterminate {
          background-color: #4285f4;
          border-color: #4285f4;
        }
        .folder-name {
          flex: 1;
          font-size: 13px;
          color: #333;
          line-height: 1.25;
          word-break: break-word;
        }
        .folder-row.folder .folder-name {
          font-weight: 700;
        }
        .folder-row.item .folder-name {
          font-weight: 400;
        }
      `}</style>
    </div>
  );
};

export default memo(FolderComponent);