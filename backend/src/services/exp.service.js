import { User } from "../models/user.model.js";

/* =================================
EXP REQUIRED FOR NEXT LEVEL
================================= */

export const expRequired = (level) => {
  return Math.floor(300 * Math.pow(level, 1.6));
};


/* =================================
GRANT EXP TO USER
================================= */

export const grantExp = async (userId, baseExp, updateStreak = false) => {

  if (baseExp <= 0) {
    throw new Error("Invalid EXP value");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  let streak = user.currentStreak;

  /* =========================
     STREAK LOGIC
  ========================= */

  if (updateStreak) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActionDate) {

      const last = new Date(user.lastActionDate);
      last.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - last) / 86400000);

      if (diffDays === 1) {
        streak += 1;
      } 
      else if (diffDays > 1) {
        streak = 1;
      }

      if (diffDays !== 0) {
        user.currentStreak = streak;
        user.lastActionDate = today;
      }

    } else {

      streak = 1;
      user.currentStreak = 1;
      user.lastActionDate = today;

    }

  }

  /* =========================
     EXP MULTIPLIER
  ========================= */

  const multiplier = 1 + Math.min(streak * 0.05, 1);
  const gainedExp = Math.floor(baseExp * multiplier);

  user.exp += gainedExp;
  user.totalExp += gainedExp;

  /* =========================
     LEVEL UP SYSTEM
  ========================= */

  let required = expRequired(user.level);

  while (user.level < 100 && user.exp >= required) {

    user.exp -= required;
    user.level += 1;

    required = expRequired(user.level);

  }

  await user.save();

  return {
    gainedExp,
    level: user.level,
    exp: user.exp,
    streak: user.currentStreak
  };
};