(()=>{
 const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const absent=v=>v==null||v===''||/^(?:not (?:found|provided|stated|evidenced)|unknown|unclear|n\/a)$/i.test(String(v).trim());
 const scopeFields=[['electricalWork','Electrical work'],['emitterChanges','Radiator / emitter changes'],['pipework','Pipework'],['cylinder','Hot-water cylinder'],['groundworks','External / ground works'],['commissioning','Commissioning and handover'],['warranty','Warranty and aftercare']];
 const designFields=[['heatLossKw','Whole-home heat loss'],['roomByRoom','Room-by-room heat-loss evidence'],['designOutdoorC','Outdoor design temperature'],['flowTemperatureC','Design flow temperature'],['model','Exact heat-pump model']];
 function scope(q,key,label){
  const raw=q[key],evidence=absent(raw)?'':String(raw).slice(0,1600);
  let status='Not stated';
  if(evidence){
   if(/not found|not provided|not stated|not evidenced|unknown/i.test(evidence))status='Not stated';
   else if(/excluded|not included|customer to arrange|by others/i.test(evidence))status='Excluded';
   else if(/provisional|allowance|subject to (?:survey|confirmation)|to be confirmed/i.test(evidence))status='Provisional';
   else if(/assum|may |might |if required|not clear|unclear/i.test(evidence))status='Assumed';
   else if(/included|provided|covered|fixed price/i.test(evidence))status='Confirmed';
   else status='Assumed';
  }
  return {key,label,status,evidence:evidence||'Not found in the extracted quote details. Ask for written confirmation.'};
 }
 function build(input){
  if(!Array.isArray(input)||input.length<1||input.length>3)throw new Error('Choose one, two or three quotes for this pack.');
  return {generatedAt:new Date().toISOString(),quotes:input.map((q,i)=>{
   q=q&&typeof q==='object'?q:{};
   const name=String(q.installer||q.fileName||'Quote '+(i+1)).slice(0,240);
   const evidence=designFields.map(([key,label])=>({label,value:absent(q[key])?'Not stated':String(q[key])+((typeof q[key]==='number'&&key==='heatLossKw')?' kW':(typeof q[key]==='number'&&/TemperatureC|OutdoorC/.test(key))?' °C':''),missing:absent(q[key])||/not provided|not found|not evidenced|unknown/i.test(String(q[key]))}));
   const scopeItems=scopeFields.map(([key,label])=>scope(q,key,label));
   const questions=evidence.filter(x=>x.missing).map(x=>'Please provide or confirm '+x.label.toLowerCase()+' and the supporting design information.');
   scopeItems.filter(x=>x.status!=='Confirmed').forEach(x=>questions.push('Please confirm '+x.label.toLowerCase()+': what is included in the quoted total, what is excluded or provisional, and how any extra cost will be agreed?'));
   questions.push('Please confirm the final price, all exclusions and provisional sums, payment stages and cancellation terms in writing.');
   return {name,price:Number(q.price)>0?'£'+Number(q.price).toLocaleString('en-GB'):'Not stated',model:absent(q.model)?'Not stated':String(q.model),scope:scopeItems,evidence,questions};
  })};
 }
 function markup(r){
  const row=(label,values)=>'<tr><th scope="row">'+esc(label)+'</th>'+values.map(v=>'<td>'+v+'</td>').join('')+'</tr>';
  return '<p>Scope labels describe the supplied extracted information, not independent verification of the installation. Check the original documents and ask for written confirmation.</p><div style="overflow-x:auto" tabindex="0" role="region" aria-label="Quote comparison"><table style="width:100%;border-collapse:collapse;min-width:480px"><caption>Side-by-side quote comparison</caption><thead><tr><th scope="col">Item</th>'+r.quotes.map(q=>'<th scope="col">'+esc(q.name)+'</th>').join('')+'</tr></thead><tbody>'+row('Stated price',r.quotes.map(q=>esc(q.price)))+row('Heat-pump model',r.quotes.map(q=>esc(q.model)))+scopeFields.map(([key,label])=>row(label,r.quotes.map(q=>{const s=q.scope.find(x=>x.key===key);return '<strong>'+esc(s.status)+'</strong><br><small>'+esc(s.evidence)+'</small>'}))).join('')+'</tbody></table></div><p><b>Confirmed</b>: explicitly stated as included or covered. <b>Assumed</b>: a detail requiring confirmation. <b>Excluded</b>: explicitly outside scope. <b>Provisional</b>: subject to an allowance or later decision. <b>Not stated</b>: missing from the extracted details.</p>'+r.quotes.map(q=>'<section><h3>'+esc(q.name)+': design evidence</h3><ul>'+q.evidence.map(x=>'<li><b>'+esc(x.label)+':</b> '+esc(x.value)+(x.missing?' — ask for supporting evidence':' — extracted statement; verify against the documents')+'</li>').join('')+'</ul><h3>Questions for '+esc(q.name)+'</h3><ol>'+q.questions.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>').join('')+'<p><b>Before committing:</b> resolve material gaps in writing and confirm the final included scope. This report does not certify design, approve an installer or guarantee performance or grant eligibility.</p>';
 }
 function lines(r){return ['# Home Quote Check Decision Pack','Generated '+r.generatedAt.slice(0,10),'Independent document comparison. Not design certification.','Scope labels concern extracted quote statements. Check the original documents.',...r.quotes.flatMap(q=>['# '+q.name,'Stated price: '+q.price,'Heat-pump model: '+q.model,'# Scope',...q.scope.map(s=>s.label+' — '+s.status+': '+s.evidence),'# Design evidence',...q.evidence.map(e=>e.label+': '+e.value),'# Questions to send your installer',...q.questions.map((x,i)=>(i+1)+'. '+x)]),'# Before committing','Resolve material gaps in writing and confirm final scope. No installer approval, design certification, grant-eligibility decision or performance guarantee is implied.'];}
 // Render locally using browser fonts, then embed page images in a small PDF container.
 // Quote content stays in the browser; there are no network requests or external libraries.
 function pdf(r){
  const pages=[];let canvas,ctx,y;
  function page(){canvas=document.createElement('canvas');canvas.width=1190;canvas.height=1684;ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1190,1684);ctx.fillStyle='#142c40';y=100;pages.push(canvas);}
  page();
  for(const raw of lines(r)){
   const heading=raw.startsWith('# '),text=heading?raw.slice(2):raw;
   ctx.font=(heading?'bold 29px':'23px')+' system-ui, sans-serif';
   let line='';const pieces=text.match(/\S+\s*/g)||[''];
   const wrapped=[];
   for(const piece of pieces){if(line&&ctx.measureText(line+piece).width>990){wrapped.push(line.trimEnd());line='';}if(ctx.measureText(piece).width<=990){line+=piece;continue}for(const ch of piece){if(ctx.measureText(line+ch).width>990&&line){wrapped.push(line.trimEnd());line='';}line+=ch;}}
   if(line)wrapped.push(line.trimEnd());
   if(y+wrapped.length*(heading?42:34)+32>1540&&wrapped.length<40){page();ctx.font=(heading?'bold 29px':'23px')+' system-ui, sans-serif';}
   if(heading)y+=18;
   for(const line of wrapped){if(y>1540){page();ctx.font=(heading?'bold 29px':'23px')+' system-ui, sans-serif';}ctx.fillText(line,100,y);y+=heading?42:34;}
   y+=14;
  }
  const encoder=new TextEncoder(),objects=[],enc=s=>encoder.encode(s);
  const join=parts=>{const n=parts.reduce((v,p)=>v+p.length,0),b=new Uint8Array(n);let i=0;for(const p of parts){b.set(p,i);i+=p.length}return b};
  objects.push(enc('<< /Type /Catalog /Pages 2 0 R >>'));
  objects.push(enc('<< /Type /Pages /Count '+pages.length+' /Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>'));
  pages.forEach((c,i)=>{const footer=c.getContext('2d');footer.font='19px system-ui, sans-serif';footer.fillStyle='#52647a';footer.fillText('Home Quote Check · Decision Pack · Page '+(i+1)+' of '+pages.length,100,1615);const id=3+i*3,binary=atob(c.toDataURL('image/jpeg',0.92).split(',')[1]),bytes=Uint8Array.from(binary,x=>x.charCodeAt(0)),stream='q 595 0 0 842 0 0 cm /P'+i+' Do Q';
   objects.push(enc('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /P'+i+' '+(id+1)+' 0 R >> >> /Contents '+(id+2)+' 0 R >>'));
   objects.push(join([enc('<< /Type /XObject /Subtype /Image /Width 1190 /Height 1684 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bytes.length+' >>\nstream\n'),bytes,enc('\nendstream')]));
   objects.push(enc('<< /Length '+enc(stream).length+' >>\nstream\n'+stream+'\nendstream'));
  });
  const parts=[enc('%PDF-1.4\n')],offsets=[0];let size=parts[0].length;
  objects.forEach((o,i)=>{offsets.push(size);const p=join([enc((i+1)+' 0 obj\n'),o,enc('\nendobj\n')]);parts.push(p);size+=p.length});
  parts.push(enc('xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.slice(1).map(x=>String(x).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+size+'\n%%EOF'));
  return join(parts);
 }
 globalThis.HqcPackModel={build,markup,lines,pdf,esc};
})();
