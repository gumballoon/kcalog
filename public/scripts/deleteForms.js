const allDeleteForms = document.querySelectorAll('.delete-form');

const textCapitalize = (title) => {
    const words = title.split(' ');
    return words.map(w => {
        if (w[0] === '(') {
            return w[0] + w[1].toUpperCase() + w.slice(2);
        } else {
            return w[0].toUpperCase() + w.slice(1);
        }
    }).join(' ');
};

if (allDeleteForms && allDeleteForms.length) {
    for (let deleteForm of allDeleteForms) {
        deleteForm.addEventListener('submit', function(e) {
            if (!window.confirm(`Are you sure you want to delete '${textCapitalize(deleteForm.id)}'?`)) {
                e.preventDefault();
            };
        })
    }
}