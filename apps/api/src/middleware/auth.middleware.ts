import { DrizzleSessionRepository } from '@pranakaia/identity';
import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  sessionId?: string;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Missing authorization' },
      });
      return;
    }

    const token = authHeader.substring(7);

    const sessionRepository = container.resolve(DrizzleSessionRepository);
    const sessionResult = await sessionRepository.findByToken(token);

    if (!sessionResult.success || !sessionResult.value) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Invalid session' },
      });
      return;
    }

    const session = sessionResult.value;

    if (session.isRevoked() || session.isExpired()) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Session expired' },
      });
      return;
    }

    req.user = {
      id: session.userId,
      email: '', // Could be fetched from user repository
      name: '',
    };
    req.sessionId = session.id;

    next();
  } catch (error) {
    next(error);
  }
}
