import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Partner from '../models/Partner';
import User from '../models/User';

dotenv.config();

const partners = [
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-1_uuci4c.png',
        width: 90,
        height: 80,
        name: 'Company 1',
        isActive: true,
        displayOrder: 1,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-2_hfq105.png',
        width: 94,
        height: 80,
        name: 'Company 2',
        isActive: true,
        displayOrder: 2,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-3_buvoqj.png',
        width: 94,
        height: 80,
        name: 'Company 3',
        isActive: true,
        displayOrder: 3,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-4_irnrlp.png',
        width: 83,
        height: 80,
        name: 'Company 4',
        isActive: true,
        displayOrder: 4,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-5_yrp9du.png',
        width: 88,
        height: 80,
        name: 'Company 5',
        isActive: true,
        displayOrder: 5,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-6_nac2jf.png',
        width: 88,
        height: 80,
        name: 'Company 6',
        isActive: true,
        displayOrder: 6,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-1_uuci4c.png',
        width: 90,
        height: 80,
        name: 'Company 7',
        isActive: true,
        displayOrder: 7,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-2_hfq105.png',
        width: 94,
        height: 80,
        name: 'Company 8',
        isActive: true,
        displayOrder: 8,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-3_buvoqj.png',
        width: 94,
        height: 80,
        name: 'Company 9',
        isActive: true,
        displayOrder: 9,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-4_irnrlp.png',
        width: 83,
        height: 80,
        name: 'Company 10',
        isActive: true,
        displayOrder: 10,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-5_yrp9du.png',
        width: 88,
        height: 80,
        name: 'Company 11',
        isActive: true,
        displayOrder: 11,
    },
    {
        icon: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765135981/company-6_nac2jf.png',
        width: 88,
        height: 80,
        name: 'Company 12',
        isActive: true,
        displayOrder: 12,
    },
];

const seedPartners = async () => {
    try {
        console.log('🌱 Starting partner seeding process...\n');

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

        // Clear existing partners
        const deletedCount = await Partner.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing partner(s)\n`);

        // Add creator to all partners
        const partnersWithCreator = partners.map(item => ({
            ...item,
            createdBy: creator._id,
        }));

        // Insert partners
        const createdPartners = await Partner.insertMany(partnersWithCreator);
        console.log(`✅ Successfully seeded ${createdPartners.length} partners\n`);

        // Display statistics
        console.log('📊 Partner Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const activeCount = createdPartners.filter(p => p.isActive).length;

        console.log(`   🤝 Total Partners:   ${createdPartners.length}`);
        console.log(`   ✅ Active:           ${activeCount}`);

        console.log('\n📐 Image Dimensions:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const dimensions = [...new Set(createdPartners.map(p => `${p.width}x${p.height}`))];
        dimensions.forEach(dim => {
            const count = createdPartners.filter(
                p => `${p.width}x${p.height}` === dim
            ).length;
            console.log(`   ${dim.padEnd(10)} ${count} partner(s)`);
        });

        console.log('\n🏢 Partners List:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        createdPartners.forEach(p => {
            console.log(`   ${p.displayOrder}. ${p.name} (${p.width}x${p.height})`);
        });

        console.log('\n🎉 Partner seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding partners:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedPartners();