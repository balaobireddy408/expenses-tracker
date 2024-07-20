// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExpenseList from './ExpenseList';
import AddExpense from './AddExpense';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path='/add-expense' element={<AddExpense />} />
          <Route path='/edit-expense/:personName' element={<AddExpense />} />
          <Route path='/' element={<ExpenseList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
