// Import required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Create an instance of Express
const app = express();

// Middleware
app.use(cors()); // Allow CORS
app.use(express.json()); // To parse JSON request bodies

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost', // Change if your MySQL server is hosted elsewhere
  user: 'root', // Replace with your MySQL username
  password: 'admin', // Replace with your MySQL password
  database: 'grocery' // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

// API routes

// Add a new product
app.post('/api/products', (req, res) => {
  const product = req.body;
  const query = 'INSERT INTO products (name, price, description, imageUrl, category) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [product.name, product.price, product.description, product.imageUrl, product.category], (err, result) => {
    if (err) {
      console.error('Error adding product:', err); // Log the error
      return res.status(500).send({ message: 'Failed to add product.', error: err });
    }
    res.status(201).send({ id: result.insertId, ...product });
  });
});

// Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = req.body;

  // Validate the incoming data
  if (!product.name || !product.price || !product.description || !product.imageUrl || !product.category) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'UPDATE products SET name = ?, price = ?, description = ?, imageUrl = ?, category = ? WHERE id = ?';
  db.query(query, [product.name, product.price, product.description, product.imageUrl, product.category, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err); // Log the error
      return res.status(500).send({ message: 'Failed to update product.', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Product not found.' });
    }
    res.send({ id, ...product });
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting product:', err); // Log the error
      return res.status(500).send({ message: 'Failed to delete product.', error: err });
    }
    res.sendStatus(204); // No content
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err); // Log the error
      return res.status(500).send({ message: 'Failed to fetch products.', error: err });
    }
    res.send(results);
  });
});

// Get a single product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err); // Log the error
      return res.status(500).send({ message: 'Failed to fetch product.', error: err });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(results[0]);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});