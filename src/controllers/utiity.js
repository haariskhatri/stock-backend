
const normalizeDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
}

module.exports = {
    normalizeDate
}