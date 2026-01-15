## Test Passwords and Logins

This frontend-only build does not use passwords. Access is based on secret codes.

### Regular User (Secret Code Login)
- Secret code: `ABCD2345`
- Note: secret codes are 8 characters (letters/numbers). No phone number required.

### Stakeholder Portal Access (All Roles)
Stakeholders do **not** need secret codes during testing. Select a role, then continue the OTP flow.

- ADMIN
  - Phone number (any is accepted in mock mode): `+231-000-0001`
  - Email: `admin@test.reproplan`
- POLICE
  - Phone number: `+231-000-0002`
  - Email: `police@test.reproplan`
- SAFEHOUSE
  - Phone number: `+231-000-0003`
  - Email: `safehouse@test.reproplan`
- MEDICAL
  - Phone number: `+231-000-0004`
  - Email: `medical@test.reproplan`
- NGO
  - Phone number: `+231-000-0005`
  - Email: `ngo@test.reproplan`

### Notes
- These test accounts are seeded in local storage by the mock API in `frontend/src/services/api.ts`.
- You can use any 6-digit OTP in the stakeholder portal during testing.
