# SPEEDKIT Governed Public Reconciliation

SPEEDKIT has two integrity modes.

## Pure append mode

A change is accepted when every changed path is a new file.

## Governed public reconciliation mode

A generated public surface rebuild is accepted only when these invariants pass:

- title remains `SPEEDKIT Control Engine`
- mode remains `PUBLIC_ONLY`
- recognized execution systems remain `4`
- private remaining remains `0`
- workspace entry count matches the manifest
- ANTIMATTERIUM remains projected as a public workspace family
- index checksum matches `index.html`
- purged private repository-name tokens are not projected
- private repository visibility is not projected
- repository, organization, package, and family existence is not automatic systems admission

The reconciliation proof is:

- `PUBLIC_RECONCILIATION_PROOF.json`

Operational commands:

```bash
node scripts/speedkit-stamp-public-reconciliation-proof.cjs
node scripts/speedkit-public-universe-audit.cjs
node scripts/speedkit-governed-public-reconciliation-gate.cjs
```
