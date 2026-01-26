import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Settings from '../models/Settings';
import User from '../models/User';

dotenv.config();

const defaultSettings = {
    restaurantName: 'Zestify Restaurant',
    email: 'info@zestify.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Downtown, New York, NY 10001',
    description: 'Experience culinary excellence at Zestify, where fresh ingredients meet innovative cooking techniques. We pride ourselves on serving memorable meals in a warm, welcoming atmosphere.',
    logo: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1765008046/logo.png',
    businessHours: [
        { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
        { day: 'Friday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Saturday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Sunday', open: '10:00', close: '21:00', isClosed: false },
    ],
    notifications: {
        newOrders: true,
        newReservations: true,
        lowStockAlerts: true,
        newMessages: true,
    },
    socialMedia: {
        facebook: 'https://facebook.com/zestify',
        instagram: 'https://instagram.com/zestify',
        twitter: 'https://twitter.com/zestify',
        linkedin: 'https://linkedin.com/company/zestify',
        youtube: 'https://youtube.com/@zestify',
    },
    currency: 'USD',
    timezone: 'America/New_York',
    taxRate: 8.5,
    deliveryFee: 5.0,
    minimumOrderAmount: 15.0,
    allowOnlineOrdering: true,
    allowReservations: true,
};

const seedSettings = async () => {
    try {
        console.log('🌱 Starting settings seeding process...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Find a user to be the updater
        const user = await User.findOne();

        if (!user) {
            console.error('❌ No user found in database.');
            console.error('💡 Please create a user first by registering or running user seed script.\n');
            process.exit(1);
        }

        console.log(`👤 Found user: (${user.email})\n`);

        // Clear existing settings
        const deletedCount = await Settings.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing settings\n`);

        // Create new settings
        const settings = await Settings.create({
            ...defaultSettings,
            updatedBy: user._id,
        });

        console.log('✅ Settings created successfully!\n');

        // Display settings summary
        console.log('⚙️  Settings Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   🏪 Restaurant:       ${settings.restaurantName}`);
        console.log(`   📧 Email:            ${settings.email}`);
        console.log(`   📞 Phone:            ${settings.phone}`);
        console.log(`   📍 Address:          ${settings.address}`);
        console.log(`   💵 Currency:         ${settings.currency}`);
        console.log(`   🕐 Timezone:         ${settings.timezone}`);
        console.log(`   📊 Tax Rate:         ${settings.taxRate}%`);
        console.log(`   🚚 Delivery Fee:     $${settings.deliveryFee}`);
        console.log(`   💰 Min Order:        $${settings.minimumOrderAmount}`);

        console.log('\n📅 Business Hours:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        settings.businessHours.forEach(hours => {
            const status = hours.isClosed
                ? 'Closed'
                : `${hours.open} - ${hours.close}`;
            console.log(`   ${hours.day.padEnd(12)} ${status}`);
        });

        console.log('\n🔔 Notifications:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   New Orders:          ${settings.notifications.newOrders ? '✅' : '❌'}`);
        console.log(`   New Reservations:    ${settings.notifications.newReservations ? '✅' : '❌'}`);
        console.log(`   Low Stock Alerts:    ${settings.notifications.lowStockAlerts ? '✅' : '❌'}`);
        console.log(`   New Messages:        ${settings.notifications.newMessages ? '✅' : '❌'}`);

        console.log('\n🌐 Social Media:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Facebook:            ${settings.socialMedia.facebook || 'Not set'}`);
        console.log(`   Instagram:           ${settings.socialMedia.instagram || 'Not set'}`);
        console.log(`   Twitter:             ${settings.socialMedia.twitter || 'Not set'}`);
        console.log(`   LinkedIn:            ${settings.socialMedia.linkedin || 'Not set'}`);
        console.log(`   YouTube:             ${settings.socialMedia.youtube || 'Not set'}`);

        console.log('\n🚀 Features:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Online Ordering:     ${settings.allowOnlineOrdering ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`   Reservations:        ${settings.allowReservations ? '✅ Enabled' : '❌ Disabled'}`);

        console.log('\n🎉 Settings seeding completed successfully!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error seeding settings:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    }
};

// Run the seed function
seedSettings();