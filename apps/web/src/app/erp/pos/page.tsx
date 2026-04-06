import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="POS management"
      phase="1"
      bullets={[
        "Terminal registry, drawer sessions, service modes",
        "Split / merge / transfer / comps (with approval hooks)",
        "Pricing rules, dayparts, channel-specific menus",
      ]}
    />
  );
}
