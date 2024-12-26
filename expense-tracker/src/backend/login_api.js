// routes/login.js
module.exports = (connection) => {
    const loginRoute = (req, res) => {
        const { username, password } = req.body;

        connection.query(
            'SELECT username, isAdmin FROM users WHERE username = ? AND password = ?',
            [username, password],
            (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.length === 1) {
                    req.session.user = { username: results[0].username, isAdmin: results[0].isAdmin };
                    res.json({ message: 'Login successful', isAdmin: results[0].isAdmin });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        );
    };

    const checkAuthRoute = (req, res) => {
        if (req.session.user) {
            res.json({ isAuthenticated: true, isAdmin: req.session.user.isAdmin });
        } else {
            res.json({ isAuthenticated: false });
        }
    };

    const logoutRoute = (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Logout failed" });
            }
            res.json({ message: "Logout successful" });
        });
    };

    return {
        login: loginRoute,
        checkAuth: checkAuthRoute,
        logout: logoutRoute
    };
};