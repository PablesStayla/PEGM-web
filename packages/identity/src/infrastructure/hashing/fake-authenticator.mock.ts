import { Result } from '@pranakaia/shared-kernel';
import type {
  AuthenticationResult,
  Authenticator,
} from '../../domain/credentials/authenticator.port';

export class FakeAuthenticator implements Authenticator {
  private hashes: Map<string, string> = new Map();
  private userPasswords: Map<string, string> = new Map();
  private shouldRequire2FA = false;

  // Mock configuration for tests
  setRequires2FA(value: boolean): void {
    this.shouldRequire2FA = value;
  }

  setUserPassword(userId: string, password: string): void {
    this.userPasswords.set(userId, password);
  }

  async authenticate(
    userId: string,
    password: string,
  ): Promise<Result<AuthenticationResult, Error>> {
    const storedPassword = this.userPasswords.get(userId);

    if (storedPassword === password) {
      return Result.ok({
        success: true,
        requires2FA: this.shouldRequire2FA,
      });
    }

    return Result.err(new Error('Invalid credentials'));
  }

  async verify2FA(_userId: string, token: string): Promise<Result<boolean, Error>> {
    if (token === '123456') {
      return Result.ok(true);
    }
    return Result.ok(false);
  }

  async hashPassword(password: string): Promise<Result<string, Error>> {
    const hash = `hashed_${password}`;
    this.hashes.set(hash, password);
    return Result.ok(hash);
  }

  async verifyPassword(password: string, hash: string): Promise<Result<boolean, Error>> {
    const original = this.hashes.get(hash);
    return Result.ok(original === password);
  }
}
