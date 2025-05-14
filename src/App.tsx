import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { RegistrarEntrega } from './components/entregas/RegistrarEntrega';
import { BuscarEntregas } from './components/entregas/BuscarEntregas';
import { Relatorios } from './components/relatorios/Relatorios';
import { CadastroPresos } from './components/presos/CadastroPresos';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ResetPassword } from './components/auth/ResetPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entregas/registrar" element={<RegistrarEntrega />} />
          <Route path="/entregas/buscar" element={<BuscarEntregas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/presos/cadastro" element={<CadastroPresos />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;