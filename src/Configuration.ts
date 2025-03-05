import { z } from 'zod';

export const ConfigurationZaaktypeCreateSchema = z.object({
  url: z.string().url().min(1).max(1000).optional(),
  identificatie: z.string().max(50).optional(),
  omschrijving: z.string().max(80),
  vertrouwelijkheidaanduiding: z.enum([
    'openbaar',
    'beperkt_openbaar',
    'intern',
    'zaakvertrouwelijk',
    'vertrouwelijk',
    'confidentieel',
    'geheim',
    'zeer_geheim',
  ]),
  doel: z.string(),
  aanleiding: z.string(),
  referentieproces: z.object({
    naam: z.string().max(80),
    link: z.string().url().max(200).optional(),
  }),
  verantwoordelijke: z.string().max(80),
  indicatieInternOfExtern: z.enum(['intern', 'extern']),
  handelingInitiator: z.string().max(20),
  onderwerp: z.string().max(80),
  handelingBehandelaar: z.string().max(20),
  doorlooptijd: z.string(), // ISO 8601 duration format
  opschortingEnAanhoudingMogelijk: z.boolean(),
  verlengingMogelijk: z.boolean(),
  publicatieIndicatie: z.boolean(),
  productenOfDiensten: z.array(z.string()),
  catalogus: z.string().url(),
  statustypen: z.array(z.string()).optional(),
  resultaattypen: z.array(z.string()).optional(),
  eigenschappen: z.array(z.string()).optional(),
  informatieobjecttypen: z.string().optional(),
  roltypen: z.array(z.string()).optional(),
  besluittypen: z.array(z.string()),
  deelzaaktypen: z.array(z.string()).optional(),
  gerelateerdeZaaktypen: z.array(z.object({
    zaaktype: z.string().url().max(200),
    aardRelatie: z.enum(['vervolg', 'bijdrage', 'onderwerp']),
    toelichting: z.string().max(255).optional(),
  })),
  beginGeldigheid: z.string(), // ISO 8601 date format
  versiedatum: z.string(), // ISO 8601 date format
  concept: z.boolean().optional(),
  zaakobjecttypen: z.array(z.string()).optional(),
});

export const ConfigurationInformatieobjecttypenSchema = z.object({
  omschrijving: z.string(),
  vertrouwelijkheidaanduiding: z.enum([
    'openbaar',
    'beperkt_openbaar',
    'intern',
    'zaakvertrouwelijk',
    'vertrouwelijk',
    'confidentieel',
    'geheim',
    'zeer_geheim',
  ]),
  beginGeldigheid: z.string(), // 2020-12-31
  informatieobjectcategorie: z.string(),
});

export const ConfigurationSchema = z.object({
  naam: z.string(),
  rsin: z.string().max(9),
  domein: z.string().min(1).max(5),
  contactpersoonBeheerNaam: z.string().max(40),
  informatieobjecttypen: z.array(ConfigurationInformatieobjecttypenSchema).optional(),
  zaaktypen: z.array(ConfigurationZaaktypeCreateSchema).optional(),
});


export type Configuration = z.infer<typeof ConfigurationSchema>;
export type ConfigurationInformatieobjecttype = z.infer<typeof ConfigurationInformatieobjecttypenSchema>;
export type ConfigurationZaaktypeCreate = z.infer<typeof ConfigurationZaaktypeCreateSchema>;

