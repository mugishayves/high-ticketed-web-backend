import Token from "../models/Token";
import config from "../../config/config";
import * as crypto from "crypto";
import bcrypt from "bcryptjs";
import { Account, User } from "../models";
import APIError from "./APIError";
import status from "http-status";
import { TokenType } from "../interfaces/Token";

export async function generateAppToken(
  email: string,
  tokenType: TokenType
): Promise<string> {
  const user = await Account.findOne({ email });

  if (!user) {
    throw new APIError(status.BAD_REQUEST, `Account does not exist`);
  }

  const existingToken = await Token.findOne({ email, type: tokenType });

  if (existingToken) await existingToken.deleteOne();

  const token = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedToken = bcrypt.hashSync(token, config.BCRYPT_SALT);

  const newToken = new Token({ email, token: hashedToken, type: tokenType });
  newToken.save();

  return token;
}

export async function generateVerificationCode(email: string): Promise<string> {
  const user = await Account.findOne({ email });

  if (!user) {
    throw new APIError(status.BAD_REQUEST, `Account does not exist`);
  }

  const existingToken = await Token.findOne({ email, type: "VERIFY_EMAIL" });

  if (existingToken) await existingToken.deleteOne();

  const token = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedToken = bcrypt.hashSync(token, config.BCRYPT_SALT);

  const newToken = new Token({
    email,
    token: hashedToken,
    type: "VERIFY_EMAIL",
  });
  newToken.save();

  return token;
}

export async function verifyAppToken(
  email: string,
  token: string,
  type: TokenType
): Promise<string | null> {
  const tokenData = await Token.findOne({ email, type }).exec();

  if (tokenData) {
    try {
      const isValidToken = await bcrypt.compare(token, tokenData.token);

      if (isValidToken) {
        await Token.findByIdAndDelete(tokenData.id);
        return token;
      }
      return null;
    } catch (error) {
      await Token.findByIdAndDelete(tokenData.id);
      return null;
    }
  }

  return null; // Token not found or already used
}
