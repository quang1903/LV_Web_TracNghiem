const mongoose = require('mongoose');

const connectDB = async () => {        // hàm async kết nối DB
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);  
    // đọc link MongoDB từ file .env rồi kết nối
    
    console.log(`MongoDB kết nối thành công: ${conn.connection.host}`);
    // in ra thông báo kết nối thành công
    
  } catch (error) {
    console.error(`Lỗi kết nối MongoDB: ${error.message}`);
    // nếu lỗi thì in ra lỗi
    
    process.exit(1);
    // tắt server luôn vì không có DB thì chạy vô nghĩa
  }
};

module.exports = connectDB;
// export ra để dùng ở file khác