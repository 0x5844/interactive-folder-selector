import { Folder } from '@/types/folder';
import { parseData, sortAndNestFolders } from '@/utils/folderUtils';
import { useEffect, useMemo, useState } from 'react';

interface FoldersData {
  folders: Folder[];
  error: string | null;
}

/**
 * Custom hook to fetch and process folder data.
 * @returns An object containing the sorted and nested folders data
 * and any error that occurred during fetching.
 */
const useFoldersData = (): FoldersData => {
  const [data, setData] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/response.json');
        const result = await response.json();
        setData(parseData(result.data));
      } catch (e) {
        setError('An error occurred while fetching data');
      }
    };

    fetchData();
  }, []);

  const folders = useMemo(() => sortAndNestFolders(data), [data]);

  return { folders, error };
};

export default useFoldersData;
