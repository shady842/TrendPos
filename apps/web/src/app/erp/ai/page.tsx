import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="AI"
      phase="7"
      bullets={[
        "Voice order parsing → structured cart lines",
        "Upsell rules from basket + time-of-day",
        "Forecasting / waste risk from ledger + sales history",
      ]}
    />
  );
}
