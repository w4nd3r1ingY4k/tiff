'use client';

import styles from '@components/modals/ModalAlert.module.scss';

import React, { useState } from 'react';
import Button from '@components/Button';
import CardDouble from '@components/CardDouble';
import Checkbox from '@components/Checkbox';
import Input from '@components/Input';
import RadioButtonGroup from '@components/RadioButtonGroup';

function ModalCreateAccount({ onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    goodwillAccepted: false,
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = () => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      username,
      password,
      confirmPassword,
      termsAccepted,
      goodwillAccepted,
    } = formData;

    // Basic validation
    if (!firstName || !lastName || !email || !phoneNumber || !username || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted || !goodwillAccepted) {
      setError('You must accept all terms and conditions.');
      return;
    }

    setError('');
    onSubmit({ firstName, lastName, email, phoneNumber, username, password });
  };

  return (
    // A full-screen overlay that centers everything via flexbox
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Optional: a semi-transparent background
        zIndex: 1000,
      }}
    >
      <CardDouble title="CREATE ACCOUNT">
        <p>Sign up to get tiff on your team, courtesy of Beya Inc.</p>
        <br />
        <RadioButtonGroup
          defaultValue="modal_developer"
          options={[
            { value: 'modal_individual', label: 'I’m using this for personal use.' },
            { value: 'modal_developer', label: 'I’m building or creating something for work.' },
            { value: 'modal_company', label: 'We’re using this as a team or organization.' },
          ]}
        />
        <br />
        <Input
          autoComplete="off"
          label="FIRST NAME"
          placeholder="Enter your first name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="LAST NAME"
          placeholder="Enter your last name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="EMAIL"
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="PHONE NUMBER"
          placeholder="Enter your phone number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="USERNAME"
          placeholder="Choose a username (e.g., SurfGirl29)"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="PASSWORD"
          placeholder="Create a password (8+ characters)"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <Input
          autoComplete="off"
          label="CONFIRM PASSWORD"
          placeholder="Type it again"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
        <br />
        <Checkbox
          name="termsAccepted"
          checked={formData.termsAccepted}
          onChange={handleInputChange}
        >
          I agree to the Terms of Service, Data Privacy Policy, and Acceptable Use Guidelines.
        </Checkbox>
        <Checkbox
          name="goodwillAccepted"
          checked={formData.goodwillAccepted}
          onChange={handleInputChange}
        >
          I agree not to use this service for unlawful purposes.
        </Checkbox>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button onClick={handleSubmit}>Create an Account</Button>
      </CardDouble>
    </div>
  );
}

export default ModalCreateAccount;