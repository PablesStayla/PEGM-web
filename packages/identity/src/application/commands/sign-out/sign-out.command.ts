import { Result } from '@pranakaia/shared-kernel';
import { SessionId } from '../../../domain/session/session-id.vo';

export interface SignOutCommand {
  sessionId: SessionId;
  revokeAllSessions?: boolean | undefined;
}

export const SignOutCommand = {
  create: (props: {
    sessionId: string;
    revokeAllSessions?: boolean | undefined;
  }): Result<SignOutCommand, Error> => {
    const sessionIdResult = SessionId.create(props.sessionId);
    if (sessionIdResult.isFailure) {
      return Result.err(sessionIdResult.errorValue as Error);
    }

    const command: SignOutCommand = {
      sessionId: sessionIdResult.getValue(),
      revokeAllSessions: props.revokeAllSessions ?? false,
    };

    return Result.ok(command);
  },
};
