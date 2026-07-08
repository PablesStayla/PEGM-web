import { Result } from '@pranakaia/shared-kernel';
import { Email } from '../../../domain/user/email.vo';

/**
 * SignIn Command - DTO para el caso de uso
 * Contiene solo datos, sin lógica
 */
export interface SignInCommand {
  email: Email;
  password: string; // Plain text, validated by VO
  rememberMe: boolean;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export const SignInCommand = {
  create: (props: {
    email: string;
    password: string;
    rememberMe?: boolean;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
  }): Result<SignInCommand, Error> => {
    const emailResult = Email.create(props.email);

    if (emailResult.isFailure) {
      return Result.err(emailResult.errorValue as Error);
    }

    if (!props.password || props.password.length < 8) {
      return Result.err(new Error('Password must be at least 8 characters'));
    }

    return Result.ok({
      email: emailResult.getValue(),
      password: props.password,
      rememberMe: !!props.rememberMe,
      ipAddress: props.ipAddress,
      userAgent: props.userAgent,
    });
  },
};
