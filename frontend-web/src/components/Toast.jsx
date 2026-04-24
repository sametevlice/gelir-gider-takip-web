import { useStore } from '../store/useStore';

export default function Toast() {
  const toastMsg = useStore(state => state.toastMsg);

  if (!toastMsg) return null;

  const { msg, type } = toastMsg;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };

  return (
    <div className="toast-container" style={{ top: '80px', right: '24px' }}>
      <div className={`toast toast-${type}`}>
        <span>{icons[type] || 'ℹ️'}</span> {msg}
      </div>
    </div>
  );
}
