import React from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  return (
    <div className="App full-page">
      <div className="two-columns">
        <div className="left-column">
          <h1>Bienvenido al Sistema Contable</h1>
          <p>Administra tu contabilidad de manera fácil y rápida.</p>
        </div>
        <div className="right-column">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default App;
