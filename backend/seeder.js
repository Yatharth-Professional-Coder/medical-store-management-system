const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'SuperAdmin'
        });

        console.log('Data Imported!');
        console.log(`Super Admin Created: ${superAdmin.email} / password123`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
