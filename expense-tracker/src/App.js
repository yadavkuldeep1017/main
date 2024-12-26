import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import React from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import Report from './components/Report';
import AdminDashboard from './components/AdminDashboard';
import AddProduct from './components/AddProduct';
import { Navigate, Outlet } from 'react-router-dom';



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
      path: "/user",
      element:<UserDashboard/>
    },
    {
      path: "/admin",
      element:<AdminDashboard/>
    },
    {
      path: "/report",
      element:<Report/>
    },
    {
      path: "/add-product",
      element:<AddProduct/>
    }
  ])
  return (
    <div className="App">
      <RouterProvider router={router}/>

    </div>
  );
}

export default App;
