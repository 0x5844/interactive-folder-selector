import { Folder } from '@/types/folder';
import { parseData, sortAndNestFolders } from '@/utils/folderUtils';
import { useEffect, useMemo, useState } from 'react';

const useFolderData = () => {
  const [data, setData] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/response.json');
      const result = await response.json();
      setData(parseData(result.data));
    };

    fetchData();
  }, []);

  const folders = useMemo(() => sortAndNestFolders(data), [data]);

  return folders;
};

export default useFolderData;
