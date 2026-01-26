import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import Chef from '../models/Chef';

dotenv.config();

// Create a dummy ObjectId for createdBy field
const userId = new mongoose.Types.ObjectId('6935dc6a650136381fe4fdb8');

const chefs = [
    {
        name: 'Gordon Martinez',
        title: 'Executive Chef',
        specialty: 'French Cuisine',
        label: 'Master Chef',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949685/team-1_f1njfc.png',
        altText: 'Executive Chef Gordon Martinez',
        profileLink: 'gordon-martinez', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/gordon-martinez',
            facebook: 'https://facebook.com/gordonmartinez',
            twitter: 'https://twitter.com/gordonmartinez',
        },
        isActive: true,
        displayOrder: 1,
        createdBy: userId,
    },
    {
        name: 'Maria Rodriguez',
        title: 'Head Pastry Chef',
        specialty: 'Pastry & Desserts',
        label: 'Award Winner',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949685/team-2_b6cqnm.png',
        altText: 'Head Pastry Chef Maria Rodriguez',
        profileLink: 'maria-rodriguez', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/maria-rodriguez',
            facebook: 'https://facebook.com/mariarodriguez',
            twitter: 'https://twitter.com/mariarodriguez',
        },
        isActive: true,
        displayOrder: 2,
        createdBy: userId,
    },
    {
        name: 'James Chen',
        title: 'Sous Chef',
        specialty: 'Asian Fusion',
        label: 'Innovation Expert',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949685/team-3_v3asbi.png',
        altText: 'Sous Chef James Chen',
        profileLink: 'james-chen', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/james-chen',
            facebook: 'https://facebook.com/jameschen',
            twitter: 'https://twitter.com/jameschen',
        },
        isActive: true,
        displayOrder: 3,
        createdBy: userId,
    },
    {
        name: 'Isabella Rossi',
        title: 'Italian Cuisine Specialist',
        specialty: 'Italian Cuisine',
        label: 'Traditional Master',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949684/team-4_kkmdds.png',
        altText: 'Italian Cuisine Specialist Isabella Rossi',
        profileLink: 'isabella-rossi', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/isabella-rossi',
            facebook: 'https://facebook.com/isabellarossi',
            twitter: 'https://twitter.com/isabellarossi',
        },
        isActive: true,
        displayOrder: 4,
        createdBy: userId,
    },
    {
        name: 'Ahmed Hassan',
        title: 'Grill Master',
        specialty: 'BBQ & Grilled Meats',
        label: 'Fire Expert',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949684/team-5_j9a3dp.png',
        altText: 'Grill Master Ahmed Hassan',
        profileLink: 'ahmed-hassan', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/ahmed-hassan',
            facebook: 'https://facebook.com/ahmedhassan',
            twitter: 'https://twitter.com/ahmedhassan',
        },
        isActive: true,
        displayOrder: 5,
        createdBy: userId,
    },
    {
        name: 'Sophie Laurent',
        title: 'Seafood Specialist',
        specialty: 'Seafood & Mediterranean',
        label: 'Ocean Master',
        imgSrc: 'https://res.cloudinary.com/deuhv7bop/image/upload/v1764949686/team-6_bjaimo.png',
        altText: 'Seafood Specialist Sophie Laurent',
        profileLink: 'sophie-laurent', // ✅ Added
        socialLinks: {
            linkedin: 'https://linkedin.com/in/sophie-laurent',
            facebook: 'https://facebook.com/sophielaurent',
            twitter: 'https://twitter.com/sophielaurent',
        },
        isActive: true,
        displayOrder: 6,
        createdBy: userId,
    },
];

const seedChefs = async () => {
    try {
        await connectDB();

        // Clear existing chefs
        await Chef.deleteMany({});
        console.log('🗑️  Cleared existing chefs');

        // Insert chefs
        await Chef.insertMany(chefs);
        console.log('✅ Chefs seeded successfully!');
        console.log(`📊 Total chefs: ${chefs.length}`);

        // Display seeded chefs
        console.log('\n👨‍🍳 Seeded Chefs:');
        chefs.forEach((chef, index) => {
            console.log(`${index + 1}. ${chef.name} - ${chef.title} (${chef.specialty})`);
            console.log(`   Profile Link: /chefs/${chef.profileLink}`);
        });

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error seeding chefs:', error.message);
        process.exit(1);
    }
};

seedChefs();