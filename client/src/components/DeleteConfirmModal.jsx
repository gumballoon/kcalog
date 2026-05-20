export default function DeleteConfirmModal({ id = 'deleteModal', name, onConfirm }) {
    return (
        <div className="modal fade" id={id} tabIndex="-1">
            <div className="modal-dialog modal-sm">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delete {name}?</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal" onClick={onConfirm}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
