const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    // Check if admins table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='admins';", (err, table) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (!table) {
            console.log('Admins table not found in dev.db');
            return;
        }

        db.all("SELECT id, username, password_hash, role FROM admins", (err, rows) => {
            if (err) {
                console.error('Error querying admins:', err.message);
            } else {
                if (rows.length === 0) {
                    console.log('No admin users found in dev.db');
                } else {
                    console.log('Found Admin Users:');
                    rows.forEach(row => {
                        console.log(`- Username: ${row.username}, Role: ${row.role}`);
                        // Password is hashed, so we can't show it directly, but helpful to know it exists.
                    });
                }
            }
        });
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
