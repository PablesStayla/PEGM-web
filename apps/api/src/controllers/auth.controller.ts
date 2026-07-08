import {
  SignInCommand,
  SignInHandler,
  SignOutCommand,
  SignOutHandler,
  SignUpCommand,
  SignUpHandler,
} from '@pranakaia/identity';
import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
  };
  sessionId?: string;
};

export class AuthController {
  private signInHandler: SignInHandler;
  private signUpHandler: SignUpHandler;
  private signOutHandler: SignOutHandler;

  constructor() {
    this.signInHandler = container.resolve(SignInHandler);
    this.signUpHandler = container.resolve(SignUpHandler);
    this.signOutHandler = container.resolve(SignOutHandler);
  }

  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Email, password and name are required' },
        });
        return;
      }

      const commandResult = SignUpCommand.create({
        email,
        password,
        confirmPassword: password,
        firstName: name,
      });

      if (commandResult.isFailure) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: commandResult.errorValue.message },
        });
        return;
      }

      const result = await this.signUpHandler.execute(commandResult.getValue());

      if (result.isFailure) {
        const error = result.errorValue;
        const code = error && 'code' in error ? String(error.code) : 'SIGN_UP_FAILED';
        const message = error.message;

        if (code === 'USER_ALREADY_EXISTS') {
          res.status(409).json({
            success: false,
            error: { code, message },
          });
          return;
        }

        res.status(400).json({
          success: false,
          error: { code, message },
        });
        return;
      }

      const data = result.getValue();
      res.status(201).json({
        success: true,
        data: {
          userId: data.userId,
          email: data.email,
          requiresEmailVerification: data.requiresEmailVerification,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
        });
        return;
      }

      const commandResult = SignInCommand.create({
        email,
        password,
        rememberMe: false,
        ipAddress,
        userAgent,
      });

      if (commandResult.isFailure) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: commandResult.errorValue.message },
        });
        return;
      }

      const result = await this.signInHandler.execute(commandResult.getValue());

      if (result.isFailure) {
        const error = result.errorValue;
        const code = error && 'code' in error ? String(error.code) : 'SIGN_IN_FAILED';
        const message = error.message;

        if (code === 'USER_NOT_FOUND' || code === 'INVALID_CREDENTIALS') {
          res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
          });
          return;
        }

        if (code === 'RATE_LIMITED') {
          res.status(429).json({
            success: false,
            error: { code, message },
          });
          return;
        }

        res.status(400).json({
          success: false,
          error: { code, message },
        });
        return;
      }

      const data = result.getValue();
      if (data.status === '2FA_REQUIRED') {
        res.status(200).json({
          success: true,
          data: {
            status: '2FA_REQUIRED',
            tempToken: data.tempToken,
          },
        });
        return;
      }

      const session = data.session;
      if (!session) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTHENTICATION_FAILED', message: 'Session could not be established' },
        });
        return;
      }

      const primitives = session.toPrimitives();
      res.status(200).json({
        success: true,
        data: {
          token: primitives.id,
          userId: primitives.userId,
          expiresAt: primitives.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  signOut = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = req.sessionId; // Set by auth middleware

      if (!sessionId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' },
        });
        return;
      }

      const commandResult = SignOutCommand.create({ sessionId });
      if (commandResult.isFailure) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: commandResult.errorValue.message },
        });
        return;
      }

      const result = await this.signOutHandler.execute(commandResult.getValue());

      if (result.isFailure) {
        const error = result.errorValue;
        const code = error && 'code' in error ? String(error.code) : 'SIGN_OUT_FAILED';
        const message = error.message;

        res.status(400).json({
          success: false,
          error: { code, message },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { message: 'Signed out successfully' },
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          userId: req.user.id,
          email: req.user.email,
          name: req.user.name,
          isEmailVerified: req.user.isEmailVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
