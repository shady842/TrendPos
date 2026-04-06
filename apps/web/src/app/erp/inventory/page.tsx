import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Inventory"
      phase="4"
      bullets={[
        "StockItem / StockLocation / StockLedger already in schema",
        "Recipes, depletion on sale, waste, counts, transfers",
        "Procurement + supplier approvals",
      ]}
    />
  );
}
