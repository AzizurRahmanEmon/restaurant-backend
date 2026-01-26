import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Blog from '../models/Blog';
import User from '../models/User';

dotenv.config();

// Helper function to generate link from title
const generateLink = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const blogs = [
    {
        title: 'The Art of Perfect Pizza Making',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008046/blog-main-1_zr50va.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-details-1_zfl2bj.png',
        date: new Date('2024-03-15'),
        category: 'Recipes',
        tags: ['pizza', 'italian', 'cooking', 'tips'],
        content: `Making the perfect pizza at home is an art that combines tradition, technique, and quality ingredients. In this comprehensive guide, we'll walk you through every step of creating authentic Italian pizza in your own kitchen.

**The Foundation: Perfect Dough**
The secret to great pizza starts with the dough. Use high-quality flour, preferably tipo 00, which creates that perfect chewy yet crispy crust. Allow your dough to ferment for at least 24 hours in the refrigerator for maximum flavor development.

**Sauce Selection**
Keep it simple with San Marzano tomatoes, olive oil, salt, and fresh basil. The sauce should be uncooked and spread thinly.

**Cheese Matters**
Use fresh mozzarella, preferably buffalo mozzarella, and drain it well to avoid a soggy pizza.

**Baking Tips**
Preheat your oven to the highest temperature possible (ideally 500°F/260°C) with a pizza stone inside for at least 30 minutes.

With these tips, you'll be making restaurant-quality pizza at home in no time!`,
        excerpt: 'Learn the secrets to making authentic Italian pizza at home with our comprehensive guide covering dough, sauce, cheese, and baking techniques.',
        status: 'published',
        isFeatured: true,
    },
    {
        title: 'Farm to Table: Our Sustainability Journey',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-2_tvumpt.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008048/blog-details-2_azswea.png',
        date: new Date('2024-03-10'),
        category: 'News',
        tags: ['sustainability', 'organic', 'farm-to-table', 'local'],
        content: `At Zestify, we believe in serving food that's not only delicious but also responsibly sourced. Our commitment to sustainability goes beyond just a trendy phrase – it's the foundation of everything we do.

**Local Partnerships**
We've established relationships with over 20 local farms within a 50-mile radius. This means fresher ingredients, reduced carbon footprint, and support for our local economy.

**Seasonal Menus**
Our menu changes with the seasons, ensuring we're always using ingredients at their peak flavor and nutritional value.

**Zero Waste Goals**
We've implemented a comprehensive composting program and work with local food banks to donate excess food.

**Organic Standards**
Over 80% of our produce is certified organic, and we're constantly working to increase this percentage.

Join us in making dining a more sustainable experience!`,
        excerpt: 'Discover how Zestify is committed to sustainability through local partnerships, seasonal menus, and zero-waste initiatives.',
        status: 'published',
        isFeatured: true,
    },
    {
        title: '10 Essential Knife Skills Every Home Cook Should Master',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-3_kxte0z.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-details-3_d6hkgq.png',
        date: new Date('2024-03-05'),
        category: 'Tips',
        tags: ['cooking-tips', 'knife-skills', 'techniques', 'kitchen'],
        content: `Proper knife skills are the foundation of efficient cooking. Whether you're a beginner or looking to refine your technique, mastering these essential cuts will transform your time in the kitchen.

**1. The Claw Grip**
Protect your fingers by curling them like a claw when holding ingredients.

**2. Julienne**
Perfect matchstick cuts for stir-fries and garnishes.

**3. Brunoise**
Fine dice technique for aromatic vegetables.

**4. Chiffonade**
Rolling and slicing herbs and leafy greens into ribbons.

**5. Mincing**
Creating very fine pieces of garlic, ginger, and herbs.

**6. Dicing**
Uniform cubes in small, medium, or large sizes.

**7. Chopping**
Rough cuts for ingredients that will be cooked for long periods.

**8. Slicing**
Consistent thickness for even cooking.

**9. Bias Cut**
Angled slices for Asian dishes and attractive presentations.

**10. Rock Chopping**
Using the tip of your knife as a pivot for quick mincing.

Practice makes perfect – start with softer vegetables and work your way up!`,
        excerpt: 'Master these 10 fundamental knife skills to improve your efficiency and safety in the kitchen.',
        status: 'published',
        isFeatured: false,
    },
    {
        title: 'Wine Pairing Guide for Beginners',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-4_mlnwcx.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008048/blog-details-4_d2nb2e.png',
        date: new Date('2024-02-28'),
        category: 'Tips',
        tags: ['wine', 'pairing', 'beverages', 'dining'],
        content: `Wine pairing doesn't have to be intimidating. Follow these simple guidelines to enhance your dining experience.

**Basic Principles**
- Match weight with weight (light wines with light dishes)
- Consider acidity (acidic wines with acidic foods)
- Tannins pair well with protein
- Sweet wines balance spicy foods

**Red Wines**
- Cabernet Sauvignon: Steak, lamb, rich sauces
- Pinot Noir: Salmon, chicken, mushroom dishes
- Merlot: Roasted vegetables, pasta with tomato sauce

**White Wines**
- Chardonnay: Butter-based dishes, lobster, creamy pasta
- Sauvignon Blanc: Salads, goat cheese, seafood
- Riesling: Spicy Asian cuisine, pork, fruit-based desserts

**The Golden Rule**
The best pairing is the one you enjoy! Don't be afraid to experiment and find your own favorite combinations.`,
        excerpt: 'Learn the fundamentals of wine pairing with this beginner-friendly guide to enhance your meals.',
        status: 'published',
        isFeatured: false,
    },
    {
        title: 'Behind the Scenes: A Day in Our Kitchen',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-3_kxte0z.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-details-3_d6hkgq.png',
        date: new Date('2024-02-20'),
        category: 'Chef Stories',
        tags: ['behind-the-scenes', 'kitchen', 'team', 'restaurant'],
        content: `Ever wondered what happens behind the kitchen doors? Join us for a typical day at Zestify's bustling kitchen.

**5:00 AM - Prep Begins**
Our team arrives early to prepare fresh ingredients, bake bread, and create the day's specials.

**10:00 AM - Pre-Service Meeting**
The entire team gathers to discuss specials, dietary restrictions, and coordinate for the day ahead.

**11:30 AM - Lunch Service**
The pace quickens as orders start flowing in. Communication and teamwork are essential.

**3:00 PM - Afternoon Break**
The team takes a well-deserved break, enjoying family meal together.

**5:00 PM - Dinner Prep**
Final preparations for the evening service, ensuring everything is perfectly mise en place.

**5:30 PM - Dinner Service**
The kitchen comes alive with energy as we serve our guests until close.

**10:30 PM - Clean Down**
A clean kitchen is a happy kitchen. The team works together to prepare for tomorrow.

It's demanding work, but the satisfaction of creating memorable dining experiences makes it all worthwhile!`,
        excerpt: 'Step inside our kitchen and discover what it takes to prepare and serve exceptional meals every day.',
        status: 'published',
        isFeatured: true,
    },
    {
        title: 'Summer Menu Preview: Fresh and Light',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-4_mlnwcx.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008048/blog-details-4_d2nb2e.png',
        date: new Date('2024-02-15'),
        category: 'Restaurant Updates',
        tags: ['menu', 'seasonal', 'summer', 'new-dishes'],
        content: `Get ready for summer! We're excited to preview some of the fresh, light dishes coming to our menu next season.

**Heirloom Tomato Salad**
Featuring locally grown heirloom tomatoes, fresh mozzarella, and basil with aged balsamic.

**Grilled Peach and Arugula Salad**
Sweet grilled peaches with peppery arugula, goat cheese, and honey vinaigrette.

**Citrus-Herb Grilled Salmon**
Fresh salmon with lemon, orange, and fresh herbs served over quinoa pilaf.

**Watermelon Gazpacho**
A refreshing cold soup perfect for hot summer days.

**Lavender Honey Panna Cotta**
A light, floral dessert to end your meal on a sweet note.

**Summer Cocktails**
Featuring fresh fruit, herbs, and light spirits perfect for warm evenings.

Stay tuned for the official menu launch in May!`,
        excerpt: 'Preview our upcoming summer menu featuring fresh, seasonal ingredients and light, flavorful dishes.',
        status: 'draft',
        isFeatured: false,
    },
    {
        title: 'The History of Italian Pasta: From Ancient Times to Today',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-main-2_tvumpt.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008048/blog-details-2_azswea.png',
        date: new Date('2024-02-10'),
        category: 'Recipes',
        tags: ['pasta', 'italian', 'history', 'culture'],
        content: `Pasta is more than just a food – it's a cultural icon with a rich history spanning centuries.

**Ancient Origins**
While many believe Marco Polo brought pasta from China, evidence suggests Italians were making pasta as early as the 4th century BC.

**Evolution of Shapes**
Different regions of Italy developed unique pasta shapes based on local ingredients and traditions. From the long strands of spaghetti to the tubes of rigatoni, each shape serves a purpose.

**Dried vs. Fresh**
The introduction of dried pasta in the 12th century revolutionized Italian cuisine, making it possible to store and transport.

**Regional Varieties**
- Northern Italy: Fresh egg pasta like tagliatelle and tortellini
- Southern Italy: Dried durum wheat pasta like spaghetti and penne
- Sicily: Unique shapes like busiate and casarecce

**Modern Day**
Today, pasta remains a staple of Italian cuisine and has been embraced worldwide, with countless variations and fusion dishes celebrating this versatile food.

Understanding pasta's history helps us appreciate every bite of this timeless dish.`,
        excerpt: 'Explore the fascinating history of Italian pasta from ancient times to its place in modern cuisine.',
        status: 'published',
        isFeatured: false,
    },
    {
        title: 'Mastering the Art of Homemade Bread',
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008046/blog-main-1_zr50va.png',
        descImg: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008047/blog-details-1_zfl2bj.png',
        date: new Date('2024-02-05'),
        category: 'Recipes',
        tags: ['bread', 'baking', 'techniques', 'homemade'],
        content: `There's nothing quite like the aroma of freshly baked bread. Learn to master this timeless skill.

**Understanding Ingredients**
Flour, water, yeast, and salt – these simple ingredients create magic when combined correctly.

**The Kneading Process**
Proper kneading develops gluten, giving bread its structure and chewy texture. Knead for 10-15 minutes by hand or 5-7 minutes with a mixer.

**First Rise**
Allow dough to double in size in a warm place. This typically takes 1-2 hours.

**Shaping Techniques**
Learn to shape boules, baguettes, and sandwich loaves with confidence.

**Second Rise**
Also called proofing, this shorter rise allows shaped dough to expand before baking.

**Baking**
Steam in the oven creates a crispy crust. Try placing a pan of water in the oven.

**Troubleshooting**
- Dense bread: Under-kneaded or not enough rise time
- Flat bread: Over-proofed or old yeast
- Tough crust: Baked too long or too high temperature

With practice, you'll be baking bakery-quality bread at home!`,
        excerpt: 'Learn the fundamentals of bread making from kneading to baking for perfect homemade loaves.',
        status: 'published',
        isFeatured: false,
    },
];

const seedBlogs = async () => {
    try {
        console.log('🌱 Starting blog seeding process...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Find a user to be the author
        const author = await User.findOne();

        if (!author) {
            console.error('❌ No user found in database.');
            console.error('💡 Please create a user first by registering or running user seed script.\n');
            process.exit(1);
        }

        console.log(`👤 Found author: (${author.email})\n`);

        // Clear existing blogs
        const deletedCount = await Blog.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing blog(s)\n`);

        // Add author and generate link for all blogs
        const blogsWithAuthorAndLink = blogs.map(blog => ({
            ...blog,
            author: author._id,
            link: generateLink(blog.title), // Manually generate link
        }));

        // Insert blogs
        const createdBlogs = await Blog.insertMany(blogsWithAuthorAndLink);
        console.log(`✅ Successfully seeded ${createdBlogs.length} blogs\n`);

        // Display statistics
        console.log('📊 Blog Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const publishedCount = createdBlogs.filter(b => b.status === 'published').length;
        const draftCount = createdBlogs.filter(b => b.status === 'draft').length;
        const featuredCount = createdBlogs.filter(b => b.isFeatured).length;

        console.log(`   📝 Total Blogs:     ${createdBlogs.length}`);
        console.log(`   ✅ Published:       ${publishedCount}`);
        console.log(`   📄 Drafts:          ${draftCount}`);
        console.log(`   ⭐ Featured:        ${featuredCount}`);

        console.log('\n📂 Blogs by Category:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const categories = [...new Set(createdBlogs.map(b => b.category))];
        categories.forEach(cat => {
            const count = createdBlogs.filter(b => b.category === cat).length;
            console.log(`   ${cat.padEnd(20)} ${count}`);
        });

        console.log('\n🏷️  Popular Tags:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const allTags = createdBlogs.flatMap(b => b.tags);
        const tagCounts = allTags.reduce((acc: any, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        Object.entries(tagCounts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([tag, count]) => {
                console.log(`   ${tag.padEnd(20)} ${count}`);
            });

        console.log('\n🎉 Blog seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding blogs:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedBlogs();