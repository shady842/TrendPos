import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Hardware & devices"
      phase="1"
      bullets={[
        "PosTerminal model — printer routing profiles per branch",
        "USB / LAN / BT bridges (usually local agent + cloud config)",
      ]}
    />
  );
}
