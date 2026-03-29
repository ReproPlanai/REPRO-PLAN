import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('products');
const router = Router();

// Get all products with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, inStock, sortBy = 'name' } = req.query;
    
    let sql = 'SELECT * FROM products WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR generic_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (inStock === 'true') {
      sql += ` AND stock_quantity > 0`;
    }
    
    // Sorting
    switch (sortBy) {
      case 'price-low': sql += ' ORDER BY price ASC'; break;
      case 'price-high': sql += ' ORDER BY price DESC'; break;
      case 'rating': sql += ' ORDER BY rating DESC'; break;
      default: sql += ' ORDER BY name ASC';
    }
    
    const products = await query(sql, params);
    res.json({ success: true, products });
  } catch (err) {
    log.error({ err }, 'Failed to get products');
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const products = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (products.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    // Get reviews
    const reviews = await query(
      'SELECT * FROM product_reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    res.json({ success: true, product: products[0], reviews });
  } catch (err) {
    log.error({ err }, 'Failed to get product');
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Create product (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      genericName,
      description,
      price,
      category,
      stockQuantity,
      requiresPrescription,
      dosage,
      form,
      sideEffects,
      instructions,
      imageUrl
    } = req.body;
    
    if (!name || !price || !category) {
      res.status(400).json({ error: 'Name, price, and category are required' });
      return;
    }
    
    const id = uuidv4();
    const product = await query(
      `INSERT INTO products 
       (id, name, generic_name, description, price, category, stock_quantity, 
        requires_prescription, dosage, form, side_effects, instructions, image_url, 
        rating, reviews_count, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, 0, true, NOW(), NOW())
       RETURNING *`,
      [id, name, genericName || '', description || '', price, category, stockQuantity || 0, 
       requiresPrescription || false, dosage || '', form || '', 
       JSON.stringify(sideEffects || []), instructions || '', imageUrl || '']
    );
    
    log.info({ productId: id }, 'Product created');
    res.json({ success: true, product: product[0] });
  } catch (err) {
    log.error({ err }, 'Failed to create product');
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'generic_name', 'description', 'price', 'category',
      'stock_quantity', 'requires_prescription', 'dosage', 'form',
      'side_effects', 'instructions', 'image_url', 'is_active'
    ];
    
    const setClauses: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    
    setClauses.push('updated_at = NOW()');
    
    const product = await query(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    
    if (product.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    log.info({ productId: id }, 'Product updated');
    res.json({ success: true, product: product[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update product');
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    log.info({ productId: id }, 'Product deleted');
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to delete product');
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Add product review
router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }
    
    const reviewId = uuidv4();
    const review = await query(
      `INSERT INTO product_reviews (id, product_id, user_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [reviewId, id, userId || null, rating, comment || '']
    );
    
    // Update product average rating
    await query(
      `UPDATE products 
       SET rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = $1),
           reviews_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = $1)
       WHERE id = $1`,
      [id]
    );
    
    log.info({ reviewId, productId: id }, 'Product review added');
    res.json({ success: true, review: review[0] });
  } catch (err) {
    log.error({ err }, 'Failed to add review');
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get product categories
router.get('/categories/list', async (_req: Request, res: Response) => {
  try {
    const categories = await query(
      'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category'
    );
    res.json({ success: true, categories: categories.map(c => c.category) });
  } catch (err) {
    log.error({ err }, 'Failed to get categories');
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

export default router;
