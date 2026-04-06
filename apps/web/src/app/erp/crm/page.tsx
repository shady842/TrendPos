import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="CRM & loyalty"
      phase="5"
      bullets={[
        "Customer model stub exists — extend with segments & campaigns",
        "Loyalty earn/burn, promos, QR guest capture",
      ]}
    />
  );
}
