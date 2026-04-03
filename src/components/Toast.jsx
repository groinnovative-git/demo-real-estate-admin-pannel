import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

const ICON_MAP = {
    success: CheckCircle2,
    error:   AlertCircle,
    warning: AlertTriangle,
    info:    Info,
};

/**
 * Reusable floating toast notification.
 *
 * Props:
 *   message  — string to display
 *   type     — 'success' | 'error' | 'warning' | 'info'  (default: 'error')
 *   onClose  — callback when dismissed
 *   duration — auto-dismiss ms (default 3500, pass 0 to disable)
 */
export default function Toast({ message, type = 'error', onClose, duration = 3500 }) {
    useEffect(() => {
        if (!duration) return;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [message, duration, onClose]);

    const Icon = ICON_MAP[type] || AlertCircle;

    return ReactDOM.createPortal(
        <div className={`toast toast--${type}`} role="alert">
            <Icon size={18} className="toast__icon" />
            <span className="toast__msg">{message}</span>
            <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss">
                <X size={14} />
            </button>
        </div>,
        document.body
    );
}
