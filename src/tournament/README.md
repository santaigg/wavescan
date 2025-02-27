# Tournament Module

This module provides tournament management functionality for the Optic Gaming tournament page.

## Features

- Tournament data management with Redis storage
- Admin authentication for secure operations
- Match management (create, update, delete)
- API endpoints for frontend integration

## Environment Variables

The following environment variables can be configured:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ADMIN_COOKIE_NAME` | Name of the cookie used for admin authentication | `optic_tournament_admin` |
| `ADMIN_TOKEN_VALUE` | Token value stored in the cookie for authentication | `optic-admin-token` |
| `ADMIN_PASSWORD` | Password required for admin authentication | `opticadmin` |
| `TOURNAMENT_KEY_PREFIX` | Redis key prefix for tournament data | `wv:tournament:data:` |
| `TOURNAMENT_CACHE_TTL` | Cache TTL in seconds for tournament data | `86400` (1 day) |

## API Endpoints

The module exposes the following API endpoints:

### GET /tournament

Fetches tournament data.

Query parameters:
- `id`: Tournament ID (default: "default")

### POST /tournament

Performs various tournament operations. Requires admin authentication.

Query parameters:
- `id`: Tournament ID (default: "default")
- `action`: The action to perform

Available actions:
- `update`: Update tournament data
- `add-match`: Add a new match
- `update-match`: Update an existing match
- `delete-match`: Delete a match
- `reset`: Reset tournament data to default
- `create-match`: Create a new default match
- `auth`: Authenticate as admin
- `logout`: Log out admin

## Usage

```typescript
import { 
  fetchTournament, 
  updateTournament, 
  addMatch, 
  updateMatch, 
  deleteMatch, 
  resetTournamentData,
  authenticateAdmin,
  isAdminAuthenticated,
  logoutAdmin
} from './tournament';

// Fetch tournament data
const result = await fetchTournament('tournament1');

// Authenticate as admin
const authResult = authenticateAdmin('password');

// Add a new match
if (isAdminAuthenticated()) {
  const match = createDefaultMatch('match4', 'Finals');
  await addMatch('tournament1', match);
}
``` 