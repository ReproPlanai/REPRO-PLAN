import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createServiceLogger } from '../config/logger';
import { query } from '../config/db';

const log = createServiceLogger('orders');
const router = Router();

// Get all orders (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status, limit = '50', offset = '0' } = req.query;
    
    let sql = `
      SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'product_name', p.name,
          'product_image', p.image_url
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      sql += ` AND o.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    sql += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const orders = await query(sql, params);
    
    // Parse items JSON
    orders.forEach((order: any) => {
      if (order.items && order.items[0] === null) {
        order.items = [];
      }
    });
    
    res.json({ success: true, orders });
  } catch (err) {
    log.error({ err }, 'Failed to get orders');
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get single order
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const orders = await query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'product_name', p.name,
          'product_image', p.image_url,
          'requires_prescription', p.requires_prescription
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [id]
    );
    
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    if (orders[0].items && orders[0].items[0] === null) {
      orders[0].items = [];
    }
    
    res.json({ success: true, order: orders[0] });
  } catch (err) {
    log.error({ err }, 'Failed to get order');
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Create order
router.post('/', async (req: Request, res: Response) => {
  const client = await query('BEGIN');
  
  try {
    const {
      userId,
      items,
      pharmacyId,
      deliveryType,
      deliveryAddress,
      prescriptionUrl,
      notes
    } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }
    
    // Calculate totals
    let subtotal = 0;
    let requiresPrescription = false;
    
    for (const item of items) {
      const products = await query(
        'SELECT price, stock_quantity, requires_prescription FROM products WHERE id = $1',
        [item.productId]
      );
      
      if (products.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const product = products[0];
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      
      subtotal += product.price * item.quantity;
      
      if (product.requires_prescription) {
        requiresPrescription = true;
      }
      
      // Update stock
      await query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }
    
    // Calculate delivery fee
    let deliveryFee = 0;
    if (deliveryType === 'delivery' && pharmacyId) {
      const pharmacies = await query(
        'SELECT delivery_fee FROM pharmacies WHERE id = $1',
        [pharmacyId]
      );
      if (pharmacies.length > 0) {
        deliveryFee = pharmacies[0].delivery_fee || 0;
      }
    }
    
    const total = subtotal + deliveryFee;
    
    // Create order
    const orderId = uuidv4();
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    
    const order = await query(
      `INSERT INTO orders 
       (id, order_number, user_id, status, subtotal, delivery_fee, total,
        pharmacy_id, delivery_type, delivery_address, prescription_url, 
        requires_prescription, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      [orderId, orderNumber, userId || null, 'pending', subtotal, deliveryFee, total,
       pharmacyId || null, deliveryType || 'pickup', deliveryAddress || null,
       prescriptionUrl || null, requiresPrescription, notes || '']
    );
    
    // Create order items
    for (const item of items) {
      const products = await query('SELECT price FROM products WHERE id = $1', [item.productId]);
      const itemId = uuidv4();
      
      await query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [itemId, orderId, item.productId, item.quantity, products[0].price]
      );
    }
    
    await query('COMMIT');
    
    log.info({ orderId, orderNumber, userId, total }, 'Order created');
    res.json({ success: true, order: order[0] });
  } catch (err: any) {
    await query('ROLLBACK');
    log.error({ err }, 'Failed to create order');
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

// Update order status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    const order = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (order.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    log.info({ orderId: id, status }, 'Order status updated');
    res.json({ success: true, order: order[0] });
  } catch (err) {
    log.error({ err }, 'Failed to update order status');
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Cancel order
router.post('/:id/cancel', async (req: Request, res: Response) => {
  const client = await query('BEGIN');
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get order items to restore stock
    const items = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );
    
    // Restore stock
    for (const item of items) {
      await query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    // Update order status
    const order = await query(
      'UPDATE orders SET status = $1, cancellation_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      ['cancelled', reason || '', id]
    );
    
    if (order.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    await query('COMMIT');
    
    log.info({ orderId: id, reason }, 'Order cancelled');
    res.json({ success: true, order: order[0] });
  } catch (err) {
    await query('ROLLBACK');
    log.error({ err }, 'Failed to cancel order');
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get order receipt
router.get('/:id/receipt', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const orders = await query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price,
          'subtotal', oi.quantity * oi.price
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [id]
    );
    
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    const order = orders[0];
    
    if (order.items && order.items[0] === null) {
      order.items = [];
    }
    
    const receipt = {
      orderNumber: order.order_number,
      orderDate: order.created_at,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      deliveryType: order.delivery_type,
      deliveryAddress: order.delivery_address,
      notes: order.notes
    };
    
    res.json({ success: true, receipt });
  } catch (err) {
    log.error({ err }, 'Failed to get receipt');
    res.status(500).json({ error: 'Failed to get receipt' });
  }
});

export default router;
