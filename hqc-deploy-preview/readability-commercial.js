(()=>{
  const STYLE_ID='hqc-readability-commercial-style';
  const css=`
  :root{--hqc-text:#172b35;--hqc-muted:#526873;--hqc-green:#087a58;--hqc-soft:#f5faf7}
  body{color:var(--hqc-text)!important;font-size:16px!important;line-height:1.55!important;-webkit-font-smoothing:antialiased;background:#f4f7f6!important} main{max-width:1180px;margin:0 auto;background:#fff;min-height:calc(100vh - 64px)}
  main p,main li,main label,main button,main a{font-size:max(16px,1rem);line-height:1.55}
  main h1{font-size:clamp(32px,4vw,48px)!important;line-height:1.08!important;letter-spacing:-.025em}
  main h2{font-size:clamp(24px,2.4vw,30px)!important;line-height:1.2!important;letter-spacing:-.015em;margin-bottom:10px!important}
  main h3{font-size:20px!important;line-height:1.3!important}
  main small,.muted,.subtle,[class*="muted"],[class*="caption"],[class*="helper"]{font-size:14px!important;line-height:1.5!important;color:var(--hqc-muted)!important}
  main .panel,main .card{font-size:16px;border-radius:14px!important;border-color:#dfe9e5!important;box-shadow:0 6px 22px rgba(17,54,45,.045)!important} main button{transition:transform .12s ease,box-shadow .12s ease,opacity .12s ease} main button:hover{transform:translateY(-1px)} main button:active{transform:translateY(0)}
  main button,main [role="button"],main a[class*="button"],main a[class*="btn"]{min-height:48px;font-weight:700!important;font-size:16px!important}
  [data-hqc-plain-summary]{margin:0 0 18px;padding:18px 20px;border:1px solid #cfe4da;border-radius:14px;background:var(--hqc-soft);color:var(--hqc-text);font-size:18px!important;line-height:1.45!important;font-weight:650}
  [data-hqc-plain-summary] strong{display:block;font-size:21px;line-height:1.3;margin-bottom:5px}
  [data-hqc-readability-note]{font-size:16px!important;line-height:1.5!important;color:var(--hqc-text)!important}
  @media(max-width:720px){body{font-size:17px!important;background:#fff!important}main p,main li,main label{font-size:17px!important}main .panel,main .card{padding:17px!important;border-radius:12px!important;box-shadow:none!important}main h2{font-size:25px!important}#hqc-simple-summary>div[style*="grid-template-columns:repeat(3"]{grid-template-columns:1fr!important}}

  /* Align result and comparison screens with the approved HQC editorial homepage. */
  :root{--hqc-text:#203336;--hqc-muted:#536760;--hqc-green:#204b3d;--hqc-soft:#faf9f5}
  body:not([data-hqc-home="clean"]){background:#faf9f5!important;color:#203336!important}
  body:not([data-hqc-home="clean"]) main{background:#faf9f5!important}
  body:not([data-hqc-home="clean"]) main h1,body:not([data-hqc-home="clean"]) main h2,body:not([data-hqc-home="clean"]) main h3{font-family:Georgia,'Times New Roman',serif!important;letter-spacing:-.035em!important;color:#203336!important}
  body:not([data-hqc-home="clean"]) main h1{font-size:clamp(34px,8.7vw,60px)!important;line-height:1.07!important}
  body:not([data-hqc-home="clean"]) main h2{font-size:clamp(26px,6.4vw,36px)!important}
  body:not([data-hqc-home="clean"]) .panel,body:not([data-hqc-home="clean"]) .card{background:#fff!important;border:1px solid #c2cec5!important;border-radius:3px!important;box-shadow:none!important}
  body:not([data-hqc-home="clean"]) main button,body:not([data-hqc-home="clean"]) main a[class*="button"]{border-radius:3px!important;box-shadow:none!important;transform:none!important}
  body:not([data-hqc-home="clean"]) main button.primary,body:not([data-hqc-home="clean"]) main button[data-next],body:not([data-hqc-home="clean"]) main button[type="submit"]{background:#204b3d!important;color:#fff!important}
  body:not([data-hqc-home="clean"]) [data-hqc-plain-summary]{background:#e9eee7!important;border-radius:0!important;border-color:#c2cec5!important}
  #hqc-simple-summary{background:#e9eee7!important;background-image:none!important;border:1px solid #c2cec5!important;border-top:3px solid #204b3d!important;border-radius:0!important;color:#203336!important;box-shadow:none!important}
  #hqc-simple-summary h2{font-family:Georgia,'Times New Roman',serif!important;color:#203336!important;letter-spacing:-.035em!important}
  #hqc-simple-summary p{color:#536760!important}
  #hqc-simple-summary button{background:#204b3d!important;color:#fff!important;border-radius:3px!important;box-shadow:none!important}
  #hqc-revenue-next-step,#hqc-next-step{border-radius:0!important;box-shadow:none!important;background:#f5f6f1!important;color:#203336!important}
  body:not([data-hqc-home="clean"]) header{background:#faf9f5!important;border-bottom:1px solid #c2cec5!important}
  body:not([data-hqc-home="clean"]) header button{border-radius:3px!important}
  @media(max-width:759px){
    body:not([data-hqc-home="clean"]) main{padding-bottom:calc(18px + env(safe-area-inset-bottom))}
    body:not([data-hqc-home="clean"]) main .panel,body:not([data-hqc-home="clean"]) main .card{padding:18px!important}
    #hqc-simple-summary{padding:22px 19px!important}
    #hqc-simple-summary button{width:100%;min-height:52px}
  }
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
