import express from 'express';
import { isAdmin } from '../middleware/auth';
import {
  getAdminDashboard,
  getProducts,
  getCreateProductForm,
  createProduct,
  getEditProductForm,
  updateProduct,
  deleteProduct,
  getCategories,
  getCreateCategoryForm,
  createCategory,
  createCategoryWithUpload,
  getEditCategoryForm,
  updateCategory,
  updateCategoryWithUpload,
  deleteCategory
} from '../controllers/adminController';

const router = express.Router();

// Admin middleware for all routes
router.use(isAdmin);

// Dashboard
router.get('/', getAdminDashboard);

// Product routes
router.get('/products', getProducts);
router.get('/products/new', getCreateProductForm);
router.post('/products', createProduct);
router.get('/products/:id/edit', getEditProductForm);
router.post('/products/:id', updateProduct);
router.post('/products/:id/delete', deleteProduct);

// Category routes
router.get('/categories', getCategories);
router.get('/categories/new', getCreateCategoryForm);
router.post('/categories', createCategoryWithUpload);
router.get('/categories/:id/edit', getEditCategoryForm);
router.post('/categories/:id', updateCategoryWithUpload);
router.post('/categories/:id/delete', deleteCategory);

export default router;