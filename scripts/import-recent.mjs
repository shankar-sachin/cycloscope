import fs from 'node:fs';
import {parseBestTrack} from '../worker/index.js';
const storms=[];
for(const file of fs.readdirSync('data/recent').filter(f=>/^b(?:al|ep|cp)\d{6}\.dat$/.test(f))){
 const text=fs.readFileSync('data/recent/'+file,'utf8'),track=parseBestTrack(text);
 if(!track.length)continue;
 const names=text.trim().split('\n').map(l=>l.split(',')[27]?.trim()).filter(n=>n&&!/^\d+$/.test(n)&&!['INVEST','UNNAMED'].includes(n));
 const name=names.at(-1)||'Unnamed';
 storms.push({id:file.slice(1,-4).toUpperCase(),name:name.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),provisional:true,source:'https://ftp.nhc.noaa.gov/atcf/btk/'+file,points:track.map(p=>[p.time,p.lat,p.lon,p.windKt,p.pressureHpa,p.status,''])});
}
fs.writeFileSync('data/recent.json',JSON.stringify(storms));
console.log('Imported',storms.length,'preliminary 2026 NHC tracks');
