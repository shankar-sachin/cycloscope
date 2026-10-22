const BASE='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
const PRODUCTS=[['GOES-East_ABI_Band13_Clean_Infrared','NOAA GOES-East infrared',false],['GOES-West_ABI_Band13_Clean_Infrared','NOAA GOES-West infrared',false],['VIIRS_NOAA20_CorrectedReflectance_TrueColor','NOAA-20 VIIRS true color',true],['MODIS_Terra_CorrectedReflectance_TrueColor','NASA Terra MODIS true color',true]];
let cache;
export function availableTime(ranges,time,daily){
 const requested=Date.parse(daily?time.slice(0,10)+'T00:00:00Z':time);
 for(const range of ranges.split(',')){
  const [start,end,step]=range.trim().split('/'),a=Date.parse(start),b=end?Date.parse(end):a;
  const delta=step?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/),increment=daily?86400000:delta?(Number(delta[1]||0)*60+Number(delta[2]||0))*60000:600000;
  const closest=Math.max(a,Math.min(b,a+Math.round((requested-a)/increment)*increment));
  if(Number.isFinite(closest)&&Math.abs(closest-requested)<=(daily?0:1800000))return daily?new Date(closest).toISOString().slice(0,10):new Date(closest).toISOString().replace('.000Z','Z');
 }
 return null;
}
export function parseSatelliteCapabilities(xml){const out={};for(const [id] of PRODUCTS){const pos=xml.indexOf('<Name>'+id+'</Name>');if(pos<0)continue;const layer=xml.slice(pos,xml.indexOf('</Layer>',pos));out[id]=layer.match(/<Dimension[^>]*name="time"[^>]*>([\s\S]*?)<\/Dimension>/)?.[1]?.trim()||'';}return out;}
export async function satelliteFrame({time,lat,lon,product='auto'}){
 lat=Number(lat);lon=Number(lon);if(!Number.isFinite(Date.parse(time))||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Invalid satellite time or position');
 if(!cache||Date.now()-cache.at>3600000){const r=await fetch(BASE+'?SERVICE=WMS&REQUEST=GetCapabilities',{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Satellite archive metadata is temporarily unavailable');cache={at:Date.now(),layers:parseSatelliteCapabilities(await r.text())};}
 const candidates=PRODUCTS.filter(([id,,daily])=>product==='color'?daily:product==='infrared'?!daily:true).sort((a,b)=>{if(a[2]||b[2])return 0;return lon< -105?(a[0].includes('West')?-1:1):(a[0].includes('East')?-1:1);});
 for(const [id,title,daily] of candidates){const observedTime=availableTime(cache.layers[id]||'',time,daily);if(!observedTime)continue;
  const west=Math.max(-180,Math.min(156,lon-12)),south=Math.max(-90,Math.min(74,lat-8)),bbox=[west,south,west+24,south+16];
  const p=new URLSearchParams({SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetMap',LAYERS:id,STYLES:'',FORMAT:'image/jpeg',SRS:'EPSG:4326',BBOX:bbox.join(','),WIDTH:'900',HEIGHT:'600',TIME:observedTime});
  return {available:true,url:BASE+'?'+p,title,observedTime,daily,bbox,requestedTime:time,caption:daily?'Daily composite, not an exact-hour image. Nighttime, clouds and orbital gaps can limit visible coverage.':'10-minute infrared imagery; nearest available frame within 30 minutes. Enhanced colors indicate cloud-top temperature, not wind speed.',source:'NASA GIBS / NOAA',sourceUrl:'https://www.earthdata.nasa.gov/data/tools/worldview'};
 }
 return {available:false,requestedTime:time,message:'No imagery for this date in the selected archive. Try Auto / true color. GOES infrared has a limited rolling archive; older storms use daily satellite composites.'};
}
