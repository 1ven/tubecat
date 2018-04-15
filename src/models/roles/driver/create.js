import Boom from "boom";
import * as userModel from "models/account/user";
import { prop, pick } from "ramda";
import readByUserId from "./readByUserId";

export default async (
  { first_name, last_name, photo, price, parcel_types },
  userId,
  db
) => {
  const { role } = await userModel.readById(userId, db);

  if (role !== "driver") {
    throw Boom.forbidden("User should have a driver role");
  }

  if (await readByUserId(userId, db)) {
    throw Boom.conflict("User is already having a driver");
  }

  const driver = (await db
    .insert({ first_name, last_name, photo, price, user_id: userId })
    .into("drivers")
    .returning("*"))[0];

  const parcelTypes = await db
    .insert(parcel_types.map(p => ({ driver_id: driver.id, parcel_type: p })))
    .into("drivers_parcel_types")
    .returning("*");

  return {
    ...pick(["id", "first_name", "last_name", "photo", "price"], driver),
    parcel_types: parcelTypes.map(prop("parcel_type"))
  };
};
