import { CountTabs } from "@/components/ui/count-tabs";
import {
  RECEIPT_TABS,
  type ReceiptTabKey,
} from "@/features/franchise-receipts/types";

interface ReceiptTabsProps {
  activeTab: ReceiptTabKey;
  tabCounts: Record<ReceiptTabKey, number>;
  onChange: (tab: ReceiptTabKey) => void;
}

export function ReceiptTabs({
  activeTab,
  tabCounts,
  onChange,
}: ReceiptTabsProps) {
  return (
    <CountTabs
      items={RECEIPT_TABS}
      activeKey={activeTab}
      counts={tabCounts}
      ariaLabel="가맹 접수 상태 필터"
      onChange={onChange}
    />
  );
}
