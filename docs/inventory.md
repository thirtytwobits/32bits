## DNS and registrar

| Field          | Value                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| Registrar      | GoDaddy                                                                              |
| DNS hosted at  | **AWS Route 53** (NS records on `awsdns-*`)                                          |
| Apex A records | `198.49.23.144`, `198.49.23.145`, `198.185.159.144`, `198.185.159.145` (Squarespace) |
| `www` CNAME    | `ext-cust.squarespace.com`                                                           |
| TTLs           | (default Route 53; lower to 300s ~24h before cutover)                                |

**Important for Phase 7:** DNS edits happen in **Route 53**, not at GoDaddy.
The registrar is GoDaddy but nameservers are delegated to AWS, so the change
panel is the AWS console (or `aws route53` CLI).

### Cutover record set (target)

When ready to switch to GitHub Pages:

- Apex `32bits.io` → four A records:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www.32bits.io` → CNAME `thirtytwobits.github.io`
- (Optional) AAAA records:
  - `2606:50c0:8000::153`, `2606:50c0:8001::153`,
    `2606:50c0:8002::153`, `2606:50c0:8003::153`

---
