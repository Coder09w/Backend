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
      console.error('Error adding product:', err);
      return res.status(500).send({ message: 'Failed to add product.', error: err });
    }
    res.status(201).send({ id: result.insertId, ...product });
  });
});

// Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = req.body;

  if (!product.name || !product.price || !product.description || !product.imageUrl || !product.category) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'UPDATE products SET name = ?, price = ?, description = ?, imageUrl = ?, category = ? WHERE id = ?';
  db.query(query, [product.name, product.price, product.description, product.imageUrl, product.category, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
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
      console.error('Error deleting product:', err);
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
      console.error('Error fetching products:', err);
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
      console.error('Error fetching product:', err);
      return res.status(500).send({ message: 'Failed to fetch product.', error: err });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(results[0]);
  });
});

// Add a new purchase
app.post('/api/purchases', (req, res) => {
  const { userName, phone, location, paymentMethod, cart } = req.body;

  if (!userName || !phone || !location || !paymentMethod || !cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).send({ message: 'Invalid purchase data. All fields and a valid cart are required.' });
  }

  // Calculate the total amount dynamically
  const totalAmount = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Prepare query for batch insertion
  const query = 'INSERT INTO purchases (userName, productName, price, phone, location, paymentMethod, totalAmount) VALUES ?';

  const purchaseValues = cart.map((item) => [
    userName,
    item.name,
    item.price * (item.quantity || 1),
    phone,
    location,
    paymentMethod,
    totalAmount
  ]);

  db.query(query, [purchaseValues], (err, result) => {
    if (err) {
      console.error('Error adding purchase:', err);
      return res.status(500).send({ message: 'Failed to add purchase.', error: err });
    }
    res.status(201).send({ message: 'Purchase successfully recorded.', purchaseId: result.insertId });
  });
});

// Get all purchases
app.get('/api/purchases', (req, res) => {
  const query = 'SELECT * FROM purchases';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching purchases:', err);
      return res.status(500).send({ message: 'Failed to fetch purchases.', error: err });
    }
    res.send(results);
  });
});

// Delete a purchase
app.delete('/api/purchases/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM purchases WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting purchase:', err);
      return res.status(500).send({ message: 'Failed to delete purchase.', error: err });
    }
    res.sendStatus(204); // No content
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
