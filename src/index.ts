import { readFileSync } from 'fs';
import { catalogi } from '@gemeentenijmegen/modules-zgw-client';
import { IndicatieInternOfExternEnum, OmschrijvingGeneriekEnum, VertrouwelijkheidaanduidingEnum } from '@gemeentenijmegen/modules-zgw-client/lib/catalogi-generated-client';
//import { Configuration, ConfigurationBesluittypeCreate, ConfigurationInformatieobjecttype, ConfigurationResultaattypeCreate, ConfigurationRoltypeCreate, ConfigurationSchema, ConfigurationStatustypeCreate, ConfigurationZaaktypeCreate } from './Configuration';
import { getClient } from './setupClient';

export async function update() {

  // Setup client
  const clientId = process.env.ZGW_CLIENT_ID;
  const clientSecret = process.env.ZGW_CLIENT_SECRET;
  const baseUrl = process.env.ZGW_BASE_URL;
  if (!clientId || !clientSecret || !baseUrl) {
    throw Error('Missing required configuration in environment variables!');
  }

  try {
    const client = getClient(baseUrl, clientId, clientSecret);

    // Load configuration (fixtures)
    const configurationFile = readFileSync('./catalogi.json').toString('utf-8');
    //const configuration = ConfigurationSchema.parse(JSON.parse(configurationFile));
    const configuration = JSON.parse(configurationFile);


    // Catalogus aanmaken
    const cat = await catalogusAanmaken(client, configuration);

    // Informatieobjecttypen in de catalogus aanmaken
    let informatieobjecttypen: any[] = [];
    if (configuration.informatieobjecttypen) {
      const promises = configuration.informatieobjecttypen?.map((infoObject: any) => {
        return informatieobjecttypenAanmaken(client, cat!.url, infoObject);
      });
      informatieobjecttypen = await Promise.all(promises);
    } else {
      console.log('Geen informatieobjecttypes gevonden in de configuratie.');
    }
    console.log(informatieobjecttypen);

    // Besluittype in de catalogus aanmaken
    let besluittypen: any[] = [];
    if (configuration.besluittypen) {
      const promises = configuration.besluittypen?.map((besluittype: any) => {
        return besluitTypeAanmaken(client, cat!.url, besluittype);
      });
      besluittypen = await Promise.all(promises);
    } else {
      console.log('Geen besluittypes gevonden in de configuratie.');
    }
    console.log(besluittypen);

    // Zaaktype in de catalogus aanmaken
    let zaaktypen: any[] = [];
    if (configuration.zaaktypen) {
      const promises = configuration.zaaktypen?.map((zaaktype: any) => {
        return zaaktypenAanmaken(client, cat!.url, zaaktype);
      });
      zaaktypen = await Promise.all(promises);
    } else {
      console.log('Geen zaaktypes gevonden in de configuratie.');
    }
    console.log(zaaktypen);

    // Rest van de typen aanmaken als er een nieuw zaaktype is aangemaakt
    for (const zaaktypeItem of zaaktypen) {
      if (zaaktypeItem.nieuwZaaktype) {

        // Roltype in de catalogus aanmaken
        let roltypen: any[] = [];
        if (configuration.roltypen) {
          const promises = configuration.roltypen?.map((roltype: any) => {
            return roltypenAanmaken(client, roltype);
          });
          roltypen = await Promise.all(promises);
        } else {
          console.log('Geen roltypen gevonden in de configuratie.');
        }
        console.log(roltypen);


        // Resultaattype in de catalogus aanmaken
        let resultaattypen: any[] = [];
        if (configuration.resultaattypen) {
          const promises = configuration.resultaattypen?.map((resultaattype: any) => {
            return resultaattypenAanmaken(client, resultaattype);
          });
          resultaattypen = await Promise.all(promises);
        } else {
          console.log('Geen resultaattypen gevonden in de configuratie.');
        }
        console.log(resultaattypen);

        // Statustype in de catalogus aanmaken
        let statustypen: any[] = [];
        if (configuration.statustypen) {
          const promises = configuration.statustypen?.map((statustype: any) => {
            return statustypenAanmaken(client, statustype);
          });
          statustypen = await Promise.all(promises);
        } else {
          console.log('Geen statustypen gevonden in de configuratie.');
        }
        console.log(statustypen);

      }
    }

  } catch (error: any) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }

}

/**
 * Catalogus aanmaken
 * @param client
 * @param config
 * @returns Catalogus
 */
async function catalogusAanmaken(client: catalogi.HttpClient, config: catalogi.CatalogusCreateData) {
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
  const catalogus = await catalogussen.catalogusCreate(catalogusInput as catalogi.CatalogusCreateData);
  console.log('Catalogus creation successful!');
  return catalogus.data;
}

/**
 * Informatieobjecttype aanmaken
 * @param httpClient
 * @param catalogus
 * @param informatieobjecttype
 * @returns Informatieobjecttype
 */
async function informatieobjecttypenAanmaken(httpClient: catalogi.HttpClient, catalogus: string,
  informatieobjecttype: catalogi.InformatieObjectType) {
  const soort = 'informatieobjecttype';
  const client = new catalogi.Informatieobjecttypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. omschrijving)`, informatieobjecttype.omschrijving);
  const existing = await client.informatieobjecttypeList({
    catalogus: catalogus,
    omschrijving: informatieobjecttype.omschrijving,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.InformatieObjectType> = {
    catalogus: catalogus,
    omschrijving: informatieobjecttype.omschrijving,
    vertrouwelijkheidaanduiding: informatieobjecttype.vertrouwelijkheidaanduiding as VertrouwelijkheidaanduidingEnum,
    beginGeldigheid: informatieobjecttype.beginGeldigheid,
    eindeGeldigheid: informatieobjecttype.eindeGeldigheid, // Optional
    beginObject: informatieobjecttype.beginObject, // Optional
    eindeObject: informatieobjecttype.eindeObject, // Optional
    informatieobjectcategorie: informatieobjecttype.informatieobjectcategorie,
    trefwoord: informatieobjecttype.trefwoord, // Optional
    omschrijvingGeneriek: informatieobjecttype.omschrijvingGeneriek as catalogi.InformatieObjectTypeOmschrijvingGeneriek, // Optional
  };
  const output = await client.informatieobjecttypeCreate(input as catalogi.InformatieObjectType);
  console.log(`${soort} creation successful!`);
  return output.data;
}

/**
 * Besluittype aanmaken
 * @param httpClient
 * @param catalogus
 * @param besluitType
 * @returns Besluittype
 */
async function besluitTypeAanmaken(httpClient: catalogi.HttpClient, catalogus: string, besluitType: catalogi.BesluittypeCreateData) {
  const soort = 'besluittype';
  const client = new catalogi.Besluittypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. omschrijving)`, besluitType.omschrijving);
  const existing = await client.besluittypeList({
    catalogus: catalogus,
    omschrijving: besluitType.omschrijving,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.BesluittypeCreateData> = {
    catalogus: catalogus,
    omschrijving: besluitType.omschrijving, // Optional
    omschrijvingGeneriek: besluitType.omschrijvingGeneriek as OmschrijvingGeneriekEnum, // Optional
    besluitcategorie: besluitType.besluitcategorie, // Optional
    reactietermijn: besluitType.reactietermijn, // Optional
    publicatieIndicatie: besluitType.publicatieIndicatie,
    publicatietekst: besluitType.publicatietekst, // Optional
    publicatietermijn: besluitType.publicatietermijn, // Optional
    toelichting: besluitType.toelichting, // Optional
    informatieobjecttypen: besluitType.informatieobjecttypen,
    beginGeldigheid: besluitType.beginGeldigheid,
    eindeGeldigheid: besluitType.eindeGeldigheid, // Optional
    beginObject: besluitType.beginObject, // Optional

  };

  console.log('Besluittype input:', input);

  try {
    const output = await client.besluittypeCreate(input as catalogi.BesluittypeCreateData);
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

/**
 * Zaaktype aanmaken
 * @param httpClient
 * @param catalogus
 * @param zaaktype
 * @returns
 */
async function zaaktypenAanmaken(httpClient: catalogi.HttpClient, catalogus: string, zaaktype: catalogi.ZaaktypeCreateData) {
  const soort = 'zaaktype';
  const client = new catalogi.Zaaktypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. omschrijving)`, zaaktype.omschrijving,
  );
  const existing = await client.zaaktypeList({}); // Lege lijst om alle zaaktypen op te halen
  console.log(existing.data?.results?.[0]);

  for (const zaaktypeItem of existing.data?.results ?? []) {
    if (zaaktypeItem.omschrijving == zaaktype.omschrijving) {
      console.log('Zaaktype gevonden:', zaaktypeItem);
      return { zaaktypeItem, nieuwZaaktype: false };
    }
  }

  // if (existing.data?.count == 1) {
  //   console.log(`${soort} gevonden`);
  //   return existing.data?.results?.[0];
  // }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.ZaaktypeCreateData> = {
    identificatie: zaaktype.identificatie,
    omschrijving: zaaktype.omschrijving,
    omschrijvingGeneriek: zaaktype.omschrijvingGeneriek as OmschrijvingGeneriekEnum,
    vertrouwelijkheidaanduiding: zaaktype.vertrouwelijkheidaanduiding as VertrouwelijkheidaanduidingEnum,
    doel: zaaktype.doel,
    aanleiding: zaaktype.aanleiding,
    toelichting: zaaktype.toelichting, // Optional
    indicatieInternOfExtern: zaaktype.indicatieInternOfExtern as IndicatieInternOfExternEnum,
    handelingInitiator: zaaktype.handelingInitiator,
    onderwerp: zaaktype.onderwerp,
    handelingBehandelaar: zaaktype.handelingBehandelaar,
    doorlooptijd: zaaktype.doorlooptijd,
    servicenorm: zaaktype.servicenorm, // Optional
    opschortingEnAanhoudingMogelijk: zaaktype.opschortingEnAanhoudingMogelijk,
    verlengingMogelijk: zaaktype.verlengingMogelijk,
    verlengingstermijn: zaaktype.verlengingstermijn, // Optional
    trefwoorden: zaaktype.trefwoorden, // Optional
    publicatieIndicatie: zaaktype.publicatieIndicatie,
    publicatietekst: zaaktype.publicatietekst, // Optional
    verantwoordingsrelatie: zaaktype.verantwoordingsrelatie, // Optional
    productenOfDiensten: zaaktype.productenOfDiensten,
    selectielijstProcestype: zaaktype.selectielijstProcestype, // Optional
    referentieproces: zaaktype.referentieproces,
    verantwoordelijke: zaaktype.verantwoordelijke,
    broncatalogus: zaaktype.broncatalogus, // Optional
    bronzaaktype: zaaktype.bronzaaktype, // Optional
    catalogus: catalogus,
    besluittypen: zaaktype.besluittypen,
    deelzaaktypen: zaaktype.deelzaaktypen,
    gerelateerdeZaaktypen: zaaktype.gerelateerdeZaaktypen.map((relatie: { aardRelatie: catalogi.v1_3_1.AardRelatieEnum; zaaktype: string }) => ({
      ...relatie,
      aardRelatie: relatie.aardRelatie as catalogi.AardRelatieEnum,
      zaaktype: relatie.zaaktype, // Ensure 'zaaktype' is included
    })),
    beginGeldigheid: zaaktype.beginGeldigheid,
    eindeGeldigheid: zaaktype.eindeGeldigheid, // Optional
    beginObject: zaaktype.beginObject, // Optional
    eindeObject: zaaktype.eindeObject, // Optional
    versiedatum: zaaktype.versiedatum,
  };

  console.log('Zaaktype input:', input);

  try {
    const output = await client.zaaktypeCreate(input as catalogi.ZaakTypeCreate);
    console.log(`${soort} creation successful!`);
    const outputData = output.data;
    return { outputData, nieuwZaaktype: true };
  } catch (error: any) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function roltypenAanmaken(httpClient: catalogi.HttpClient, roltype: catalogi.RoltypeCreateData) {
  const soort = 'roltype';
  const client = new catalogi.Roltypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. zaaktype)`, roltype.zaaktype);

  const existing = await client.roltypeList({
    zaaktype: roltype.zaaktype,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);

  const input: Partial<catalogi.RoltypeCreateData> = {
    zaaktype: roltype.zaaktype,
    omschrijving: roltype.omschrijving,
    omschrijvingGeneriek: roltype.omschrijvingGeneriek as OmschrijvingGeneriekEnum,
    catalogus: roltype.catalogus, // Optional
    beginGeldigheid: roltype.beginGeldigheid, // Optional
    eindeGeldigheid: roltype.eindeGeldigheid, // Optional
    beginObject: roltype.beginObject, // Optional
    eindeObject: roltype.eindeObject, // Optional
  };
  const output = await client.roltypeCreate(input as catalogi.RoltypeCreateData);
  console.log(`${soort} creation successful!`);
  return output.data;
}

/**
 * Resultaattype aanmaken
 * @param httpClient
 * @param resultaattype
 * @returns ResultaatType
 */
async function resultaattypenAanmaken(httpClient: catalogi.HttpClient, resultaattype: catalogi.ResultaattypeCreateData) {
  const soort = 'resultaattype';
  const client = new catalogi.Resultaattypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. zaaktype)`, resultaattype.zaaktype);

  const existing = await client.resultaattypeList({
    zaaktype: resultaattype.zaaktype,
  });

  if (existing.data?.count == 1) {
    console.log(`${soort} gevonden`);
    return existing.data?.results?.[0];
  }

  console.log(`${soort} niet gevonden, ${soort} maken...`);
  const input: Partial<catalogi.ResultaattypeCreateData> = {
    zaaktype: resultaattype.zaaktype,
    omschrijving: resultaattype.omschrijving,
    resultaattypeomschrijving: resultaattype.resultaattypeomschrijving, // Zie: https://selectielijst.openzaak.nl/api/v1/resultaattypeomschrijvingen
    selectielijstklasse: resultaattype.selectielijstklasse,
    toelichting: resultaattype.toelichting, // Optional
    archiefnominatie: resultaattype.archiefnominatie as catalogi.ArchiefnominatieEnum, // Optional
    archiefactietermijn: resultaattype.archiefactietermijn, // Optional
    brondatumArchiefprocedure: resultaattype.brondatumArchiefprocedure, // Optional
    procesobjectaard: resultaattype.procesobjectaard, // Optional
    catalogus: resultaattype.catalogus, // Optional
    beginGeldigheid: resultaattype.beginGeldigheid, // Optional
    eindeGeldigheid: resultaattype.eindeGeldigheid, // Optional
    beginObject: resultaattype.beginObject, // Optional
    eindeObject: resultaattype.eindeObject, // Optional
    indicatieSpecifiek: resultaattype.indicatieSpecifiek, // Optional
    procestermijn: resultaattype.procestermijn, // Optional
    besluittypen: resultaattype.besluittypen,
    informatieobjecttypen: resultaattype.informatieobjecttypen, // Optional
  };
  const output = await client.resultaattypeCreate(input as catalogi.ResultaatTypeCreate);
  console.log(`${soort} creation successful!`);
  return output.data;
}

/**
 * StatusType aanmaken
 * @param httpClient
 * @param statusType
 * @returns StatusType
 */
async function statustypenAanmaken(httpClient: catalogi.HttpClient, statusType: catalogi.StatustypeCreateData) {
  const soort = 'statustype';
  const client = new catalogi.Statustypen(httpClient);

  console.log(`Checken of ${soort} bestaat (o.b.v. zaaktype)`, statusType.zaaktype);

  const existing = await client.statustypeList({
    zaaktype: statusType.zaaktype,
  });

  console.log(existing.data);

  let statustypeList = [];
  existing.data?.results?.forEach(async element => {
    if (element.omschrijving == statusType.omschrijving) {
      console.log('Statustype bestaat al');
      statustypeList.push(element);
      return element;
    } else {
      console.log(`${soort} niet gevonden, ${soort} maken...`);

      const input: Partial<catalogi.StatustypeCreateData> = {
        omschrijving: statusType.omschrijving,
        omschrijvingGeneriek: statusType.omschrijvingGeneriek as OmschrijvingGeneriekEnum, // Optional
        statustekst: statusType.statustekst, // Optional
        zaaktype: statusType.zaaktype,
        volgnummer: statusType.volgnummer,
        informeren: statusType.informeren, // Optional
        doorlooptijd: statusType.doorlooptijd, // Optional
        toelichting: statusType.toelichting, // Optional
        checklistitemStatustype: statusType.checklistitemStatustype, // Optional
        eigenschappen: statusType.eigenschappen, // Optional
        beginGeldigheid: statusType.beginGeldigheid, // Optional
        eindeGeldigheid: statusType.eindeGeldigheid, // Optional
        beginObject: statusType.beginObject, // Optional
        eindeObject: statusType.eindeObject, // Optional
      };
      const output = await client.statustypeCreate(input as catalogi.StatustypeCreateData);
      console.log(`${soort} creation successful!`);
      return output.data;
    }
  });
}