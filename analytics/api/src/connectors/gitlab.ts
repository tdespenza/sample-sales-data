import { httpGet } from '../lib/http';
import { WorkItem, Timebox } from '../types.js';
import { mapGitLabIssue, mapGitLabMilestone } from '../mappers/gitlabMapper';

export async function fetchGitLabIssues(): Promise<WorkItem[]> {
  const { GITLAB_BASE_URL, GITLAB_PROJECT_ID, GITLAB_TOKEN } = process.env;
  if (!GITLAB_BASE_URL || !GITLAB_PROJECT_ID || !GITLAB_TOKEN) return [];
  const url = `${GITLAB_BASE_URL}/api/v4/projects/${GITLAB_PROJECT_ID}/issues?per_page=100`;
  const data = await httpGet(url, GITLAB_TOKEN);
  return Array.isArray(data) ? data.map(mapGitLabIssue) : [];
}

export async function fetchGitLabMilestones(): Promise<Timebox[]> {
  const { GITLAB_BASE_URL, GITLAB_PROJECT_ID, GITLAB_TOKEN } = process.env;
  if (!GITLAB_BASE_URL || !GITLAB_PROJECT_ID || !GITLAB_TOKEN) return [];
  const url = `${GITLAB_BASE_URL}/api/v4/projects/${GITLAB_PROJECT_ID}/milestones`;
  const data = await httpGet(url, GITLAB_TOKEN);
  return Array.isArray(data) ? data.map(mapGitLabMilestone) : [];
}
