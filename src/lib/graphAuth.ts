export async function getGraphAccessToken(): Promise<string> {
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Faltan credenciales de Microsoft Graph en las variables de entorno.');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    next: { revalidate: 3000 }, // Caché para re-usar el token si es posible
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Error al obtener token de MS Graph:', err);
    throw new Error('No se pudo autenticar con Microsoft Graph');
  }

  const data = await response.json();
  return data.access_token;
}

// Función auxiliar para obtener el Site ID de SharePoint (necesario para Graph API)
export async function getSharePointSiteId(accessToken: string): Promise<string> {
  const hostname = process.env.SHAREPOINT_HOSTNAME || 'wellperf.sharepoint.com';
  const sitePath = 'PowerAppsWP'; // Tomado de la URL que proporcionaste

  const response = await fetch(`https://graph.microsoft.com/v1.0/sites/${hostname}:/sites/${sitePath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el ID del sitio de SharePoint');
  }

  const data = await response.json();
  return data.id;
}

export async function getSharePointListId(accessToken: string, siteId: string, listName: string): Promise<string> {
  const response = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`No se pudo obtener el ID de la lista: ${listName}`);
  }

  const data = await response.json();
  return data.id;
}

export async function getSharePointAccessToken(): Promise<string> {
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const hostname = process.env.SHAREPOINT_HOSTNAME || 'wellperf.sharepoint.com';

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Faltan credenciales en las variables de entorno.');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', `https://${hostname}/.default`);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    next: { revalidate: 3000 },
  });

  if (!response.ok) {
    throw new Error('No se pudo autenticar con SharePoint REST API');
  }

  const data = await response.json();
  return data.access_token;
}
