import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { useAppDispatch, useAppSelector } from '../hooks/index.ts';
import { fetchActiveGameThunk, fetchGameHistoryThunk, fetchPlayerStatsThunk } from '../features/game/gameSlice.ts';
import { Card } from '../components/ui/Card.tsx';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, history, status, error } = useAppSelector((s) => s.game);

  useEffect(() => {
    dispatch(fetchPlayerStatsThunk());
    dispatch(fetchGameHistoryThunk());
    dispatch(fetchActiveGameThunk());
  }, [dispatch]);

  return (
    <div className="dashboard">
      <div className="two-column">
        <Card
          title="Your Stats"
          headerAction={
            <Button
              variant="secondary"
              loading={status === 'loading'}
              onClick={() => { dispatch(fetchPlayerStatsThunk()); dispatch(fetchGameHistoryThunk()); }}
            >
              Refresh
            </Button>
          }
        >
          {status === 'loading' && <div>Loading...</div>}
          {error && <div className="error-banner">{error}</div>}
          {stats ? (
            <div className="stats-grid" role="region" aria-label="Player statistics">
              <div className="stat-card"><span className="stat-label">Total Games</span><span className="stat-value">{stats.totalGames}</span></div>
              <div className="stat-card"><span className="stat-label">Wins</span><span className="stat-value">{stats.wins}</span></div>
              <div className="stat-card"><span className="stat-label">Losses</span><span className="stat-value">{stats.losses}</span></div>
              <div className="stat-card"><span className="stat-label">Draws</span><span className="stat-value">{stats.draws}</span></div>
              <div className="stat-card"><span className="stat-label">Surrenders</span><span className="stat-value">{stats.surrenders}</span></div>
              <div className="stat-card"><span className="stat-label">Damage Dealt</span><span className="stat-value">{stats.totalDamageDealt}</span></div>
              <div className="stat-card"><span className="stat-label">Damage Taken</span><span className="stat-value">{stats.totalDamageTaken}</span></div>
              <div className="stat-card"><span className="stat-label">Healing Done</span><span className="stat-value">{stats.totalHealing}</span></div>
              <div className="stat-card"><span className="stat-label">Avg Duration</span><span className="stat-value">{Math.round(stats.averageGameDuration)}s</span></div>
              <div className="stat-card"><span className="stat-label">Win Rate</span><span className="stat-value">{stats.winRate}%</span></div>
            </div>
          ) : (
            <div className="empty-state">No stats yet. Play a game to get started!</div>
          )}
        </Card>

        <Card
          title="Recent Games"
          headerAction={<NavLink to="/game" className="btn btn-ghost">Open Arena</NavLink>}
        >
          {history.length === 0 ? (
            <div className="empty-state">No games played yet.</div>
          ) : (
            <div className="timeline">
              {history.slice(0, 10).map((g) => {
                const id = g.id || g._id || '';
                const started = new Date(g.startedAt);
                const ended = g.endedAt ? new Date(g.endedAt) : null;
                const duration = g.duration != null ? g.duration : (ended ? Math.max(0, Math.floor((ended.getTime() - started.getTime()) / 1000)) : null);
                const actionsCount = g.actionsCount ?? (g.actions ? g.actions.length : 0);
                const status = g.status;
                const statusLabel = status === 'PLAYER_WON' ? 'Won' : status === 'PLAYER_LOST' ? 'Lost' : status === 'DRAW' ? 'Draw' : 'In Progress';
                const statusClass = status === 'PLAYER_WON' ? 'won' : status === 'PLAYER_LOST' ? 'lost' : status === 'DRAW' ? 'draw' : 'in-progress';
                return (
                  <div key={id} className="timeline-entry">
                    <div className="timeline-row">
                      <strong>Game {id.slice(-6)}</strong>
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                    </div>
                    <div className="timeline-meta">
                      <span>{started.toLocaleString()}</span>
                      {duration != null ? <span>• {Math.floor(duration / 60)}m {duration % 60}s</span> : null}
                      <span>• {actionsCount} actions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
