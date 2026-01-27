import { Inngest } from "inngest";
import connectDB from "../lib/db.js";
import User from "../model/User.js";

export const inngest = new Inngest({ id: "interviewly" });

/* =========================
   CREATE USER
========================= */
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    await User.create(newUser);
  },
);

/* =========================
   UPDATE USER
========================= */
const updateUserInDB = inngest.createFunction(
  { id: "update-user-in-db" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const updatedData = {
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    };

    const user = await User.findOneAndUpdate({ clerkId: id }, updatedData, {
      new: true,
    });

    if (!user) {
      console.warn("⚠️ User not found for update:", id);
      return;
    }
  },
);

/* =========================
   DELETE USER
========================= */
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
  },
);

/* =========================
   EXPORT ALL FUNCTIONS
========================= */
export const functions = [syncUser, updateUserInDB, deleteUserFromDB];
