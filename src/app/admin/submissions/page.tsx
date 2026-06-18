import { SubmissionModerationAdmin } from "@/components/SubmissionModerationAdmin";

export const metadata = {
  title: "Review submissions",
  robots: { index: false, follow: false },
};

export default function AdminSubmissionsPage() {
  return <SubmissionModerationAdmin />;
}
