import { readFileSync } from 'fs';
import path from 'path';
import { CatalogueSchema } from '../src/informatieobjectTypeSchema';
test('Parsing catalogue works', async () => {
  const configurationFile = readFileSync(path.join(__dirname, '../catalogi.json')).toString('utf-8');
  const json = JSON.parse(configurationFile);
  const catalogue = CatalogueSchema.parse(json);
  expect(catalogue).toBeTruthy();
});
