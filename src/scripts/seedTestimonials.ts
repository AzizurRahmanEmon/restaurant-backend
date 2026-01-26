import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Testimonial from '../models/Testimonial';
import User from '../models/User';

dotenv.config();

const testimonials = [
    {
        testimony: "Nestled within a fresh, toasted bun each bite unveils a perfect harmony of textures, complemented by layers of crisp lettuce, ripe tomatoes, and crunch pickles. Our secret sauce proprietary blend savory. The experience at this restaurant has been absolutely phenomenal!",
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765104602/user_jqhzgj.png',
        name: 'Azizur Rahman',
        position: 'Co Founder',
        rating: 5,
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
    },
    {
        testimony: "The food quality is exceptional and the service is top-notch. Every dish is prepared with care and attention to detail. The ambiance creates a perfect dining atmosphere for any occasion. Highly recommended for food lovers!",
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765104602/user_jqhzgj.png',
        name: 'Sarah Johnson',
        position: 'Food Blogger',
        rating: 5,
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
    },
    {
        testimony: "Amazing culinary experience! The flavors are incredible and the presentation is beautiful. The staff is friendly and attentive. This has become my favorite restaurant in the city. Worth every penny!",
        img: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765104602/user_jqhzgj.png',
        name: 'Michael Chen',
        position: 'Business Owner',
        rating: 5,
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
    },
];

const seedTestimonials = async () => {
    try {
        console.log('🌱 Starting testimonial seeding process...\n');

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

        // Clear existing testimonials
        const deletedCount = await Testimonial.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing testimonial(s)\n`);

        // Add creator to all testimonials
        const testimonialsWithCreator = testimonials.map(item => ({
            ...item,
            createdBy: creator._id,
        }));

        // Insert testimonials
        const createdTestimonials = await Testimonial.insertMany(testimonialsWithCreator);
        console.log(`✅ Successfully seeded ${createdTestimonials.length} testimonials\n`);

        // Display statistics
        console.log('📊 Testimonial Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const activeCount = createdTestimonials.filter(t => t.isActive).length;
        const featuredCount = createdTestimonials.filter(t => t.isFeatured).length;
        const avgRating = (createdTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / createdTestimonials.length).toFixed(1);

        console.log(`   💬 Total Testimonials:  ${createdTestimonials.length}`);
        console.log(`   ✅ Active:              ${activeCount}`);
        console.log(`   ⭐ Featured:            ${featuredCount}`);
        console.log(`   📈 Average Rating:      ${avgRating}/5`);

        console.log('\n👥 Testimonials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        createdTestimonials.forEach(t => {
            const featured = t.isFeatured ? '⭐' : '  ';
            console.log(`   ${featured} ${t.name.padEnd(20)} - ${t.position}`);
        });

        console.log('\n🎉 Testimonial seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding testimonials:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedTestimonials();