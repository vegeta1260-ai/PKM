# Pokemon Champions Calculator

This folder contains the deterministic calculator layer for the GPTs battle coach.

## Engine

- Core damage formula: `@smogon/calc` 0.10.0.
- Data basis: Pokemon Showdown / Smogon calc generation 9 data.
- Champions adapter:
  - Level is forced to 50.
  - Champions stat points are converted to equivalent EVs for description compatibility.
  - Actual stats are overwritten with the Champions formula:
    - HP = base HP + 75 + HP stat points.
    - Other stats = floor((base + 20 + stat points) * alignment).

## Commands

```powershell
npm.cmd run calc:sample
npm.cmd run calc:test
npm.cmd run calc:server
```

Server defaults to:

```text
http://127.0.0.1:8787
```

Endpoints:

- `GET /health`
- `POST /damage`
- `POST /speed`
- `POST /compare-speed`

For GPT Actions, deploy this service to an HTTPS endpoint and use `gpts_action_openapi.yaml`.
