# Security Policy

## Reporting a vulnerability

Please do not publish credentials, authentication bypasses, payment issues, or other security-sensitive details in a public GitHub issue.

If you discover a potential vulnerability, contact the repository owner privately through the contact method listed on the project website or GitHub profile. Include:

- A clear description of the issue
- Reproduction steps
- Affected component or route
- Potential impact
- Suggested mitigation, if known

Please avoid accessing, modifying, or retaining data that does not belong to you while testing.

## Secrets

Real API keys, tokens, passwords, webhook secrets, and production credentials must never be committed to this repository. Use local `.env` files or deployment-provider secret storage instead.
