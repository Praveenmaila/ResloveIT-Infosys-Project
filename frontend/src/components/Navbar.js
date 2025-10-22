import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="navbar">
      <h1>ResolveIT</h1>
      <nav>
        <Link to="/">Home</Link>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/anonymous">Submit Anonymous Complaint</Link>
          </>
        )}
        {user && !isAdmin() && (
          <>
            <Link to="/submit-complaint">Submit Complaint</Link>
            <Link to="/my-complaints">My Complaints</Link>
          </>
        )}
        {user && isAdmin() && (
          <>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
          </>
        )}
        {user && (
          <a href="#" onClick={logout} style={{ cursor: 'pointer' }}>
            Logout ({user.username})
          </a>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
