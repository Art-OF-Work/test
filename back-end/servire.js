const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function initializeDatabase() {
  const dbPath = path.join(__dirname, 'clinisys.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('Database initialized successfully');
}

initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.all('SELECT id, username, email, role, created_at, last_login_at FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.all('SELECT id, username, email, role, created_at, last_login_at FROM users WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patients routes
app.get('/api/patients', async (req, res) => {
  try {
    const result = await db.all(
      'SELECT p.*, u.email, u.username FROM patients p JOIN users u ON p.user_id = u.id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.all(
      'SELECT p.*, u.email, u.username FROM patients p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctors routes
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await db.all(
      'SELECT d.*, u.email, u.username FROM doctors d JOIN users u ON d.user_id = u.id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration route
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await db.all(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );
    
    const user = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', [result.lastID]);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error during registration', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await db.all('SELECT * FROM users WHERE username = ?', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login time
    await db.run('UPDATE users SET last_login_at = DATETIME("now") WHERE id = ?', [user.id]);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error during login', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});