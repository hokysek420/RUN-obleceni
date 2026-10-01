import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getCustomerSession();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingZip,
      shippingCountry,
      billingStreet,
      billingCity,
      billingZip,
      billingCountry,
      deliveryMethod,
      deliveryPickupPoint,
      shippingPrice,
      paymentMethod,
      discountCode,
      discountAmount,
      giftCardCode,
      giftCardAmount,
      subtotal,
      total,
      items,
    } = body;

    if (!customerEmail || !customerName || !shippingStreet || !shippingCity || !shippingZip) {
      return NextResponse.json({ error: 'Vyplňte prosím všechna povinná pole.' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Váš košík je prázdný.' }, { status: 400 });
    }

    // Generate unique order number (e.g. RUN-2026-8914)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RUN-2026-${randomSuffix}`;

    // Determine initial payment status based on payment method
    let paymentStatus = 'Čeká na platbu';
    if (paymentMethod.includes('karta') || paymentMethod.includes('Apple')) {
      paymentStatus = 'Zaplaceno'; // Card / Apple Pay simulated successful processing
    }

    // Begin database transaction for atomicity
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_street, shipping_city, shipping_zip, shipping_country,
        billing_street, billing_city, billing_zip, billing_country,
        delivery_method, delivery_pickup_point, shipping_price,
        payment_method, payment_status, order_status,
        discount_code, discount_amount, gift_card_code, gift_card_amount,
        subtotal, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_image, size, color, price, quantity, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateVariantStock = db.prepare(`
      UPDATE product_variants
      SET stock = MAX(0, stock - ?)
      WHERE product_id = ? AND size = ? AND color = ?
    `);

    const updateVariantStockFallback = db.prepare(`
      UPDATE product_variants
      SET stock = MAX(0, stock - ?)
      WHERE id = (
        SELECT id FROM product_variants
        WHERE product_id = ? AND size = ?
        LIMIT 1
      )
    `);

    const transaction = db.transaction(() => {
      const orderResult = insertOrder.run(
        orderNumber,
        session ? session.userId : null,
        customerName,
        customerEmail,
        customerPhone,
        shippingStreet,
        shippingCity,
        shippingZip,
        shippingCountry || 'Česká republika',
        billingStreet || null,
        billingCity || null,
        billingZip || null,
        billingCountry || null,
        deliveryMethod,
        deliveryPickupPoint || null,
        shippingPrice,
        paymentMethod,
        paymentStatus,
        'Přijato',
        discountCode || null,
        discountAmount || 0,
        giftCardCode || null,
        giftCardAmount || 0,
        subtotal,
        total
      );

      const orderId = orderResult.lastInsertRowid;

      for (const item of items) {
        const pId = item.productId || item.product_id || (typeof item.id === 'number' ? item.id : parseInt(String(item.id).split('-')[0], 10)) || 1;
        const pName = item.name || item.product_name || 'RUN Apparel';
        const pImage = item.image || item.primary_image || item.product_image || '/images/products/run-teddy-black-1.jpg';
        const pSize = item.size || item.selectedSize || 'OS';
        const pColor = item.color || item.selectedColor || 'Standard';

        insertItem.run(
          orderId,
          pId,
          pName,
          pImage,
          pSize,
          pColor,
          item.price,
          item.quantity,
          item.price * item.quantity
        );

        // Adjust inventory
        try {
          const res = updateVariantStock.run(item.quantity, pId, pSize, pColor);
          if (res.changes === 0) {
            updateVariantStockFallback.run(item.quantity, pId, pSize);
          }
        } catch (e) {
          console.warn('Variant stock update warning:', e);
        }
      }

      // If discount code was used, increment usage count
      if (discountCode) {
        db.prepare('UPDATE discount_codes SET times_used = times_used + 1 WHERE code = ?').run(discountCode);
      }

      // If gift card was used, deduct from balance
      if (giftCardCode && giftCardAmount > 0) {
        db.prepare('UPDATE gift_cards SET current_balance = MAX(0, current_balance - ?) WHERE code = ?').run(
          giftCardAmount,
          giftCardCode
        );
      }

      return { orderId, orderNumber };
    });

    const result = transaction();

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      orderId: result.orderId,
    });
  } catch (e: any) {
    console.error('Order creation error:', e);
    return NextResponse.json({ error: e.message || 'Chyba při ukládání objednávky' }, { status: 500 });
  }
}
