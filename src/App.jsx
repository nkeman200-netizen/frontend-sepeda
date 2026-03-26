import { Routes, Route, Navigate } from "react-router-dom";

import Login from './pages/Login'
import Admin from './pages/Admin'
import Mahasiswa from './pages/Mahasiswa'
import Register from './pages/Register'

function Satpam({children, allowedRole}) {
  const token= localStorage.getItem('TOKEN');
  const role= localStorage.getItem('ROLE');
  if (!token) {
    return <Navigate to={"/login"}/>
  }
  if (role!==allowedRole) {
    if (role=="admin") {
      return <Navigate to={"/admin"}/>
    }else{
      return <Navigate to={"/mahasiswa"}/>
    }
  }
  return children;
}


function App() {
  return(
  <Routes>
    <Route path="/" element={<Navigate to={"/login"}/>} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/mahasiswa" element={<Satpam allowedRole={"mahasiswa"}><Mahasiswa /></Satpam>} />
    <Route path="/admin" element={<Satpam allowedRole={"admin"}><Admin /></Satpam>} />
    
    
  </Routes>
  );
}

export default App;