import {catalog as previous} from '../story-v5/catalog-source.mjs';
import {localCatalog} from './country-source.mjs';
export const catalog=[...previous.map(e=>({...e,id:e.id.replace('s5.','s6.')})),...localCatalog];
