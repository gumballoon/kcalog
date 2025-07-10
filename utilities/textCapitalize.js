module.exports.textCapitalize = (title) => {
    const words = title.split(' ');
    return words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}