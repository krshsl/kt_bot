import { parse } from "csv-parse";
import { StatusCodes } from "http-status-codes";
import { PassThrough } from "stream";

import db from "../config/db";
import { OrgUser } from "../entities/org_user";
import { Organization } from "../entities/organization";
import { Phone } from "../entities/phone";
import * as schema from "../schemas/user";
import { ApiError } from "../utils/error";
import { chunk } from "../utils/lib";
import { email } from "zod";

export const create = async (buffer: Buffer, id: string, upsert: boolean) => {
  const organization = await db.getRepository(Organization).findOne({
    where: {
      id,
    },
  });

  if (!organization)
    throw new ApiError(StatusCodes.NOT_FOUND, "Organization not found");

  type UserRow = {
    update: boolean;
    email: string;
    name: string;
    phone: string;
    id?: string;
  };
  const users: UserRow[] = [];
  const org_id = organization.id;
  const bufferStream = new PassThrough();
  bufferStream.end(buffer);
  await new Promise<void>((resolve, reject) => {
    bufferStream
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }),
      )
      .on("data", (data) => {
        const result = schema.user.safeParse(data);
        if (result.error || !result.success || !result.data) {
          bufferStream.destroy();
          return reject(result.error);
        }
        users.push({ update: false, ...result.data });
      })
      .on("end", resolve)
      .on("error", (err) => {
        console.error("Error occurred while parsing new users", err);
        reject(
          new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while parsing",
          ),
        );
      });
  });

  try {
    return await db.transaction(async (manager) => {
      for (const userChunk of chunk(users, 1000)) {
        const chunkMap = new Map(userChunk.map((r) => [r.email, r]));
        const userInsert = manager
          .createQueryBuilder()
          .insert()
          .into(OrgUser)
          .values(
            userChunk.map(({ email, name }) => ({ email, name, org_id })),
          );
        if (upsert) userInsert.orUpdate(["name"], ["email", "org_id"]);
        else userInsert.orIgnore();
        const result = await userInsert.returning(["id", "email"]).execute();
        ((result.raw ?? []) as Pick<OrgUser, "id" | "email">[])
          .filter(({ id, email }) => id && email)
          .forEach(({ id, email }) => {
            const row = chunkMap.get(email);
            if (row) {
              row.id = id;
              row.update = true;
            }
          });
      }

      for (const userChunk of chunk(users, 1000)) {
        const chunkMap = new Map(userChunk.map((r) => [r.phone, r]));
        const phoneInsert = manager
          .createQueryBuilder()
          .insert()
          .into(Phone)
          .values(
            userChunk
              .filter(({ id }) => id)
              .map(({ id, phone }) => ({ phone, user_id: id!, org_id })),
          );
        if (upsert) phoneInsert.orUpdate(["phone"], ["user_id", "org_id"]);
        else phoneInsert.orIgnore();
        const result = await phoneInsert.returning(["phone"]).execute();
        ((result.raw ?? []) as Pick<Phone, "phone">[])
          .filter(({ phone }) => phone)
          .forEach(({ phone }) => {
            const row = chunkMap.get(phone);
            if (row) {
              row.update = true;
            }
          });
      }

      const count = users.reduce(
        (acc, { update }) => acc + (update ? 1 : 0),
        0,
      );
      return count;
    });
  } catch (err) {
    console.error("Error occurred while adding new users", err);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error while adding");
  }
};

export const getUsers = async (org_id: string, page: number, limit: number) => {
  const [result, total] = await db.getRepository(OrgUser).findAndCount({
    where: {
      org_id,
    },
    skip: page - 1,
    take: limit,
  });

  return {
    users: result,
    total: total,
  };
};

export const getUser = async (id: string) => {
  const user = await db.getRepository(OrgUser).findOne({
    where: {
      id,
    },
  });

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

export const remove = async (id: string) => {
  // ideally we wanna remove linq chat history as well at this point....
  await db.getRepository(OrgUser).delete({
    id,
  });
};
