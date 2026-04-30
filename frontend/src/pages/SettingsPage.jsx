import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

function getInitials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await api.put(`/users/${user._id}`, { name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPwError('');
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: curPw, newPassword: newPw });
      toast.success('Password updated');
      setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
    setChangingPw(false);
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex' }}>
      {show ? <EyeOff size={16} color="#64748b"/> : <Eye size={16} color="#64748b"/>}
    </button>
  );

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>Settings</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Manage your account</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Profile */}
        <div style={{ flex: 1, minWidth: '280px', background: '#161b27', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '28px', fontWeight: 700,
            }}>{getInitials(user?.name)}</div>
            <p style={{ color: '#818cf8', fontSize: '12px', marginTop: '8px', cursor: 'pointer' }}>Change Avatar</p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Email</label>
            <input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Role</label>
            <input value={user?.role || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed', textTransform: 'capitalize' }} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{
            marginTop: '16px', width: '100%', padding: '12px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
            fontWeight: 600, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>

        {/* Security */}
        <div style={{ flex: 1, minWidth: '280px', background: '#161b27', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: 'white', fontWeight: 600, fontSize: '17px', marginBottom: '16px' }}>Change Password</h2>

          {['Current Password', 'New Password', 'Confirm New Password'].map((lbl, i) => {
            const val = [curPw, newPw, confirmPw][i];
            const setter = [setCurPw, setNewPw, setConfirmPw][i];
            const show = [showCur, showNew, showConfirm][i];
            const toggle = [() => setShowCur(!showCur), () => setShowNew(!showNew), () => setShowConfirm(!showConfirm)][i];
            return (
              <div key={lbl} style={{ marginTop: i === 0 ? 0 : '16px' }}>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lbl}</label>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} />
                  {eyeBtn(show, toggle)}
                </div>
              </div>
            );
          })}

          {pwError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px' }}>{pwError}</p>}

          <button onClick={handlePasswordChange} disabled={changingPw} style={{
            marginTop: '16px', width: '100%', padding: '12px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
            fontWeight: 600, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            opacity: changingPw ? 0.7 : 1,
          }}>{changingPw ? 'Updating...' : 'Update Password'}</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        marginTop: '24px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '14px', padding: '24px',
      }}>
        <h3 style={{ color: '#f87171', fontWeight: 600, marginBottom: '8px' }}>Danger Zone</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>These actions are permanent and cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} style={{
          padding: '10px 20px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px',
          color: '#f87171', fontSize: '14px', background: 'transparent', cursor: 'pointer',
          transition: 'background 0.15s',
        }} className="sidebar-logout-btn">Delete Account</button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowDeleteModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#161b27', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Are you sure?</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>This will permanently delete your account and all associated data.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{
                padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: 'none',
                borderRadius: '10px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{
                padding: '10px 20px', background: '#ef4444', border: 'none',
                borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
