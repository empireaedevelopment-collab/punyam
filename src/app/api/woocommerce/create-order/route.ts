import { NextResponse } from 'next/server';
import { createWoocommerceOrder } from '@/lib/woocommerce';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, form, razorpayPaymentId, razorpayOrderId } = body;

    if (!items || !form) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    // Map cart items to WooCommerce line items
    const lineItems = items.map((item: any) => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    const orderData = {
      payment_method: 'razorpay',
      payment_method_title: 'Razorpay',
      set_paid: true,
      transaction_id: razorpayPaymentId,
      billing: {
        first_name: form.firstName,
        last_name: form.lastName,
        address_1: form.address,
        city: form.city,
        state: form.state,
        postcode: form.pinCode,
        country: 'IN',
        email: form.email,
        phone: form.phone
      },
      shipping: {
        first_name: form.firstName,
        last_name: form.lastName,
        address_1: form.address,
        city: form.city,
        state: form.state,
        postcode: form.pinCode,
        country: 'IN',
        phone: form.phone
      },
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'Flat Rate',
          total: '40.00'
        }
      ],
      line_items: lineItems,
      meta_data: [
        {
          key: 'razorpay_order_id',
          value: razorpayOrderId
        }
      ]
    };

    const wcOrder = await createWoocommerceOrder(orderData);

    return NextResponse.json({ success: true, order: wcOrder });
  } catch (error: any) {
    console.error('API Error creating WooCommerce order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create WooCommerce order' }, { status: 500 });
  }
}
