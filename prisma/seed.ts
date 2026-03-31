import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  console.log("Connected to database.");

  // Hash the password
  const passwordHash = await bcrypt.hash("admin123", 12);
  console.log("Password hashed.");

  // Check if user already exists
  const [existing]: any = await connection.query(
    "SELECT id FROM users WHERE email = ?", ["admin@daikin.com"]
  );

  if (existing.length > 0) {
    console.log("User admin@daikin.com already exists. Updating password...");
    await connection.query(
      "UPDATE users SET password_hash = ?, is_active = 1 WHERE email = ?",
      [passwordHash, "admin@daikin.com"]
    );
    console.log("Password updated.");
  } else {
    console.log("Creating admin user...");
    await connection.query(
      `INSERT INTO users (name, email, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, NOW())`,
      ["Administrator", "admin@daikin.com", passwordHash, 1]
    );
    console.log("Admin user created.");
  }

  // Verify
  const [verify]: any = await connection.query(
    "SELECT id, name, email, is_active FROM users WHERE email = ?", ["admin@daikin.com"]
  );
  console.log("\nVerification:", verify[0]);

  await connection.end();
  console.log("\nSeed complete! You can now login with:");
  console.log("  Email: admin@daikin.com");
  console.log("  Password: admin123");
}

seed();
