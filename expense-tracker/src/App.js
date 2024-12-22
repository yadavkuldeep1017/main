import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import React from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import Report from './components/Report';


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
      path: "/report",
      element:<Report/>
    }
  ])
  return (
    <div className="App">
      <RouterProvider router={router}/>

    </div>
  );
}

export default App;
