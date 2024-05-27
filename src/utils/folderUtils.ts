import { Folder } from '@/types/folder';

/**
 * Sorts and nests an array of folders using the merge sort algorithm.
 *
 * @param folders - The array of folders to be sorted and nested.
 * @returns The sorted and nested array of folders.
 */
export const sortAndNestFolders = (folders: Folder[]): Folder[] => {
  const map = new Map<number, Folder>();
  const roots: Folder[] = [];

  folders.forEach((folder) => {
    folder.children = [];
    map.set(folder.id, folder);
  });

  folders.forEach((folder) => {
    if (folder.parent === null) {
      roots.push(folder);
    } else {
      const parent = map.get(folder.parent);
      if (parent) {
        parent.children!.push(folder);
      }
    }
  });

  const mergeSort = (folders: Folder[]): Folder[] => {
    if (folders.length <= 1) {
      return folders;
    }

    const middle = Math.floor(folders.length / 2);
    const left = mergeSort(folders.slice(0, middle));
    const right = mergeSort(folders.slice(middle));

    return merge(left, right);
  };

  const merge = (left: Folder[], right: Folder[]): Folder[] => {
    let result: Folder[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex].name.localeCompare(right[rightIndex].name) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  };

  const sortFoldersRecursively = (folders: Folder[]): Folder[] => {
    if (folders.length === 0) return folders;
    
    const sortedFolders = mergeSort(folders);
    sortedFolders.forEach(folder => {
      if (folder.children && folder.children.length > 0) {
        folder.children = sortFoldersRecursively(folder.children);
      }
    });
    return sortedFolders;
  };

  return sortFoldersRecursively(roots);
};

export const parseData = (data: any[]): Folder[] => {
  return data.map((item: any) => ({
    id: item[0],
    name: item[1] || 'Unnamed Folder',
    parent: item[2] !== undefined ? item[2] : null,
    created: item[3],
    children: []
  }));
};
