import React, { useEffect, useState, useContext } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../shared/context/auth-context';

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();
  const auth = useContext(AuthContext);
  console.log('isAdmin:', auth.isAdmin);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `${API_BASE_URL}/users`
        );

        setLoadedUsers(responseData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]);

  const handleDeleteUser = async (userId) => {
    try {
      await sendRequest(
        `${API_BASE_URL}/users/${userId}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + auth.token }
      );
      setLoadedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} isAdmin={auth.isAdmin} onDeleteUser={handleDeleteUser} />}
    </React.Fragment>
  );
};

export default Users;
 