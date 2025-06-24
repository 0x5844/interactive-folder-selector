import { APIResponse, Folder, SelectionState } from '@/types/folder';
import {
  calculateFolderStates,
  flattenFolders,
  processApiData,
  toggleFolderSelection
} from '@/utils/folderUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface FoldersData {
  folders: Folder[];
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
  selectionState: SelectionState;
  toggleItemSelection: (itemId: number) => void;
  toggleFolderSelection: (folderId: number) => void;
  clearSelection: () => void;
  isFolderSelected: (folder: Folder) => boolean;
  isFolderIndeterminate: (folder: Folder) => boolean;
  getSelectedItemIds: () => number[];
  expandFolder: (folderId: number) => void;
  collapseFolder: (folderId: number) => void;
  toggleFolderExpansion: (folderId: number) => void;
}

/**
 *  Custom hook to manage folder data and selection state.
 */
const useFoldersData = (): FoldersData => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedItemIds: new Set<number>(),
    expandedFolderIds: new Set<number>()
  });

  const folderStates = useMemo(() => {
    return calculateFolderStates(folders, selectionState.selectedItemIds);
  }, [folders, selectionState.selectedItemIds]);

  /**
   *  Fetches folder data from the API and processes it.
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/response.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: APIResponse = await response.json();
      
      if (!apiResponse.folders || !apiResponse.items) {
        throw new Error('Invalid API response structure');
      }
      
      if (!Array.isArray(apiResponse.folders.data) || !Array.isArray(apiResponse.items.data)) {
        throw new Error('Invalid data format in API response');
      }
      
      const processedFolders = processApiData(apiResponse);
      setFolders(processedFolders);
      
      const allFolders = flattenFolders(processedFolders);
      setSelectionState(prev => ({
        ...prev,
        expandedFolderIds: new Set(allFolders.map(f => f.id))
      }));
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred while fetching data';
      setError(errorMessage);
      console.error('Error fetching folder data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on initial render
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   *  Toggles selection state of an item by its ID.
   */
  const toggleItemSelection = useCallback((itemId: number) => {
    setSelectionState(prev => {
      const newSelectedItemIds = new Set(prev.selectedItemIds);
      
      if (newSelectedItemIds.has(itemId)) {
        newSelectedItemIds.delete(itemId);
      } else {
        newSelectedItemIds.add(itemId);
      }
      
      return {
        ...prev,
        selectedItemIds: newSelectedItemIds
      };
    });
  }, []);

  /**
   *  Toggles selection state of a folder by its ID.
   */
  const toggleFolderSelectionHandler = useCallback((folderId: number) => {
    const allFolders = flattenFolders(folders);
    const targetFolder = allFolders.find(f => f.id === folderId);
    
    if (!targetFolder) return;
    
    setSelectionState(prev => {
      const newSelectedItemIds = toggleFolderSelection(targetFolder, prev.selectedItemIds);
      
      return {
        ...prev,
        selectedItemIds: newSelectedItemIds
      };
    });
  }, [folders]);
  
  /**
   *  Clears the current selection state.
   */
  const clearSelection = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedItemIds: new Set<number>()
    }));
  }, []);

  /**
   *  Expands a folder by its ID.
   */
  const expandFolder = useCallback((folderId: number) => {
    setSelectionState(prev => ({
      ...prev,
      expandedFolderIds: new Set(Array.from(prev.expandedFolderIds).concat(folderId))
    }));
  }, []);

  /**
   *   Collapses a folder by its ID.
   */
  const collapseFolder = useCallback((folderId: number) => {
    setSelectionState(prev => {
      const newExpanded = new Set(prev.expandedFolderIds);
      newExpanded.delete(folderId);
      return {
        ...prev,
        expandedFolderIds: newExpanded
      };
    });
  }, []);

  /**
   *   Toggles expansion state of a folder by its ID.
   */
  const toggleFolderExpansion = useCallback((folderId: number) => {
    setSelectionState(prev => {
      const newExpanded = new Set(prev.expandedFolderIds);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return {
        ...prev,
        expandedFolderIds: newExpanded
      };
    });
  }, []);

  /**
   *  Checks if a folder is selected.
   */
  const isFolderSelected = useCallback((folder: Folder): boolean => {
    const state = folderStates.get(folder.id);
    return state?.selected ?? false;
  }, [folderStates]);

  /**
   *   Checks if a folder is indeterminate (some but not all descendants selected).
   */
  const isFolderIndeterminate = useCallback((folder: Folder): boolean => {
    const state = folderStates.get(folder.id);
    return state?.indeterminate ?? false;
  }, [folderStates]);

  /**
   *   Returns the IDs of all selected items, sorted numerically.
   */
  const getSelectedItemIds = useCallback((): number[] => {
    return Array.from(selectionState.selectedItemIds).sort((a, b) => a - b);
  }, [selectionState.selectedItemIds]);

  return {
    folders,
    error,
    isLoading,
    refetch: fetchData,
    selectionState,
    toggleItemSelection,
    toggleFolderSelection: toggleFolderSelectionHandler,
    clearSelection,
    isFolderSelected,
    isFolderIndeterminate,
    getSelectedItemIds,
    expandFolder,
    collapseFolder,
    toggleFolderExpansion
  };
};

export default useFoldersData;
