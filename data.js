const sqlite3 = require('sqlite3').verbose();

// Kết nối tới cơ sở dữ liệu SQLite, nếu chưa có, nó sẽ tự động tạo mới
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Tạo một bảng mới nếu nó chưa tồn tại
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hwid TEXT NOT NULL,
    email TEXT NOT NULL
  )`);
  
  // Thêm một người dùng mới vào cơ sở dữ liệu
  const newUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };
  db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, [newUser.name, newUser.email], function(err) {
    if (err) {
      return console.error('Error inserting user:', err.message);
    }
    console.log(`A new user has been inserted with id ${this.lastID}`);
  });
  