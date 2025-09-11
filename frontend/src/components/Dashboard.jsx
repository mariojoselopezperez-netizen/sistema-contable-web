import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link para una navegación más fluida

function Dashboard({ onLogout }) {
  const userRol = localStorage.getItem('userRol');

  return (
    // Usa un contenedor general con un fondo claro
    <div className="dashboard-container"> 
      
      {/* Contenido principal del dashboard */}
      <div className="main-content">
        
        {/* Cabecera del dashboard con el título y el botón de cerrar sesión */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={onLogout} className="logout-button">Cerrar Sesión</button>
        </div>
        
        {/* Sección de tarjetas para una apariencia más moderna y profesional */}
        <div className="dashboard-cards">
          
          {/* Tarjeta de Configuración de la Empresa */}
          <Link to="/configuracion" className="card-link">
            <div className="card">
              <div className="card-icon">⚙️</div>
              <h3 className="card-title">Configuración de la Empresa</h3>
            </div>
          </Link>

          {/* Tarjeta de Gestión de Usuarios, visible solo para administradores */}
          {userRol === 'administrador' && (
            <Link to="/users" className="card-link">
              <div className="card">
                <div className="card-icon">👥</div>
                <h3 className="card-title">Gestión de Usuarios</h3>
              </div>
            </Link>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;