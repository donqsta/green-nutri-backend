import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { uploadSingle, getFileUrl, deleteFile } from '../middleware/upload';

// Dashboard
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).populate('categoryId').lean();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Green Nutri',
      productCount,
      categoryCount,
      recentProducts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load dashboard'
    });
  }
};

// Product Controllers
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.render('admin/products', {
      title: 'Quản lý Sản phẩm - Green Nutri',
      products,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load products'
    });
  }
};

export const getCreateProductForm = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    res.render('admin/product-form', {
      title: 'Thêm Sản phẩm Mới - Green Nutri',
      product: null,
      categories,
      isEdit: false
    });
  } catch (error) {
    console.error('Get create form error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load form'
    });
  }
};

// Wrapper for createProduct with file upload
export const createProductWithUpload = async (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
      return res.status(400).render('admin/product-form', {
        title: 'Thêm Sản phẩm Mới - Green Nutri',
        product: req.body,
        categories,
        isEdit: false,
        error: 'File upload failed: ' + err.message
      });
    }

    try {
      // Auto-generate slug if not provided
      let slug = req.body.slug;
      if (!slug) {
        slug = req.body.name
          .toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
          .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
          .replace(/[íìỉĩị]/g, 'i')
          .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
          .replace(/[úùủũụưứừửữự]/g, 'u')
          .replace(/[ýỳỷỹỵ]/g, 'y')
          .replace(/[đ]/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      const productData: any = {
        ...req.body,
        slug,
        price: parseInt(req.body.price) || 0,
        salePrice: req.body.salePrice ? parseInt(req.body.salePrice) : undefined,
        originalPrice: req.body.originalPrice ? parseInt(req.body.originalPrice) : parseInt(req.body.price),
        stock: parseInt(req.body.stock) || 0,
        isActive: req.body.isActive === 'on',
        isFeatured: req.body.isFeatured === 'on'
      };

      // Handle details field - only include if it's a valid array
      if (req.body.details && Array.isArray(req.body.details)) {
        productData.details = req.body.details;
      } else {
        delete productData.details; // Remove empty/invalid details
      }

      // Handle variants field
      if (req.body.variants && Array.isArray(req.body.variants)) {
        productData.variants = req.body.variants;
      }

      // Handle uploaded image or URL
      if (req.file) {
        productData.image = getFileUrl(req.file.filename);
      } else if (req.body.imageUrl) {
        productData.image = req.body.imageUrl;
      } else {
        // Default image if none provided
        productData.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMwNjgyNDIiLz4KPHRleHQgeD0iMTAwIiB5PSI2MCIgZmlsbD0iI0ZGRkRkZGIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3IgPSJtaWRkbGUiPlByb2R1Y3Q8L3RleHQ+Cjwvc3ZnPgo=';
      }

      // Ensure required fields have valid values
      if (!productData.price || productData.price === 0) {
        productData.price = 100000; // Default price
      }
      if (!productData.stock || productData.stock === 0) {
        productData.stock = 10; // Default stock
      }

      // Handle variants
      if (req.body.variants && Array.isArray(req.body.variants)) {
        productData.variants = req.body.variants;
      }

      // Handle sizes
      if (req.body.sizes) {
        productData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',').map((s: string) => s.trim());
      }

      const product = new Product(productData);
      await product.save();

      res.redirect('/admin/products?success=Product created successfully');
    } catch (error: any) {
      console.error('Create product error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Request body:', req.body);
      console.error('Request file:', req.file);
      const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

      res.status(400).render('admin/product-form', {
        title: 'Thêm Sản phẩm Mới - Green Nutri',
        product: req.body,
        categories,
        isEdit: false,
        error: 'Failed to create product. Please check your input.'
      });
    }
  });
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = {
      ...req.body,
      price: parseInt(req.body.price),
      salePrice: parseInt(req.body.salePrice),
      originalPrice: parseInt(req.body.originalPrice) || parseInt(req.body.price),
      stock: parseInt(req.body.stock),
      isActive: req.body.isActive === 'on',
      isFeatured: req.body.isFeatured === 'on'
    };

    const product = new Product(productData);
    await product.save();

    res.redirect('/admin/products?success=Product created successfully');
  } catch (error) {
    console.error('Create product error:', error);
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    res.status(400).render('admin/product-form', {
      title: 'Thêm Sản phẩm Mới - Green Nutri',
      product: req.body,
      categories,
      isEdit: false,
      error: 'Failed to create product. Please check your input.'
    });
  }
};

export const getEditProductForm = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId').lean();
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Product not found'
      });
    }

    res.render('admin/product-form', {
      title: `Chỉnh sửa ${product.name} - Green Nutri`,
      product,
      categories,
      isEdit: true
    });
  } catch (error) {
    console.error('Get edit form error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load product'
    });
  }
};

// Wrapper for updateProduct with file upload
export const updateProductWithUpload = async (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      const product = await Product.findById(req.params.id).populate('categoryId').lean();
      const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
      return res.status(400).render('admin/product-form', {
        title: `Chỉnh sửa ${product?.name} - Green Nutri`,
        product: { ...product?.toObject(), ...req.body },
        categories,
        isEdit: true,
        error: 'File upload failed: ' + err.message
      });
    }

    try {
      // Auto-generate slug if not provided
      let slug = req.body.slug;
      if (!slug && req.body.name) {
        slug = req.body.name
          .toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
          .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
          .replace(/[íìỉĩị]/g, 'i')
          .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
          .replace(/[úùủũụưứừửữự]/g, 'u')
          .replace(/[ýỳỷỹỵ]/g, 'y')
          .replace(/[đ]/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      const productData: any = {
        ...req.body,
      };

      // Only include slug if generated
      if (slug) {
        productData.slug = slug;
      }

      // Parse numeric fields with safe defaults
      productData.price = parseInt(req.body.price) || 0;
      productData.salePrice = req.body.salePrice ? parseInt(req.body.salePrice) : undefined;
      productData.originalPrice = req.body.originalPrice ? parseInt(req.body.originalPrice) : parseInt(req.body.price) || 0;
      productData.stock = parseInt(req.body.stock) || 0;
      productData.isActive = req.body.isActive === 'on';
      productData.isFeatured = req.body.isFeatured === 'on';

      // Handle uploaded image or URL
      if (req.file) {
        productData.image = getFileUrl(req.file.filename);
      } else if (req.body.imageUrl) {
        productData.image = req.body.imageUrl;
      }

      // Handle details field - only include if it's a valid array
      if (req.body.details && Array.isArray(req.body.details)) {
        productData.details = req.body.details;
      } else {
        delete productData.details; // Remove empty/invalid details
      }

      // Handle variants
      if (req.body.variants && Array.isArray(req.body.variants)) {
        productData.variants = req.body.variants;
      }

      // Handle sizes
      if (req.body.sizes) {
        productData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',').map((s: string) => s.trim());
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        productData,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).render('admin/error', {
          title: 'Not Found',
          message: 'Product not found'
        });
      }

      res.redirect('/admin/products?success=Product updated successfully');
    } catch (error) {
      console.error('Update product error:', error);
      const product = await Product.findById(req.params.id).populate('categoryId').lean();
      const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

      res.status(400).render('admin/product-form', {
        title: `Chỉnh sửa ${product?.name} - Green Nutri`,
        product: { ...product?.toObject(), ...req.body },
        categories,
        isEdit: true,
        error: 'Failed to update product. Please check your input.'
      });
    }
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productData = {
      ...req.body,
      price: parseInt(req.body.price),
      salePrice: parseInt(req.body.salePrice),
      originalPrice: parseInt(req.body.originalPrice) || parseInt(req.body.price),
      stock: parseInt(req.body.stock),
      isActive: req.body.isActive === 'on',
      isFeatured: req.body.isFeatured === 'on'
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Product not found'
      });
    }

    res.redirect('/admin/products?success=Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    const product = await Product.findById(req.params.id).populate('categoryId').lean();
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

    res.status(400).render('admin/product-form', {
      title: `Chỉnh sửa ${product?.name} - Green Nutri`,
      product: { ...product?.toObject(), ...req.body },
      categories,
      isEdit: true,
      error: 'Failed to update product. Please check your input.'
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products?success=Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    res.redirect('/admin/products?error=Failed to delete product');
  }
};

// Category Controllers
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    res.render('admin/categories', {
      title: 'Quản lý Danh mục - Green Nutri',
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load categories'
    });
  }
};

export const getCreateCategoryForm = (req: Request, res: Response) => {
  res.render('admin/category-form', {
    title: 'Thêm Danh mục Mới - Green Nutri',
    category: null,
    isEdit: false
  });
};

// Wrapper for createCategory with file upload
export const createCategoryWithUpload = async (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).render('admin/category-form', {
        title: 'Thêm Danh mục Mới - Green Nutri',
        category: req.body,
        isEdit: false,
        error: 'File upload failed: ' + err.message
      });
    }

    try {
      // Auto-generate slug if not provided
      let slug = req.body.slug;
      if (!slug) {
        slug = req.body.name
          .toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
          .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
          .replace(/[íìỉĩị]/g, 'i')
          .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
          .replace(/[úùủũụưứừửữự]/g, 'u')
          .replace(/[ýỳỷỹỵ]/g, 'y')
          .replace(/[đ]/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      const categoryData: any = {
        ...req.body,
        slug,
        order: parseInt(req.body.order) || 0,
        isActive: req.body.isActive === 'on'
      };

      // Handle uploaded image or URL
      if (req.file) {
        categoryData.image = getFileUrl(req.file.filename);
      } else if (req.body.imageUrl) {
        categoryData.image = req.body.imageUrl;
      }

      const category = new Category(categoryData);
      await category.save();

      res.redirect('/admin/categories?success=Category created successfully');
    } catch (error: any) {
      console.error('Create category error:', error);

      let errorMessage = 'Failed to create category. Please check your input.';
      if (error.code === 11000 && error.keyPattern?.slug) {
        errorMessage = 'Slug already exists. Please use a different name or slug.';
      }

      res.status(400).render('admin/category-form', {
        title: 'Thêm Danh mục Mới - Green Nutri',
        category: req.body,
        isEdit: false,
        error: errorMessage
      });
    }
  });
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    // Auto-generate slug if not provided
    let slug = req.body.slug;
    if (!slug) {
      slug = req.body.name
        .toLowerCase()
        .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
        .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i')
        .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u')
        .replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/[đ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    const categoryData = {
      ...req.body,
      slug,
      order: parseInt(req.body.order) || 0,
      isActive: req.body.isActive === 'on'
    };

    const category = new Category(categoryData);
    await category.save();

    res.redirect('/admin/categories?success=Category created successfully');
  } catch (error: any) {
    console.error('Create category error:', error);

    let errorMessage = 'Failed to create category. Please check your input.';
    if (error.code === 11000 && error.keyPattern?.slug) {
      errorMessage = 'Slug already exists. Please use a different name or slug.';
    }

    res.status(400).render('admin/category-form', {
      title: 'Thêm Danh mục Mới - Green Nutri',
      category: req.body,
      isEdit: false,
      error: errorMessage
    });
  }
};

export const getEditCategoryForm = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Category not found'
      });
    }

    res.render('admin/category-form', {
      title: `Chỉnh sửa ${category.name} - Green Nutri`,
      category,
      isEdit: true
    });
  } catch (error) {
    console.error('Get edit category form error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load category'
    });
  }
};

// Wrapper for updateCategory with file upload
export const updateCategoryWithUpload = async (req: Request, res: Response) => {
  uploadSingle(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      const category = await Category.findById(req.params.id).lean();
      return res.status(400).render('admin/category-form', {
        title: `Chỉnh sửa ${category?.name} - Green Nutri`,
        category: { ...category?.toObject(), ...req.body },
        isEdit: true,
        error: 'File upload failed: ' + err.message
      });
    }

    try {
      const categoryData: any = {
        ...req.body,
        order: parseInt(req.body.order),
        isActive: req.body.isActive === 'on'
      };

      // Handle uploaded image or URL
      if (req.file) {
        categoryData.image = getFileUrl(req.file.filename);
      } else if (req.body.imageUrl) {
        categoryData.image = req.body.imageUrl;
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        categoryData,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).render('admin/error', {
          title: 'Not Found',
          message: 'Category not found'
        });
      }

      res.redirect('/admin/categories?success=Category updated successfully');
    } catch (error) {
      console.error('Update category error:', error);
      const category = await Category.findById(req.params.id).lean();

      res.status(400).render('admin/category-form', {
        title: `Chỉnh sửa ${category?.name} - Green Nutri`,
        category: { ...category?.toObject(), ...req.body },
        isEdit: true,
        error: 'Failed to update category. Please check your input.'
      });
    }
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryData = {
      ...req.body,
      order: parseInt(req.body.order),
      isActive: req.body.isActive === 'on'
    };

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).render('admin/error', {
        title: 'Not Found',
        message: 'Category not found'
      });
    }

    res.redirect('/admin/categories?success=Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    const category = await Category.findById(req.params.id).lean();

    res.status(400).render('admin/category-form', {
      title: `Chỉnh sửa ${category?.name} - Green Nutri`,
      category: { ...category?.toObject(), ...req.body },
      isEdit: true,
      error: 'Failed to update category. Please check your input.'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories?success=Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    res.redirect('/admin/categories?error=Failed to delete category');
  }
};