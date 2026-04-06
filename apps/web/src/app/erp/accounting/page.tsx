import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Accounting"
      phase="5"
      bullets={[
        "Chart of accounts, journals, period close",
        "P&L / balance sheet / AR / AP / bank rec",
        "Posted from POS settlements and inventory COGS",
      ]}
    />
  );
}
