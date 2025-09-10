import React, { useState } from 'react';
import axios from 'axios';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        contrasena,
      });
      setToken(response.data.token);
      setMensaje('¡Inicio de sesión exitoso!');
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

return (
    <div className="form-container"> {/* Añade esta clase */}
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="contrasena">Contraseña:</label>
          <input type="password" id="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
      {token && <p>Token: {token}</p>}
    </div>
  );
}

export default LoginForm;