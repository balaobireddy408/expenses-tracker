const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const filePath = path.join(__dirname, 'expenses.xlsx');

// Helper function to check if headers exist
const checkHeaders = async (worksheet) => {
  const headers = worksheet.getRow(1).values.slice(1); // Get headers from the first row
  return (
    headers.includes('Person Name') &&
    headers.includes('Amount') &&
    headers.includes('Given Date') &&
    headers.includes('Return Date') &&
    headers.includes('Interest') &&
    headers.includes('Remarks')
  );
};

// Read expenses from the Excel file
app.get('/api/expenses', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headersExist = await checkHeaders(worksheet);

    if (!headersExist) {
      return res
        .status(500)
        .json({ error: 'Headers missing in the Excel file' });
    }

    const jsonData = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        jsonData.push({
          personName: row.getCell(1).value,
          amount: row.getCell(2).value,
          givenDate: row.getCell(3).value,
          returnDate: row.getCell(4).value,
          interest: row.getCell(5).value,
          remarks: row.getCell(6).value,
        });
      }
    });

    res.json(jsonData);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to read Excel file' });
  }
});

// Get expenses by personName
app.get('/api/expenses/:personName', async (req, res) => {
  try {
    const { personName } = req.params;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const jsonData = worksheet.getSheetValues(); // Adjust if needed
      const expenses = jsonData.slice(1).map((row) => ({
        personName: row[1],
        amount: row[2],
        givenDate: row[3],
        returnDate: row[4],
        interest: row[5],
        remarks: row[6],
      }));
    const filteredExpenses = expenses.filter(expense => expense.personName.toLowerCase() === personName.toLowerCase());
    res.json(filteredExpenses);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to read Excel file' });
  }
});

// Add new expenses to the Excel file
app.post('/api/expenses', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    let expenses = [];

    if (Array.isArray(req.body)) {
      expenses = req.body;
    } else if (req.body.personName && req.body.amount) {
      expenses = [req.body];
    } else {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const headersExist = await checkHeaders(worksheet);

    if (!headersExist) {
      // Add headers if they don't exist
      worksheet.addRow([
        'Person Name',
        'Amount',
        'Given Date',
        'Return Date',
        'Interest',
        'Remarks',
      ]);
    }

    // Add expenses without headers
    expenses.forEach((expense) => {
      worksheet.addRow([
        expense.personName,
        expense.amount,
        expense.givenDate,
        expense.returnDate,
        expense.interest,
        expense.remarks,
      ]);
    });

    await workbook.xlsx.writeFile(filePath);
    res.json({ message: 'Expenses updated successfully' });
  } catch (error) {
    console.error('Error saving Excel file:', error);
    res.status(500).json({ error: 'Failed to write to Excel file' });
  }
});

// Update expense by personName
app.put('/api/expenses/:personName', async (req, res) => {
  try {
    const { personName } = req.params;
    const updatedExpense = req.body;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const headersExist = await checkHeaders(worksheet);

    if (!headersExist) {
      return res
        .status(500)
        .json({ error: 'Headers missing in the Excel file' });
    }

    let found = false;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (row.getCell(1).value === personName) {
        worksheet.getRow(rowNumber).values = [
          updatedExpense.personName,
          updatedExpense.amount,
          updatedExpense.givenDate,
          updatedExpense.returnDate,
          updatedExpense.interest,
          updatedExpense.remarks,
        ];
        found = true;
      }
    });

    if (!found) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await workbook.xlsx.writeFile(filePath);
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating Excel file:', error);
    res.status(500).json({ error: 'Failed to update Excel file' });
  }
});

// Delete expense by personName
app.delete('/api/expenses/:personName', async (req, res) => {
  try {
    const { personName } = req.params;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const headersExist = await checkHeaders(worksheet);

    if (!headersExist) {
      return res
        .status(500)
        .json({ error: 'Headers missing in the Excel file' });
    }

    let rowToDelete = null;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (row.getCell(1).value === personName) {
        rowToDelete = rowNumber;
      }
    });

    if (!rowToDelete) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    worksheet.spliceRows(rowToDelete, 1);

    await workbook.xlsx.writeFile(filePath);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting Excel file:', error);
    res.status(500).json({ error: 'Failed to delete from Excel file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
