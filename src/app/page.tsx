// src/app/page.tsx

'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import FolderComponent from '@/components/Folder';
import useFolderData from '@/hooks/useFolderData';
import { Folder } from '@/types/folder';
import React, {
  JSX,
  Suspense, lazy
} from 'react';

/**
 * Functional component `HomeInternal` that renders the interactive folder selector.
 * It utilizes the `useFolderData` hook to manage folder data, selection states, and interactions.
 *
 * @returns {JSX.Element} - The JSX representation of the folder selector page.
 */
const HomeInternal: React.FC = (): JSX.Element => {
 const {
    folders,
    error,
    isLoading,
    toggleItemSelection,
    toggleFolderSelection,
    clearSelection,
    isFolderSelected,
    isFolderIndeterminate,
    getSelectedItemIds,
    toggleFolderExpansion,
    selectionState,
  } = useFolderData();

  // Helper function to check if a folder is expanded based on state from the hook
  const isExpanded = (folder: Folder): boolean => {
    return selectionState.expandedFolderIds.has(folder.id);
  };

  // Helper function to check if an item is selected based on state from the hook
  const isItemSelected = (id: number): boolean => {
    return selectionState.selectedItemIds.has(id);
  };

  // Get the set of selected item IDs from the hook
  const selectedIds = getSelectedItemIds();

  // Handler to clear all selections
  const handleClearSelection = () => {
    clearSelection();
  };

  if (isLoading) {
    return <div>Loading application...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="folder-selector-page">
      <div className="folder-tree-container">
        {folders.map((folder: Folder) => (
          <FolderComponent
            key={folder.id}
            folder={folder}
            depth={0}
            onToggleExpansion={toggleFolderExpansion}
            onSelectFolder={toggleFolderSelection}
            onSelectItem={toggleItemSelection}
            isSelected={isFolderSelected}
            isIndeterminate={isFolderIndeterminate}
            isExpanded={isExpanded}
            isItemSelected={isItemSelected}
          />
        ))}
      </div>

      <div className="output-section">
        <div className="selected-ids-display">
          <span>Selected item IDs: </span>
          <span className="ids-text">
            {Array.from(selectedIds).sort((a, b) => a - b).join(', ') || 'None'}
          </span>
        </div>
        
        <button 
          className="clear-selection-btn"
          onClick={handleClearSelection}
          disabled={selectedIds.length === 0}
        >
          Clear selection
        </button>
      </div>

      <style jsx>{`
        .folder-selector-page {
          width: 320px;
          margin: 80px auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 14px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .folder-tree-container {
          background: white;
          min-height: 300px;
          max-height: 500px;
          overflow-y: auto;
          margin: 24px;
          border: 1px solid #e0e0e0;
        }

        .output-section {
          padding: 0px 16px;
          background: white;
          margin-bottom: 24px;
        }

        .selected-ids-display {
          margin-bottom: 12px;
          margin-left: 8px;
          font-size: 12px;
          color: #333;
        }

        .selected-ids-display strong {
          font-weight: 600;
        }

        .ids-text {
          color: #666;
        }

        .clear-selection-btn {
          background: #4285f4;
          color: white;
          border-radius: 4px;
          margin-left: 165px;
          border: none;
          padding: 8px 20px;
          border-radius: 2px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 100;
          transition: background-color 0.2s ease;
        }

        .clear-selection-btn:hover:not(:disabled) {
          background: #3367d6;
        }

        .clear-selection-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-container {
          max-width: 400px;
          margin: 20px auto;
          padding: 20px;
        }

        .error-message {
          color: #d32f2f;
          background: #ffebee;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #ffcdd2;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};


const LazyHome = lazy(() => Promise.resolve({ default: HomeInternal }));

const Home: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading application...</div>}>
        <LazyHome />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Home;
