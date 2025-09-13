import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Configuracion.css';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function Configuracion() {
  const [empresaData, setEmpresaData] = useState({
    nombre_comercial: '',
    nombre_legal: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Nuevos estados para las secciones adicionales
  const [comprobantes, setComprobantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [userRol, setUserRol] = useState('');

  const token = localStorage.getItem('token');

  // Memoizar las funciones de fetch
  const fetchComprobantes = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/configuracion/comprobantes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComprobantes(response.data || []);
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      setComprobantes([
        { id: 1, tipo: 'Factura', consecutivo: 1, reinicio: 'nunca' },
        { id: 2, tipo: 'Recibo', consecutivo: 1, reinicio: 'nunca' },
        { id: 3, tipo: 'Cotización', consecutivo: 1, reinicio: 'nunca' },
        { id: 4, tipo: 'Retención', consecutivo: 1, reinicio: 'nunca' },
        { id: 5, tipo: 'Cheque', consecutivo: 1, reinicio: 'nunca' },
        { id: 6, tipo: 'Vale Caja Chica', consecutivo: 1, reinicio: 'nunca' },
      ]); // Fallback data
    }
  }, [token]); // Dependencia: token

  const fetchPeriodos = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/configuracion/periodos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeriodos(response.data || []);
    } catch (error) {
      console.error('Error al cargar periodos:', error);
      const newPeriodos = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        mes: i + 1,
        anio: 2025,
        estado: 'abierto',
      }));
      setPeriodos(newPeriodos);
    }
  }, [token]); // Dependencia: token

  const fetchCuentasBancarias = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/configuracion/cuentas-bancarias', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCuentasBancarias(response.data || []);
    } catch (error) {
      console.error('Error al cargar cuentas bancarias:', error);
      setCuentasBancarias([
        { id: 1, nombre: 'Banco Nacional', mes: 9, anio: 2025, estado: 'pendiente' },
        { id: 2, nombre: 'Banco Internacional', mes: 9, anio: 2025, estado: 'pendiente' },
      ]); // Fallback data
    }
  }, [token]); // Dependencia: token

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setMensaje('Debes iniciar sesión para cargar la configuración.');
        return;
      }

      // Decodificar el token para obtener el rol
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRol(decoded.rol || 'usuario');
      } catch (error) {
        console.error('Error decodificando token:', error);
        setUserRol('usuario'); // Fallback
      }

      // Fetch datos de la empresa
      try {
        const response = await axios.get('http://localhost:3001/api/configuracion/empresa', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setEmpresaData(data || {});
        if (data.logo_url) {
          setPreviewUrl(data.logo_url);
        }
      } catch (error) {
        console.error('No se pudo cargar la configuración de la empresa:', error);
        setMensaje('Error al cargar la configuración o no tienes una empresa registrada.');
      }

      // Fetch para nuevas secciones (solo para administradores)
      if (userRol === 'administrador') {
        await fetchComprobantes();
        await fetchPeriodos();
        await fetchCuentasBancarias();
      }
    };
    fetchData();
  }, [token, fetchComprobantes, fetchCuentasBancarias, fetchPeriodos, userRol]); // Dependencias actualizadas

  const handleChange = (e) => {
    setEmpresaData({
      ...empresaData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setMensaje('El archivo debe ser menor a 1MB');
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setMensaje('Solo se permiten imágenes PNG o JPG');
        return;
      }
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('Debes iniciar sesión para guardar la configuración.');
      setLoading(false);
      return;
    }

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
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMensaje(response.data.message);
      setLogoFile(null);
      // Refetch para actualizar datos
      const updatedResponse = await axios.get('http://localhost:3001/api/configuracion/empresa', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmpresaData(updatedResponse.data || {});
      if (updatedResponse.data.logo_url) {
        setPreviewUrl(updatedResponse.data.logo_url);
      }
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      setMensaje(error.response?.data?.error || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para nuevas secciones
  const handleUpdateComprobante = (id, field, value) => {
    setComprobantes(comprobantes.map(comp =>
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
    axios.put(`http://localhost:3001/api/configuracion/comprobantes/${id}`, { [field]: value }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchComprobantes())
      .catch(err => console.error('Error saving comprobante:', err));
  };

  const handleTogglePeriodo = (id) => {
    if (userRol !== 'administrador') {
      setMensaje('Solo administradores pueden modificar periodos.');
      return;
    }
    const periodo = periodos.find(p => p.id === id);
    const newEstado = periodo.estado === 'abierto' ? 'bloqueado' : 'abierto';
    setPeriodos(periodos.map(p => p.id === id ? { ...p, estado: newEstado } : p));
    axios.put(`http://localhost:3001/api/configuracion/periodos/${id}`, { estado: newEstado }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchPeriodos())
      .catch(err => console.error('Error toggling periodo:', err));
  };

  const handleConciliarCuenta = (id) => {
    if (userRol !== 'administrador') {
      setMensaje('Solo administradores pueden conciliar cuentas.');
      return;
    }
    setCuentasBancarias(cuentasBancarias.map(c =>
      c.id === id ? { ...c, estado: 'conciliada' } : c
    ));
    axios.put(`http://localhost:3001/api/configuracion/cuentas-bancarias/${id}`, { estado: 'conciliada' }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchCuentasBancarias())
      .catch(err => console.error('Error conciliando cuenta:', err));
  };

  return (
    <div className="configuracion-container">
      <h1 className="config-title">Configuración de Empresa</h1>
      {mensaje && (
        <div className={`message ${mensaje.includes('Error') ? 'error' : 'success'}`}>
          {mensaje}
        </div>
      )}

      <div className="config-layout">
        {/* Lado Izquierdo: Formulario de Empresa */}
        <div className="config-left">
          <div className="config-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  value={empresaData.nombre_comercial}
                  onChange={handleChange}
                  placeholder="Ej. Mi Empresa S.A."
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Nombre Legal</label>
                <input
                  type="text"
                  name="nombre_legal"
                  value={empresaData.nombre_legal}
                  onChange={handleChange}
                  placeholder="Ej. Mi Empresa S.A. Legal"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RUC</label>
                <input
                  type="text"
                  name="ruc"
                  value={empresaData.ruc}
                  onChange={handleChange}
                  placeholder="Ej. 123456789"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={empresaData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Calle 123, Ciudad"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={empresaData.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 555-1234"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={empresaData.email}
                  onChange={handleChange}
                  placeholder="Ej. info@empresa.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Logotipo</label>
                <input type="file" onChange={handleFileChange} className="form-input file-input" />
                {previewUrl && (
                  <img src={previewUrl} alt="Vista previa logo" className="logo-preview" />
                )}
              </div>
              <div className="button-group">
                <button type="submit" disabled={loading} className="save-button">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lado Derecho: Nuevas Secciones (solo para administradores) */}
        {userRol === 'administrador' && (
          <div className="config-right">
            <Tabs>
              <TabList>
                <Tab>Configuración de Comprobantes</Tab>
                <Tab>Apertura y Bloqueo de Periodos</Tab>
                <Tab>Conciliación de Cuentas Bancarias</Tab>
              </TabList>

              <TabPanel>
                <h3>Configuración de Comprobantes</h3>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Consecutivo Actual</th>
                      <th>Reinicio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantes.map((comp) => (
                      <tr key={comp.id}>
                        <td>{comp.tipo}</td>
                        <td>
                          <input
                            type="number"
                            value={comp.consecutivo}
                            onChange={(e) => handleUpdateComprobante(comp.id, 'consecutivo', e.target.value)}
                            className="form-input small"
                          />
                        </td>
                        <td>
                          <select
                            value={comp.reinicio}
                            onChange={(e) => handleUpdateComprobante(comp.id, 'reinicio', e.target.value)}
                            className="form-input small"
                          >
                            <option value="mensual">Mensual</option>
                            <option value="anual">Anual</option>
                            <option value="nunca">Nunca</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              console.log('Guardar comprobante:', comp);
                            }}
                            className="save-button small"
                          >
                            Guardar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabPanel>

              <TabPanel>
                <h3>Apertura y Bloqueo de Periodos</h3>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Mes/Año</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((p) => (
                      <tr key={p.id}>
                        <td>{`${p.mes}/${p.anio}`}</td>
                        <td>{p.estado}</td>
                        <td>
                          <button
                            onClick={() => handleTogglePeriodo(p.id)}
                            className="toggle-button"
                          >
                            {p.estado === 'abierto' ? 'Bloquear' : 'Desbloquear'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabPanel>

              <TabPanel>
                <h3>Conciliación de Cuentas Bancarias</h3>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Cuenta</th>
                      <th>Mes/Año</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasBancarias.map((cuenta) => (
                      <tr key={cuenta.id}>
                        <td>{cuenta.nombre}</td>
                        <td>{`${cuenta.mes}/${cuenta.anio}`}</td>
                        <td>{cuenta.estado}</td>
                        <td>
                          {cuenta.estado === 'pendiente' && (
                            <button
                              onClick={() => handleConciliarCuenta(cuenta.id)}
                              className="conciliar-button"
                            >
                              Conciliar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </div>

      <div className="button-group full-width">
        <Link to="/" className="back-button">Regresar al Dashboard</Link>
      </div>
    </div>
  );
}

export default Configuracion;