import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Kitchen display (KDS)"
      phase="2"
      bullets={[
        "Filter Socket.IO by branch + station (grill, bar, cold)",
        "Bump / recall, prep timers, SLA alerts",
        "Sound + visual escalation; waiter recall",
      ]}
    />
  );
}
