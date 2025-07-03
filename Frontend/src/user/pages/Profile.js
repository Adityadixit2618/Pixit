import React, { useContext, useState, useEffect, useCallback } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { API_BASE_URL } from '../../config';
import './Auth.css';
import { useHistory } from 'react-router-dom';

const Profile = () => {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [success, setSuccess] = useState('');

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: { value: '', isValid: false },
      email: { value: '', isValid: false },
      phone: { value: '', isValid: true }
    },
    false
  );

  const [passwordForm, passwordInputHandler, setPasswordFormData] = useForm(
    {
      currentPassword: { value: '', isValid: false },
      newPassword: { value: '', isValid: false },
      confirmNewPassword: { value: '', isValid: false }
    },
    false
  );

  const fetchAndSetUser = useCallback(async () => {
    try {
      const response = await sendRequest(`${API_BASE_URL}/users/${auth.userId}`);
      console.log('Fetched user:', response.user);
      setFormData(
        {
          name: { value: response.user.name, isValid: true },
          email: { value: response.user.email, isValid: true },
          phone: { value: response.user.phone || '', isValid: true }
        },
        true
      );
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }, [sendRequest, auth.userId, setFormData]);

  useEffect(() => {
    if (!auth.userId) {
      history.push('/auth');
      return;
    }
    fetchAndSetUser();
  }, [fetchAndSetUser, history, auth.userId]);

  const profileSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `${API_BASE_URL}/users/profile`,
        'PATCH',
        JSON.stringify({
          name: formState.inputs.name.value,
          email: formState.inputs.email.value,
          phone: formState.inputs.phone.value
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token
        }
      );
      setSuccess('Profile updated successfully!');
      fetchAndSetUser();
    } catch (err) {}
  };

  const passwordSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `${API_BASE_URL}/users/update-password`,
        'POST',
        JSON.stringify({
          currentPassword: passwordForm.inputs.currentPassword.value,
          newPassword: passwordForm.inputs.newPassword.value,
          confirmNewPassword: passwordForm.inputs.confirmNewPassword.value
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token
        }
      );
      setSuccess('Password updated successfully!');
      setPasswordFormData(
        {
          currentPassword: { value: '', isValid: false },
          newPassword: { value: '', isValid: false },
          confirmNewPassword: { value: '', isValid: false }
        },
        false
      );
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Profile</h2>
        <hr />
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={profileSubmitHandler}>
          <Input
            element="input"
            id="name"
            type="text"
            label="Name"
            value={formState.inputs.name.value}
            validators={[]}
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            value={formState.inputs.email.value}
            validators={[]}
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="phone"
            type="text"
            label="Phone Number"
            value={formState.inputs.phone.value}
            validators={[]}
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            Update Profile
          </Button>
        </form>
        <hr />
        <h3>Update Password</h3>
        <form onSubmit={passwordSubmitHandler}>
          <Input
            element="input"
            id="currentPassword"
            type="password"
            label="Current Password"
            validators={[]}
            onInput={passwordInputHandler}
            value={passwordForm.inputs.currentPassword.value}
            initialValue=""
            initialValid={false}
          />
          <Input
            element="input"
            id="newPassword"
            type="password"
            label="New Password"
            validators={[]}
            onInput={passwordInputHandler}
            value={passwordForm.inputs.newPassword.value}
            initialValue=""
            initialValid={false}
          />
          <Input
            element="input"
            id="confirmNewPassword"
            type="password"
            label="Confirm New Password"
            validators={[]}
            onInput={passwordInputHandler}
            value={passwordForm.inputs.confirmNewPassword.value}
            initialValue=""
            initialValid={false}
          />
          <Button type="submit" disabled={!passwordForm.isValid}>
            Update Password
          </Button>
        </form>
      </Card>
    </React.Fragment>
  );
};

export default Profile; 