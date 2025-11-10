import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

// Get all products with filters
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      featured,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (categoryId) query.categoryId = categoryId;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search as string };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    // Fetch products with category populated
    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate('categoryId', 'name')
      .sort(sort as string)
      .lean();

    // Transform to match frontend format
    const transformedProducts = products.map((p: any) => ({
      ...p,
      category: {
        id: p.categoryId._id,
        name: p.categoryId.name
      },
      originalPrice: p.salePrice ? p.price : undefined,
      price: p.salePrice || p.price
    }));

    res.json({
      success: true,
      data: {
        items: transformedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
          hasNext: skip + products.length < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId', 'name image')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Không tìm thấy sản phẩm'
        }
      });
    }

    // Transform to match frontend format
    const productData = product as any;
    const transformedProduct = {
      ...productData,
      category: {
        id: productData.categoryId._id,
        name: productData.categoryId.name,
        image: productData.categoryId.image
      },
      originalPrice: productData.salePrice ? productData.price : undefined,
      price: productData.salePrice || productData.price
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    next(error);
  }
};

// Create product (Admin only)
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body;

    // Generate slug from name
    productData.slug = productData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Tạo sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only)
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Không tìm thấy sản phẩm'
        }
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (soft delete - Admin only)
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Không tìm thấy sản phẩm'
        }
      });
    }

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    next(error);
  }
};
