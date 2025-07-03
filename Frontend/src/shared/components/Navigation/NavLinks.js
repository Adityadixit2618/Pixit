import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';
import Avatar from '../UIElements/Avatar';
import { API_BASE_URL } from '../../../config';

const NavLinks = props => {
  const auth = useContext(AuthContext);
  const [userImage, setUserImage] = useState(auth.image);

  useEffect(() => {
    const fetchUserImage = async () => {
      if (auth.userId && (!auth.image || !auth.image.startsWith('http'))) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/${auth.userId}`);
          const data = await response.json();
          setUserImage(data.user.image);
        } catch {
          setUserImage('/default-avatar.png');
        }
      } else {
        setUserImage(auth.image);
      }
    };
    fetchUserImage();
  }, [auth.userId, auth.image]);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li style={{maxWidth: '40px', maxHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <NavLink to="/profile" className="profile-avatar-link" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
            <Avatar
              image={userImage || '/default-avatar.png'}
              alt="Profile"
              width="40px"
            />
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button className="logout-btn" onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
