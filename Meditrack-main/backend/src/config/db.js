const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`
🍃 MongoDB Connected Successfully!
📊 Database: ${conn.connection.name}
🌐 Host: ${conn.connection.host}
🔌 Port: ${conn.connection.port}
🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Suggestion: Check your MongoDB URI and internet connection');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Suggestion: Check your database username and password');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Suggestion: Check your firewall settings and MongoDB service status');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
