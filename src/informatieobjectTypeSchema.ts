import { z } from "zod";

const informatieobjectTypeSchema = z.object({
  omschrijving: z.string(),
  vertrouwelijkheidaanduiding: z.string(),
  beginGeldigheid: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  informatieobjectcategorie: z.string(),
});
const besluittypeSchema = z.object({
  omschrijving: z.string(),
  beginGeldigheid: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  informatieobjecttypen: z.array(z.string()).optional(),
  publicatieIndicatie: z.boolean(),
});
const gerelateerdeZaaktypeSchema = z.object({
  zaaktype: z.string(),
  aardRelatie: z.string(),
  toelichting: z.string(),
});
const zaaktypeSchema = z.object({
  omschrijving: z.string(),
  vertrouwelijkheidaanduiding: z.string(),
  beginGeldigheid: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  indicatieInternOfExtern: z.string(),
  handelingInitiator: z.string(),
  onderwerp: z.string(),
  handelingBehandelaar: z.string(),
  doorlooptijd: z.string().optional(), // e.g., P30D
  opschortingEnAanhoudingMogelijk: z.boolean(),
  verlengingMogelijk: z.boolean(),
  productenOfDiensten: z.array(z.string()).optional(),
  besluittypen: z.array(z.string()).optional(),
  gerelateerdeZaaktypen: z.array(gerelateerdeZaaktypeSchema).optional(),
  versiedatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  doel: z.string(),
  aanleiding: z.string(),
  publicatieIndicatie: z.boolean(),
  referentieproces: z.object({
    naam: z.string(),
    link: z.string().url(),
  }).optional(),
  verantwoordelijke: z.string(),
  trefwoorden: z.array(z.string()).optional(),
  statustypen: z.array(z.string()).optional(),
});
const roltypeSchema = z.object({
  omschrijving: z.string(),
  beginGeldigheid: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  omschrijvingGeneriek: z.string(),
});
const resultaattypeSchema = z.object({
  omschrijving: z.string(),
  resultaattypeomschrijving: z.string(),
  selectielijstklasse: z.string(),
  besluittypen: z.array(z.string()).optional(),
  archiefnominatie: z.string(),
});
const statustypeSchema = z.object({
  omschrijving: z.string(),
  volgnummer: z.number(),
});
export const CatalogueSchema = z.object({
  naam: z.string(),
  rsin: z.string(),
  domein: z.string(),
  contactpersoonBeheerNaam: z.string(),
  informatieobjecttypen: z.array(informatieobjectTypeSchema),
  besluittypen: z.array(besluittypeSchema),
  zaaktypen: z.array(zaaktypeSchema),
  roltypen: z.array(roltypeSchema),
  resultaattypen: z.array(resultaattypeSchema),
  statustypen: z.array(statustypeSchema),
});

export type Catalogue = z.infer<typeof CatalogueSchema>;
export default CatalogueSchema;
