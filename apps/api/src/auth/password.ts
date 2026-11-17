import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const keyLength = 64;
const saltLength = 16;
const cost = 16_384;
const blockSize = 8;
const parallelisation = 1;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLength);
  const derivedKey = await deriveKey(password, salt);

  return [
    "scrypt",
    cost,
    blockSize,
    parallelisation,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, storedCost, storedBlockSize, storedParallelisation, saltHex, keyHex, ...rest] =
    passwordHash.split("$");

  if (
    algorithm !== "scrypt" ||
    storedCost !== String(cost) ||
    storedBlockSize !== String(blockSize) ||
    storedParallelisation !== String(parallelisation) ||
    !saltHex ||
    !/^[\da-f]{32}$/i.test(saltHex) ||
    !keyHex ||
    !/^[\da-f]{128}$/i.test(keyHex) ||
    rest.length > 0
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await deriveKey(password, salt);

  return timingSafeEqual(storedKey, derivedKey);
}
