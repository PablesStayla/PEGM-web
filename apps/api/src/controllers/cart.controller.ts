import {
  AddToCartCommand,
  AddToCartHandler,
  CartService,
  RemoveFromCartCommand,
  RemoveFromCartHandler,
} from '@pranakaia/cart';
import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

export class CartController {
  private addToCartHandler: AddToCartHandler;
  private removeFromCartHandler: RemoveFromCartHandler;
  private cartService: CartService;

  constructor() {
    this.addToCartHandler = container.resolve(AddToCartHandler);
    this.removeFromCartHandler = container.resolve(RemoveFromCartHandler);
    this.cartService = container.resolve(CartService);
  }

  addToCart = async (
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

      const { productId, quantity = 1 } = req.body;

      if (!productId || typeof productId !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_PRODUCT_ID', message: 'Product ID is required' },
        });
        return;
      }

      if (typeof quantity !== 'number' || quantity < 1) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_QUANTITY', message: 'Quantity must be at least 1' },
        });
        return;
      }

      const command = new AddToCartCommand({
        customerId: req.user.id,
        productId,
        quantity,
      });

      const result = await this.addToCartHandler.execute(command);

      if (!result.success) {
        const error = result.error;
        const code = error && 'code' in error ? String(error.code) : 'CART_ERROR';
        const message = error ? error.message : 'Failed to add item to cart';

        if (code === 'PRODUCT_NOT_FOUND') {
          res.status(404).json({
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

      res.status(200).json({
        success: true,
        data: result.value!.toPrimitives(),
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (
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

      const { productId } = req.params;

      const cartResult = await this.cartService.getCartByCustomer(req.user.id);
      if (!cartResult.success || !cartResult.value) {
        res.status(404).json({
          success: false,
          error: { code: 'CART_NOT_FOUND', message: 'Cart not found' },
        });
        return;
      }

      const cart = cartResult.value;
      const cartItem = cart.items.find((item) => item.productId === productId);
      if (!cartItem) {
        res.status(404).json({
          success: false,
          error: { code: 'ITEM_NOT_FOUND', message: 'Product is not in the cart' },
        });
        return;
      }

      const command = new RemoveFromCartCommand({
        cartId: cart.id,
        itemId: cartItem.id,
      });

      const result = await this.removeFromCartHandler.execute(command);

      if (!result.success) {
        const error = result.error;
        const code = error && 'code' in error ? String(error.code) : 'CART_ERROR';
        const message = error ? error.message : 'Failed to remove item';

        res.status(400).json({
          success: false,
          error: { code, message },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.value!.toPrimitives(),
      });
    } catch (error) {
      next(error);
    }
  };

  getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' },
        });
        return;
      }

      const cartResult = await this.cartService.getCartByCustomer(req.user.id);
      if (cartResult.isFailure) {
        res.status(400).json({
          success: false,
          error: { code: 'CART_ERROR', message: cartResult.errorValue.message },
        });
        return;
      }

      let cart = cartResult.getValue();
      if (!cart) {
        const { CartId, Cart } = await import('@pranakaia/cart');
        const newCartResult = Cart.create({
          id: CartId.generate(),
          customerId: req.user.id,
          currency: 'CLP',
        });

        if (newCartResult.isFailure) {
          res.status(400).json({
            success: false,
            error: { code: 'CART_CREATION_FAILED', message: newCartResult.errorValue.message },
          });
          return;
        }

        cart = newCartResult.getValue();
        const cartRepository = container.resolve<any>('CartRepository');
        await cartRepository.save(cart);
      }

      res.status(200).json({
        success: true,
        data: cart.toPrimitives(),
      });
    } catch (error) {
      next(error);
    }
  };
}
