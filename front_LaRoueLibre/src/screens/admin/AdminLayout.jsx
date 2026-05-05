import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarAdmin from '../../components/UI/admin/NavbarAdmin';

const AdminLayout = () => {
    return (
        <div className="bg-dark-nigth-blue min-h-screen text-white">
            <NavbarAdmin />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
