require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error connecting to db:', error.message);
        process.exit(1);
    }
}

startServer();
