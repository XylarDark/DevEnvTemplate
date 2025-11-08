# Express API Fixture

This is a minimal Express + TypeScript API server fixture for testing DevEnvTemplate.

## API Endpoints

- `GET /` - Server information
- `GET /health` - Health check
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

## Running

```bash
npm run dev    # Development with hot reload
npm run build  # Build for production
```

**Intentionally missing:**
- Test setup
- .env.example file
- ESLint configuration
- Prettier configuration
- TypeScript strict mode (set to false)
- Input validation
- Error handling middleware

This allows the doctor to detect gaps and suggest fixes.

