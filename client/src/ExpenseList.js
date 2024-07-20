// src/ExpenseList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './ExpenseList.css'; // Import CSS file

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expenses');
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
    fetchExpenses();
  }, []);

  const handleDelete = async (personName) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${personName}`);
      setExpenses(
        expenses.filter((expense) => expense.personName !== personName)
      ); // Update local state
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const navigateToEdit = (personName) => {
    const encodedPersonName = encodeURIComponent(personName);
    navigate(`/edit-expense/${encodedPersonName}`);
  };

  return (
    <div className='expense-list-container'>
      <h1>Expense List</h1>
      <Link to='/add-expense'>
        <button className='add-expense-button'>Add Expense</button>
      </Link>
      <table className='expense-table'>
        <thead>
          <tr>
            <th>Person Name</th>
            <th>Amount</th>
            <th>Given Date</th>
            <th>Return Date</th>
            <th>Interest</th>
            <th>Remarks</th>
            <th>Actions</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {expenses?.map((expense) => (
            <tr key={expense.personName}>
              <td>{expense.personName}</td>
              <td>{expense.amount}</td>
              <td>
                {expense.givenDate
                  ? new Date(expense.givenDate).toLocaleDateString()
                  : '--'}
              </td>
              <td>
                {expense.returnDate
                  ? new Date(expense.returnDate).toLocaleDateString()
                  : '--'}
              </td>
              <td>{expense.interest ? expense.interest : 0}</td>
              <td>{expense.remarks ? expense.remarks : 'not mentioned'}</td>
              <td className='actions'>
                <button
                  className='edit-button'
                  onClick={() => navigateToEdit(expense.personName)}
                >
                  <i className='fas fa-edit'></i>
                </button>
                <button
                  className='delete-button'
                  onClick={() => handleDelete(expense.personName)}
                >
                  <i className='fas fa-trash'></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;
