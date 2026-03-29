import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('cart');
const router = Router();

// Get user's cart
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const cartItems = await query(
      `SELECT c.*, 
        p.name as product_name,
        p.generic_name,
        p.price as current_price,
        p.image_url,
        p.stock_quantity,
        p.requires_prescription,
        p.category
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1`,
      [userId]
    );
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.current_price * item.quantity), 0
    );
    
    res.json({ 
      success: true, 
      items: cartItems,
      summary: {
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        subtotal
      }
    });
  } catch (err) {
    log.error({ err }, 'Failed to get cart');
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add item to cart
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    if (!userId || !productId) {
      res.status(400).json({ error: 'userId and productId are required' });
      return;
    }
    
    // Check if product exists and has stock
    const products = await query(
      'SELECT stock_quantity, price FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );
    
    if (products.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    if (products[0].stock_quantity < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }
    
    // Check if item already in cart
    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      
      if (products[0].stock_quantity < newQuantity) {
        res.status(400).json({ error: 'Insufficient stock for requested quantity' });
        return;
      }
      
      const updated = await query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newQuantity, existing[0].id]
      );
      
      res.json({ success: true, item: updated[0], action: 'updated' });
    } else {
      // Add new item
      const id = uuidv4();
      const item = await query(
        `INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [id, userId, productId, quantity]
      );
      
      res.json({ success: true, item: item[0], action: 'added' });
    }
  } catch (err) {
    log.error({ err }, 'Failed to add to cart');
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      res.status(400).json({ error: 'Quantity must be at least 1' });
      return;
    }
    
    // Check stock
    const items = await query(
      `SELECT c.*, p.stock_quantity FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (items.length === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }
    
    if (items[0].stock_quantity < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }
    
    const updated = await query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    res.json({ success: true, item: updated[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update cart item');
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.length === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (err) {
    log.error({ err }, 'Failed to remove from cart');
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    log.error({ err }, 'Failed to clear cart');
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get cart summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    
    const result = await query(
      `SELECT 
        COUNT(*) as item_count,
        SUM(c.quantity) as total_quantity,
        SUM(c.quantity * p.price) as subtotal
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1`,
      [userId]
    );
    
    res.json({ 
      success: true, 
      summary: {
        itemCount: parseInt(result[0].item_count) || 0,
        totalQuantity: parseInt(result[0].total_quantity) || 0,
        subtotal: parseFloat(result[0].subtotal) || 0
      }
    });
  } catch (err) {
    log.error({ err }, 'Failed to get cart summary');
    res.status(500).json({ error: 'Failed to get cart summary' });
  }
});

export default router;
