(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const track=(meta={})=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:'dashboard_demo_interaction',path:location.pathname,meta:{action:'validated_signal_open',...meta},ts:new Date().toISOString()}),keepalive:true}).catch(()=>{});
async function init(){
  const anchor=document.querySelector('#opportunities');
  if(!anchor)return;
  try{
    const response=await fetch('/signals.json',{cache:'no-store'});
    if(!response.ok)throw new Error('feed unavailable');
    const feed=await response.json();
    const section=document.createElement('section');
    section.className='card';section.id='validated-signals';
    const cards=(feed.signals||[]).map(s=>`<article style="padding:16px;border:1px solid #dce5e1;border-radius:12px;background:#fff"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><span class="badge new">VALIDATED · ${esc(s.event)}</span><h3 style="margin:9px 0 3px">${esc(s.name)}</h3><div class="sub">${esc(s.address)}</div></div><div class="priority p90">${esc(s.score)}</div></div><div style="margin-top:13px;font-size:12px"><b>What we know</b><p style="margin:4px 0 10px;color:#526071">${esc(s.fact)}</p><b>Why a supplier may care</b><p style="margin:4px 0 10px;color:#526071">${esc(s.why)}</p><div>${(s.needs||[]).map(n=>`<span class="need">${esc(n)}</span>`).join('')}</div><p style="margin:12px 0 0"><b>Suggested opener:</b> ${esc(s.opener)}</p><p style="margin:10px 0 0"><a class="button small live-evidence" data-id="${esc(s.id)}" href="${esc(s.source_url)}" target="_blank" rel="noopener">View authoritative source ↗</a></p></div></article>`).join('');
    section.innerHTML=`<div class="cardhead"><div><h2>Validated signals from the monitored register</h2><p>These are real detected register changes, not demo organisations. Commercial requirements are clearly shown as ScrapSignal assessment rather than fact.</p></div><span class="activepill">${feed.signal_count||0} validated</span></div><div style="padding:18px 20px"><div class="notice" style="margin-top:0"><strong>Quality gate active.</strong> ${esc(feed.quality_note||'Only source-quality-approved changes are shown.')}</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">${cards||'<div class="empty">No validated signals currently available.</div>'}</div></div>`;
    anchor.parentNode.insertBefore(section,anchor);
    section.querySelectorAll('.live-evidence').forEach(a=>a.addEventListener('click',()=>track({id:a.dataset.id})));
  }catch(err){console.warn('Validated feed unavailable',err)}
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
