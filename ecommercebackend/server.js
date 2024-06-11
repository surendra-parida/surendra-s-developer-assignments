const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5001;

app.use(express.json());

// Set up CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const getJsonData = (filePath) => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

const saveJsonData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.get('/products', (req, res) => {
  const products = getJsonData('./data/products.json');
  res.json(products);
});

app.post('/checkout', (req, res) => {
  try {
    const { user, cart } = req.body;

    if (!user || !cart || !user.name || !user.email || !Array.isArray(cart)) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const users = getJsonData('./data/users.json');
    const orders = getJsonData('./data/orders.json');
    const orderChairs = getJsonData('./data/order_chairs.json');
    const orderTables = getJsonData('./data/order_tables.json');
    const orderTops = getJsonData('./data/order_tops.json');

    const userId = users.length + 1;
    users.push({ id: userId, name: user.name, email: user.email });

    const orderId = orders.length + 1;
    const amount = cart.reduce((acc, item) => acc + item.price, 0);
    orders.push({ id: orderId, amount, user_id: userId, created_at: new Date().toISOString() });

    cart.forEach(item => {
      if (item.category === 'Chairs') {
        orderChairs.push({ id: orderChairs.length + 1, order_id: orderId, chair_id: item.id });
      } else if (item.category === 'Tables') {
        orderTables.push({ id: orderTables.length + 1, order_id: orderId, table_id: item.id });
      } else if (item.category === 'Dining tops') {
        orderTops.push({ id: orderTops.length + 1, order_id: orderId, top_id: item.id });
      }
    });

    saveJsonData('./data/users.json', users);
    saveJsonData('./data/orders.json', orders);
    saveJsonData('./data/order_chairs.json', orderChairs);
    saveJsonData('./data/order_tables.json', orderTables);
    saveJsonData('./data/order_tops.json', orderTops);

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
