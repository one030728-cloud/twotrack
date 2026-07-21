import type {
  CreateInstallInput,
  InstallRecord,
} from "@/features/installations/types";

export async function fetchInstalls(): Promise<InstallRecord[]> {
  const res = await fetch("/api/installs");
  return res.json();
}

export async function createInstall(
  input: CreateInstallInput,
): Promise<InstallRecord> {
  const res = await fetch("/api/installs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateInstall(
  id: number,
  patch: Partial<InstallRecord>,
): Promise<InstallRecord> {
  const res = await fetch(`/api/installs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteInstall(id: number): Promise<void> {
  await fetch(`/api/installs/${id}`, { method: "DELETE" });
}
