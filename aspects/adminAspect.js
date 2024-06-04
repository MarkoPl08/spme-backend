async function adminAspect(req, res, next) {
    if (!req.user) {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const userRole = req.user.role;

    if (userRole !== 1) {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
}

module.exports = adminAspect;
