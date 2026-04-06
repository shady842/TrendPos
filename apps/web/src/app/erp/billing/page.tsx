import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Plans & Stripe"
      phase="6"
      bullets={[
        "stripeCustomerId on Company — webhook to activate plan tier",
        "Checkout for Starter / Pro / Premium + trial enforcement",
      ]}
    />
  );
}
