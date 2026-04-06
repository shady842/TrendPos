import { ModulePlaceholder } from "@/components/erp/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="HR & payroll"
      phase="5"
      bullets={[
        "Staff profiles linked to UserCompany roles",
        "Attendance, shifts, payroll export / integration",
      ]}
    />
  );
}
