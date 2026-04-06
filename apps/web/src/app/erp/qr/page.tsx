import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="QR ordering"
      phase="6"
      bullets={[
        "Public menu by table token, cart → same Order pipeline",
        "Stripe PaymentIntent for pay-at-table",
      ]}
    />
  );
}
