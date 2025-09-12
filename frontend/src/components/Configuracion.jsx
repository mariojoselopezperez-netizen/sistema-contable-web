// frontend/src/components/Configuracion.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Configuracion.css';
import { useNavigate } from 'react-router-dom';

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

  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/configuracion/empresa');
        const data = response.data;
        setEmpresaData(data);
        if (data.logo_path) {
          setPreviewUrl(data.logo_path);
        }
      } catch (error) {
        console.error('No se pudo cargar la configuración de la empresa:', error);
        setMensaje('Error al cargar la configuración de la empresa.');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in empresaData) {
      formData.append(key, empresaData[key]);
    }
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/configuracion/empresa',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMensaje(response.data.message);
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al guardar la configuración');
    }
  };

  // 🔹 Función corregida para regresar al dashboard
  const handleGoBack = () => {
    // Verificamos que la ruta exista antes de navegar
    try {
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al navegar al dashboard:', error);
      // Como fallback, recargamos la página
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="configuracion-container">
      <h2>Configuración de la Empresa</h2>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre_comercial"
          value={empresaData.nombre_comercial}
          onChange={handleChange}
          placeholder="Nombre Comercial"
        />
        <input
          type="text"
          name="nombre_legal"
          value={empresaData.nombre_legal}
          onChange={handleChange}
          placeholder="Nombre Legal"
        />
        <input
          type="text"
          name="ruc"
          value={empresaData.ruc}
          onChange={handleChange}
          placeholder="RUC"
        />
        <input
          type="text"
          name="direccion"
          value={empresaData.direccion}
          onChange={handleChange}
          placeholder="Dirección"
        />
        <input
          type="text"
          name="telefono"
          value={empresaData.telefono}
          onChange={handleChange}
          placeholder="Teléfono"
        />
        <input
          type="email"
          name="email"
          value={empresaData.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <input type="file" onChange={handleFileChange} />
        {previewUrl && <img src={previewUrl} alt="Vista previa logo" className="logo-preview" />}

        <button type="submit">Guardar</button>
        <button type="button" onClick={handleGoBack}>Regresar al Dashboard</button>
      </form>
    </div>
  );
}

export default Configuracion;
