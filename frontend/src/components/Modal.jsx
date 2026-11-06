import { useEffect } from "react";
import { X } from "lucide-react";
import "./Modal.css";
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md"
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
    className={`modal-dialog modal-${maxWidth}`}
    onClick={(e) => e.stopPropagation()}
  >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button
    type="button"
    className="modal-close-btn"
    onClick={onClose}
    aria-label="Close modal"
  >
            <X className="w-5 h-5 text-slate-500 hover:text-slate-700" />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>;
};
export {
  Modal
};
