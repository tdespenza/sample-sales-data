import { httpGet } from '../lib/http';
import { WorkItem, Timebox } from '../types.js';
import { mapOpenProjectWorkPackage, mapOpenProjectVersion } from '../mappers/openProjectMapper';

export async function fetchOpenProjectWorkPackages(): Promise<WorkItem[]> {
  const { OP_BASE_URL, OP_PROJECT_ID, OP_API_KEY } = process.env;
  if (!OP_BASE_URL || !OP_PROJECT_ID || !OP_API_KEY) return [];
  const url = `${OP_BASE_URL}/api/v3/projects/${OP_PROJECT_ID}/work_packages`;
  const data = await httpGet(url, OP_API_KEY);
  return Array.isArray(data?._embedded?.elements)
    ? data._embedded.elements.map(mapOpenProjectWorkPackage)
    : [];
}

export async function fetchOpenProjectVersions(): Promise<Timebox[]> {
  const { OP_BASE_URL, OP_PROJECT_ID, OP_API_KEY } = process.env;
  if (!OP_BASE_URL || !OP_PROJECT_ID || !OP_API_KEY) return [];
  const url = `${OP_BASE_URL}/api/v3/projects/${OP_PROJECT_ID}/versions`;
  const data = await httpGet(url, OP_API_KEY);
  return Array.isArray(data?._embedded?.elements)
    ? data._embedded.elements.map(mapOpenProjectVersion)
    : [];
}
