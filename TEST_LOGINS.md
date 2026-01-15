## Test Passwords and Logins

This frontend-only build does not use passwords. Access is based on secret codes.

### Regular User (Secret Code Login)
- Secret code: `ABCD2345`
- Note: secret codes are 8 characters (letters/numbers). No phone number required.

### Stakeholder Portal Access (All Roles)
Use these codes in the Secure Access Portal, then continue the OTP flow.

- ADMIN
  - Secret code: `REPROPLAN_ADMIN_2024`
  - Phone number (any is accepted in mock mode): `+231-000-0001`
- POLICE
  - Secret code: `REPROPLAN_POLICE_2024`
  - Phone number: `+231-000-0002`
- SAFEHOUSE
  - Secret code: `REPROPLAN_SAFE_2024`
  - Phone number: `+231-000-0003`
- MEDICAL
  - Secret code: `REPROPLAN_MED_2024`
  - Phone number: `+231-000-0004`
- NGO
  - Secret code: `REPROPLAN_NGO_2024`
  - Phone number: `+231-000-0005`

### Notes
- These test accounts are seeded in local storage by the mock API in `frontend/src/services/api.ts`.
- You can use any 6-digit OTP in the stakeholder portal during testing.
