// import { z } from 'zod';

// export const ConfigurationBesluittypeCreateSchema = z.object({
//   catalogus: z.string().url(),
//   omschrijving: z.string().max(80).optional(),
//   omschrijvingGeneriek: z.string().max(80).optional(),
//   besluitcategorie: z.string().max(40).optional(),
//   reactietermijn: z.string().optional(),
//   publicatieIndicatie: z.boolean(),
//   publicatietekst: z.string().optional(),
//   publicatietermijn: z.string().optional(),
//   toelichting: z.string().optional(),
//   informatieobjecttypen: z.array(z.string()),
//   beginGeldigheid: z.string().date(), // ISO 8601 date format
//   eindeGeldigheid: z.string().date().optional(),
//   beginObject: z.string().date().optional(),
//   eindeObject: z.string().date().optional(),

//   // url: z.string().url().min(1).max(1000).optional(),
//   // identificatie: z.string().max(50).optional(),
//   // vertrouwelijkheidaanduiding: z.enum([
//   //   'openbaar',
//   //   'beperkt_openbaar',
//   //   'intern',
//   //   'zaakvertrouwelijk',
//   //   'vertrouwelijk',
//   //   'confidentieel',
//   //   'geheim',
//   //   'zeer_geheim',
//   // ]).optional(),
// });

// export const ConfigurationZaaktypeCreateSchema = z.object({
//   url: z.string().url().min(1).max(1000).optional(),
//   identificatie: z.string().max(50).optional(),
//   omschrijving: z.string().max(80),
//   vertrouwelijkheidaanduiding: z.enum([
//     'openbaar',
//     'beperkt_openbaar',
//     'intern',
//     'zaakvertrouwelijk',
//     'vertrouwelijk',
//     'confidentieel',
//     'geheim',
//     'zeer_geheim',
//   ]),
//   doel: z.string(),
//   aanleiding: z.string(),
//   referentieproces: z.object({
//     naam: z.string().max(80),
//     link: z.string().url().max(200).optional(),
//   }),
//   verantwoordelijke: z.string().max(80),
//   indicatieInternOfExtern: z.enum(['intern', 'extern']),
//   handelingInitiator: z.string().max(20),
//   onderwerp: z.string().max(80),
//   handelingBehandelaar: z.string().max(20),
//   doorlooptijd: z.string(), // ISO 8601 duration format
//   opschortingEnAanhoudingMogelijk: z.boolean(),
//   verlengingMogelijk: z.boolean(),
//   publicatieIndicatie: z.boolean(),
//   productenOfDiensten: z.array(z.string()),
//   catalogus: z.string().url(),
//   statustypen: z.array(z.string()).optional(),
//   resultaattypen: z.array(z.string()).optional(),
//   eigenschappen: z.array(z.string()).optional(),
//   informatieobjecttypen: z.string().optional(),
//   roltypen: z.array(z.string()).optional(),
//   besluittypen: z.array(z.string()),
//   deelzaaktypen: z.array(z.string()).optional(),
//   gerelateerdeZaaktypen: z.array(z.object({
//     zaaktype: z.string().url().max(200),
//     aardRelatie: z.enum(['vervolg', 'bijdrage', 'onderwerp']),
//     toelichting: z.string().max(255).optional(),
//   })),
//   beginGeldigheid: z.string(), // ISO 8601 date format
//   versiedatum: z.string(), // ISO 8601 date format
//   concept: z.boolean().optional(),
//   zaakobjecttypen: z.array(z.string()).optional(),
//   trefwoorden: z.array(z.string()).optional(),
// });

// export const ConfigurationRoltypeCreateSchema = z.object({
//   zaaktype: z.string().url().max(200),
//   omschrijving: z.string().max(100),
//   omschrijvingGeneriek: z.enum([
//     'adviseur',
//     'behandelaar',
//     'belanghebbende',
//     'beslisser',
//     'initiator',
//     'klantcontacter',
//     'zaakcoordinator',
//     'mede-initiator',
//   ]),
// });

// export const ConfigurationResultaattypeCreateSchema = z.object({
//   zaaktype: z.string().url().max(200),
//   omschrijving: z.string().max(30),
//   resultaattypeomschrijving: z.string().max(1000),
//   selectielijstklasse: z.string().max(1000),
//   besluittypen: z.array(z.string()),
//   archiefnominatie: z.enum([
//     'blijvend_bewaren',
//     'vernietigen',
//   ]),
// });

// export const ConfigurationInformatieobjecttypenSchema = z.object({
//   omschrijving: z.string(),
//   vertrouwelijkheidaanduiding: z.enum([
//     'openbaar',
//     'beperkt_openbaar',
//     'intern',
//     'zaakvertrouwelijk',
//     'vertrouwelijk',
//     'confidentieel',
//     'geheim',
//     'zeer_geheim',
//   ]),
//   beginGeldigheid: z.string(), // 2020-12-31
//   informatieobjectcategorie: z.string(),
// });

// export const ConfigurationStatustypeCreateSchema = z.object({
//   omschrijving: z.string(),
//   zaaktype: z.string().url().max(200),
//   volgnummer: z.number(),
// });

// export const ConfigurationSchema = z.object({
//   naam: z.string(),
//   rsin: z.string().max(9),
//   domein: z.string().min(1).max(5),
//   contactpersoonBeheerNaam: z.string().max(40),
//   informatieobjecttypen: z.array(ConfigurationInformatieobjecttypenSchema).optional(),
//   zaaktypen: z.array(ConfigurationZaaktypeCreateSchema).optional(),
//   besluittypen: z.array(ConfigurationBesluittypeCreateSchema).optional(),
//   roltypen: z.array(ConfigurationRoltypeCreateSchema).optional(),
//   resultaattypen: z.array(ConfigurationResultaattypeCreateSchema).optional(),
//   statustypen: z.array(ConfigurationStatustypeCreateSchema).optional(),
// });


// export type Configuration = z.infer<typeof ConfigurationSchema>;
// export type ConfigurationInformatieobjexcttype = z.infer<typeof ConfigurationInformatieobjecttypenSchema>;
// export type ConfigurationZaaktypeCreate = z.infer<typeof ConfigurationZaaktypeCreateSchema>;
// export type ConfigurationBesluittypeCreate = z.infer<typeof ConfigurationBesluittypeCreateSchema>;
// export type ConfigurationRoltypeCreate = z.infer<typeof ConfigurationRoltypeCreateSchema>;
// export type ConfigurationResultaattypeCreate = z.infer<typeof ConfigurationResultaattypeCreateSchema>;
// export type ConfigurationStatustypeCreate = z.infer<typeof ConfigurationStatustypeCreateSchema>;

