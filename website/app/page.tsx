'use client';

import React, { useState } from 'react';
import '@root/global.scss';
import ActionButton from '@components/ActionButton';
import Badge from '@components/Badge';
import DefaultLayout from '@components/page/DefaultLayout';
import Grid from '@components/Grid';
import ModalCreateAccount from '@components/modals/ModalCreateAccount';
import ModalTrigger from '@components/ModalTrigger';
import Package from '@root/package.json';
import Row from '@components/Row';
import InteractiveMessages from './interactiveMessages';

export default function Page(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(!isLoggedIn);

  const handleCreateAccount = async (userData) => {
    try {
      const response = await fetch('http://localhost:10001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      console.log('Response status:', response.status); // Log the HTTP status code
  
      if (response.ok) {
        console.log('Account created successfully');
        setIsLoggedIn(true);
        setShowModal(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create account:', errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <DefaultLayout previewPixelSRC="https://intdev-global.s3.us-west-2.amazonaws.com/template-app-icon.png">
      {showModal && (
        <ModalCreateAccount
          onSubmit={handleCreateAccount}
        />
      )}
      {!showModal && (
        <>
          <br />
          <Grid>
            <Row>
              {Package.name} <Badge>Version {Package.version}</Badge>
            </Row>
            <Row>{Package.description}</Row>
            <Row>{Package.beya}</Row>
            <Row>
              <ModalTrigger modal={ModalCreateAccount}>
                <ActionButton>Create Account</ActionButton>
              </ModalTrigger>
            </Row>
          </Grid>
          <br />
          <br />
          <br />
          <InteractiveMessages />
        </>
      )}
    </DefaultLayout>
  );
}