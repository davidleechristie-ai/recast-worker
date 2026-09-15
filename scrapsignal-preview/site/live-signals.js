(()=>{
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const badge=(type)=>String(type||'signal').replaceAll('_',' ');
  const render=(signal)=>`<article class="signal-card live-signal" data-live-signal="${esc(signal.id)}">
    <div class="signal-top"><div><div class="badges"><span class="badge high">${esc(badge(signal.event_type))}</span><span class="badge new">Source-backed</span></div><h3>${esc(signal.operator)}</h3><p class="location">${esc(signal.location)}</p></div><div class="score">${esc(signal.score)}<span>/100</span></div></div>
    <p class="reason"><strong>Why now:</strong> ${esc(signal.why_now)}</p>
    <div class="likely"><strong>Supplier categories</strong><div class="tags">${(signal.supplier_categories||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
    <p class="reason"><strong>Confidence:</strong> ${esc(signal.confidence)} · ${esc(signal.source_name)}</p>
    <div class="signal-actions"><a class="btn btn-small" href="${esc(signal.evidence_url)}" target="_blank" rel="noopener">Open evidence ↗</a><a class="btn btn-small" href="/signals/new-waste-sites-september-2026">Research note</a></div>
  </article>`;
  const mount=async()=>{
    const stats=document.querySelector('#view-dashboard .stats');
    if(!stats||document.querySelector('[data-live-feed]'))return;
    try{
      const response=await fetch('/signals.json',{cache:'no-store'});if(!response.ok)return;
      const payload=await response.json();const signals=payload.signals||[];if(!signals.length)return;
      const section=document.createElement('section');section.className='live-intel-section';section.dataset.liveFeed='true';
      section.innerHTML=`<div class="section-head"><div><p class="eyebrow">LIVE VALIDATION FEED</p><h2>Genuine detected register changes</h2><p>These records come from accepted stable Environment Agency register changes. Commercial interpretation is clearly separated from source facts.</p></div><a class="btn" href="/proof">View validation evidence</a></div><div class="signal-list">${signals.map(render).join('')}</div>`;
      stats.insertAdjacentElement('afterend',section);
      document.querySelectorAll('[data-live-signal] a').forEach(a=>a.addEventListener('click',()=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:'signal_open',path:location.pathname,meta:{signal:a.closest('[data-live-signal]')?.dataset.liveSignal||'',source:'live_validation_feed'},ts:new Date().toISOString()}),keepalive:true}).catch(()=>{})));
    }catch(_){/* Keep the demo usable if the feed is unavailable. */}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
