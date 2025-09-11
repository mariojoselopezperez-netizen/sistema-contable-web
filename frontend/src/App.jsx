import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Configuracion from './components/Configuracion';
import UsersManagement from './components/UsersManagement';
import './App.css'; // Asegúrate de tener este archivo para los estilos globales
import './Dashboard.css'; // Importa los estilos específicos para el dashboard

// Componente para la página de autenticación
const AuthPage = ({ onLogin }) => (
  <div className="App full-page">
    <div className="two-columns">
      <div className="left-column">
        <h1>Bienvenido al Sistema Contable</h1>
        <p>Administra tu contabilidad de manera fácil y rápida.</p>
      </div>
      <div className="right-column">
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  </div>
);

// Componente principal de la aplicación
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRol, setUserRol] = useState('');

  useEffect(() => {
    // Comprueba si hay un token y un rol guardados al cargar la aplicación
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('userRol');
    if (token) {
      setIsAuthenticated(true);
      setUserRol(rol);
    }
  }, []);

  const handleLogin = (token, rol) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRol', rol); // Guarda el rol del usuario en localStorage
    setIsAuthenticated(true);
    setUserRol(rol);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRol'); // Remueve el rol del usuario de localStorage
    setIsAuthenticated(false);
    setUserRol('');
  };

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            {/* Si el usuario está autenticado, muestra las rutas protegidas */}
            <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
            <Route path="/configuracion" element={<Configuracion />} />
            
            {/* La ruta de gestión de usuarios solo es accesible para administradores */}
            {userRol === 'administrador' && (
              <Route path="/users" element={<UsersManagement />} />
            )}
            
            {/* Puedes agregar una ruta de fallback para usuarios sin permisos */}
            <Route path="*" element={userRol === 'administrador' ? null : <h1>Acceso Denegado</h1>} />
          </>
        ) : (
          /* Si el usuario no está autenticado, siempre lo dirige al login */
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;