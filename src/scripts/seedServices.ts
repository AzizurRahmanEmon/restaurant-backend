import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Service from '../models/Service';
import User from '../models/User';

dotenv.config();

const services = [
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-1_ywvxqb.png',
        title: 'Quality Foods',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 1,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-2_ppomfl.png',
        title: 'Potato Skins',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 2,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139154/service-icon-3_lhemfy.png',
        title: 'Caesar Wrap',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 3,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-4_sxqzls.png',
        title: 'Beef Noodles',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 4,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-5_lc27kj.png',
        title: 'Brown Sandwich',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 5,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-6_u1ihmy.png',
        title: 'Mutton Curry',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 6,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-7_vgstte.png',
        title: 'Alfresco Dining',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 7,
    },
    {
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765139155/service-icon-8_zttnfh.png',
        title: 'Expert Chef',
        description: 'Praesent rutrum ligula ligula, eget viverra neque congue sed.',
        isActive: true,
        displayOrder: 8,
    },
];

const seedServices = async () => {
    try {
        console.log('🌱 Starting service seeding process...\n');

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

        // Clear existing services
        const deletedCount = await Service.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing service(s)\n`);

        // Add creator to all services
        const servicesWithCreator = services.map(item => ({
            ...item,
            createdBy: creator._id,
        }));

        // Insert services
        const createdServices = await Service.insertMany(servicesWithCreator);
        console.log(`✅ Successfully seeded ${createdServices.length} services\n`);

        // Display statistics
        console.log('📊 Service Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const activeCount = createdServices.filter(s => s.isActive).length;

        console.log(`   🍽️  Total Services:   ${createdServices.length}`);
        console.log(`   ✅ Active:            ${activeCount}`);

        console.log('\n📋 Services List:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        createdServices.forEach(s => {
            console.log(`   ${s.displayOrder}. ${s.title}`);
            console.log(`      ${s.description}`);
        });

        console.log('\n🎉 Service seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding services:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedServices();