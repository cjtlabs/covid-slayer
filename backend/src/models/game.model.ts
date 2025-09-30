import mongoose, { Schema, Document, Model } from 'mongoose';
import { GameStatus, GameAction, ActionLog } from '../modules/game/game.types';

export type TGame = Document & {
  playerId: mongoose.Types.ObjectId;
  playerHealth: number;
  covidHealth: number;
  timer: number;
  status: (typeof GameStatus)[keyof typeof GameStatus];
  actions: ActionLog[];
  startedAt: Date;
  endedAt?: Date;
  winner?: 'player' | 'covid' | 'draw';
  createdAt: Date;
  updatedAt: Date;
}

const actionLogSchema = new Schema<ActionLog>({
  type: {
    type: String,
    enum: Object.values(GameAction),
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  playerDamage: {
    type: Number,
    min: 0
  },
  covidDamage: {
    type: Number,
    min: 0
  },
  healAmount: {
    type: Number,
    min: 0
  },
  description: String
}, { _id: false });

const gameSchema = new Schema<TGame>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Player ID is required'],
      index: true
    },
    playerHealth: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
      required: true
    },
    covidHealth: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
      required: true
    },
    timer: {
      type: Number,
      min: 0,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.IN_PROGRESS,
      required: true,
      index: true
    },
    actions: {
      type: [actionLogSchema],
      default: []
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: Date,
    winner: {
      type: String,
      enum: ['player', 'covid', 'draw']
    }
  },
  {
    timestamps: true
  }
);

gameSchema.methods.addAction = function(action: ActionLog) {
  this.actions.push(action);
  return this;
};

gameSchema.methods.endGame = function(status: (typeof GameStatus)[keyof typeof GameStatus], winner: 'player' | 'covid' | 'draw') {
  this.status = status;
  this.winner = winner;
  this.endedAt = new Date();
  return this;
};

gameSchema.statics.findActiveGames = function() {
  return this.find({ status: GameStatus.IN_PROGRESS });
};

gameSchema.statics.findByPlayer = function(playerId: string) {
  return this.find({ playerId }).sort({ createdAt: -1 });
};

gameSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(
        this.playerId,
        { $push: { gameHistory: this._id } }
      );
    } catch (error) {
      console.error('Error updating player game history:', error);
    }
  }
  next();
});

export const Game: Model<TGame> = mongoose.model<TGame>('Game', gameSchema);
