import { WorkItem, Timebox } from '../types.js';

export function mapOpenProjectWorkPackage(wp: any): WorkItem {
  const state = wp._links?.status?.title === 'Closed' ? 'done' : 'open';
  return {
    id: String(wp.id),
    key: `WP-${wp.id}`,
    title: wp.subject,
    state,
    points: wp.storyPoints ?? undefined,
    labels: [],
    createdAt: wp.createdAt,
    closedAt: wp.closedAt,
  };
}

export function mapOpenProjectVersion(v: any): Timebox {
  return {
    id: String(v.id),
    name: v.name,
    startDate: v.startDate,
    dueDate: v.dueDate,
  };
}
