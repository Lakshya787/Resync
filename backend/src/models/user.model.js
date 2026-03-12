import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"]
  },

  password: {
    type: String,
    required: true
  },

  fullname: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: ""
  },

  lastLogin: {
    type: Date,
    default: Date.now
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },

  exp: {
    type: Number,
    default: 0,
    min: 0
  },

  totalExp: {
    type: Number,
    default: 0,
    min: 0
  },

  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  education: {
  type: String,
  trim: true,
  maxlength: 100,
  default: ""
},

  lastActionDate: {
    type: Date,
    default: null
  },

  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,

  verificationToken: {
    type: String,
    index: true
  },

  verificationTokenExpiresAt: Date
},
{ timestamps: true }
);

/* password hashing */

/* password hashing */

userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

/* password comparison */

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);