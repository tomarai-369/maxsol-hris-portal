// Email stub - not using SMTP in this version
// All email functions return success but don't actually send emails

export async function sendActivationEmail(
  to: string,
  firstName: string,
  token: string
): Promise<boolean> {
  console.log(`[EMAIL STUB] Would send activation to ${to} for ${firstName} with token ${token}`);
  return true;
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string
): Promise<boolean> {
  console.log(`[EMAIL STUB] Would send password reset to ${to} for ${firstName} with token ${token}`);
  return true;
}

export async function sendLeaveRequestNotification(
  to: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  status: string
): Promise<boolean> {
  console.log(`[EMAIL STUB] Would send leave notification to ${to}`);
  return true;
}
