module.exports.textCapitalize = (title) => {
    const words = title.split(' ');
    return words.map(w => {
        if (w[0] === '(') {
            return w[0] + w[1].toUpperCase() + w.slice(2);
        } else {
            return w[0].toUpperCase() + w.slice(1);
        }
    }).join(' ');
};