import { parse } from "csv-parse";
import { StatusCodes } from "http-status-codes";
import { PassThrough } from "stream";

import db from "../config/db";
import { OrgUser } from "../entities/org_user";
import { Organization } from "../entities/organization";
import * as schema from "../schemas/user";
import { ApiError } from "../utils/error";
import { chunk } from "../utils/lib";
import { Phone } from "../entities/phone";

export const create = async (buffer: Buffer, id: string) => {
  const organization = await db.getRepository(Organization).findOne({
    where: {
      id,
    },
  });

  if (!organization)
    throw new ApiError(StatusCodes.NOT_FOUND, "Organization not found");

  type UserRow = {
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
        users.push({ ...result.data });
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
      let count = 0;
      for (const userChunk of chunk(users, 1000)) {
        const chunkMap = new Map(userChunk.map((r) => [r.email, r]));
        const result = await manager
          .createQueryBuilder()
          .insert()
          .into(OrgUser)
          .values(userChunk.map(({ email, name }) => ({ email, name, org_id })))
          .orUpdate(["name"], ["email", "org_id"])
          .returning(["id", "email"])
          .execute();
        result.raw.forEach(({ id, email }: { id: string; email: string }) => {
          const row = chunkMap.get(email);
          if (row) row.id = id;
        });
        count += result.identifiers.length;
      }

      for (const userChunk of chunk(users, 1000)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Phone)
          .values(
            userChunk.map(({ id, phone }) => ({ phone, user_id: id!, org_id })),
          )
          .orUpdate(["phone"], ["user_id", "org_id"])
          .execute();
      }
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
