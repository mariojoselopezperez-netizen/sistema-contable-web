// frontend/src/components/UsersManagement.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    rol_id: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  // URL del backend (ajusta si es necesario)
  const apiUrl = 'https://effective-space-pancake-4j9vr64grrwwf77j6-3001.app.github.dev/api';

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
      setMensaje(error.response?.data?.error || 'Error al cargar la lista de usuarios.');
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/roles`, { // Cambiado a /roles
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error al cargar los roles:', error);
      setMensaje(error.response?.data?.error || 'Error al cargar la lista de roles.');
    }
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/auth/register`, newUser, { // Usar la ruta de registro
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMensaje('Usuario creado exitosamente.');
      setNewUser({ nombre: '', email: '', contrasena: '', rol_id: '' });
      fetchUsers();
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al crear el usuario.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${apiUrl}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMensaje('Usuario eliminado exitosamente.');
        fetchUsers();
      } catch (error) {
        setMensaje(error.response?.data?.error || 'Error al eliminar el usuario.');
      }
    }
  };

  if (loading) {
      return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Gestión de Usuarios</h1>
          <Link to="/" className="back-link">Volver al Dashboard</Link>
        </div>

        {mensaje && <p className="message">{mensaje}</p>}
        
        <div className="users-cards-container">
          {/* Tarjeta para la lista de usuarios */}
          <div className="user-list-card card">
            <h3 className="card-title">Usuarios Existentes</h3>
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.nombre}</td>
                      <td>{user.email}</td>
                      <td>{user.rol}</td>
                      <td>
                          <button onClick={() => handleDelete(user.id)} className="delete-button">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta para crear nuevo usuario */}
          <div className="create-user-card card">
            <h3 className="card-title">Crear Nuevo Usuario</h3>
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value={newUser.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={newUser.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="contrasena">Contraseña:</label>
                <input type="password" id="contrasena" name="contrasena" value={newUser.contrasena} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="rol_id">Rol:</label>
                <select id="rol_id" name="rol_id" value={newUser.rol_id} onChange={handleChange} required>
                  <option value="">Selecciona un rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="submit-button">Crear Usuario</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersManagement;