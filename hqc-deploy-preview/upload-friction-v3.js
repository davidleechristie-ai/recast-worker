(()=>{
  const VERSION='upload-friction-v3';
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const cardFor=el=>el?.closest?.('.card')||qsa('.card').find(c=>/add your quotes/i.test(text(qs('h1,h2',c))))||document;
  const scoreInput=(input,card)=>{
    let score=0;
    if(card!==document&&card.contains(input))score+=20;
    const accept=(input.getAttribute('accept')||'').toLowerCase();
    if(/image|pdf|png|jpe?g|webp/.test(accept))score+=8;
    if(!input.disabled)score+=4;
    return score;
  };
  const bestFileInput=card=>qsa('input[type="file"]').filter(i=>!i.disabled).sort((a,b)=>scoreInput(b,card)-scoreInput(a,card))[0]||null;
  const nativeUploadControl=card=>qsa('button,a,[role="button"]',card).find(n=>!/^hqc-/.test(n.id||'')&&/(upload|add (a )?quote|choose (a )?file|browse|select (a )?(file|photo|image))/i.test(text(n)))||null;
  const nativeManualControl=card=>qsa('button,a,[role="button"]',card).find(n=>!/^hqc-/.test(n.id||'')&&/(enter|add|type).*(manual|figure)|manual.*(entry|figure)/i.test(text(n)))||null;
  function status(help,message){
    let s=qs('#hqc-upload-v3-status',help);
    if(!s){s=document.createElement('div');s.id='hqc-upload-v3-status';s.setAttribute('role','status');s.style.cssText='margin-top:9px;font-size:12px;font-weight:700;color:#07503b';help.appendChild(s);}
    s.textContent=message;
  }
  function wire(){
    const choose=qs('#hqc-choose-file'),help=qs('#hqc-upload-help');
    if(!choose||!help||choose.dataset.hqcV3==='1')return;
    choose.dataset.hqcV3='1';help.dataset.hqcUploadVersion=VERSION;
    const card=cardFor(choose);
    choose.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopImmediatePropagation();
      const input=bestFileInput(card);
      if(input){
        if(input.dataset.hqcV3Change!=='1'){
          input.dataset.hqcV3Change='1';
          input.addEventListener('change',()=>{if(input.files?.length)status(help,'File selected. Continue with the existing check/analyse action below.');});
        }
        input.click();
        return;
      }
      const native=nativeUploadControl(card);
      if(native){native.click();return;}
      status(help,'Upload control could not be opened. Use “Enter figures manually” below.');
    },true);
    const manual=qs('#hqc-enter-manual');
    if(manual&&manual.dataset.hqcV3!=='1'){
      manual.dataset.hqcV3='1';
      manual.addEventListener('click',ev=>{
        const native=nativeManualControl(card);
        if(!native)return;
        ev.preventDefault();ev.stopImmediatePropagation();native.click();
      },true);
    }
  }
  let queued=false;const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;wire();});};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});
  tick();
})();
