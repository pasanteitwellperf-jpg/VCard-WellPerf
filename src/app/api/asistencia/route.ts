import { NextResponse } from 'next/server';
import { getGraphAccessToken, getSharePointSiteId } from '@/lib/graphAuth';
import { put } from '@vercel/blob';
import { createClient } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, nombres, apellidos, empresa, cedula, firmaBase64 } = data;

    if (!title || !nombres || !apellidos || !cedula || !firmaBase64) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // 1. Obtener Token de Graph
    const accessToken = await getGraphAccessToken();

    // 2. Obtener Site ID
    const siteId = await getSharePointSiteId(accessToken);
    const listName = 'Registro de Asistencia';

    // 3. Crear el Ítem en la Lista de SharePoint
    const createItemUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items`;
    
    const itemPayload = {
      fields: {
        Title: title,
        Nombres: nombres,
        Apellidos: apellidos,
        Empresa: empresa || '',
        Cedula: cedula
      }
    };

    const createResponse = await fetch(createItemUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemPayload)
    });

    if (!createResponse.ok) {
      const err = await createResponse.text();
      console.error('Error al crear el registro en SharePoint:', err);
      return NextResponse.json({ error: 'Error al guardar en SharePoint' }, { status: 500 });
    }

    const itemData = await createResponse.json();
    const itemId = itemData.id;

    // 4. Subir la Firma a Vercel Blob
    const buffer = Buffer.from(firmaBase64, 'base64');
    const fileName = `firmas/firma_${cedula}_${Date.now()}.png`;

    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: 'image/png'
    });

    // 5. Guardar la referencia en PostgreSQL
    const dbClient = createClient();
    await dbClient.connect();
    await dbClient.query(
      'INSERT INTO attendance_signatures (sharepoint_id, cedula, blob_url) VALUES ($1, $2, $3)',
      [itemId, cedula, blob.url]
    );
    await dbClient.end();

    return NextResponse.json({ success: true, itemId });

  } catch (error: any) {
    console.error('API Asistencia Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const accessToken = await getGraphAccessToken();
    const siteId = await getSharePointSiteId(accessToken);
    const listName = 'Registro de Asistencia';

    const getItemsUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listName}/items?$expand=fields`;
    
    const response = await fetch(getItemsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 } // No cache para ver datos en vivo
    });

    if (!response.ok) {
      throw new Error('Error al consultar SharePoint');
    }

    const data = await response.json();
    
    // Mapear los datos para el dashboard
    const registros = data.value.map((item: any) => ({
      id: item.id,
      title: item.fields.Title,
      nombres: item.fields.Nombres,
      apellidos: item.fields.Apellidos,
      empresa: item.fields.Empresa,
      cedula: item.fields.Cedula,
      created: item.createdDateTime
    }));

    return NextResponse.json(registros);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
