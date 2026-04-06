export type ErpNavItem = {
  href: string;
  label: string;
  phase: string;
};

export const erpNav: ErpNavItem[] = [
  { href: "/erp/dashboard", label: "Dashboard", phase: "0" },
  { href: "/erp/pos", label: "POS management", phase: "1" },
  { href: "/erp/floor", label: "Floor plan & tables", phase: "1" },
  { href: "/erp/menu", label: "Menu & modifiers", phase: "1" },
  { href: "/erp/kds", label: "Kitchen (KDS)", phase: "2" },
  { href: "/erp/manager", label: "Manager approvals", phase: "3" },
  { href: "/erp/inventory", label: "Inventory", phase: "4" },
  { href: "/erp/accounting", label: "Accounting", phase: "5" },
  { href: "/erp/hr", label: "HR & payroll", phase: "5" },
  { href: "/erp/crm", label: "CRM & loyalty", phase: "5" },
  { href: "/erp/hardware", label: "Hardware & devices", phase: "1" },
  { href: "/erp/reports", label: "Reports & BI", phase: "5" },
  { href: "/erp/qr", label: "QR ordering", phase: "6" },
  { href: "/erp/ai", label: "AI & assistant", phase: "7" },
  { href: "/erp/billing", label: "Plans & Stripe", phase: "6" },
];
