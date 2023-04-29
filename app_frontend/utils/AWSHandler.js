import { SecretsManager } from '@aws-sdk/client-secrets-manager';

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
  }

  async getSecretValue(SecretId) {
    try {
      console.log("Fetching AWS Secret: ", SecretId)
      const data = await this.secretsManager.getSecretValue({ SecretId });
  
      if ('SecretString' in data) {
        console.log("AWS Secret Retrieved")
        return JSON.parse(data.SecretString);
      } else {
        throw new Error('No secret string found');
      }
    } catch (error) {
      console.error('Error fetching secret:', error);
      return null;
    }
  }
};  


export default AWSHandler;
