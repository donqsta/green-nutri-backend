"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
// Get all categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category_1.default.find({ isActive: true })
            .sort({ order: 1 })
            .lean();
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Get category by ID
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findById(id).lean();
        if (!category) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CATEGORY_NOT_FOUND',
                    message: 'Không tìm thấy danh mục'
                }
            });
        }
        res.json({
            success: true,
            data: category
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
//# sourceMappingURL=categoryController.js.map