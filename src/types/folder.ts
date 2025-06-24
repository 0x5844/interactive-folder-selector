/**
 *  Represents a folder in a hierarchical structure.
 */
export interface Folder {
  id: number;
  name: string;
  parent: number | null;
  children: Folder[];
  items: Item[];
}

/**
 *   Represents an item within a folder.
 */
export interface Item {
  id: number;
  name: string;
  folder_id: number;
}

/**
 *  Represents the selection state of items and folders.
 */
export interface SelectionState {
  selectedItemIds: Set<number>;
  expandedFolderIds: Set<number>;
}

/**
 *  Represents the API response structure for folders and items.
 */
export interface APIResponse {
  folders: {
    columns: string[];
    data: Array<[number, string, number | null]>;
  };
  items: {
    columns: string[];
    data: Array<[number, string, number]>;
  };
}

/**
 *  Processes the API response data into structured folder and item objects.
 */
export interface ProcessedData {
  folders: Folder[];
  items: Item[];
}
