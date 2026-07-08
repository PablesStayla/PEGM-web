import type { DomainEvent, Money } from '@pranakaia/shared-kernel';
import { Entity, Result } from '@pranakaia/shared-kernel';
import {
  PaymentAuthorized,
  PaymentCaptured,
  PaymentCreated,
  PaymentFailed,
  PaymentRefunded,
} from '../events/payment.events';
import type { PaymentIdBrand } from './payment-id.vo';
import type { PaymentMethod } from './payment-method.vo';
import { PaymentStatus } from './payment-status.vo';

export interface CreatePaymentProps {
  id: PaymentIdBrand;
  orderId: string;
  customerId: string;
  amount: Money;
  method: PaymentMethod;
  status?: PaymentStatus;
  externalId?: string;
  createdAt?: Date;
}

export class Payment extends Entity<PaymentIdBrand> {
  private _domainEvents: DomainEvent[] = [];

  private constructor(
    id: PaymentIdBrand,
    private _orderId: string,
    private _customerId: string,
    private _amount: Money,
    private _method: PaymentMethod,
    private _status: PaymentStatus,
    private _externalId: string | null,
    private _authorizedAt: Date | null,
    private _capturedAt: Date | null,
    private _refundedAt: Date | null,
    private _failureReason: string | null,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
  }

  static create(props: CreatePaymentProps): Result<Payment, Error> {
    const payment = new Payment(
      props.id,
      props.orderId,
      props.customerId,
      props.amount,
      props.method,
      props.status ?? PaymentStatus.PENDING,
      props.externalId ?? null,
      null,
      null,
      null,
      null,
      props.createdAt ?? new Date(),
    );

    payment._domainEvents.push(
      new PaymentCreated(payment.idValue, payment._orderId, payment._amount.amount),
    );

    return Result.ok(payment);
  }

  authorize(externalId: string): Result<void, Error> {
    if (this._status !== PaymentStatus.PENDING) {
      return Result.err(new Error('Payment must be pending to authorize'));
    }

    this._status = PaymentStatus.AUTHORIZED;
    this._externalId = externalId;
    this._authorizedAt = new Date();

    this._domainEvents.push(new PaymentAuthorized(this.idValue, this._orderId, externalId));

    return Result.ok(undefined);
  }

  capture(): Result<void, Error> {
    if (this._status !== PaymentStatus.AUTHORIZED) {
      return Result.err(new Error('Payment must be authorized to capture'));
    }

    this._status = PaymentStatus.CAPTURED;
    this._capturedAt = new Date();

    this._domainEvents.push(new PaymentCaptured(this.idValue, this._orderId, this._amount.amount));

    return Result.ok(undefined);
  }

  fail(reason: string): void {
    this._status = PaymentStatus.FAILED;
    this._failureReason = reason;

    this._domainEvents.push(new PaymentFailed(this.idValue, this._orderId, reason));
  }

  refund(amount?: Money): Result<void, Error> {
    if (this._status !== PaymentStatus.CAPTURED) {
      return Result.err(new Error('Payment must be captured to refund'));
    }

    const refundAmount = amount ?? this._amount;

    if (refundAmount.isGreaterThan(this._amount)) {
      return Result.err(new Error('Refund amount cannot exceed payment amount'));
    }

    this._status = PaymentStatus.REFUNDED;
    this._refundedAt = new Date();

    this._domainEvents.push(new PaymentRefunded(this.idValue, refundAmount.amount));

    return Result.ok(undefined);
  }

  get orderId(): string {
    return this._orderId;
  }
  get customerId(): string {
    return this._customerId;
  }
  get amount(): Money {
    return this._amount;
  }
  get method(): PaymentMethod {
    return this._method;
  }
  get status(): PaymentStatus {
    return this._status;
  }
  get externalId(): string | null {
    return this._externalId;
  }
  get isPending(): boolean {
    return this._status === PaymentStatus.PENDING;
  }
  get isAuthorized(): boolean {
    return this._status === PaymentStatus.AUTHORIZED;
  }
  get isCaptured(): boolean {
    return this._status === PaymentStatus.CAPTURED;
  }
  get isFailed(): boolean {
    return this._status === PaymentStatus.FAILED;
  }
  get isRefunded(): boolean {
    return this._status === PaymentStatus.REFUNDED;
  }
  get canCapture(): boolean {
    return this._status === PaymentStatus.AUTHORIZED;
  }
  get canRefund(): boolean {
    return this._status === PaymentStatus.CAPTURED;
  }
  get events(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  toPrimitives() {
    return {
      id: this.idValue,
      orderId: this._orderId,
      customerId: this._customerId,
      amount: this._amount.toPrimitives(),
      method: this._method,
      status: this._status,
      externalId: this._externalId,
      authorizedAt: this._authorizedAt ? this._authorizedAt.toISOString() : null,
      capturedAt: this._capturedAt ? this._capturedAt.toISOString() : null,
      refundedAt: this._refundedAt ? this._refundedAt.toISOString() : null,
      failureReason: this._failureReason,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
