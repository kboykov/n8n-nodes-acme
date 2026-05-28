# n8n-nodes-acme

An n8n community node package for **ACME certificate automation** (Let's Encrypt / RFC 8555) with native **DNS provider API integration** for fully automated DNS-01 challenge workflows.

---

## Nodes

### DNS

Manage and query DNS records.

| Operation | Description |
|---|---|
| **Create DNS TXT Record** | Create a TXT record via a DNS provider API (for ACME DNS-01 challenges) |
| **Delete DNS TXT Record** | Delete a TXT record via a DNS provider API (cleanup after challenge) |
| **Query DNS TXT Record** | Resolve TXT records using standard public resolvers (8.8.8.8, 1.1.1.1) |
| **Wait for DNS TXT Record** | Poll until a TXT record value propagates to all resolvers |

### ACME

Drive the full ACME certificate lifecycle step-by-step.

| Operation | Description |
|---|---|
| **Create Account** | Register an ACME account with Let's Encrypt |
| **Create Order** | Submit a certificate order for one or more domains |
| **Get Order** | Retrieve the current status of an order |
| **Get Challenge Key Authorization** | Get the DNS-01 key authorization value for each domain |
| **Complete Challenge** | Notify the ACME server to verify the challenge |
| **Finalize Order** | Submit the CSR and finalize the order |
| **Download Certificate** | Download the signed certificate chain |

### Certificate

Cryptographic utilities for certificate workflows.

| Operation | Description |
|---|---|
| **Generate Private Key** | Generate an RSA private key (2048 / 4096 bit) |
| **Generate CSR** | Generate a Certificate Signing Request |
| **Parse Certificate** | Parse a PEM certificate into readable fields |
| **Parse CSR** | Parse a PEM CSR into readable fields |

---

## DNS Providers

### Currently supported

| Provider | Status | Credential |
|---|---|---|
| **Cloudflare** | Supported | `Cloudflare DNS API` |

### Planned

| Provider | Status |
|---|---|
| AWS Route 53 | Planned |
| Google Cloud DNS | Planned |
| OVH | Planned |
| deSEC | Planned |
| DigitalOcean DNS | Planned |
| Bunny DNS | Planned |
| Porkbun | Planned |

Each provider implements the same `IDnsProvider` interface (`createTxtRecord` / `deleteTxtRecord`) so adding a new provider requires only one new file with no changes to node logic.

---

## Installation

Follow the [installing community nodes](https://docs.n8n.io/integrations/community-nodes/installation/) guide in the n8n docs.

Package name: `n8n-nodes-acme`

---

## Credentials

### Cloudflare DNS API

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **My Profile → API Tokens → Create Token**
3. Use the **Edit zone DNS** template, or create a custom token with:
   - **Zone → DNS → Edit**
   - **Zone Resources → Include → Specific zone** (or All zones)
4. Copy the generated token into the **API Token** field in n8n

---

## Usage: Automated DNS-01 Certificate Workflow

This is the recommended fully-automated flow using all three nodes together.

```
[Manual Trigger]
    → [Certificate: Generate Private Key]       — account key
    → [Certificate: Generate Private Key]       — domain key
    → [Certificate: Generate CSR]               — CSR for domain(s)
    → [ACME: Create Account]
    → [ACME: Create Order]
    → [ACME: Get Challenge Key Authorization]   — returns keyAuth per domain
    → [DNS: Create DNS TXT Record]              — _acme-challenge.example.com = keyAuth
    → [DNS: Wait for DNS TXT Record]            — wait for global propagation
    → [ACME: Complete Challenge]
    → [ACME: Finalize Order]
    → [ACME: Download Certificate]
    → [DNS: Delete DNS TXT Record]              — cleanup
```

### Key parameters

**DNS: Create DNS TXT Record**
- `Domain (Zone)` — e.g. `example.com` (must match your Cloudflare zone name exactly)
- `Record Name` — `_acme-challenge.example.com`
- `Record Value` — the `authorization` field from **Get Challenge Key Authorization**
- `Record ID Output Field` — e.g. `dnsRecordId` (referenced by the Delete step)

**DNS: Wait for DNS TXT Record**
- `Host Name` — same as Record Name above
- `Expected Value` — same key authorization value
- Uses resolvers: `8.8.8.8`, `1.1.1.1`, `9.9.9.9` by default

**DNS: Delete DNS TXT Record**
- `Domain (Zone)` — same zone as creation
- `Record ID` — `{{ $json.dnsRecordId }}` (or your chosen output field)

---

## Compatibility

Tested against n8n `1.x`. Requires Node.js `>= 18.17.0`.

ACME directory URLs:
- **Staging:** `https://acme-staging-v02.api.letsencrypt.org/directory`
- **Production:** `https://acme-v02.api.letsencrypt.org/directory`

Always test with the staging endpoint first to avoid Let's Encrypt rate limits.

---

## Contributing a new DNS provider

1. Create `nodes/DNS/providers/YourProviderDnsProvider.ts` implementing `IDnsProvider`
2. Add a credential in `credentials/YourProviderDnsApi.credentials.ts`
3. Register the credential in `package.json` → `n8n.credentials`
4. Add a `case 'yourProvider':` block in `CommonAction.getDnsProvider()` in `nodes/DNS/Common.action.ts`
5. Add a new option to the `dnsProvider` dropdown in `nodes/DNS/DNS.node.ts`
6. Register the credential in `nodes/DNS/DNS.node.ts` → `description.credentials`

No other files need to change.

---

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/installation/)
- [Let's Encrypt documentation](https://letsencrypt.org/docs/)
- [ACME RFC 8555](https://tools.ietf.org/html/rfc8555)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

## License

MIT
