export const CURRENT_CS_REP = "서지은";

export const CS_REPRESENTATIVES = [CURRENT_CS_REP, "최혜민"] as const;

export const CS_REPRESENTATIVE_OPTIONS = [
  ...CS_REPRESENTATIVES.map((representative) => ({
    value: representative,
    label: representative,
  })),
] as const;
