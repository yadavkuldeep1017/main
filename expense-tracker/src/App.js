import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import Report from './components/Report';
import AdminDashboard from './components/AdminDashboard';
import { Navigate, Outlet } from 'react-router-dom';
import ForgotPassword from './components/ForgotPassword';
import Signup from './components/SignUp';
import AddNewProduct from './components/AddNewProduct';
import SearchableSelect from './components/SearchableSelect';



const PrivateRoute = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};


function App() {
  const router=createBrowserRouter([
    {
      path: "/",
      element:<Login/>
    },
    {
      path: "/user-dashboard",
      element:<UserDashboard/>
    },
    {
      path: "/admin-dashboard",
      element:<AdminDashboard/>
    },
    {
      path: "/report",
      element:<Report/>
    },
    {
      path: "/add-product",
      element:<AddNewProduct/>
    },
    {
      path: "/forgot-password",
      element:<ForgotPassword/>
    },
    {
      path: "/signup",
      element:<Signup/>
    },
    {
      path: "/select",
      element:<SearchableSelect/>
    }

  ])
  return (
    <div className="App">
      <RouterProvider router={router}/>

    </div>
  );
}

export default App;
