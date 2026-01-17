import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import MassEmailSendingPage from "./Campaigns";

export default function MassEmails() {
  return (
    <SuspenseWithBoundary>
      <MassEmailSendingPage />
    </SuspenseWithBoundary>
  );
}
