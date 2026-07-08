import { Result } from '@pranakaia/shared-kernel';
import { Email } from '../../../domain/user/email.vo';

export interface SignUpCommand {
  email: Email;
  password: string;
  confirmPassword: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export const SignUpCommand = {
  create: (props: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
  }): Result<SignUpCommand, Error> => {
    const emailResult = Email.create(props.email);
    if (!emailResult.success) {
      return Result.err(emailResult.errorValue);
    }

    if (props.password.length < 8) {
      return Result.err(new Error('Password must be at least 8 characters'));
    }

    if (props.password !== props.confirmPassword) {
      return Result.err(new Error('Passwords do not match'));
    }

    return Result.ok({
      email: emailResult.getValue(),
      password: props.password,
      confirmPassword: props.confirmPassword,
      firstName: props.firstName,
      lastName: props.lastName,
      ipAddress: props.ipAddress,
      userAgent: props.userAgent,
    });
  },
};
