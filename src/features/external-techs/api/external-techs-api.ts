import type {
  CreateExternalTechInput,
  ExternalTechRecord,
  UpdateExternalTechInput,
} from "@/features/external-techs/types";

export async function fetchExternalTechs(): Promise<ExternalTechRecord[]> {
  const res = await fetch("/api/external-techs");
  return res.json();
}

export async function createExternalTech(
  input: CreateExternalTechInput,
): Promise<ExternalTechRecord> {
  const res = await fetch("/api/external-techs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateExternalTech(
  id: string,
  patch: UpdateExternalTechInput,
): Promise<ExternalTechRecord> {
  const res = await fetch(`/api/external-techs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteExternalTech(id: string): Promise<void> {
  await fetch(`/api/external-techs/${id}`, { method: "DELETE" });
}
