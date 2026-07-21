"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useExternalTechs } from "@/features/external-techs/hooks/use-external-techs";
import {
  EXTERNAL_TECH_STATUS_META,
  EXTERNAL_TECH_STATUS_ORDER,
  type ExternalTechRecord,
  type ExternalTechStatus,
} from "@/features/external-techs/types";
import {
  ExternalTechFormModal,
  type ExternalTechFormValue,
} from "@/features/external-techs/components/external-tech-form-modal";

const STATUS_BADGE_TONE: Record<ExternalTechStatus, "primary" | "neutral"> = {
  active: "primary",
  inactive: "neutral",
};

type StatusTab = "all" | ExternalTechStatus;

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function ExternalTechListItem({
  tech,
  active,
  onSelect,
}: {
  tech: ExternalTechRecord;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "border-border hover:bg-surface-subtle flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0",
        active ? "bg-primary-muted" : "bg-card",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="text-foreground truncate text-sm font-bold">
          {tech.name}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {tech.company || "소속 미등록"} · {tech.phone}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {tech.region || "활동지역 미등록"}
        </div>
      </div>
      <Badge tone={STATUS_BADGE_TONE[tech.status]} className="shrink-0">
        {EXTERNAL_TECH_STATUS_META[tech.status].label}
      </Badge>
    </button>
  );
}

function ExternalTechDetail({
  tech,
  onEdit,
  onDelete,
}: {
  tech: ExternalTechRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-xl font-bold">
            {tech.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {tech.company || "소속 미등록"} ·{" "}
            <CopyableText
              value={tech.phone}
              label="연락처"
              className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {tech.region || "활동지역 미등록"}
          </p>
        </div>
        <Badge tone={STATUS_BADGE_TONE[tech.status]} size="md">
          {EXTERNAL_TECH_STATUS_META[tech.status].label}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">전문분야</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {tech.specialty || "-"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">계약일</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {tech.contractedAt ?? "-"}
          </dd>
        </div>
      </dl>

      {tech.memo && (
        <p className="bg-surface-subtle text-foreground mt-4 rounded-lg px-3 py-2 text-sm">
          {tech.memo}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onEdit}>
          정보 수정
        </Button>
        <Button variant="danger" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}

export function ExternalTechsPage() {
  const {
    loading,
    externalTechs,
    addExternalTech,
    editExternalTech,
    removeExternalTech,
  } = useExternalTechs();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExternalTechRecord | null>(null);

  const filteredTechs = useMemo(() => {
    const normalized = query.trim();
    return externalTechs.filter((tech) => {
      if (statusTab !== "all" && tech.status !== statusTab) return false;
      if (!normalized) return true;
      return [tech.name, tech.phone, tech.company, tech.region, tech.specialty]
        .join(" ")
        .includes(normalized);
    });
  }, [externalTechs, query, statusTab]);

  const selectedTech =
    filteredTechs.find((t) => t.id === selectedId) ?? filteredTechs[0] ?? null;

  const handleAdd = async (value: ExternalTechFormValue) => {
    const created = await addExternalTech(value);
    setSelectedId(created.id);
    setAddOpen(false);
  };

  const handleEdit = async (value: ExternalTechFormValue) => {
    if (!editTarget) return;
    await editExternalTech(editTarget.id, value);
    setEditTarget(null);
  };

  const handleDelete = (tech: ExternalTechRecord) => {
    if (!window.confirm(`${tech.name} 외부 기사 정보를 삭제하시겠습니까?`)) {
      return;
    }
    removeExternalTech(tech.id);
    if (selectedId === tech.id) setSelectedId(null);
  };

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="외부 기사 관리"
        description="외부 협력 기사의 연락처와 활동 현황을 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            외부 기사 등록
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 외부 기사" value={externalTechs.length} />
        <StatTile
          label="활동중"
          value={externalTechs.filter((t) => t.status === "active").length}
        />
        <StatTile
          label="비활성"
          value={externalTechs.filter((t) => t.status === "inactive").length}
        />
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  label="외부 기사 검색"
                  hideLabel
                  placeholder="이름, 소속업체, 활동지역 검색"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["all", ...EXTERNAL_TECH_STATUS_ORDER] as StatusTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusTab(tab)}
                      className={[
                        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                        statusTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab === "all"
                        ? "전체"
                        : EXTERNAL_TECH_STATUS_META[tab].label}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {loading ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  불러오는 중입니다.
                </div>
              ) : filteredTechs.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  조건에 맞는 외부 기사가 없습니다.
                </div>
              ) : (
                filteredTechs.map((tech) => (
                  <ExternalTechListItem
                    key={tech.id}
                    tech={tech}
                    active={selectedTech?.id === tech.id}
                    onSelect={() => setSelectedId(tech.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedTech ? (
            <ExternalTechDetail
              tech={selectedTech}
              onEdit={() => setEditTarget(selectedTech)}
              onDelete={() => handleDelete(selectedTech)}
            />
          ) : (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center text-sm">
              <UsersIcon className="size-6" />
              {loading ? "불러오는 중입니다." : "표시할 외부 기사가 없습니다."}
            </div>
          )}
        </main>
      </div>

      {addOpen && (
        <ExternalTechFormModal
          title="외부 기사 등록"
          submitLabel="등록"
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <ExternalTechFormModal
          title={`${editTarget.name} 정보 수정`}
          submitLabel="저장"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </PageShell>
  );
}
