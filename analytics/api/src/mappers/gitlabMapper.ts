import { WorkItem, Label, Timebox } from '../types.js';

interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  state: string;
  weight?: number;
  labels: string[];
  created_at: string;
  closed_at?: string;
}

export function mapGitLabIssue(issue: GitLabIssue): WorkItem {
  const labels: Label[] = issue.labels.map((name, idx) => ({ id: String(idx), name }));
  let state: WorkItem['state'];
  switch (issue.state) {
    case 'opened':
      state = 'open';
      break;
    case 'closed':
      state = 'done';
      break;
    default:
      state = 'open';
  }
  return {
    id: String(issue.id),
    key: `#${issue.iid}`,
    title: issue.title,
    state,
    points: issue.weight ?? undefined,
    labels,
    createdAt: issue.created_at,
    closedAt: issue.closed_at ?? undefined,
  };
}

interface GitLabMilestone {
  id: number;
  title: string;
  start_date?: string;
  due_date?: string;
}

export function mapGitLabMilestone(m: GitLabMilestone): Timebox {
  return {
    id: String(m.id),
    name: m.title,
    startDate: m.start_date,
    dueDate: m.due_date,
  };
}
