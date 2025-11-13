# Quick Start Guide

Get the Flowy backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/el-j/flowy-backend.git
   cd flowy-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env if you need custom ports
   ```

## Development

**Start the development server with hot reload:**
```bash
npm run dev
```

Server will start at `http://localhost:9023`

## Testing

**Run all tests:**
```bash
npm test
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

## Production

**Build the project:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

## Verify Installation

**Check server health:**
```bash
curl http://localhost:9023/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T17:30:00.000Z"
}
```

**Get all projects:**
```bash
curl http://localhost:9023/api/getProjects
```

## Common Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Full check (type, lint, test)
npm run typecheck && npm run lint && npm test
```

## Project Structure

```
flowy-backend/
├── src/              # TypeScript source code
│   ├── services/     # Business logic
│   ├── routes/       # API endpoints
│   ├── config/       # Configuration
│   └── types/        # Type definitions
├── dist/             # Compiled JavaScript
├── public/           # Static files & projects
└── tests/            # Test files
```

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [MIGRATION.md](MIGRATION.md) to understand changes from legacy code
- Review [SECURITY.md](SECURITY.md) for security information

## Troubleshooting

**Port already in use:**
```bash
# Change the port in .env
SERVER_PORT=9024
```

**Dependencies not installing:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Tests failing:**
```bash
# Clear test cache
npm test -- --clearCache
npm test
```

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/el-j/flowy-backend/issues)
- Check the documentation
- Review existing issues

## License

MIT
