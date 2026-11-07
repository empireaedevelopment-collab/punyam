// Utilities to fetch data from a Headless WordPress backend.
// Replace WP_API_URL with your actual WordPress site URL.

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';

export const mockProducts = [
  { id: 1, title: { rendered: "Premium Brass Rudraksha Mala" }, image: "/product_1.png", price: "₹1,499", description: "Authentic 108 bead brass rudraksha mala, sourced directly from the Himalayas. Perfect for daily japa and meditation." },
  { id: 2, title: { rendered: "Copper Pooja Thali Set" }, image: "/product_2.png", price: "₹2,199", description: "Beautiful handcrafted copper pooja thali set including diya, incense holder, and traditional bell for your daily rituals." },
  { id: 3, title: { rendered: "Carved Wooden Incense Holder" }, image: "/product_3.png", price: "₹599", description: "Intricately carved wooden incense holder that catches ash and spreads fragrance evenly throughout your sacred space." },
  { id: 4, title: { rendered: "Clear Sphatik Shivling" }, image: "/product_4.png", price: "₹3,499", description: "Premium quality, crystal clear quartz (sphatik) shivling. Brings positive energy, peace, and prosperity to your home." },
  { id: 5, title: { rendered: "Sacred Rudraksha Mala" }, image: "/product_1.png", price: "₹999", description: "Traditional 5 mukhi rudraksha mala strung on durable thread. A must-have for every spiritual practitioner." },
  { id: 6, title: { rendered: "Antique Diya Set" }, image: "/product_2.png", price: "₹1,299", description: "Set of 2 antique-finished diyas. Perfect for Diwali, festivals, or daily evening pooja." },
  { id: 7, title: { rendered: "Sandalwood Incense Combo" }, image: "/product_3.png", price: "₹399", description: "Pack of 100 premium sandalwood incense sticks. Hand-rolled and made from pure natural ingredients." },
  { id: 8, title: { rendered: "Small Sphatik Shivling" }, image: "/product_4.png", price: "₹1,899", description: "Compact size sphatik shivling, ideal for small home altars and daily worship." }
];

export async function getPosts() {
  if (WP_API_URL === 'https://your-wordpress-site.com/wp-json/wp/v2') {
    return mockProducts;
  }

  try {
    const res = await fetch(`${WP_API_URL}/posts?_embed`);
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  if (WP_API_URL === 'https://your-wordpress-site.com/wp-json/wp/v2') {
    return { id: 1, title: { rendered: `Mock Post: ${slug}` } };
  }

  try {
    const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed`);
    if (!res.ok) {
      throw new Error('Failed to fetch post');
    }
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

export async function getProductById(id: string) {
  if (WP_API_URL === 'https://your-wordpress-site.com/wp-json/wp/v2') {
    const product = mockProducts.find(p => p.id === parseInt(id));
    return product || null;
  }
  
  // Real implementation would fetch from WooREST API or similar
  return null;
}
