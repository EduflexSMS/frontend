import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const userInfo = sessionStorage.getItem('userInfo');
    console.log("PrivateRoute Check - userInfo:", userInfo);
    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
