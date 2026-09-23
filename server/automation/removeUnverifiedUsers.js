import cron from "node-cron";
import User from "../models/userModel.js";

export const removeUnverifiedAccounts = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      await User.deleteMany({
        verified: false,
        createdAt: { $lt: tenMinutesAgo },
      });
    } catch (err) {
      console.warn("[NODE-CRON] removeUnverifiedAccounts error (non-fatal):", err.message);
    }
  });
};