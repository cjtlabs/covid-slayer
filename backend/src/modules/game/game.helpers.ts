import { Game, TGame } from "../../models/game.model";
import { GameStatus, Winner } from "./game.types";

export async function checkGameEnd(game: TGame): Promise<{ status: (typeof GameStatus)[keyof typeof GameStatus]; winner: Winner }> {
  if (game.playerHealth <= 0) {
    return { status: GameStatus.PLAYER_LOST, winner: 'covid' };
  }

  if (game.covidHealth <= 0) {
    return { status: GameStatus.PLAYER_WON, winner: 'player' };
  }

  if (game.timer <= 0) {
    if (game.playerHealth > game.covidHealth) {
      return { status: GameStatus.PLAYER_WON, winner: 'player' };
    } else if (game.covidHealth > game.playerHealth) {
      return { status: GameStatus.PLAYER_LOST, winner: 'covid' };
    } else {
      return { status: GameStatus.DRAW, winner: 'draw' };
    }
  }

  return { status: GameStatus.IN_PROGRESS, winner: 'draw' };
};

export async function getPlayerGameHistory(playerId: string): Promise<TGame[]> {
  return Game.find({ playerId }).sort({ createdAt: -1 });
}