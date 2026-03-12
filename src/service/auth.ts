import { User } from "@supabase/supabase-js";
import { StatusCodes } from "http-status-codes";

import db from "../config/db";
import supabase from "../config/supabase";
import { Organization } from "../entities/organization";
import { Phone } from "../entities/phone";
import { Profile } from "../entities/profile";
import { SignUp } from "../schemas/auth";
import { SignIn } from "../schemas/auth";
import { ApiError } from "../utils/error";

export const signUp = async ({
  email,
  password,
  name,
  organization,
  phone,
}: SignUp) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new ApiError(StatusCodes.UNAUTHORIZED, error.message);
  if (!data.user)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "User cannot be created",
    );

  const isExistingUser = data.user?.identities?.length === 0;
  if (isExistingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already in use");
  }

  const id = data.user.id;
  if (!id)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "User creation failed",
    );

  try {
    await db.transaction(async (manager) => {
      const orgE = manager.create(Organization, { name: organization });
      await manager.save(orgE);
      const org_id = orgE.id;

      let phoneE = await manager.findOne(Phone, {
        where: { phone, org_id },
      });
      if (!phoneE) {
        phoneE = manager.create(Phone, { phone, org_id });
        await manager.save(phoneE);
      }

      const profileE = manager.create(Profile, { id, name, org_id });
      await manager.save(profileE);
    });
  } catch (err) {
    console.error(`User creation failed: ${email}`, err);
    await supabase.auth.admin.deleteUser(id);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "User creation failed",
    );
  }
};

export const signIn = async ({ email, password }: SignIn) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new ApiError(StatusCodes.NOT_FOUND, error.message);
  if (!data.session || !data.user)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized user");

  const me = await getMe(data.user);
  return {
    session: data.session,
    ...me,
  };
};

export const refresh = async (token: string) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: token,
  });

  if (error) throw new ApiError(StatusCodes.NOT_FOUND, error.message);
  if (!data.session || !data.user)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized user");

  const me = await getMe(data.user);
  return {
    session: data.session,
    ...me,
  };
};

export const getMe = async (user: User) => {
  const profile = await getProfile(user.id);

  return {
    user: {
      email: user.email!,
      ...profile,
    },
  };
};

export const getProfile = async (id: string) => {
  const profile = await db.getRepository(Profile).findOne({
    where: { id: id },
    relations: ["organization"],
  });
  if (!profile) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  return {
    id: profile.id,
    name: profile.name,
    organization: profile.organization,
  };
};

export const signOut = async (token: string) => {
  const { error } = await supabase.auth.admin.signOut(token);
  console.error("Error signing out user", error);
};
