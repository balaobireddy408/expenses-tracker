const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // Import PostgreSQL client
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup (use environment variables for security)
const pool = new Pool({
  connectionString:
    'postgresql://expense_db_4pn9_user:boiCXdmyIMa3IGYy4tEZ8zKYx2hi6ufF@dpg-cruhmk3v2p9s73erldvg-a.oregon-postgres.render.com/expense_db_4pn9',
  ssl: {
    rejectUnauthorized: false, // For secure connections
  },
});

// Function to connect to the pool
const connectDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release(); // Release client after successful connection
  } catch (error) {
    console.error('Failed to connect to PostgreSQL', error);
  }
};

connectDb();

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
});

app.get('/api/expenses/:guid', async (req, res) => {
  const { guid } = req.params;
  try {
    console.log('Fetching expense with GUID:', guid);
    const result = await pool.query('SELECT * FROM expenses WHERE guid = $1', [
      guid,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to retrieve expense' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { personname, amount, givendate, returndate, interest, remarks, guid } =
    req.body;
  try {
    const givenDate = givendate === '' ? null : givendate;
    const returnDate = returndate === '' ? null : returndate;

    await pool.query(
      'INSERT INTO expenses (personname, amount, givendate, returndate, interest, remarks, guid) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [personname, amount, givenDate, returnDate, interest, remarks, guid]
    );
    res.json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

app.put('/api/expenses/:guid', async (req, res) => {
  const { guid } = req.params;
  const { personname, amount, givendate, returndate, interest, remarks } =
    req.body;
  try {
    const result = await pool.query(
      'UPDATE expenses SET personname = $1, amount = $2, givendate = $3, returndate = $4, interest = $5, remarks = $6 WHERE guid = $7',
      [personname, amount, givendate, returndate, interest, remarks, guid]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:guid', async (req, res) => {
  const { guid } = req.params;
  try {
    const result = await pool.query('DELETE FROM expenses WHERE guid = $1', [
      guid,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

