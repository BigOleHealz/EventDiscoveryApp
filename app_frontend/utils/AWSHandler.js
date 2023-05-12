import React, { createContext, useContext } from 'react';
// import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';


import AWS from 'aws-sdk';





/**
 * Get the secret value for a given SecretId
 * @param {string} SecretId - The ID of the secret to retrieve
 * @returns {Promise<Object|null>} - The secret value as an object or null if an error occurs
 */


async function getSecretValue(secretId) {
  const response = await fetch(`https://o83fz5lh02.execute-api.us-east-1.amazonaws.com/Stage/fetch_secret?secret_id=${secretId}`);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  // Assuming the secret is in the 'body' field of the response
  return data.body;
}

class AWSHandler {
  // constructor() {
  // this.secretsManager = new AWS.SecretsManager();

  // }

  // async getSecretValue(SecretId) {
  //   try {
  //     console.log("Fetching AWS Secret: ", SecretId)
  //     const data = await this.secretsManager.getSecretValue({ SecretId });

  //     if ('SecretString' in data) {
  //       console.log("AWS Secret Retrieved:", SecretId)
  //       return JSON.parse(data.SecretString);
  //     } else {
  //       throw new Error('No secret string found');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching secret:', error);
  //     return null;
  //   }
  // }





};

const AWSHandlerContext = createContext(null);

const useAWSHandler = () => {
  return useContext(AWSHandlerContext);
};

const AWSHandlerProviderWrapper = ({ children }) => {
  const awsHandler = new AWSHandler();

  return (
    <AWSHandlerContext.Provider value={awsHandler}>
      {children}
    </AWSHandlerContext.Provider>
  );
};

export { AWSHandlerProviderWrapper, useAWSHandler, AWSHandlerContext, getSecretValue };


// async sendVerificationEmail(email, token) {
//   const params = {
//     Destination: {
//       ToAddresses: [email],
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: `Please click the following link to verify your email address: 
//                  <a href="https://your-website.com/verify?token=${token}">Verify Email Address</a>`,
//         },
//       },
//       Subject: { Data: 'Verify your email address', Charset: 'UTF-8' },
//     },
//     Source: 'your-email@your-domain.com',
//   };

//   try {
//     const command = new SendEmailCommand(params);
//     const response = await this.sesClient.send(command);
//     console.log('Email sent:', response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// }