import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export type TUser = Document & {
  fullname: string;
  email: string;
  password: string;
  avatar: string;
  gameHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hashPassword(): Promise<void>;
}

const userSchema = new Schema<TUser>(
  {
    fullname: {
      type: String,
      required: [true, 'Fullname is required'],
      trim: true,
      minlength: [2, 'Fullname must be at least 2 characters'],
      maxlength: [100, 'Fullname must not exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
      type: String,
      default: function() {
        // Generate a default avatar URL using the user's email
        const emailHash = this.email ? 
          this.email.toLowerCase().trim() : 
          Math.random().toString(36).substring(7);
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailHash}`;
      }
    },
    gameHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'Game'
    }]
  },
  {
    timestamps: true
  }
);

userSchema.index({ createdAt: -1 });

userSchema.pre<TUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.hashPassword = async function() {
  if (!this.isModified || this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
};

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User: Model<TUser> = mongoose.model<TUser>('User', userSchema);
