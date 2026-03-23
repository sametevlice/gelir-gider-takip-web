const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyasının yolu (db klasörünün içinde expenses.db yaratılacak)
const dbPath = path.resolve(__dirname, 'finance.db');

// Veritabanına bağlan
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanına bağlanırken bir hata oluştu:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlanıldı.');
    }
});

// Veritabanı tablolarını başlat
db.serialize(() => {
    // Kullanıcılar (Users) tablosu
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error("Users tablosu oluşturulurken hata:", err.message);
        } else {
            console.log("Users tablosu hazır.");
        }
    });

    // İleriki haftalar için Gelir/Gider (Transactions) tablosu eklenebilir.
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'income' veya 'expense'
        category TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error("Transactions tablosu oluşturulurken hata:", err.message);
        } else {
            console.log("Transactions tablosu hazır.");
        }
    });

});

module.exports = db;
