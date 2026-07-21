"use client";

import { useId, useState, type ReactNode } from "react";
import { MessageSquareTextIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import {
  DatePicker,
  InlineDatePicker,
  TextDatePicker,
} from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MemoDrawer, type MemoItem } from "@/components/ui/memo-drawer";
import { SectionTitle } from "@/components/ui/section-title";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBusinessNumber,
  formatPhoneNumber,
} from "@/lib/format-identifiers";
import type {
  ColumnDef,
  FieldDef,
  ManagementKind,
  PageConfig,
  RowData,
} from "@/features/management-preview/types";
import {
  findField,
  getInitialEntryValues,
  hasRequiredValues,
  normalizeDate,
} from "@/features/management-preview/utils";

function formatMoneyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function badgeClass(
  kind: ManagementKind,
  columnKey: string,
  value: string,
): string {
  const specific: Record<string, string> = {
    "changes:changeType:통장변경": "!bg-blue-500/15 !text-blue-500",
    "changes:changeType:상호변경": "!bg-violet-500/15 !text-violet-500",
    "changes:changeType:대표자 변경": "!bg-orange-500/15 !text-orange-500",
    "changes:changeType:주소변경": "!bg-cyan-500/15 !text-cyan-500",
    "changes:changeType:업종변경": "!bg-pink-500/15 !text-pink-500",
    "woo:category:신규": "!bg-blue-500/15 !text-blue-500",
    "woo:category:명의변경": "!bg-amber-500/15 !text-amber-500",
    "woo:category:승계": "!bg-violet-500/15 !text-violet-500",
    "woo:internet:3S": "!bg-blue-500/15 !text-blue-500",
    "woo:internet:백메가": "!bg-violet-500/15 !text-violet-500",
    "internet:category:3S": "!bg-blue-500/15 !text-blue-500",
    "internet:category:백메가": "!bg-violet-500/15 !text-violet-500",
    "internet:carrier:SKT": "!bg-red-500/15 !text-red-500",
    "internet:carrier:KT": "!bg-zinc-500/15 !text-zinc-500",
    "internet:carrier:LG": "!bg-pink-500/15 !text-pink-500",
  };
  const matched = specific[`${kind}:${columnKey}:${value}`];
  if (matched) return matched;
  if (["접수완료", "개통완료", "가맹완료", "Y"].includes(value))
    return "!bg-green-500/15 !text-green-500";
  if (["서류미비", "가맹미확인", "N"].includes(value))
    return "!bg-red-500/15 !text-red-500";
  if (["서류대기", "미정"].includes(value))
    return "!bg-amber-500/15 !text-amber-500";
  return "!bg-blue-500/15 !text-blue-500";
}
function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = field.label;
  if (field.type === "select") {
    const placeholder =
      field.key === "manager" || field.label.includes("담당자")
        ? "미배정"
        : "미설정";
    return (
      <Select
        label={label}
        value={value || null}
        onValueChange={onChange}
        placeholder={placeholder}
        disablePortal
        options={(field.options ?? []).map((option) => ({
          value: option,
          label: option,
        }))}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <Textarea
        label={field.label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder ?? "내용을 입력해주세요."}
        rows={3}
      />
    );
  }
  if (field.type === "date") {
    return <DatePicker label={label} value={value} onChange={onChange} />;
  }
  if (field.type === "dateText") {
    return (
      <TextDatePicker
        label={field.label}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
      />
    );
  }
  const formatValue =
    field.type === "money"
      ? formatMoneyInput
      : field.format === "raw"
        ? (nextValue: string) => nextValue
        : field.key === "phone"
          ? formatPhoneNumber
          : field.key === "bizNo"
            ? formatBusinessNumber
            : (nextValue: string) => nextValue;
  return (
    <Input
      label={label}
      type="text"
      inputMode={
        field.type === "money" || field.key === "bizNo"
          ? "numeric"
          : field.key === "phone"
            ? "tel"
            : undefined
      }
      value={value}
      onChange={(event) => onChange(formatValue(event.target.value))}
      placeholder={field.placeholder ?? `${field.label} 입력`}
    />
  );
}

function EntrySections({
  config,
  values,
  onChange,
  columns = 2,
}: {
  config: PageConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  columns?: 2 | 4;
}) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-4 items-start gap-3.5"
      : "grid grid-cols-2 items-start gap-3.5";
  const fullSpanClass = columns === 4 ? "col-span-4" : "col-span-2";
  const getFieldSpanClass = (field: FieldDef) => {
    if (field.width === "wide") {
      return columns === 4 ? "col-span-2" : "";
    }
    return field.span === 2 ? fullSpanClass : "";
  };
  const renderField = (field: FieldDef) => (
    <FieldControl
      field={field}
      value={values[field.key] ?? ""}
      onChange={(value) => onChange(field.key, value)}
    />
  );

  return (
    <div className="space-y-6">
      {config.sections.map((section) => {
        const fields: ReactNode[] = [];
        for (let index = 0; index < section.fields.length; index += 1) {
          const field = section.fields[index];
          const nextField = section.fields[index + 1];

          if (field.key === "address" && nextField?.key === "addressDetail") {
            fields.push(
              <div
                key="address-row"
                className={[
                  fullSpanClass,
                  "grid min-w-0 grid-cols-[minmax(0,1fr)_180px] items-start gap-3.5",
                ].join(" ")}
              >
                <div className="min-w-0">{renderField(field)}</div>
                <div className="min-w-0">{renderField(nextField)}</div>
              </div>,
            );
            index += 1;
            continue;
          }

          fields.push(
            <div
              key={field.key}
              className={[getFieldSpanClass(field), "min-w-0"]
                .filter(Boolean)
                .join(" ")}
            >
              {renderField(field)}
            </div>,
          );
        }

        return (
          <section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <div className={gridClass}>{fields}</div>
          </section>
        );
      })}
    </div>
  );
}

export function CreateEntryModal({
  config,
  onClose,
  onSave,
}: {
  config: PageConfig;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
}) {
  const titleId = useId();
  const [values, setValues] = useState<Record<string, string>>(() =>
    getInitialEntryValues(),
  );
  const canSave = hasRequiredValues(config, values);
  const save = () => {
    if (canSave) onSave(values);
  };
  return (
    <Dialog open onClose={onClose} variant="modal" labelledBy={titleId}>
      <div className="flex max-h-[90vh] w-full flex-col">
        <div className="border-border flex items-center justify-between border-b px-7 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold">
              {config.createLabel}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              접수 정보를 입력하고 등록해주세요.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="등록 닫기"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <EntrySections
            config={config}
            values={values}
            columns={4}
            onChange={(key, value) =>
              setValues((current) => ({ ...current, [key]: value }))
            }
          />
        </div>
        <div className="border-border flex justify-end gap-2 border-t px-7 py-4">
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" disabled={!canSave} onClick={save}>
            등록
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export function DetailDrawer({
  config,
  row,
  onClose,
  onSave,
}: {
  config: PageConfig;
  row: RowData;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
}) {
  const titleId = useId();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...row,
    receivedAt: normalizeDate(row.receivedAt),
    appliedAt: normalizeDate(row.appliedAt),
    openDate: normalizeDate(row.openDate),
    openedAt: normalizeDate(row.openedAt),
  }));
  const canSave = hasRequiredValues(config, values);
  const save = () => {
    if (canSave) onSave(values);
  };
  return (
    <Dialog
      open
      onClose={onClose}
      variant="drawer"
      labelledBy={titleId}
      className="flex w-[640px] max-w-[calc(100vw-32px)] flex-col"
    >
      <div className="border-border flex items-start justify-between border-b px-6 py-5">
        <div>
          <h2 id={titleId} className="text-lg font-bold">
            {row.name}
          </h2>
          <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-1 text-sm">
            <span>{row.owner}</span>
            <span>·</span>
            <span>{row.bizType ?? "-"}</span>
            <span>·</span>
            <CopyableText
              value={row.phone}
              label="연락처"
              className="hover:text-primary focus-visible:ring-primary/30 rounded-sm text-left underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            />
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="상세 닫기"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <EntrySections
          config={config}
          values={values}
          columns={2}
          onChange={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
        />
      </div>
      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSave} onClick={save}>
          저장
        </Button>
      </div>
    </Dialog>
  );
}
export function ManagementMemoDrawer({
  row,
  onClose,
}: {
  row: RowData;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<MemoItem[]>([
    {
      id: "memo-1",
      type: "메모",
      meta: "2026.07.16 14:20 · 서지은",
      content: "고객과 통화 완료. 필요한 서류를 문자로 다시 안내했습니다.",
      pinned: true,
    },
    {
      id: "history-1",
      type: "변경 이력",
      meta: "2026.07.16 11:42 · 서지은",
      content: "상태를 ‘서류대기’에서 ‘서류미비’로 변경했습니다.",
      pinned: false,
    },
    {
      id: "history-2",
      type: "변경 이력",
      meta: "2026.07.16 09:18 · 시스템",
      content: "신규 접수가 등록되었습니다.",
      pinned: false,
    },
  ]);
  const addNote = (content: string) => {
    setNotes((current) => [
      {
        id: crypto.randomUUID(),
        type: "메모",
        meta: "방금 · 나",
        content,
        pinned: false,
      },
      ...current,
    ]);
  };
  const togglePin = (id: string) => {
    setNotes((current) =>
      current.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  };
  const removeNote = (id: string) => {
    setNotes((current) => current.filter((item) => item.id !== id));
  };
  return (
    <MemoDrawer
      subject={row.name}
      description={row.owner}
      items={notes}
      onClose={onClose}
      onAdd={addNote}
      onTogglePin={togglePin}
      onRemove={removeNote}
    />
  );
}

export function renderCell(
  kind: ManagementKind,
  config: PageConfig,
  row: RowData,
  column: ColumnDef,
  onUpdate: (id: string, key: string, value: string) => void,
  onMemo: () => void,
): ReactNode {
  const value = row[column.key] || "-";
  const field = findField(config, column.key);
  const editable = config.inlineEditKeys.includes(column.key) && field;

  if (editable) {
    if (field.type === "date") {
      return (
        <div onClick={(event) => event.stopPropagation()}>
          <InlineDatePicker
            ariaLabel={`${row.name} ${column.label}`}
            value={value === "-" ? "" : normalizeDate(value)}
            onChange={(nextValue) => onUpdate(row.id, column.key, nextValue)}
          />
        </div>
      );
    }
    if (field.type === "select") {
      const options = field.options ?? [];
      const selectValue = options.includes(value) ? value : null;
      const placeholder =
        column.key === "manager" || column.label.includes("담당자")
          ? "미배정"
          : "미설정";
      const customSpeed =
        kind === "internet" &&
        column.key === "speed" &&
        (value === "직접입력" || !options.includes(value));
      return (
        <div
          className="flex items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Select
            label={`${row.name} ${column.label}`}
            hideLabel
            value={customSpeed ? "직접입력" : selectValue}
            onValueChange={(nextValue) =>
              onUpdate(row.id, column.key, nextValue)
            }
            placeholder={placeholder}
            options={options.map((option) => ({
              value: option,
              label: option,
            }))}
            className={[
              column.kind === "badge"
                ? "h-auto min-w-20 rounded-md border-none px-2.5 py-1.5 text-[11.5px] font-semibold"
                : "h-auto min-w-20 border-none bg-transparent py-0 pr-6 pl-0 text-[12.5px]",
              column.kind === "badge"
                ? badgeClass(kind, column.key, value)
                : "",
            ].join(" ")}
          />
          {customSpeed && (
            <Input
              label={`${row.name} 속도 직접 입력`}
              hideLabel
              value={value === "직접입력" ? "" : value}
              onChange={(event) =>
                onUpdate(row.id, column.key, event.target.value)
              }
              placeholder="직접 입력"
              className="h-auto w-20 py-1 text-[12.5px]"
            />
          )}
        </div>
      );
    }
    if (field.type === "money") {
      return (
        <div
          className="flex items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Input
            label={`${row.name} ${column.label}`}
            hideLabel
            inputMode="numeric"
            value={value === "-" ? "" : value}
            onChange={(event) =>
              onUpdate(row.id, column.key, formatMoneyInput(event.target.value))
            }
            className="h-auto w-20 border-none bg-transparent px-0 py-0 text-right text-[12.5px] font-semibold"
          />
          <span>원</span>
        </div>
      );
    }
    if (field.type === "text" || !field.type || field.type === "dateText") {
      return (
        <div onClick={(event) => event.stopPropagation()}>
          <Input
            label={`${row.name} ${column.label}`}
            hideLabel
            value={value === "-" ? "" : value}
            onChange={(event) =>
              onUpdate(row.id, column.key, event.target.value)
            }
            placeholder={field.placeholder ?? "직접 입력"}
            className="h-auto min-w-20 border-none bg-transparent px-0 py-0 text-[12.5px]"
          />
        </div>
      );
    }
  }

  if (column.key === "phone") {
    return <CopyableText value={value} label="연락처" />;
  }

  if (column.kind === "identity")
    return (
      <span className="text-foreground block max-w-40 truncate font-semibold">
        {value}
      </span>
    );
  if (column.kind === "badge")
    return (
      <span
        className={[
          "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
          badgeClass(kind, column.key, value),
        ].join(" ")}
      >
        {value}
      </span>
    );
  if (column.kind === "money")
    return (
      <span className="font-semibold tabular-nums">
        {value}
        {value === "-" ? "" : "원"}
      </span>
    );
  if (column.kind === "memo")
    return (
      <button
        type="button"
        aria-label={`${row.name} 메모`}
        onClick={(event) => {
          event.stopPropagation();
          onMemo();
        }}
        className="text-muted-foreground hover:text-primary inline-flex items-center"
      >
        <MessageSquareTextIcon className="size-4" />
      </button>
    );
  return (
    <span className={value === "-" ? "text-muted-foreground" : ""}>
      {value}
    </span>
  );
}
