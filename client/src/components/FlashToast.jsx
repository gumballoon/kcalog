import { useEffect } from 'react';

export default function FlashToast({ flash, onClear }) {
    useEffect(() => {
        if (flash) {
            const t = setTimeout(onClear, 4000);
            return () => clearTimeout(t);
        }
    }, [flash, onClear]);

    if (!flash) return null;

    const variant = flash.type === 'error' ? 'danger' : flash.type || 'success';
    return (
        <div className={`alert alert-${variant} alert-dismissible fade show`} role="alert">
            {flash.message}
            <button type="button" className="btn-close" onClick={onClear}></button>
        </div>
    );
}
