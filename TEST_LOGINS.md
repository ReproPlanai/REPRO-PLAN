## Test Passwords and Logins

This frontend-only build does not use passwords. Regular users use secret codes; stakeholders use phone/email + OTP.

### Regular User (Secret Code Login)
- Secret code: `ABCD2345`
- Note: secret codes are 8 characters (letters/numbers). No phone number required.
- Additional test codes: `EFGH6789`, `IJKL3456`, `MNOP9012`, `QRST5678`, `UVWX1122`

### Stakeholder Portal Access (All Roles)
Stakeholders do **not** need secret codes during testing. Select a role, then continue the OTP flow.

- ADMIN
  - Phone number: `+231-000-0001`
  - Email: `admin@test.reproplan`
  - Alternate: `+231-000-0006` / `ops.admin@test.reproplan`
- POLICE
  - Phone number: `+231-000-0002`
  - Email: `police@test.reproplan`
  - Alternate: `+231-000-0007` / `supervisor.police@test.reproplan`
- SAFEHOUSE
  - Phone number: `+231-000-0003`
  - Email: `safehouse@test.reproplan`
  - Alternate: `+231-000-0008` / `manager.safehouse@test.reproplan`
- MEDICAL
  - Phone number: `+231-000-0004`
  - Email: `medical@test.reproplan`
  - Alternate: `+231-000-0009` / `clinic.supervisor@test.reproplan`
- NGO
  - Phone number: `+231-000-0005`
  - Email: `ngo@test.reproplan`
  - Alternate: `+231-000-0010` / `outreach.ngo@test.reproplan`

### Notes
- These test accounts are seeded in local storage by the mock API in `frontend/src/services/api.ts`.
- You can use any 6-digit OTP in the stakeholder portal during testing.
