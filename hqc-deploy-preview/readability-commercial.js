(()=>{
  const STYLE_ID='hqc-readability-commercial-style';
  const css=`
  :root{--hqc-text:#172b35;--hqc-muted:#526873;--hqc-green:#087a58;--hqc-soft:#f5faf7}
  body{color:var(--hqc-text)!important;font-size:16px!important;line-height:1.55!important;-webkit-font-smoothing:antialiased}
  main p,main li,main label,main button,main a{font-size:max(16px,1rem);line-height:1.55}
  main h1{font-size:clamp(32px,4vw,48px)!important;line-height:1.08!important;letter-spacing:-.025em}
  main h2{font-size:clamp(24px,2.4vw,30px)!important;line-height:1.2!important;letter-spacing:-.015em;margin-bottom:10px!important}
  main h3{font-size:20px!important;line-height:1.3!important}
  main small,.muted,.subtle,[class*="muted"],[class*="caption"],[class*="helper"]{font-size:14px!important;line-height:1.5!important;color:var(--hqc-muted)!important}
  main .panel,main .card{font-size:16px}
  main button,main [role="button"],main a[class*="button"],main a[class*="btn"]{min-height:48px;font-weight:700!important;font-size:16px!important}
  [data-hqc-plain-summary]{margin:0 0 18px;padding:18px 20px;border:1px solid #cfe4da;border-radius:14px;background:var(--hqc-soft);color:var(--hqc-text);font-size:18px!important;line-height:1.45!important;font-weight:650}
  [data-hqc-plain-summary] strong{display:block;font-size:21px;line-height:1.3;margin-bottom:5px}
  [data-hqc-readability-note]{font-size:16px!important;line-height:1.5!important;color:var(--hqc-text)!important}
  @media(max-width:720px){body{font-size:17px!important}main p,main li,main label{font-size:17px!important}main .panel,main .card{padding:18px!important}main h2{font-size:25px!important}}
  `;
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}
  const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
  function findHeading(re){return [...document.querySelectorAll('h1,h2,h3,h4')].find(e=>re.test(txt(e)))}
  function panelFor(h){return h?.closest('.panel,.card,section,article')||h?.parentElement}
  function addDecisionSummary(){
    const h=findHeading(/what to do next/i);if(!h)return;const p=panelFor(h);if(!p||p.querySelector('[data-hqc-plain-summary]'))return;
    const all=txt(p);let title='Check the missing details before you commit.';let body='Resolve the important gaps with the installer in writing before paying a deposit.';
    if(/important information is still missing/i.test(all)){title='Don’t pay a deposit yet.';body='Important information is missing. Ask the installer to confirm the missing details in writing first.'}
    const box=document.createElement('div');box.dataset.hqcPlainSummary='1';box.innerHTML=`<strong>${title}</strong>${body}`;h.insertAdjacentElement('afterend',box);
  }
  function simplifyEvidence(){
    const h=findHeading(/quote evidence completeness/i);if(!h)return;const p=panelFor(h);if(!p)return;
    const score=txt(p).match(/\b(\d+)\s*\/\s*(10)\b/);if(score&&!p.querySelector('[data-hqc-readability-note]')){const note=document.createElement('p');note.dataset.hqcReadabilityNote='1';note.textContent=`${score[1]} of 10 important quote details are documented. Check the missing items below before you decide.`;h.insertAdjacentElement('afterend',note)}
    [...p.querySelectorAll('*')].forEach(e=>{if(/^documented$/i.test(txt(e))){e.textContent='important details provided';e.style.fontSize='14px'}});
  }
  function clarifyQuestions(){
    const h=findHeading(/questions to ask installers/i);if(!h)return;const p=panelFor(h);if(!p)return;
    const intro=[...p.querySelectorAll('p')].find(e=>/next action|ask|installer/i.test(txt(e)));
    if(intro){intro.textContent='Send these questions before you accept the quote.';intro.style.fontSize='17px';intro.style.fontWeight='650'}
    [...p.querySelectorAll('button,a')].forEach(e=>{if(/copy questions/i.test(txt(e))&&!/installer/i.test(txt(e)))e.textContent='Copy questions for my installer →'});
  }
  function clarifyFacts(){
    const h=findHeading(/^quote facts$/i);if(!h)return;const p=panelFor(h);if(!p)return;
    const intro=p.querySelector('[data-hqc-quote-facts-intro]');if(intro){intro.textContent='The important numbers and claims found in your quote. Anything unclear is flagged for you to check.';intro.style.fontSize='16px';intro.style.color='#526873'}
  }
  function run(){style();addDecisionSummary();simplifyEvidence();clarifyQuestions();clarifyFacts()}
  let queued=false;const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})};
  new MutationObserver(tick).observe(document.documentElement,{subtree:true,childList:true});run();
})();
