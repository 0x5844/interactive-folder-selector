import { APIResponse, Folder, Item, ProcessedData } from '@/types/folder';

/**
 * Parses the API response data into structured folder and item objects.
 */
export const parseApiResponse = (apiResponse: APIResponse): ProcessedData => {
  const folders: Folder[] = apiResponse.folders.data.map(([id, title, parentId]) => ({
    id,
    name: title || 'Unnamed Folder',
    parent: parentId,
    children: [],
    items: []
  }));

  const items: Item[] = apiResponse.items.data.map(([id, title, folderId]) => ({
    id,
    name: title || 'Unnamed Item',
    folder_id: folderId
  }));

  return { folders, items };
};

/**
 * Nests folders and assigns items using BFS approach for efficiency.
 */
export const nestFoldersWithItems = (folders: Folder[], items: Item[]): Folder[] => {
  const folderMap = new Map<number, Folder>();
  const roots: Folder[] = [];

  // Initialize folder map
  folders.forEach(folder => {
    folder.children = [];
    folder.items = [];
    folderMap.set(folder.id, folder);
  });

  // Assign items to folders
  items.forEach(item => {
    const folder = folderMap.get(item.folder_id);
    if (folder) {
      folder.items.push(item);
    }
  });

  // Build tree structure using BFS
  const queue = [...folders];
  while (queue.length > 0) {
    const folder = queue.shift()!;
    if (folder.parent === null) {
      roots.push(folder);
    } else {
      const parent = folderMap.get(folder.parent);
      if (parent) {
        parent.children.push(folder);
      }
    }
  }

  return roots;
};

/**
 * Sorts folders and items alphabetically using iterative BFS traversal.
 * Mutates the input folder tree in-place for performance.
 */
export const sortFolders = (folders: Folder[]): Folder[] => {
  // Sort the root folders array in-place
  folders.sort((a, b) => a.name.localeCompare(b.name));

  // Use a queue for BFS traversal
  const queue: Folder[] = [...folders];

  while (queue.length > 0) {
    const folder = queue.shift()!;

    // Sort items in-place if present
    if (folder.items && folder.items.length > 1) {
      folder.items.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sort children in-place and enqueue them
    if (folder.children && folder.children.length > 1) {
      folder.children.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (folder.children && folder.children.length > 0) {
      queue.push(...folder.children);
    }
  }

  return folders;
};

/**
 * Processes API data into nested, sorted folder structure.
 */
export const processApiData = (apiResponse: APIResponse): Folder[] => {
  const { folders, items } = parseApiResponse(apiResponse);
  const nested = nestFoldersWithItems(folders, items);
  return sortFolders(nested);
};

/**
 * Gets all descendant item IDs using BFS traversal for efficiency.
 */
export const getAllDescendantItemIds = (folder: Folder): number[] => {
  const itemIds: number[] = [];
  const queue = [folder];

  while (queue.length > 0) {
    const currentFolder = queue.shift()!;
    
    // Add items from current folder
    if (currentFolder.items) {
      itemIds.push(...currentFolder.items.map(item => item.id));
    }
    
    // Add children to queue for BFS
    if (currentFolder.children) {
      queue.push(...currentFolder.children);
    }
  }

  return itemIds;
};

/**
 * Flattens folder tree using BFS traversal.
 */
export const flattenFolders = (folders: Folder[]): Folder[] => {
  const result: Folder[] = [];
  const queue = [...folders];

  while (queue.length > 0) {
    const folder = queue.shift()!;
    result.push(folder);
    
    if (folder.children) {
      queue.push(...folder.children);
    }
  }

  return result;
};

/**
 * Calculates folder selection states using BFS for efficient hierarchy traversal.
 */
export const calculateFolderStates = (
  folders: Folder[],
  selectedItemIds: Set<number>
): Map<number, { selected: boolean; indeterminate: boolean }> => {
  const stateMap = new Map<number, { selected: boolean; indeterminate: boolean }>();

  // build a post-order list of all folders
  const postOrder: Folder[] = [];
  const buildPostOrder = (f: Folder) => {
    f.children?.forEach(buildPostOrder);
    postOrder.push(f);
  };
  folders.forEach(buildPostOrder);

  // compute each folder’s selected/indeterminate by looking at all its descendant items
  postOrder.forEach(folder => {
    const descIds = getAllDescendantItemIds(folder);
    const total = descIds.length;
    const selectedCount = descIds.filter(id => selectedItemIds.has(id)).length;

    const selected = total > 0 && selectedCount === total;
    const indeterminate = selectedCount > 0 && selectedCount < total;

    stateMap.set(folder.id, { selected, indeterminate });
  });

  return stateMap;
};

/**
 * Checks if folder is indeterminate (some but not all descendants selected).
 */
export const isFolderIndeterminate = (folder: Folder, selectedItemIds: Set<number>): boolean => {
  const descendantItemIds = getAllDescendantItemIds(folder);
  if (descendantItemIds.length === 0) return false;

  const selectedCount = descendantItemIds.filter(id => selectedItemIds.has(id)).length;
  return selectedCount > 0 && selectedCount < descendantItemIds.length;
};

/**
 * Checks if all folder descendants are selected.
 */
export const areAllFolderItemsSelected = (folder: Folder, selectedItemIds: Set<number>): boolean => {
  const descendantItemIds = getAllDescendantItemIds(folder);
  if (descendantItemIds.length === 0) return false;
  
  return descendantItemIds.every(id => selectedItemIds.has(id));
};

/**
 * Toggles folder selection with proper state propagation.
 */
export const toggleFolderSelection = (
  folder: Folder,
  selectedItemIds: Set<number>
): Set<number> => {
  const newSelection = new Set(selectedItemIds);
  const descendantItemIds = getAllDescendantItemIds(folder);
  
  const isCurrentlySelected = areAllFolderItemsSelected(folder, selectedItemIds);
  
  if (isCurrentlySelected) {
    // Deselect all descendant items
    descendantItemIds.forEach(id => newSelection.delete(id));
  } else {
    // Select all descendant items
    descendantItemIds.forEach(id => newSelection.add(id));
  }
  
  return newSelection;
};

/**
 * Gets folder hierarchy path using BFS.
 */
export const getFolderPath = (folderId: number, allFolders: Folder[]): Folder[] => {
  const path: Folder[] = [];
  const folderMap = new Map<number, Folder>();
  
  // Build folder map using BFS
  const queue = [...allFolders];
  while (queue.length > 0) {
    const folder = queue.shift()!;
    folderMap.set(folder.id, folder);
    if (folder.children) {
      queue.push(...folder.children);
    }
  }
  
  // Build path from target to root
  let current = folderMap.get(folderId);
  while (current) {
    path.unshift(current);
    current = current.parent ? folderMap.get(current.parent) : undefined;
  }
  
  return path;
};

