import argon2 from 'argon2';
import { injectable } from 'tsyringe';
import type { IPasswordHasher } from '../../domain/user/ports/password-hasher.port';

@injectable()
export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
