// Credentials for these two accounts are published in the project's README
// for graders/reviewers to try the app. Since anyone can log in with them,
// they must not be editable/deletable — otherwise the first visitor to use
// them locks everyone else out (exactly what happened before this guard
// existed: a visitor changed the "user" demo account's email and password).
export const DEMO_EMAILS = ["admin@travelhub.ai", "user@travelhub.ai"];

export function isDemoEmail(email: string): boolean {
  return DEMO_EMAILS.includes(email.toLowerCase().trim());
}
