export const DEFAULT_FALLBACK_CATEGORIES = [
  { id: 1, name: "Rudraksha", slug: "rudraksha", count: 2 },
  { id: 2, name: "Pooja Essentials", slug: "pooja-essentials", count: 2 },
  { id: 3, name: "Incense & Dhoop", slug: "incense", count: 1 },
  { id: 4, name: "Idols & Murti", slug: "idols", count: 1 }
];

export const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: 101,
    name: "Premium Brass Rudraksha Mala",
    price: "1499",
    regular_price: "1499",
    description: "Authentic 108 bead brass rudraksha mala, sourced directly from the Himalayas. Perfect for daily japa and meditation.",
    categories: [{ id: 1, name: "Rudraksha", slug: "rudraksha" }],
    images: [{ src: "/product_1.png" }],
    stock_status: "instock"
  },
  {
    id: 102,
    name: "Copper Pooja Thali Set",
    price: "2199",
    regular_price: "2199",
    description: "Beautiful handcrafted copper pooja thali set including diya, incense holder, and traditional bell for your daily rituals.",
    categories: [{ id: 2, name: "Pooja Essentials", slug: "pooja-essentials" }],
    images: [{ src: "/product_2.png" }],
    stock_status: "instock"
  },
  {
    id: 103,
    name: "Carved Wooden Incense Holder",
    price: "599",
    regular_price: "599",
    description: "Intricately carved wooden incense holder that catches ash and spreads fragrance evenly throughout your sacred space.",
    categories: [{ id: 3, name: "Incense & Dhoop", slug: "incense" }],
    images: [{ src: "/product_3.png" }],
    stock_status: "instock"
  },
  {
    id: 104,
    name: "Clear Sphatik Shivling",
    price: "3499",
    regular_price: "3499",
    description: "Premium quality, crystal clear quartz (sphatik) shivling. Brings positive energy, peace, and prosperity to your home.",
    categories: [{ id: 4, name: "Idols & Murti", slug: "idols" }],
    images: [{ src: "/product_4.png" }],
    stock_status: "instock"
  },
  {
    id: 105,
    name: "Sacred 5 Mukhi Rudraksha",
    price: "999",
    regular_price: "999",
    description: "Traditional 5 mukhi rudraksha mala strung on durable thread. A must-have for every spiritual practitioner.",
    categories: [{ id: 1, name: "Rudraksha", slug: "rudraksha" }],
    images: [{ src: "/product_1.png" }],
    stock_status: "instock"
  },
  {
    id: 106,
    name: "Antique Diya Set",
    price: "1299",
    regular_price: "1299",
    description: "Set of 2 antique-finished diyas. Perfect for Diwali, festivals, or daily evening pooja.",
    categories: [{ id: 2, name: "Pooja Essentials", slug: "pooja-essentials" }],
    images: [{ src: "/product_2.png" }],
    stock_status: "instock"
  }
];

export const hasWoocommerceCredentials = () => {
  return Boolean(
    process.env.WC_STORE_URL &&
    process.env.WC_CONSUMER_KEY &&
    process.env.WC_CONSUMER_SECRET
  );
};

export const getWoocommerceApiUrl = (endpoint: string) => {
  const storeUrl = process.env.WC_STORE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!storeUrl || !consumerKey || !consumerSecret) {
    return null;
  }

  // Construct URL with query parameters for authentication to avoid CORS/Auth issues in some setups
  // Though for Next.js server-side fetch, Basic Auth headers are better.
  return `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/${endpoint}`;
};

export const getWoocommerceAuthHeader = () => {
  const consumerKey = process.env.WC_CONSUMER_KEY || '';
  const consumerSecret = process.env.WC_CONSUMER_SECRET || '';
  
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getProductCategories() {
  if (!hasWoocommerceCredentials()) {
    return DEFAULT_FALLBACK_CATEGORIES;
  }

  try {
    const url = getWoocommerceApiUrl('products/categories');
    if (!url) return DEFAULT_FALLBACK_CATEGORIES;
    
    // Disable caching to show new products instantly
    const res = await fetch(url, {
      headers: getWoocommerceAuthHeader(),
      next: { revalidate: 0 } 
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch WooCommerce categories: ${res.statusText}. Using fallback.`);
      return DEFAULT_FALLBACK_CATEGORIES;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching WooCommerce categories:', error);
    return DEFAULT_FALLBACK_CATEGORIES;
  }
}

export async function getProducts(categoryId?: number) {
  if (!hasWoocommerceCredentials()) {
    if (categoryId) {
      return DEFAULT_FALLBACK_PRODUCTS.filter(p => p.categories?.some(c => c.id === categoryId));
    }
    return DEFAULT_FALLBACK_PRODUCTS;
  }

  try {
    let endpoint = 'products?status=publish';
    if (categoryId) {
      endpoint += `&category=${categoryId}`;
    }
    
    const url = getWoocommerceApiUrl(endpoint);
    if (!url) return DEFAULT_FALLBACK_PRODUCTS;
    
    const res = await fetch(url, {
      headers: getWoocommerceAuthHeader(),
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch WooCommerce products: ${res.statusText}. Using fallback.`);
      return DEFAULT_FALLBACK_PRODUCTS;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching WooCommerce products:', error);
    return DEFAULT_FALLBACK_PRODUCTS;
  }
}

export async function getProductById(id: number) {
  if (!hasWoocommerceCredentials()) {
    return DEFAULT_FALLBACK_PRODUCTS.find(p => p.id === id) || null;
  }

  try {
    const url = getWoocommerceApiUrl(`products/${id}`);
    if (!url) return DEFAULT_FALLBACK_PRODUCTS.find(p => p.id === id) || null;
    
    const res = await fetch(url, {
      headers: getWoocommerceAuthHeader(),
      next: { revalidate: 0 }
    });
    
    if (res.status === 404) {
      return DEFAULT_FALLBACK_PRODUCTS.find(p => p.id === id) || null;
    }

    if (!res.ok) {
      console.warn(`Failed to fetch WooCommerce product ${id}: ${res.statusText}. Using fallback.`);
      return DEFAULT_FALLBACK_PRODUCTS.find(p => p.id === id) || null;
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching WooCommerce product ${id}:`, error);
    return DEFAULT_FALLBACK_PRODUCTS.find(p => p.id === id) || null;
  }
}

export async function createWoocommerceOrder(orderData: any) {
  if (!hasWoocommerceCredentials()) {
    console.warn('WooCommerce credentials not set. Returning simulated order.');
    return {
      id: Math.floor(1000 + Math.random() * 9000),
      status: 'processing',
      total: orderData.total || '0',
      currency: 'INR',
      date_created: new Date().toISOString(),
      mock: true
    };
  }

  try {
    const url = getWoocommerceApiUrl('orders');
    if (!url) throw new Error('WooCommerce API URL not available');
    
    const res = await fetch(url, {
      method: 'POST',
      headers: getWoocommerceAuthHeader(),
      body: JSON.stringify(orderData)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('WooCommerce order creation failed:', errorText);
      throw new Error(`Failed to create WooCommerce order: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating WooCommerce order:', error);
    throw error;
  }
}
