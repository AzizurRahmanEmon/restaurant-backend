import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Gallery from '../models/Gallery';
import User from '../models/User';

dotenv.config();

const galleryItems = [
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017517/gallery-1_mhhtub.png',
        width: 670,
        height: 779,
        title: 'Blue Cheese & Ham',
        category: 'Food',
        desc: 'Sausage, Three 2024',
        span: 'row-span-2',
        displayOrder: 1,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017516/gallery-2_hycrcp.png',
        width: 670,
        height: 443,
        title: 'Grilled Salmon',
        category: 'Food',
        desc: 'Fresh catch, 2024',
        span: '',
        displayOrder: 2,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017519/gallery-3_susvte.png',
        width: 670,
        height: 304,
        title: 'Caesar Salad',
        category: 'Food',
        desc: 'Garden fresh, 2024',
        span: '',
        displayOrder: 3,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017515/gallery-4_ibf9tx.png',
        width: 670,
        height: 443,
        title: 'Beef Steak',
        category: 'Food',
        desc: 'Prime cut, 2024',
        span: '',
        displayOrder: 4,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017516/gallery-5_wnwnmy.png',
        width: 670,
        height: 779,
        title: 'Pasta Carbonara',
        category: 'Food',
        desc: 'Italian classic, 2024',
        span: 'row-span-2',
        displayOrder: 5,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765017516/gallery-6_nqzh43.png',
        width: 670,
        height: 304,
        title: 'Chocolate Dessert',
        category: 'Dessert',
        desc: 'Sweet delight, 2024',
        span: '',
        displayOrder: 6,
    },
];

const seedGallery = async () => {
    try {
        console.log('🌱 Starting gallery seeding process...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Find a user to be the creator
        const creator = await User.findOne();

        if (!creator) {
            console.error('❌ No user found in database.');
            console.error('💡 Please create a user first by registering or running user seed script.\n');
            process.exit(1);
        }

        console.log(`👤 Found creator: (${creator.email})\n`);

        // Clear existing gallery items
        const deletedCount = await Gallery.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing gallery item(s)\n`);

        // Add creator to all gallery items
        const galleryWithCreator = galleryItems.map(item => ({
            ...item,
            createdBy: creator._id,
        }));

        // Insert gallery items
        const createdItems = await Gallery.insertMany(galleryWithCreator);
        console.log(`✅ Successfully seeded ${createdItems.length} gallery items\n`);

        // Display statistics
        console.log('📊 Gallery Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const activeCount = createdItems.filter(i => i.isActive).length;
        const spanCount = createdItems.filter(i => i.span === 'row-span-2').length;

        console.log(`   🖼️  Total Items:     ${createdItems.length}`);
        console.log(`   ✅ Active:          ${activeCount}`);
        console.log(`   📏 Large Span:      ${spanCount}`);

        console.log('\n📂 Items by Category:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const categories = [...new Set(createdItems.map(i => i.category))];
        categories.forEach(cat => {
            const count = createdItems.filter(i => i.category === cat).length;
            console.log(`   ${cat.padEnd(20)} ${count}`);
        });

        console.log('\n📐 Image Dimensions:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const dimensions = [...new Set(createdItems.map(i => `${i.width}x${i.height}`))];
        dimensions.forEach(dim => {
            const count = createdItems.filter(
                i => `${i.width}x${i.height}` === dim
            ).length;
            console.log(`   ${dim.padEnd(20)} ${count}`);
        });

        console.log('\n🎉 Gallery seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding gallery:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedGallery();