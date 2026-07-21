import { Select } from "@/components/ui/select";
import { FilterPanel } from "@/components/ui/filter-panel";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";
import {
  BIZ_TYPES,
  INTERNET_OPTIONS,
  RECEIPT_CHANNELS,
  STATUS_FILTER_OPTIONS,
  type BizType,
  type ReceiptChannel,
  type StatusFilterKey,
} from "@/features/franchise-receipts/types";

const BIZ_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "사업자 유형 전체" },
  ...BIZ_TYPES.map((t) => ({ value: t, label: t })),
];
const CHANNEL_FILTER_OPTIONS = [
  { value: "all", label: "접수 채널 전체" },
  ...RECEIPT_CHANNELS.map((c) => ({ value: c, label: c })),
];
const INTERNET_FILTER_OPTIONS = [
  { value: "all", label: "인터넷 전체" },
  ...INTERNET_OPTIONS,
];
interface ReceiptFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  channelFilter: ReceiptChannel | "all";
  onChannelFilterChange: (value: ReceiptChannel | "all") => void;
  bizTypeFilter: BizType | "all";
  onBizTypeFilterChange: (value: BizType | "all") => void;
  statusFilter: StatusFilterKey;
  onStatusFilterChange: (value: StatusFilterKey) => void;
  internetFilter: string;
  onInternetFilterChange: (value: string) => void;
  receiptDateRange: DateRangeValue;
  onReceiptDateRangeChange: (value: DateRangeValue) => void;
}

export function ReceiptFilters({
  searchQuery,
  onSearchQueryChange,
  channelFilter,
  onChannelFilterChange,
  bizTypeFilter,
  onBizTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  internetFilter,
  onInternetFilterChange,
  receiptDateRange,
  onReceiptDateRangeChange,
}: ReceiptFiltersProps) {
  const resetFilters = () => {
    onSearchQueryChange("");
    onStatusFilterChange("all");
    onBizTypeFilterChange("all");
    onChannelFilterChange("all");
    onInternetFilterChange("all");
    onReceiptDateRangeChange({ from: null, to: null });
  };

  return (
    <FilterPanel
      query={searchQuery}
      onQueryChange={onSearchQueryChange}
      searchPlaceholder="상호명, 대표자, 연락처, 사업자번호 통합 검색"
      onReset={resetFilters}
    >
      <div className="w-40">
        <Select
          label="상태"
          hideLabel
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as StatusFilterKey)
          }
          options={STATUS_FILTER_OPTIONS}
        />
      </div>
      <div className="w-40">
        <Select
          label="접수 채널"
          hideLabel
          value={channelFilter}
          onValueChange={(value) =>
            onChannelFilterChange(value as ReceiptChannel | "all")
          }
          options={CHANNEL_FILTER_OPTIONS}
        />
      </div>
      <div className="w-40">
        <Select
          label="사업자 유형"
          hideLabel
          value={bizTypeFilter}
          onValueChange={(value) =>
            onBizTypeFilterChange(value as BizType | "all")
          }
          options={BIZ_TYPE_FILTER_OPTIONS}
        />
      </div>
      <div className="w-32">
        <Select
          label="인터넷"
          hideLabel
          value={internetFilter}
          onValueChange={onInternetFilterChange}
          options={INTERNET_FILTER_OPTIONS}
        />
      </div>
      <div className="w-72">
        <DateRangePicker
          label="접수일 기간"
          hideLabel
          className="w-full"
          value={receiptDateRange}
          onChange={onReceiptDateRangeChange}
        />
      </div>
    </FilterPanel>
  );
}
