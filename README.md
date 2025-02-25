# Wavescan API

Wavescan is an API for Santai.GG that provides access to player data, match history, and game statistics.

## New Feature: Global Sponsor Statistics

The API now includes an endpoint to retrieve global statistics for all sponsors in the game. This provides valuable insights into sponsor usage and performance metrics across all players and matches.

### Endpoint

```
GET /api/v1/sponsor/stats
```

### How It Works

The global sponsor statistics endpoint:

1. Collects data from all match players who have selected sponsors
2. Calculates aggregate statistics for each sponsor including usage counts, kills, deaths, assists, and win/loss records
3. Processes match outcomes to determine win/loss statistics for each sponsor
4. Caches results for 1 hour to improve performance on subsequent requests

The implementation handles large datasets efficiently by:
- Processing data in batches to avoid request size limitations
- Using efficient data structures for lookups
- Caching results to reduce database load

### Response Format

```json
{
  "success": true,
  "stats": {
    "total_players": 1683,
    "sponsors": [
      {
        "sponsor_id": "Sponsor.Lookout",
        "sponsor_name": "Ryker",
        "picks": 775,
        "total_wins": 751,
        "total_losses": 20,
        "total_draws": 0,
        "total_kills": 12495,
        "total_deaths": 12944,
        "total_assists": 3074
      },
      // More sponsors...
    ]
  }
}
```

### Statistics Explanation

- `total_players`: Total number of unique players who have used sponsors
- `sponsors`: Array of sponsor statistics
  - `sponsor_id`: Unique identifier for the sponsor
  - `sponsor_name`: Display name of the sponsor
  - `picks`: Number of times this sponsor was selected across all matches
  - `total_wins`: Total number of wins for this sponsor
  - `total_losses`: Total number of losses for this sponsor
  - `total_draws`: Total number of draws for this sponsor
  - `total_kills`: Total number of kills achieved with this sponsor
  - `total_deaths`: Total number of deaths while using this sponsor
  - `total_assists`: Total number of assists while using this sponsor

### Use Cases

This endpoint is useful for:
- Analyzing sponsor popularity and usage trends
- Identifying which sponsors perform best in matches
- Comparing kill/death ratios across different sponsors
- Tracking win rates for each sponsor

## API Documentation

Full API documentation is available at `/api/v1/swagger`

## Running the API

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The API will be available at http://localhost:3003
