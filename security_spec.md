# Security Specification - AI Workshop Readiness Tool

## Data Invariants
1. Customer and Workshop data can only be accessed by authenticated Consultants/Admins.
2. Participants can only READ a published survey and CREATE a response. They cannot READ other responses.
3. Once a response is submitted, it is immutable by the participant.
4. Survey templates are managed by Admins.
5. Reports and Analysis are restricted to Consultants/Admins.

## The Dirty Dozen Payloads (Target: RLS Denial)
1. **Unauthenticated Read**: Attempt to list `/customers` without login.
2. **Unauthorized Customer Edit**: Consultant A trying to edit Customer B's data (assuming tenancy/ownership is enforced).
3. **Ghost Field in Customer**: Adding `isAdmin: true` to a customer document.
4. **Invalid Question Type**: Creating a question with `type: "unsupported_type"`.
5. **Participant Response to Closed Survey**: Creating a response when `status` is "closed" in the parent survey.
6. **Spoofed Respondent Identity**: Setting `respondent_email` to someone else's email in a response (though responses are public-ish, we should still guard against abuse if possible).
7. **Report Modification by Participant**: Attempt by a non-authenticated user to Read or Write `/reports`.
8. **Invalid ID Poisoning**: Using a 2KB string as a `customerId`.
9. **Analysis Run Manipulation**: Trying to update an `analysis_run` with spoofed maturity scores.
10. **Template Deletion by Consultant**: Only Admins should manage templates.
11. **Shadow Update to Workshop**: Trying to change `created_by` of a workshop after creation.
12. **Public Access to Raw Responses**: Attempting to list `/responses` via the public slug without consultant auth.

## Test Runner (Initial Draft)
Supabase RLS should be exercised with anonymous, authenticated non-admin, and admin clients.
