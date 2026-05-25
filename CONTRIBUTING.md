# Contributing to SBOM Compass

## Getting Started

1. Fork the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/sbom-compass.git
   cd sbom-compass
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Development

Start backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Code Style

- TypeScript strict mode is enabled.
- Follow existing code patterns and conventions.
- No comments in source code unless absolutely necessary.

## Pull Request Process

1. Create a feature branch from `master`.
2. Make your changes.
3. Ensure all tests pass: `npm test` in both backend and frontend.
4. Run linting: `npm run lint` in both directories.
5. Submit a pull request with a clear description of changes.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
