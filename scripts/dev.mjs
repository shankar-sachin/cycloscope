import http from 'node:http';
import {embeddedQa} from './embedded-qa.mjs';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
execFileSync('node',['scripts/build.mjs']);
let revision=0;let worker=(await import('../worker/index.js?rev='+revision)).default;
fs.watch('src',async()=>{try{execFileSync('node',['scripts/build.mjs']);worker=(await import('../worker/index.js?rev='+(++revision))).default;}catch(e){console.error(e.message);}});
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{if(req.url==='/__qa/embedded'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(await embeddedQa(worker));return;}const chunks=[];for await(const c of req)chunks.push(c);const init={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method))init.body=Buffer.concat(chunks);const r=await worker.fetch(new Request('http://localhost:'+port+req.url,init));res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(port,'0.0.0.0',()=>console.log('CycloScope listening on '+port));
