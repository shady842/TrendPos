import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Reports & BI"
      phase="5"
      bullets={[
        "Semantic layer over orders + payments + inventory",
        "Custom reports, scheduled exports, NL→SQL assistant (Phase 7)",
      ]}
    />
  );
}
