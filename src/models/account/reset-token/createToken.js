import uuid from "uuid/v4";
import Boom from "boom";
import moment from "moment";
import { errors } from "core/conceptions/model";
import * as userModel from "models/account/user";

export default async (email, db) => {
  const token = uuid();
  const user = await userModel.readByEmail(email, db);

  if (!user) {
    throw new errors.NotFoundError("User with given email is not found");
    // throw EmailNotFound();
  }

  await db
    .insert({
      user_id: user.id,
      token,
      expired: moment().add(30, "minutes")
    })
    .into("password_reset_tokens");

  /**
   * Sending email
   */
  console.log(token);

  return;
};

// export class EmailNotFound {}
