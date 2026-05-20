const jwt = require('jsonwebtoken');

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

module.exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'you must be logged in' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (e) {
        res.status(401).json({ error: 'invalid or expired session' });
    }
};

module.exports.requireGuest = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next();
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.status(400).json({ error: 'already logged in' });
    } catch {
        next();
    }
};

module.exports.signToken = (userId) =>
    jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports.cookieOptions = cookieOptions;
