import { 
  fetchTournament, 
  updateTournament, 
  addMatch, 
  updateMatch, 
  deleteMatch, 
  resetTournamentData,
  createDefaultMatch
} from './tournament.data';
import { TournamentData, MatchStats } from './tournament.types';
import { isAdminAuthenticated, authenticateAdmin, logoutAdmin } from './admin';

/**
 * API handler for tournament-related operations
 * @param req Request object
 * @param res Response object
 */
export async function handleTournamentApi(req: any, res: any): Promise<void> {
  const { method, query, body } = req;
  const tournamentId = query.id || 'default';

  try {
    // GET requests - fetch data
    if (method === 'GET') {
      const result = await fetchTournament(tournamentId);
      
      if (result.success && result.data) {
        res.status(200).json(result.data);
      } else {
        res.status(404).json({ error: result.error || 'Tournament not found' });
      }
      return;
    }
    
    // Check authentication for all non-GET requests
    if (!isAdminAuthenticated()) {
      res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
      return;
    }
    
    // POST requests - create or update
    if (method === 'POST') {
      const action = query.action;
      
      // Handle different actions
      switch (action) {
        case 'update': {
          // Update tournament data
          const data = body as TournamentData;
          const result = await updateTournament(tournamentId, data);
          
          if (result.success && result.data) {
            res.status(200).json(result.data);
          } else {
            res.status(400).json({ error: result.error || 'Failed to update tournament' });
          }
          break;
        }
        
        case 'add-match': {
          // Add a new match
          const match = body as MatchStats;
          const result = await addMatch(tournamentId, match);
          
          if (result.success && result.data) {
            res.status(201).json(result.data);
          } else {
            res.status(400).json({ error: result.error || 'Failed to add match' });
          }
          break;
        }
        
        case 'update-match': {
          // Update an existing match
          const { matchId, match } = body;
          
          if (!matchId || !match) {
            res.status(400).json({ error: 'Missing matchId or match data' });
            return;
          }
          
          const result = await updateMatch(tournamentId, matchId, match);
          
          if (result.success && result.data) {
            res.status(200).json(result.data);
          } else {
            res.status(400).json({ error: result.error || 'Failed to update match' });
          }
          break;
        }
        
        case 'delete-match': {
          // Delete a match
          const { matchId } = body;
          
          if (!matchId) {
            res.status(400).json({ error: 'Missing matchId' });
            return;
          }
          
          const result = await deleteMatch(tournamentId, matchId);
          
          if (result.success && result.data) {
            res.status(200).json(result.data);
          } else {
            res.status(400).json({ error: result.error || 'Failed to delete match' });
          }
          break;
        }
        
        case 'reset': {
          // Reset tournament data to default
          const result = await resetTournamentData(tournamentId);
          
          if (result.success && result.data) {
            res.status(200).json(result.data);
          } else {
            res.status(400).json({ error: result.error || 'Failed to reset tournament data' });
          }
          break;
        }
        
        case 'create-match': {
          // Create a new default match
          const { round } = body;
          
          if (!round) {
            res.status(400).json({ error: 'Missing round information' });
            return;
          }
          
          const matchId = `match_${Date.now()}`;
          const newMatch = createDefaultMatch(matchId, round);
          const result = await addMatch(tournamentId, newMatch);
          
          if (result.success && result.data) {
            res.status(201).json({ 
              tournament: result.data,
              newMatch
            });
          } else {
            res.status(400).json({ error: result.error || 'Failed to create match' });
          }
          break;
        }
        
        case 'auth': {
          // Authenticate admin
          const { password } = body;
          
          if (!password) {
            res.status(400).json({ error: 'Missing password' });
            return;
          }
          
          const authResult = authenticateAdmin(password);
          
          if (authResult.success) {
            res.status(200).json({ message: authResult.message });
          } else {
            res.status(401).json({ error: authResult.message });
          }
          break;
        }
        
        case 'logout': {
          // Logout admin
          const logoutResult = logoutAdmin();
          
          if (logoutResult.success) {
            res.status(200).json({ message: logoutResult.message });
          } else {
            res.status(500).json({ error: logoutResult.message });
          }
          break;
        }
        
        default:
          res.status(400).json({ error: 'Invalid action' });
      }
      
      return;
    }
    
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error handling tournament API request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 