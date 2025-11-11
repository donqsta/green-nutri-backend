"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.updateCategoryWithUpload = exports.getEditCategoryForm = exports.createCategory = exports.createCategoryWithUpload = exports.getCreateCategoryForm = exports.getCategories = exports.deleteProduct = exports.updateProduct = exports.updateProductWithUpload = exports.getEditProductForm = exports.createProduct = exports.createProductWithUpload = exports.getCreateProductForm = exports.getProducts = exports.getAdminDashboard = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const upload_1 = require("../middleware/upload");
// Dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const productCount = await Product_1.default.countDocuments();
        const categoryCount = await Category_1.default.countDocuments();
        const recentProducts = await Product_1.default.find().sort({ createdAt: -1 }).limit(5).populate('categoryId').lean();
        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Green Nutri',
            productCount,
            categoryCount,
            recentProducts
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load dashboard'
        });
    }
};
exports.getAdminDashboard = getAdminDashboard;
// Product Controllers
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const products = await Product_1.default.find()
            .populate('categoryId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Product_1.default.countDocuments();
        const totalPages = Math.ceil(total / limit);
        res.render('admin/products', {
            title: 'Quản lý Sản phẩm - Green Nutri',
            products,
            currentPage: page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load products'
        });
    }
};
exports.getProducts = getProducts;
const getCreateProductForm = async (req, res) => {
    try {
        const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
        res.render('admin/product-form', {
            title: 'Thêm Sản phẩm Mới - Green Nutri',
            product: null,
            categories,
            isEdit: false
        });
    }
    catch (error) {
        console.error('Get create form error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load form'
        });
    }
};
exports.getCreateProductForm = getCreateProductForm;
// Wrapper for createProduct with file upload
const createProductWithUpload = async (req, res) => {
    (0, upload_1.uploadSingle)(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
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
            const productData = {
                ...req.body,
                slug,
                price: parseInt(req.body.price),
                salePrice: parseInt(req.body.salePrice) || undefined,
                originalPrice: parseInt(req.body.originalPrice) || parseInt(req.body.price),
                stock: parseInt(req.body.stock),
                isActive: req.body.isActive === 'on',
                isFeatured: req.body.isFeatured === 'on'
            };
            // Handle uploaded image or URL
            if (req.file) {
                productData.image = (0, upload_1.getFileUrl)(req.file.filename);
            }
            else if (req.body.imageUrl) {
                productData.image = req.body.imageUrl;
            }
            else {
                // Default image if none provided
                productData.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMwNjgyNDIiLz4KPHRleHQgeD0iMTAwIiB5PSI2MCIgZmlsbD0iI0ZGRkRkZGIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgdGV4dC1hbmNob3IgPSJtaWRkbGUiPlByb2R1Y3Q8L3RleHQ+Cjwvc3ZnPgo=';
            }
            // Handle variants
            if (req.body.variants && Array.isArray(req.body.variants)) {
                productData.variants = req.body.variants;
            }
            // Handle sizes
            if (req.body.sizes) {
                productData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',').map((s) => s.trim());
            }
            const product = new Product_1.default(productData);
            await product.save();
            res.redirect('/admin/products?success=Product created successfully');
        }
        catch (error) {
            console.error('Create product error:', error);
            const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
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
exports.createProductWithUpload = createProductWithUpload;
const createProduct = async (req, res) => {
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
        const product = new Product_1.default(productData);
        await product.save();
        res.redirect('/admin/products?success=Product created successfully');
    }
    catch (error) {
        console.error('Create product error:', error);
        const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
        res.status(400).render('admin/product-form', {
            title: 'Thêm Sản phẩm Mới - Green Nutri',
            product: req.body,
            categories,
            isEdit: false,
            error: 'Failed to create product. Please check your input.'
        });
    }
};
exports.createProduct = createProduct;
const getEditProductForm = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id).populate('categoryId').lean();
        const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
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
    }
    catch (error) {
        console.error('Get edit form error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load product'
        });
    }
};
exports.getEditProductForm = getEditProductForm;
// Wrapper for updateProduct with file upload
const updateProductWithUpload = async (req, res) => {
    (0, upload_1.uploadSingle)(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            const product = await Product_1.default.findById(req.params.id).populate('categoryId').lean();
            const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
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
            const productData = {
                ...req.body,
            };
            // Only include slug if generated
            if (slug) {
                productData.slug = slug;
            }
            // Parse numeric fields
            productData.price = parseInt(req.body.price);
            productData.salePrice = parseInt(req.body.salePrice) || undefined;
            productData.originalPrice = parseInt(req.body.originalPrice) || parseInt(req.body.price);
            productData.stock = parseInt(req.body.stock);
            productData.isActive = req.body.isActive === 'on';
            productData.isFeatured = req.body.isFeatured === 'on';
            // Handle uploaded image or URL
            if (req.file) {
                productData.image = (0, upload_1.getFileUrl)(req.file.filename);
            }
            else if (req.body.imageUrl) {
                productData.image = req.body.imageUrl;
            }
            // Handle variants
            if (req.body.variants && Array.isArray(req.body.variants)) {
                productData.variants = req.body.variants;
            }
            // Handle sizes
            if (req.body.sizes) {
                productData.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',').map((s) => s.trim());
            }
            const product = await Product_1.default.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
            if (!product) {
                return res.status(404).render('admin/error', {
                    title: 'Not Found',
                    message: 'Product not found'
                });
            }
            res.redirect('/admin/products?success=Product updated successfully');
        }
        catch (error) {
            console.error('Update product error:', error);
            const product = await Product_1.default.findById(req.params.id).populate('categoryId').lean();
            const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
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
exports.updateProductWithUpload = updateProductWithUpload;
const updateProduct = async (req, res) => {
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
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).render('admin/error', {
                title: 'Not Found',
                message: 'Product not found'
            });
        }
        res.redirect('/admin/products?success=Product updated successfully');
    }
    catch (error) {
        console.error('Update product error:', error);
        const product = await Product_1.default.findById(req.params.id).populate('categoryId').lean();
        const categories = await Category_1.default.find({ isActive: true }).sort({ order: 1 }).lean();
        res.status(400).render('admin/product-form', {
            title: `Chỉnh sửa ${product?.name} - Green Nutri`,
            product: { ...product?.toObject(), ...req.body },
            categories,
            isEdit: true,
            error: 'Failed to update product. Please check your input.'
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        await Product_1.default.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products?success=Product deleted successfully');
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.redirect('/admin/products?error=Failed to delete product');
    }
};
exports.deleteProduct = deleteProduct;
// Category Controllers
const getCategories = async (req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ order: 1 }).lean();
        res.render('admin/categories', {
            title: 'Quản lý Danh mục - Green Nutri',
            categories
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load categories'
        });
    }
};
exports.getCategories = getCategories;
const getCreateCategoryForm = (req, res) => {
    res.render('admin/category-form', {
        title: 'Thêm Danh mục Mới - Green Nutri',
        category: null,
        isEdit: false
    });
};
exports.getCreateCategoryForm = getCreateCategoryForm;
// Wrapper for createCategory with file upload
const createCategoryWithUpload = async (req, res) => {
    (0, upload_1.uploadSingle)(req, res, async (err) => {
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
            const categoryData = {
                ...req.body,
                slug,
                order: parseInt(req.body.order) || 0,
                isActive: req.body.isActive === 'on'
            };
            // Handle uploaded image or URL
            if (req.file) {
                categoryData.image = (0, upload_1.getFileUrl)(req.file.filename);
            }
            else if (req.body.imageUrl) {
                categoryData.image = req.body.imageUrl;
            }
            const category = new Category_1.default(categoryData);
            await category.save();
            res.redirect('/admin/categories?success=Category created successfully');
        }
        catch (error) {
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
exports.createCategoryWithUpload = createCategoryWithUpload;
const createCategory = async (req, res) => {
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
        const category = new Category_1.default(categoryData);
        await category.save();
        res.redirect('/admin/categories?success=Category created successfully');
    }
    catch (error) {
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
exports.createCategory = createCategory;
const getEditCategoryForm = async (req, res) => {
    try {
        const category = await Category_1.default.findById(req.params.id).lean();
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
    }
    catch (error) {
        console.error('Get edit category form error:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            message: 'Failed to load category'
        });
    }
};
exports.getEditCategoryForm = getEditCategoryForm;
// Wrapper for updateCategory with file upload
const updateCategoryWithUpload = async (req, res) => {
    (0, upload_1.uploadSingle)(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            const category = await Category_1.default.findById(req.params.id).lean();
            return res.status(400).render('admin/category-form', {
                title: `Chỉnh sửa ${category?.name} - Green Nutri`,
                category: { ...category?.toObject(), ...req.body },
                isEdit: true,
                error: 'File upload failed: ' + err.message
            });
        }
        try {
            const categoryData = {
                ...req.body,
                order: parseInt(req.body.order),
                isActive: req.body.isActive === 'on'
            };
            // Handle uploaded image or URL
            if (req.file) {
                categoryData.image = (0, upload_1.getFileUrl)(req.file.filename);
            }
            else if (req.body.imageUrl) {
                categoryData.image = req.body.imageUrl;
            }
            const category = await Category_1.default.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
            if (!category) {
                return res.status(404).render('admin/error', {
                    title: 'Not Found',
                    message: 'Category not found'
                });
            }
            res.redirect('/admin/categories?success=Category updated successfully');
        }
        catch (error) {
            console.error('Update category error:', error);
            const category = await Category_1.default.findById(req.params.id).lean();
            res.status(400).render('admin/category-form', {
                title: `Chỉnh sửa ${category?.name} - Green Nutri`,
                category: { ...category?.toObject(), ...req.body },
                isEdit: true,
                error: 'Failed to update category. Please check your input.'
            });
        }
    });
};
exports.updateCategoryWithUpload = updateCategoryWithUpload;
const updateCategory = async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            order: parseInt(req.body.order),
            isActive: req.body.isActive === 'on'
        };
        const category = await Category_1.default.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).render('admin/error', {
                title: 'Not Found',
                message: 'Category not found'
            });
        }
        res.redirect('/admin/categories?success=Category updated successfully');
    }
    catch (error) {
        console.error('Update category error:', error);
        const category = await Category_1.default.findById(req.params.id).lean();
        res.status(400).render('admin/category-form', {
            title: `Chỉnh sửa ${category?.name} - Green Nutri`,
            category: { ...category?.toObject(), ...req.body },
            isEdit: true,
            error: 'Failed to update category. Please check your input.'
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        await Category_1.default.findByIdAndDelete(req.params.id);
        res.redirect('/admin/categories?success=Category deleted successfully');
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.redirect('/admin/categories?error=Failed to delete category');
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=adminController.js.map