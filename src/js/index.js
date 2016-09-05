require('babel-polyfill');
import WorldMap from  './world-map.js';

const worldMapContainer = document.getElementById('world-map');

const wordMap = new WorldMap(worldMapContainer);
