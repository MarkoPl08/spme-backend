const User = require('../models/User');
const UserRoles = require('../models/UserRoles');

module.exports = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.userId, {
                include: [{
                    model: UserRoles,
                    attributes: ['RoleName']
                }]
            });

            if (!user || user.UserRole.RoleName !== requiredRole) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (error) {
            console.error('Error checking user role:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
