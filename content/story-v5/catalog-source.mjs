import {catalog as previous} from '../story-v4/catalog-source.mjs';
import {localCatalog} from './country-source.mjs';
export const catalog=[...previous.map(e=>({...e,id:e.id.replace('s4.','s5.')})),...localCatalog];
