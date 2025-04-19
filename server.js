const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // default MySQL user
  password: '', // your MySQL password if set
  database: 'field_service_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Field Service App Backend');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Register a new user (admin only)
app.post('/api/register', (req, res) => {
  const { username, password, role, full_name } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  
  db.query(
    'INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, role, full_name],
    (err, result) => {
      if (err) return res.status(500).send('Error registering user');
      res.status(200).send({ message: 'User registered successfully' });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).send('Error on the server');
      if (!results.length) return res.status(404).send('User not found');
      
      const user = results[0];
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      
      const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: 86400 }); // 24 hours
      
      res.status(200).send({ 
        auth: true, 
        token, 
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name
        }
      });
    }
  );
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided' });
  
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token' });
    
    req.userId = decoded.id;
    next();
  });
};

// Get jobs for a specific engineer
app.get('/api/jobs/assigned', verifyToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.query(
    `SELECT j.*, u.full_name as assigned_to_name 
     FROM jobs j 
     LEFT JOIN users u ON j.assigned_to = u.id 
     WHERE j.assigned_to = ? AND j.scheduled_date = ? AND j.status != 'completed'`,
    [req.userId, today],
    (err, results) => {
      if (err) return res.status(500).send('Error fetching jobs');
      res.status(200).send(results);
    }
  );
});

// Create a new job (admin only)
app.post('/api/jobs', verifyToken, (req, res) => {
  // Check if user is admin
  db.query(
    'SELECT role FROM users WHERE id = ?',
    [req.userId],
    (err, results) => {
      if (err || results[0].role !== 'admin') {
        return res.status(403).send('Only admins can create jobs');
      }
      
      const { title, description, customer_name, customer_address, customer_phone, scheduled_date, scheduled_time, assigned_to } = req.body;
      
      db.query(
        `INSERT INTO jobs 
         (title, description, customer_name, customer_address, customer_phone, scheduled_date, scheduled_time, assigned_to, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, customer_name, customer_address, customer_phone, scheduled_date, scheduled_time, assigned_to, req.userId],
        (err, result) => {
          if (err) return res.status(500).send('Error creating job');
          res.status(200).send({ message: 'Job created successfully', jobId: result.insertId });
        }
      );
    }
  );
});

// Submit job report
app.post('/api/jobs/:id/report', verifyToken, (req, res) => {
  const jobId = req.params.id;
  const { work_performed, parts_used, customer_comments, signature_data } = req.body;
  
  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).send('Error starting transaction');
    
    // Update job status
    db.query(
      'UPDATE jobs SET status = "completed" WHERE id = ?',
      [jobId],
      (err) => {
        if (err) return db.rollback(() => res.status(500).send('Error updating job status'));
        
        // Create job report
        db.query(
          `INSERT INTO job_reports 
           (job_id, engineer_id, work_performed, parts_used, customer_comments, signature_data) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [jobId, req.userId, work_performed, parts_used, customer_comments, signature_data],
          (err) => {
            if (err) return db.rollback(() => res.status(500).send('Error creating job report'));
            
            db.commit(err => {
              if (err) return db.rollback(() => res.status(500).send('Error committing transaction'));
              res.status(200).send({ message: 'Job report submitted successfully' });
            });
          }
        );
      }
    );
  });
});

// Upload photo for job
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/jobs/:id/photos', verifyToken, upload.single('photo'), (req, res) => {
  const jobId = req.params.id;
  
  db.query(
    'INSERT INTO job_photos (job_id, photo_path) VALUES (?, ?)',
    [jobId, req.file.path],
    (err) => {
      if (err) return res.status(500).send('Error saving photo');
      res.status(200).send({ message: 'Photo uploaded successfully' });
    }
  );
});