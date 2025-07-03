import React, { useState } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_EMAIL } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { API_BASE_URL } from '../../config';
import './Auth.css';

const ForgotPassword = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [success, setSuccess] = useState(false);
  const [formState, inputHandler] = useForm(
    {
      email: {
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
        `${API_BASE_URL}/users/forgot-password`,
        'POST',
        JSON.stringify({ email: formState.inputs.email.value }),
        { 'Content-Type': 'application/json' }
      );
      setSuccess(true);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Forgot Password</h2>
        <hr />
        {success ? (
          <p>If an account exists, a reset link has been sent to your email.</p>
        ) : (
          <form onSubmit={submitHandler}>
            <Input
              element="input"
              id="email"
              type="email"
              label="E-Mail"
              validators={[VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email address."
              onInput={inputHandler}
            />
            <Button type="submit" disabled={!formState.isValid}>
              Send Reset Link
            </Button>
          </form>
        )}
      </Card>
    </React.Fragment>
  );
};

export default ForgotPassword; 