import { UnitAdmin } from "@/components/UnitAdmin";

export const metadata = {
  title: "Manage units",
  robots: { index: false, follow: false },
};

export default function AdminUnitsPage() {
  return <UnitAdmin />;
}
