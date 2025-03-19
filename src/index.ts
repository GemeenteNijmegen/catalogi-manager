import { readFileSync } from 'fs';
import { catalogi } from '@gemeentenijmegen/modules-zgw-client';
import { IndicatieInternOfExternEnum, VertrouwelijkheidaanduidingEnum } from '@gemeentenijmegen/modules-zgw-client/lib/catalogi-generated-client';
import { Configuration, ConfigurationBesluittypeCreate, ConfigurationInformatieobjecttype, ConfigurationSchema, ConfigurationZaaktypeCreate } from './Configuration';
import { getClient } from './setupClient';

export async function update() {

  // Setup client
  const clientId = process.env.ZGW_CLIENT_ID;
  const clientSecret = process.env.ZGW_CLIENT_SECRET;
  const baseUrl = process.env.ZGW_BASE_URL;
  if (!clientId || !clientSecret || !baseUrl) {
    throw Error('Missing required configuration in environment variables!');
  }
  const client = getClient(baseUrl, clientId, clientSecret);

  // Load configuration (fixtures)
  const configurationFile = readFileSync('./catalogi.json').toString('utf-8');
  const configuration = ConfigurationSchema.parse(JSON.parse(configurationFile));

  // Catalogus aanmaken
  const cat = await catalogusAanmaken(client, configuration);

  // Informatieobjecttypen in de catalogus aanmaken
  let informatieobjecttypen: any[] = [];
  if (configuration.informatieobjecttypen) {
    const promises = configuration.informatieobjecttypen?.map(infoObject => {
      return informatieobjecttypenAanmaken(client, cat!.url, infoObject);
    });
    informatieobjecttypen = await Promise.all(promises);
  } else {
    console.log('Geen informatieobjecttypes gevonden in de configuratie.');
  }
  console.log(informatieobjecttypen);

  // Besluittype aanmaken in de catalogus aanmaken
  let besluittypen: any[] = [];
  if (configuration.besluittypen) {
    const promises = configuration.besluittypen?.map(besluittype => {
      return besluitTypeAanmaken(client, cat!.url, besluittype);
    });
    besluittypen = await Promise.all(promises);
  } else {
    console.log('Geen besluittypes gevonden in de configuratie.');
  }
  console.log(besluittypen);

  // Zaaktype aanmaken in de catalogus aanmaken
  let zaaktypen: any[] = [];
  if (configuration.zaaktypen) {
    const promises = configuration.zaaktypen?.map(zaaktype => {
      return zaaktypenAanmaken(client, cat!.url, zaaktype);
    });
    zaaktypen = await Promise.all(promises);
  } else {
    console.log('Geen zaaktypes gevonden in de configuratie.');
  }
  console.log(zaaktypen);


}


async function catalogusAanmaken(client: catalogi.HttpClient, config: Configuration) {
  console.log('Checking for catalogus...');
  const catalogussen = new catalogi.Catalogussen(client);

  const existingCatalogus = await catalogussen.catalogusList({
    rsin: config.rsin,
  });

  if (existingCatalogus.data?.count == 1) {
    console.log('Existing catalogus found wit rsin', config.rsin);
    return existingCatalogus.data?.results?.[0];
  }

  console.log('No catalogus found, creating a new catalogus...');
  // Type hack as we do not want to fill all properties that the client asks for see https://github.com/acacode/swagger-typescript-api/issues/468
  const catalogusInput: Partial<catalogi.Catalogus> = {
    naam: config.naam,
    rsin: config.rsin,
    domein: config.domein,
    contactpersoonBeheerNaam: config.contactpersoonBeheerNaam,
  };
  const catalogus = await catalogussen.catalogusCreate(catalogusInput as catalogi.Catalogus);
  console.log('Catalogus creation successful!');
  return catalogus.data;
}


async function informatieobjecttypenAanmaken(httpClient: catalogi.HttpClient, catalogus: string,
  informatieobjecttype: ConfigurationInformatieobjecttype) {
  const soort = 'informatieobjecttype';
  const client = new catalogi.Informatieobjecttypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. beschrijving)`, informatieobjecttype.omschrijving);
  const existing = await client.informatieobjecttypeList({
    catalogus: catalogus,
    status: 'alles',
    omschrijving: informatieobjecttype.omschrijving,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);
  // Type hack as we do not want to fill all properties that the client asks for see https://github.com/acacode/swagger-typescript-api/issues/468
  const input: Partial<catalogi.InformatieObjectType> = {
    catalogus: catalogus,
    omschrijving: informatieobjecttype.omschrijving,
    vertrouwelijkheidaanduiding: informatieobjecttype.vertrouwelijkheidaanduiding as VertrouwelijkheidaanduidingEnum,
    beginGeldigheid: informatieobjecttype.beginGeldigheid,
    informatieobjectcategorie: informatieobjecttype.informatieobjectcategorie,
  };
  const output = await client.informatieobjecttypeCreate(input as catalogi.InformatieObjectType);
  console.log(`${soort} creation successful!`);
  return output.data;
}

async function besluitTypeAanmaken(httpClient: catalogi.HttpClient, catalogus: string, besluitType: ConfigurationBesluittypeCreate) {
  const soort = 'besluittype';
  const client = new catalogi.Besluittypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. omschrijving)`, besluitType.omschrijving);
  const existing = await client.besluittypeList({
    catalogus: catalogus,
    status: 'alles',
    omschrijving: besluitType.omschrijving,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.BesluitTypeCreate> = {
    catalogus: catalogus,
    omschrijving: besluitType.omschrijving,
    beginGeldigheid: besluitType.beginGeldigheid,
    informatieobjecttypen: besluitType.informatieobjecttypen,
    publicatieIndicatie: besluitType.publicatieIndicatie,
  };

  console.log('Besluittype input:', input);

  try {
    const output = await client.besluittypeCreate(input as catalogi.BesluitTypeCreate);
    console.log(`${soort} creation successful!`);
    return output.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function zaaktypenAanmaken(httpClient: catalogi.HttpClient, catalogus: string, zaaktype: ConfigurationZaaktypeCreate) {
  const soort = 'zaaktype';
  const client = new catalogi.Zaaktypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. trefwoorden)`, zaaktype.trefwoorden);
  const existing = await client.zaaktypeList({ //TODO zaaktypen lijst controleren of deze al bestaat
    catalogus: catalogus,
    status: 'alles',
    identificatie: '1',
    //trefwoorden: ['Vergunning', 'Aanvraag'],
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.ZaakTypeCreate> = {
    catalogus: catalogus,
    omschrijving: zaaktype.omschrijving,
    vertrouwelijkheidaanduiding: zaaktype.vertrouwelijkheidaanduiding as VertrouwelijkheidaanduidingEnum,
    beginGeldigheid: zaaktype.beginGeldigheid,
    indicatieInternOfExtern: zaaktype.indicatieInternOfExtern as IndicatieInternOfExternEnum,
    handelingInitiator: zaaktype.handelingInitiator,
    onderwerp: zaaktype.onderwerp,
    handelingBehandelaar: zaaktype.handelingBehandelaar,
    doorlooptijd: zaaktype.doorlooptijd,
    opschortingEnAanhoudingMogelijk: zaaktype.opschortingEnAanhoudingMogelijk,
    verlengingMogelijk: zaaktype.verlengingMogelijk,
    productenOfDiensten: zaaktype.productenOfDiensten,
    besluittypen: zaaktype.besluittypen,
    gerelateerdeZaaktypen: zaaktype.gerelateerdeZaaktypen.map(relatie => ({
      ...relatie,
      aardRelatie: relatie.aardRelatie as catalogi.AardRelatieEnum,
    })),
    versiedatum: zaaktype.versiedatum,
    doel: zaaktype.doel,
    aanleiding: zaaktype.aanleiding,
    publicatieIndicatie: zaaktype.publicatieIndicatie,
    referentieproces: zaaktype.referentieproces,
    verantwoordelijke: zaaktype.verantwoordelijke,
  };

  console.log('Zaaktype input:', input);

  try {
    const output = await client.zaaktypeCreate(input as catalogi.ZaakTypeCreate);
    console.log(`${soort} creation successful!`);
    return output.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}