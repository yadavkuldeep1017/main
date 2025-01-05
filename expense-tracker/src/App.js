import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import React, { useState, createContext, useContext } from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import Report from './components/Report';
import AdminDashboard from './components/AdminDashboard';
import ForgotPassword from './components/ForgotPassword';
import Signup from './components/SignUp';
import AddNewProduct from './components/AddNewProduct';
import PageNotFound from './components/PageNotFound'; // Import PageNotFound

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook for Auth
export const useAuth = () => {
    return useContext(AuthContext);
};

// Protected Route Component
const RequireAuth = ({ children }) => {
    const auth = useAuth();
    if (!auth.user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/login" replace />, // Redirect root to login
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/forgot-password",
            element: <ForgotPassword />,
        },
        {
            path: "/signup",
            element: <Signup />,
        },
        {
            element: <RequireAuth><Outlet /></RequireAuth>, // Protect these routes
            children: [
                {
                    path: "/user-dashboard",
                    element: <UserDashboard />,
                },
                {
                    path: "/admin-dashboard",
                    element: <AdminDashboard />,
                },
                {
                    path: "/report",
                    element: <Report />,
                },
                {
                    path: "/add-product",
                    element: <AddNewProduct />,
                },
            ],
        },
        {
            path: "*", // Catch-all for 404
            element: <PageNotFound />,
        }
    ]);

    return (
        <div className="App">
            <AuthProvider> {/* Wrap with AuthProvider */}
                <RouterProvider router={router} />
            </AuthProvider>
        </div>
    );
}

export default App;