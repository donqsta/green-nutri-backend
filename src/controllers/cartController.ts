import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Cart from '../models/Cart';
import Product from '../models/Product';

/**
 * Get user's cart
 */
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Please login to view cart'
        }
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create empty cart
      cart = new Cart({
        userId,
        items: [],
        subtotal: 0
      });
      await cart.save();
    }

    res.json({
      success: true,
      data: {
        id: cart._id,
        userId: cart.userId,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
        updatedAt: cart.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity = 1, variant } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Please login to add items to cart'
        }
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Product ID is required'
        }
      });
    }

    // Get product info
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Not enough stock available'
        }
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        subtotal: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId &&
        item.variant?.size === variant?.size &&
        item.variant?.color === variant?.color
    );

    const price = product.salePrice || product.price;

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id as any,
        productName: product.name,
        productImage: product.image,
        price,
        quantity,
        variant
      });
    }

    await cart.save();

    res.json({
      success: true,
      data: {
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        }
      },
      message: 'Added to cart successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Please login to update cart'
        }
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be at least 1'
        }
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found'
        }
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found in cart'
        }
      });
    }

    // Check stock
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Not enough stock available'
        }
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      data: {
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        }
      },
      message: 'Cart updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Please login to update cart'
        }
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found'
        }
      });
    }

    cart.items = cart.items.filter(
      item => item._id?.toString() !== itemId
    );

    await cart.save();

    res.json({
      success: true,
      data: {
        cart: {
          items: cart.items,
          subtotal: cart.subtotal,
          itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        }
      },
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Please login to clear cart'
        }
      });
    }

    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      data: {
        cart: {
          items: [],
          subtotal: 0,
          itemCount: 0
        }
      },
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
