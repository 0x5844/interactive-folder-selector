export interface Folder {
  id: number;
  name: string;
  parent: number | null;
  created: string;
  children?: Folder[];
}
