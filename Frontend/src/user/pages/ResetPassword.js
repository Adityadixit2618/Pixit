import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { API_BASE_URL } from '../../config';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const history = useHistory();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [success, setSuccess] = useState(false);
  const [formState, inputHandler] = useForm(
    {
      password: {
        value: '',
        isValid: false
      },
      confirmPassword: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const submitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `${API_BASE_URL}/users/reset-password/${token}`,
        'POST',
        JSON.stringify({
          password: formState.inputs.password.value,
          confirmPassword: formState.inputs.confirmPassword.value
        }),
        { 'Content-Type': 'application/json' }
      );
      setSuccess(true);
      setTimeout(() => history.push('/auth'), 2000);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Reset Password</h2>
        <hr />
        {success ? (
          <p>Password reset successful! Redirecting to login...</p>
        ) : (
          <form onSubmit={submitHandler}>
            <Input
              element="input"
              id="password"
              type="password"
              label="New Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password (at least 6 characters)."
              onInput={inputHandler}
            />
            <Input
              element="input"
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please confirm your password."
              onInput={inputHandler}
            />
            <Button type="submit" disabled={!formState.isValid}>
              Reset Password
            </Button>
          </form>
        )}
      </Card>
    </React.Fragment>
  );
};

export default ResetPassword; 