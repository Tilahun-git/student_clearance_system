export function pendingApprovalEmailTemplate(studentId: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px;">
      <h2 style="color:#1d4ed8;">New Clearance Request Pending</h2>
      <p>
        A new clearance request is waiting for your review.
      </p>
      <p>
        Student ID:
        <strong>${studentId}</strong>
      </p>
      <p>
        Please log in to the system to review and approve the request.
      </p>
    </div>
  `;
}

export function studentPendingApprovalTemplate(studentId: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px;">
      <h2 style="color:#1d4ed8;">Clearance Request Submitted</h2>
      <p>
        Your clearance request has been submitted successfully.
      </p>
      <p>
        Student ID:
        <strong>${studentId}</strong>
      </p>
      <p>
        The relevant offices will review it and you will be notified of the next update.
      </p>
    </div>
  `;
}

export function rejectionEmailTemplate(
  studentId: string,
  role: string,
  comment?: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px;">
      <h2 style="color:#dc2626;">Clearance Request Rejected</h2>
      <p>
        Your clearance request was rejected by
        <strong>${role}</strong>.
      </p>
      <p>
        Student ID:
        <strong>${studentId}</strong>
      </p>
      ${
        comment
          ? `
            <p>
              <strong>Reason:</strong>
              ${comment}
            </p>
          `
          : ""
      }
      <p>
        Please log in and review the request details to resubmit if needed.
      </p>
    </div>
  `;
}
export function finalApprovalTemplate(studentId: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px;">
      <h2 style="color:#16a34a;">Clearance Completed</h2>
      <p>
        Congratulations!
      </p>

      <p>
        Your clearance request has been fully approved.
      </p>
      <p>
        Student ID:
        <strong>${studentId}</strong>
      </p>
    </div>
  `;
}