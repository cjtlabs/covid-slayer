import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/index.ts';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { GAME_ACTIONS } from '../types/game.ts';
import { fetchActiveGameThunk, performActionThunk, startGameThunk, tickTimerThunk } from '../features/game/gameSlice.ts';
import { characters } from '../features/game/characters.ts';

export function GamePage() {
  const dispatch = useAppDispatch();
  const { activeGame, logs, status, playerCharacter, enemyCharacter, lastResult } = useAppSelector((s) => s.game);

  useEffect(() => {
    dispatch(fetchActiveGameThunk());
  }, [dispatch]);

  const playerHealth = activeGame?.playerHealth ?? 0;
  const covidHealth = activeGame?.covidHealth ?? 0;
  const gameId = activeGame?.id || activeGame?._id || '';
  const isGameOver = activeGame?.status !== 'IN_PROGRESS';

  const [displayTimer, setDisplayTimer] = useState<number>(activeGame?.timer ?? 60);

  useEffect(() => {
    setDisplayTimer(activeGame?.timer ?? 60);
  }, [activeGame?.id, activeGame?.timer, activeGame?.status]);

  useEffect(() => {
    if (!activeGame || isGameOver || !gameId) return;
    const interval = setInterval(() => {
      dispatch(tickTimerThunk({ gameId }));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch, activeGame?.id, isGameOver, gameId]);

  const leftChar = characters[playerCharacter];
  const rightChar = characters[enemyCharacter];

  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);
  type Floater = { id: number; value: string; type: 'damage' | 'heal'; side: 'left' | 'right' };
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    if (!lastResult) return;
    const a = lastResult.lastAction;
    let next: Floater[] = [];
    const idBase = Date.now();
    if (typeof a.playerDamage === 'number' && a.playerDamage > 0) {
      setShakeLeft(true);
      next.push({ id: idBase + 1, value: `-${a.playerDamage}`, type: 'damage', side: 'left' });
    }
    if (typeof a.covidDamage === 'number' && a.covidDamage > 0) {
      setShakeRight(true);
      next.push({ id: idBase + 2, value: `-${a.covidDamage}`, type: 'damage', side: 'right' });
    }
    if (a.healAmount && a.healAmount > 0) {
      next.push({ id: idBase + 3, value: `+${a.healAmount}`, type: 'heal', side: 'left' });
    }
    if (next.length) {
      setFloaters((prev) => [...prev, ...next]);
      const t = setTimeout(() => {
        setFloaters((prev) => prev.filter((f) => !next.some((n) => n.id === f.id)));
        setShakeLeft(false);
        setShakeRight(false);
      }, 950);
      return () => clearTimeout(t);
    }
  }, [lastResult]);

  return (
    <div className="game-panels">
      <div className="tekken-layout">
        <Card title="Battlefield">
          <div className="tekken-stage-container">
            <div className="tekken-hud" role="region" aria-label="Battle HUD">
              <div className="hud-side left">
                <div className="hud-name">{leftChar.name}</div>
                <div className="hud-health">
                  <div className="hud-health-fill" style={{ width: `${playerHealth}%` }} />
                  <div className="hud-health-label left">{playerHealth}%</div>
                </div>
              </div>
              <div className="hud-center">
                <div className="hud-timer">{displayTimer}</div>
                <div className={`hud-status ${isGameOver ? 'visible' : ''}`}>{isGameOver ? (activeGame?.winner === 'player' ? 'K.O.' : activeGame?.winner === 'covid' ? 'K.O.' : 'DRAW') : ''}</div>
              </div>
              <div className="hud-side right">
                <div className="hud-name">{rightChar.name}</div>
                <div className="hud-health">
                  <div className="hud-health-fill enemy" style={{ width: `${covidHealth}%` }} />
                  <div className="hud-health-label right">{covidHealth}%</div>
                </div>
              </div>
            </div>

            <div className="tekken-stage">
              <img className={`fighter-sprite left ${shakeLeft ? 'shake' : ''}`} src={leftChar.sprite} alt={leftChar.name} />
              <img className={`fighter-sprite right ${shakeRight ? 'shake' : ''}`} src={rightChar.sprite} alt={rightChar.name} />
              {floaters.map((f) => (
                <div
                  key={f.id}
                  className={`float-number ${f.type}`}
                  style={{
                    left: f.side === 'left' ? '18%' : 'auto',
                    right: f.side === 'right' ? '18%' : 'auto',
                    bottom: '150px',
                  }}
                >
                  {f.value}
                </div>
              ))}
            </div>

            <div className="tekken-toolbar">
              {!activeGame ? (
                <Button variant="primary" onClick={() => dispatch(startGameThunk())} loading={status === 'loading'}>
                  Start Game
                </Button>
              ) : (
                <div className="game-actions">
                  {isGameOver ? (
                    <Button variant="primary" onClick={() => dispatch(startGameThunk())}>Start New Game</Button>
                  ) : (
                    <>
                      <Button onClick={() => dispatch(performActionThunk({ gameId, action: GAME_ACTIONS.ATTACK }))}>Attack</Button>
                      <Button onClick={() => dispatch(performActionThunk({ gameId, action: GAME_ACTIONS.POWER_ATTACK }))}>Blast</Button>
                      <Button onClick={() => dispatch(performActionThunk({ gameId, action: GAME_ACTIONS.HEAL }))}>Heal</Button>
                      <Button variant="danger" onClick={() => dispatch(performActionThunk({ gameId, action: GAME_ACTIONS.SURRENDER }))}>Give Up</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Commentary" className="commentary-card">
          <div className="game-log" role="log" aria-live="polite">
            {logs.length === 0 ? (
              <div className="muted">No events yet...</div>
            ) : (
              logs.slice(0, 12).map((l, idx) => (
                <div key={idx} className="game-log-entry">
                  <strong>{l.type}</strong>
                  <div>{l.description}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
