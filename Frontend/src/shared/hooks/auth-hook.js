import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);
  const [image, setImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserImage = async (uid, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await response.json();
      return { image: data.user.image, isAdmin: data.user.isAdmin };
    } catch {
      return { image: null, isAdmin: false };
    }
  };

  const login = useCallback(async (uid, token, image, isAdmin, expirationDate) => {
    setToken(token);
    setUserId(uid);
    let userImage = image;
    let userIsAdmin = isAdmin;
    if ((!userImage || userIsAdmin === undefined) && uid && token) {
      const fetched = await fetchUserImage(uid, token);
      userImage = userImage || fetched.image;
      userIsAdmin = userIsAdmin !== undefined ? userIsAdmin : fetched.isAdmin;
    }
    setImage(userImage);
    setIsAdmin(userIsAdmin);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token,
        image: userImage,
        isAdmin: userIsAdmin,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setImage(null);
    setIsAdmin(false);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(storedData.userId, storedData.token, storedData.image, storedData.isAdmin, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userId, image, isAdmin };
};