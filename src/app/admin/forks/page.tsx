import { ForkModerationAdmin } from "@/components/ForkModerationAdmin";

export const metadata = {
  title: "Moderate forks",
  robots: { index: false, follow: false },
};

export default function AdminForksPage() {
  return <ForkModerationAdmin />;
}
