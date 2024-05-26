const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:'); // Hoặc ':memory:' cho cơ sở dữ liệu trong bộ nhớ, hoặc tên tệp để lưu vào đĩa

// Tạo bảng nếu chưa tồn tại
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS banned_ips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL
        )
    `);
});

module.exports = db;
