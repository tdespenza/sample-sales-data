export type ID = string;

export interface Person { id: ID; name: string; email?: string }
export interface Label { id: ID; name: string; color?: string }

export interface WorkItem {
  id: ID;
  key: string;
  title: string;
  state: 'open'|'closed'|'in_progress'|'done';
  points?: number;
  labels: Label[];
  createdAt: string;
  closedAt?: string;
}

export interface Timebox {
  id: ID;
  name: string;
  startDate?: string;
  dueDate?: string;
}

export interface Dataset {
  timebox?: Timebox;
  items: WorkItem[];
}
