import Button from "./Button";
import Modal from "./Modal";
import Spinner from "./Spinner";

// "Are you sure?" dialog for sensitive actions.
// variant="danger" makes the confirm button red. `children` can add extra content.
function ConfirmDialog({
  title,
  message,
  children,
  confirmLabel = "Confirm",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      onClose={loading ? () => {} : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Spinner light /> Working...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </>
      }
    >
      {message && <p className="text-slate-600">{message}</p>}
      {children}
    </Modal>
  );
}

export default ConfirmDialog;
