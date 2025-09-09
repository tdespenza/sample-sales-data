# Analytics Module

This directory contains a proof-of-concept backend API that normalizes GitLab and OpenProject data.

## Development

```bash
cd analytics/api
npm install
npm test
npm run dev
```

Endpoints:
- `GET /health`
- `GET /config`
- `GET /timeboxes`
- `GET /items`
