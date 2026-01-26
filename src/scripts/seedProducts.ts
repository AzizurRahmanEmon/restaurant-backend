import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Product from '../models/Product';

dotenv.config();

const products = [
    // Coffee (3 featured)
    {
        name: 'Double Espresso',
        slug: 'double-espresso',
        description: 'Rich and bold double shot of espresso',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764930513/fast-food-item-1_vwse7q.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764930513/fast-food-item-1_vwse7q.png'],
        category: 'coffee',
        tags: ['hot', 'strong', 'popular'],
        stock: 100,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 5,
    },
    {
        name: 'Raw Coffee',
        slug: 'raw-coffee',
        description: 'Pure and unfiltered coffee experience',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932201/fast-food-item-2_flau3a.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932201/fast-food-item-2_flau3a.png'],
        category: 'coffee',
        tags: ['hot', 'organic'],
        stock: 100,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 5,
    },
    {
        name: 'Irish Coffee',
        slug: 'irish-coffee',
        description: 'Classic coffee with a whiskey twist',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932208/fast-food-item-3_e1onfw.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932208/fast-food-item-3_e1onfw.png'],
        category: 'coffee',
        tags: ['hot', 'special'],
        stock: 50,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 7,
    },

    // Grill (3 featured)
    {
        name: 'Grilled Chicken',
        slug: 'grilled-chicken',
        description: 'Perfectly grilled chicken with herbs',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932221/fast-food-item-4_wdq9pl.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932221/fast-food-item-4_wdq9pl.png'],
        category: 'grill',
        tags: ['healthy', 'protein'],
        stock: 50,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 20,
    },
    {
        name: 'Grilled Beef',
        slug: 'grilled-beef',
        description: 'Premium beef grilled to perfection',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932222/fast-food-item-5_yop01n.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932222/fast-food-item-5_yop01n.png'],
        category: 'grill',
        tags: ['premium', 'protein'],
        stock: 30,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 25,
    },
    {
        name: 'Grilled Fish',
        slug: 'grilled-fish',
        description: 'Fresh fish grilled with lemon butter',
        price: 27.02,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932233/fast-food-item-6_cpjzwj.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932233/fast-food-item-6_cpjzwj.png'],
        category: 'grill',
        tags: ['healthy', 'seafood'],
        stock: 40,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
        preparationTime: 15,
    },

    // Fast Food / Shop items (at least 1 featured per category used)
    {
        name: 'Chicken Fried Rice',
        slug: 'chicken-fried-rice',
        description: 'Delicious fried rice with chicken',
        price: 27.00,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932233/fast-food-item-7_jzj8sa.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932233/fast-food-item-7_jzj8sa.png'],
        category: 'fast-food',
        tags: ['popular', 'asian'],
        stock: 75,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
    },
    {
        name: 'Breakfast Platter',
        slug: 'breakfast-platter',
        description: 'Complete breakfast with eggs and toast',
        price: 24.00,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764932234/fast-food-item-8_qu3mdb.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764932234/fast-food-item-8_qu3mdb.png'],
        category: 'breakfast',
        tags: ['morning', 'healthy'],
        stock: 60,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
    },
    {
        name: 'Pizza Best Platter',
        slug: 'pizza-best-platter',
        description: 'Assorted pizza slices',
        price: 37.00,
        image: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764930513/fast-food-item-1_vwse7q.png',
        images: ['https://res.cloudinary.com/deuhv7bop/image/upload/v1764930513/fast-food-item-1_vwse7q.png'],
        category: 'italian',
        tags: ['popular', 'cheese'],
        stock: 80,
        rating: { stars: 4.7, reviews: 365 },
        isFeatured: true,
    },
];

const seedProducts = async () => {
    try {
        await connectDB();

        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        await Product.insertMany(products);
        console.log('✅ Products seeded successfully!');
        console.log(`📊 Total products: ${products.length}`);

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error seeding products:', error.message);
        process.exit(1);
    }
};

seedProducts();