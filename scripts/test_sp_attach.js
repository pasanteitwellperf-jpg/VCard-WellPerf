const fs = require('fs');

function parseEnv() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

async function testSpAttach() {
  parseEnv();
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const hostname = process.env.SHAREPOINT_HOSTNAME || 'wellperf.sharepoint.com';
  
  console.log("Getting token...");
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', `https://${hostname}/.default`);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const res = await fetch(tokenUrl, { method: 'POST', body: params });
  const data = await res.json();
  if (!res.ok) {
    console.error("Token error:", data);
    return;
  }
  const token = data.access_token;
  console.log("Token obtained.");

  // Test creating an item first using Graph to get an itemId
  const graphTokenParams = new URLSearchParams();
  graphTokenParams.append('client_id', clientId);
  graphTokenParams.append('scope', `https://graph.microsoft.com/.default`);
  graphTokenParams.append('client_secret', clientSecret);
  graphTokenParams.append('grant_type', 'client_credentials');
  const graphRes = await fetch(tokenUrl, { method: 'POST', body: graphTokenParams });
  const graphToken = (await graphRes.json()).access_token;

  const siteIdRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${hostname}:/sites/PowerAppsWP`);
  const siteData = await siteIdRes.json(); // need headers
}
// wait, I can just test with a dummy item. Let me finish the script properly.
