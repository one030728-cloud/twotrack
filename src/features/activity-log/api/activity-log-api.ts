import { fetchAllWorkflows } from "@/features/workflow/api/workflow-api";
import {
  flattenWorkflows,
  type ActivityLogEntry,
} from "@/features/activity-log/types";

export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  const workflows = await fetchAllWorkflows();
  return flattenWorkflows(workflows);
}
