// src/ExpenseList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ExpenseList.css'; // Import CSS file

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState(1);

  let API_URL = 'http://localhost:5000/api/';

  if (process.env.NODE_ENV === 'development') {
    API_URL = 'http://localhost:5000/api/';
  } else {
    API_URL = 'https://expenses-tracker-api-b5ia.onrender.com/api/';
  }

  useEffect(() => {
    handleFilter(1);
  }, []);

  const handleDelete = async (personName) => {
    try {
      await axios.delete(API_URL + `expenses/${personName}`);
      setExpenses(
        expenses.filter((expense) => expense.personName !== personName)
      ); // Update local state
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleFilter = async (interest) => {
    let filterRes = [];
    try {
      setActiveFilter(interest);
      await axios.get(API_URL + 'expenses').then((response) => {
        if (interest === 0) {
          filterRes = response?.data?.filter((exp) => exp.interest === '0');
        } else {
          filterRes = response?.data?.filter((exp) => exp.interest !== '0');
        }
        setExpenses(filterRes);
      });
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
      <div className='actions'>
        <button
          className='add-expense-button'
          onClick={() => navigate('/add-expense')}
        >
          Add
        </button>
        <div className='actions'>
          <button
            className={`filter-button mr-10 ${
              activeFilter === 0 ? 'active' : ''
            }`}
            id='option1'
            onClick={() => handleFilter(0)}
          >
            zero
          </button>
          <button
            className={`filter-button ${activeFilter === 1 ? 'active' : ''}`}
            id='option2'
            onClick={() => handleFilter(1)}
          >
            no zero
          </button>
        </div>
      </div>
      {/* Desktop Table View */}
      <table className='expense-table'>
        <thead>
          <tr>
            <th>Person Name</th>
            <th>Amount</th>
            <th>Given Date</th>
            <th>Return Date</th>
            <th>Interest</th>
            <th>Remarks</th>
            <th>Actions</th>
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
              <td>{expense.remarks ? expense.remarks : '--'}</td>
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

      {/* Mobile View */}
      <div className='mobile-view'>
        <div className='mobile-expense-container'>
          {expenses?.map((expense, index) => (
            <div
              className={`mobile-expense-item ${
                activeIndex === index ? 'active' : ''
              }`}
              key={expense.personName}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              } // Toggle active state
            >
              <div className='mobile-line'>
                <span>{expense.personName}</span>
                <span>{expense.amount}</span>
              </div>
              <div className='mobile-line'>
                <span>
                  {expense.givenDate
                    ? new Date(expense.givenDate).toLocaleDateString()
                    : '--'}
                </span>
                <span>
                  {expense.returnDate
                    ? new Date(expense.returnDate).toLocaleDateString()
                    : '--'}
                </span>
              </div>
              <div className='mobile-line'>
                <span>Interest :</span>
                <span>
                  {expense.interest && expense.interest !== 0
                    ? expense.interest + ' rupee'
                    : 'zero rupee'}
                </span>
              </div>
              {expense.remarks && (
                <div className='mobile-line'>
                  <span>Remarks:</span>
                  <span>{expense.remarks}</span>
                </div>
              )}
              <div className='mobile-actions'>
                <button
                  className='edit-button mr-10'
                  onClick={() => navigateToEdit(expense.personName)}
                >
                  Edit
                </button>
                <button
                  className='delete-button'
                  onClick={() => handleDelete(expense.personName)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExpenseList;
