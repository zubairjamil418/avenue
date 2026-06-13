import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
  trackProductView,
  addProductReview,
  getAllReviews,
  likeProductReview,
  dislikeProductReview,
  replyProductReview,
  approveReview,
  bulkCreateProducts,
  approveProduct,
  getPendingProducts,
  getVendorProducts,
  searchProductsByImage,
} from "../controllers/productController.js";
import {
  protect,
  admin,
  adminOrVendor,
  vendor,
} from "../middleware/authMiddleware.js";
import { preventReadOnlyActions } from "../middleware/readOnlyMiddleware.js";
import upload, { handleMulterError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique product name
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 description: Selling price
 *               discountPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 0
 *               purchasedQuantity:
 *                 type: integer
 *                 default: 0
 *                 description: Base sold quantity shown to customers
 *               stock:
 *                 type: integer
 *                 default: 0
 *               slug:
 *                 type: string
 *                 description: URL slug — auto-generated from name if omitted
 *               bg:
 *                 type: string
 *                 description: Background hex colour e.g. "#F4F3F5"
 *               isNewItem:
 *                 type: boolean
 *                 default: false
 *                 description: Shows "New Arrival" badge on storefront
 *               category:
 *                 type: string
 *                 description: Category ObjectId
 *               brand:
 *                 type: string
 *                 description: Brand ObjectId
 *               productBase:
 *                 type: string
 *                 description: ProductBase ObjectId
 *               productTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of ProductType ObjectIds
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Size ObjectIds
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Color ObjectIds
 *               weights:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Weight ObjectIds
 *               badge:
 *                 type: string
 *                 description: Badge ObjectId
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64 or URL image strings — uploaded to ImageKit; first becomes the cover image
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or duplicate name/slug
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin or vendor access required
 */
router
  .route("/")
  .get(getProducts)
  .post(protect, adminOrVendor, preventReadOnlyActions, createProduct);

/**
 * @swagger
 * /api/products/search-by-image:
 *   post:
 *     summary: Search products by uploading an image
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to search for similar products
 *     responses:
 *       200:
 *         description: Similar products found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: No image uploaded or invalid file
 *       500:
 *         description: Image search failed
 */
router.post(
  "/search-by-image",
  upload.single("image"),
  handleMulterError,
  searchProductsByImage
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               stock:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */

// Get pending products (Admin only) - Must be before /:id
router.route("/pending/all").get(protect, admin, getPendingProducts);

// Get vendor products (Admin only - for approval) - Must be before /:id
router.route("/vendor").get(protect, admin, getVendorProducts);

// Get vendor's own products (Vendor only) - Must be before /:id
router.route("/vendor/me").get(protect, vendor, getVendorProducts);

/**
 * @swagger
 * /api/products/bulk:
 *   post:
 *     summary: Bulk create products (max 100)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - category
 *                     - brand
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Unique product name
 *                     description:
 *                       type: string
 *                       default: ""
 *                     price:
 *                       type: number
 *                       default: 0
 *                     discountPercentage:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       default: 0
 *                     purchasePrice:
 *                       type: number
 *                       default: 0
 *                     purchasedQuantity:
 *                       type: integer
 *                       default: 0
 *                     stock:
 *                       type: integer
 *                       default: 0
 *                     slug:
 *                       type: string
 *                       description: Auto-generated from name if omitted
 *                     bg:
 *                       type: string
 *                       description: Background hex colour e.g. "#F4F3F5"
 *                     isNewItem:
 *                       type: boolean
 *                       default: false
 *                     category:
 *                       type: string
 *                       description: Category ObjectId
 *                     brand:
 *                       type: string
 *                       description: Brand ObjectId
 *                     productBase:
 *                       type: string
 *                       description: ProductBase ObjectId
 *                     sizes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of Size ObjectIds
 *                     colors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of Color ObjectIds
 *                     weights:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of Weight ObjectIds
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of hosted image URLs (not uploaded — stored as-is)
 *     responses:
 *       201:
 *         description: Bulk operation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Successfully created 2 of 3 products"
 *                 results:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           index:
 *                             type: integer
 *                           product:
 *                             $ref: '#/components/schemas/Product'
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           index:
 *                             type: integer
 *                           data:
 *                             type: object
 *                           error:
 *                             type: string
 *       400:
 *         description: Products array missing, empty, or exceeds 100 items
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
// Bulk create products (Admin only) - Must be before /:id
router.route("/bulk").post(protect, admin, bulkCreateProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, preventReadOnlyActions, updateProduct)
  .delete(protect, admin, preventReadOnlyActions, deleteProduct);

/**
 * @swagger
 * /api/products/{id}/rate:
 *   post:
 *     summary: Rate a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product rated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.route("/:id/rate").post(protect, rateProduct);

// Track product view
router.route("/:id/view").post(trackProductView);

// Add product review
router.route("/:id/review").post(protect, addProductReview);

// Get all reviews (Admin only)
router.route("/reviews/all").get(protect, admin, getAllReviews);

// Like, dislike, or reply to a review
router.route("/:productId/review/:reviewId/like").post(protect, likeProductReview);
router.route("/:productId/review/:reviewId/dislike").post(protect, dislikeProductReview);
router.route("/:productId/review/:reviewId/reply").post(protect, replyProductReview);

// Approve/Reject review (Admin only)
router.route("/:productId/review/:reviewId").put(protect, admin, approveReview);

// Approve/Reject product (Admin only)
router
  .route("/:id/approve")
  .put(protect, admin, preventReadOnlyActions, approveProduct);
router
  .route("/:id/approval")
  .put(protect, admin, preventReadOnlyActions, approveProduct);

export default router;
