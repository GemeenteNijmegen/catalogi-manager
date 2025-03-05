import { HttpClient } from '@gemeentenijmegen/modules-zgw-client/lib/catalogi-generated-client';
import * as jwt from 'jsonwebtoken';

export function getClient(baseUrl: string, clientId: string, clientSecret: string) {

  const client = new HttpClient({
    baseURL: baseUrl,
    format: 'json',
    async securityWorker(securityData: any) {
      return {
        headers: {
          Authorization: `Bearer ${securityData?.token}`,
        },
      };
    },
  });
  client.setSecurityData({ token: createToken(clientId, clientSecret) });
  return client;
}

/**
 * Generates a new JWT token for authentication.
 */
function createToken(clientId: string, clientSecret: string): string {
  return jwt.sign(
    {
      iss: clientId,
      iat: Math.floor(Date.now() / 1000),
      client_id: clientId,
      user_id: clientId,
      user_representation: clientId,
    },
    clientSecret,
    { expiresIn: '12h' }, // Set token expiration to 12 hours
  );
}
