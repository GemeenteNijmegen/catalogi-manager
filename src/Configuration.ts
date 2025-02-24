import { z } from 'zod';

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
});


export type Configuration = z.infer<typeof ConfigurationSchema>;
export type ConfigurationInformatieobjecttype = z.infer<typeof ConfigurationInformatieobjecttypenSchema>;

