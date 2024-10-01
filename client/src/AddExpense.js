import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddExpense.css';

const AddExpense = () => {
  const [expense, setExpense] = useState({
    personName: '',
    amount: '',
    givenDate: '',
    returnDate: '',
    interest: '',
    remarks: '',
  });
  const { personName } = useParams();
  const navigate = useNavigate();

  let API_URL = 'http://localhost:5000/api/';

  if (process.env.NODE_ENV === 'development') {
    API_URL = 'http://localhost:5000/api/';
  } else {
    API_URL = 'https://expenses-tracker-api-b5ia.onrender.com/api/';
  }

  useEffect(() => {
    if (personName) {
      const decodedPersonName = decodeURIComponent(personName);
      axios
        .get(API_URL + `expenses/${decodedPersonName}`)
        .then((response) => {
          if (response.data.length > 0) {
            setExpense(response.data[0]);
          } else {
            alert('Expense not found');
          }
        })
        .catch((error) => {
          console.error('Error fetching expense:', error);
          alert('Failed to fetch expense details');
        });
    }
  }, [personName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (personName) {
      axios
        .put(API_URL+
          `expenses/${decodeURIComponent(
            personName
          )}`,
          expense
        )
        .then((response) => {
          alert('Expense updated successfully');
          navigate('/');
        })
        .catch((error) => {
          console.error('Error updating expense:', error);
          alert('Failed to update expense');
        });
    } else {
      axios
        .post(API_URL+'expenses/', expense)
        .then((response) => {
          alert('Expense added successfully');
          navigate('/');
        })
        .catch((error) => {
          console.error('Error adding expense:', error);
          alert('Failed to add expense');
        });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className='container'>
      <h2>{personName ? 'Edit Expense' : 'Add Expense'}</h2>
      <form>
        <div className='form-group'>
          <label>Person Name:</label>
          <input
            type='text'
            name='personName'
            value={expense.personName}
            onChange={handleChange}
            disabled={!!personName}
          />
        </div>
        <div className='form-group'>
          <label>Amount:</label>
          <input
            type='number'
            name='amount'
            value={expense.amount}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label>Given Date:</label>
          <input
            type='date'
            name='givenDate'
            value={expense.givenDate}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label>Return Date:</label>
          <input
            type='date'
            name='returnDate'
            value={expense.returnDate}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label>Interest:</label>
          <input
            type='number'
            name='interest'
            value={expense.interest}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label>Remarks:</label>
          <textarea
            name='remarks'
            value={expense.remarks}
            onChange={handleChange}
          />
        </div>
        <div className='button-group'>
          <button type='button' onClick={handleSave} className='save'>
            Save
          </button>
          <button type='button' onClick={handleCancel} className='cancel'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
