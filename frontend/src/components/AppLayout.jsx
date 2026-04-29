import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ padding: '28px 32px 32px', flex: 1, overflowY: 'auto', marginTop: '60px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
