import { Select } from "@/components/ui/select";
import { FilterPanel } from "@/components/ui/filter-panel";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";
import {
  INSTALL_TECH_OPTIONS,
  type SortOrder,
} from "@/features/installations/types";

const TECH_FILTER_OPTIONS = [
  { value: "all", label: "담당기사 전체" },
  ...INSTALL_TECH_OPTIONS,
];
const SORT_OPTIONS = [
  { value: "latest", label: "등록일순" },
  { value: "oldest", label: "오래된순" },
];

interface InstallFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  techFilter: string;
  onTechFilterChange: (value: string) => void;
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export function InstallFilters({
  searchQuery,
  onSearchQueryChange,
  techFilter,
  onTechFilterChange,
  dateRange,
  onDateRangeChange,
  sortOrder,
  onSortOrderChange,
}: InstallFiltersProps) {
  return (
    <FilterPanel
      query={searchQuery}
      onQueryChange={onSearchQueryChange}
      searchPlaceholder="고객명, 전화번호, 송장번호 통합 검색"
    >
      <div className="w-40">
        <Select
          label="담당기사"
          hideLabel
          value={techFilter}
          onValueChange={onTechFilterChange}
          options={TECH_FILTER_OPTIONS}
        />
      </div>
      <div className="w-72">
        <DateRangePicker
          label="등록일 기간"
          hideLabel
          className="w-full"
          value={dateRange}
          onChange={onDateRangeChange}
        />
      </div>
      <div className="w-32">
        <Select
          label="정렬"
          hideLabel
          value={sortOrder}
          onValueChange={(value) => onSortOrderChange(value as SortOrder)}
          options={SORT_OPTIONS}
        />
      </div>
    </FilterPanel>
  );
}
