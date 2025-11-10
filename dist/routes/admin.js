"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// Admin middleware for all routes
router.use(auth_1.isAdmin);
// Dashboard
router.get('/', adminController_1.getAdminDashboard);
// Product routes
router.get('/products', adminController_1.getProducts);
router.get('/products/new', adminController_1.getCreateProductForm);
router.post('/products', adminController_1.createProductWithUpload);
router.get('/products/:id/edit', adminController_1.getEditProductForm);
router.post('/products/:id', adminController_1.updateProductWithUpload);
router.post('/products/:id/delete', adminController_1.deleteProduct);
// Category routes
router.get('/categories', adminController_1.getCategories);
router.get('/categories/new', adminController_1.getCreateCategoryForm);
router.post('/categories', adminController_1.createCategoryWithUpload);
router.get('/categories/:id/edit', adminController_1.getEditCategoryForm);
router.post('/categories/:id', adminController_1.updateCategoryWithUpload);
router.post('/categories/:id/delete', adminController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=admin.js.map