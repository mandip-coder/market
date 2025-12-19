import SuspenseWithBoundary from "@/components/SuspenseWithErrorBoundry/SuspenseWithErrorBoundry";
import MassEmailSendingPage from "./MassEmails";
import PageHeading from "@/components/PageHeading/PageHeading";

export default function MassEmails() {
  return (
    <>
      <div className="min-h-screen dark:bg-black">
        {/* Header */}
        <div className="mb-8">
          <PageHeading
            title="Send Emails"
            descriptionLine="Create and send personalized emails to your audience"
          />
        </div>
        <SuspenseWithBoundary>
          <MassEmailSendingPage />
        </SuspenseWithBoundary>
      </div>
    </>
  );
}
