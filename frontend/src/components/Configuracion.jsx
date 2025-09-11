// frontend/src/components/Configuracion.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Configuracion() {
  const [empresaData, setEmpresaData] = useState({
    nombre_comercial: '',
    nombre_legal: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Carga la información de la empresa al iniciar el componente
    const fetchEmpresaData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/configuracion/empresa');
        setEmpresaData(response.data);
      } catch (error) {
        console.error('No se pudo cargar la configuración de la empresa:', error);
      }
    };
    fetchEmpresaData();
  }, []);

  const handleChange = (e) => {
    setEmpresaData({
      ...empresaData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/configuracion/empresa', empresaData);
      setMensaje(response.data.message);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al guardar la configuración');
    }
  };

  return (
    <div className="form-container">
      <h2>Configuración de la Empresa</h2>
      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        <div>
          <label htmlFor="nombre_comercial">Nombre Comercial:</label>
          <input type="text" id="nombre_comercial" name="nombre_comercial" value={empresaData.nombre_comercial} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="nombre_legal">Nombre Legal:</label>
          <input type="text" id="nombre_legal" name="nombre_legal" value={empresaData.nombre_legal} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="ruc">RUC:</label>
          <input type="text" id="ruc" name="ruc" value={empresaData.ruc} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="direccion">Dirección:</label>
          <input type="text" id="direccion" name="direccion" value={empresaData.direccion} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input type="text" id="telefono" name="telefono" value={empresaData.telefono} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={empresaData.email} onChange={handleChange} />
        </div>
        <button type="submit">Guardar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Configuracion;