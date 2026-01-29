import { Inngest } from "inngest";
import connectDB from "./db.js";
import User from "../model/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

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

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
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
    await User.deleteOne({ clerkId: id });
    await deleteStreamUser(id.toString());
  },
);

/* =========================
   EXPORT ALL FUNCTIONS
========================= */
export const functions = [syncUser, updateUserInDB, deleteUserFromDB];
