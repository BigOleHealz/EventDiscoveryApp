import React, { createContext, useContext } from 'react';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { region, aws_access_key_id, aws_secret_access_key } from '../secrets';


/**
 * Get the secret value for a given SecretId
 * @param {string} SecretId - The ID of the secret to retrieve
 * @returns {Promise<Object|null>} - The secret value as an object or null if an error occurs
 */

class AWSHandler {
  constructor() {
    this.awsConfig = {
        region,
        credentials: {
          accessKeyId: aws_access_key_id,
          secretAccessKey: aws_secret_access_key,
        },
      };


    this.secretsManager = new SecretsManager(this.awsConfig);
    this.sesClient = new SESClient(this.awsConfig);
  }

  async getSecretValue(SecretId) {
    try {
      console.log("Fetching AWS Secret: ", SecretId)
      const data = await this.secretsManager.getSecretValue({ SecretId });
  
      if ('SecretString' in data) {
        console.log("AWS Secret Retrieved:", SecretId)
        return JSON.parse(data.SecretString);
      } else {
        throw new Error('No secret string found');
      }
    } catch (error) {
      console.error('Error fetching secret:', error);
      return null;
    }
  }

  async sendVerificationEmail(email, token) {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `Please click the following link to verify your email address: 
                   <a href="https://your-website.com/verify?token=${token}">Verify Email Address</a>`,
          },
        },
        Subject: { Data: 'Verify your email address', Charset: 'UTF-8' },
      },
      Source: 'your-email@your-domain.com',
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      console.log('Email sent:', response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
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

export { AWSHandlerProviderWrapper, useAWSHandler, AWSHandlerContext};