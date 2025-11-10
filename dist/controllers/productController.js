"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// Get all products with filters
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, categoryId, search, featured, sort = '-createdAt' } = req.query;
        // Build query
        const query = { isActive: true };
        if (categoryId)
            query.categoryId = categoryId;
        if (featured === 'true')
            query.isFeatured = true;
        if (search)
            query.$text = { $search: search };
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product_1.default.countDocuments(query);
        // Fetch products with category populated
        const products = await Product_1.default.find(query)
            .skip(skip)
            .limit(Number(limit))
            .populate('categoryId', 'name')
            .sort(sort)
            .lean();
        // Transform to match frontend format
        const transformedProducts = products.map((p) => ({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// Get product by ID
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id)
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
        const productData = product;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
// Create product (Admin only)
const createProduct = async (req, res, next) => {
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
        const product = new Product_1.default(productData);
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: 'Tạo sản phẩm thành công'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
// Update product (Admin only)
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
// Delete product (soft delete - Admin only)
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map