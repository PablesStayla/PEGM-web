/**
 * SignIn Controller
 *
 * HTTP interface for sign-in use case.
 * Maps HTTP requests/responses to/from application layer.
 */

import { Result } from '@pranakaia/shared-kernel';
import { SignInCommand } from '../application/commands/sign-in/sign-in.command';
import type { SignInResult, SignInUseCase } from '../application/commands/sign-in/sign-in.use-case';

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  success: boolean;
  data?: {
    userId?: string;
    sessionId?: string;
    requires2FA?: boolean;
    tempToken?: string;
  };
  error?: string;
}

export class SignInController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  async execute(
    request: SignInRequest,
    context?: { ip?: string; userAgent?: string },
  ): Promise<SignInResponse> {
    // Create command
    const commandResult = SignInCommand.create({
      email: request.email,
      password: request.password,
      rememberMe: request.rememberMe ?? false,
      ipAddress: context?.ip,
      userAgent: context?.userAgent,
    });

    if (commandResult.isFailure) {
      return {
        success: false,
        error: commandResult.errorValue.message,
      };
    }

    // Execute use case
    const result = await this.signInUseCase.execute(commandResult.getValue());

    return Result.match<SignInResult, Error, SignInResponse>(result, {
      ok: (data) => {
        const session = data.session;
        const responseData: NonNullable<SignInResponse['data']> = {
          requires2FA: data.status === '2FA_REQUIRED',
          ...(session?.userId !== undefined ? { userId: session.userId } : {}),
          ...(session?.id !== undefined ? { sessionId: session.id } : {}),
          ...(data.tempToken !== undefined ? { tempToken: data.tempToken } : {}),
        };
        return {
          success: true,
          data: responseData,
        };
      },
      err: (error) => ({
        success: false,
        error: error.message,
      }),
    });
  }
}

// Next.js API Route Handler
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as SignInRequest;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Note: In production, inject dependencies via DI container
  // This is a placeholder to satisfy type-check
  const controller = new SignInController(null as unknown as SignInUseCase);
  const response = await controller.execute(body, { ip, userAgent });

  return Response.json(response, {
    status: response.success ? 200 : 400,
  });
}
