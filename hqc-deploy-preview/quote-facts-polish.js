(()=>{
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

  function cleanText(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){
      const value=node.nodeValue||'';
      if(!/CLAIMED_NOT_VERIFIED/i.test(value)) continue;
      node.nodeValue=value
        .replace(/CLAIMED_NOT_VERIFIED\s*[·:-]?\s*/gi,'Claimed in quote — not independently verified · ')
        .replace(/Claimed in quote — not independently verified ·\s*$/i,'Claimed in quote — not independently verified');
    }
  }

  function polish(){
    const panel=qs('.facts.panel')||qsa('.panel,.card').find(x=>/quote facts and provenance/i.test(qs('h2,h3',x)?.textContent||''));
    if(!panel) return;

    const heading=qs('h2,h3',panel);
    if(heading&&heading.textContent.trim()!=='Quote Facts') heading.textContent='Quote Facts';

    let intro=qs('[data-hqc-quote-facts-intro]',panel);
    if(!intro&&heading){
      intro=document.createElement('p');
      intro.dataset.hqcQuoteFactsIntro='1';
      intro.textContent='Key details extracted from this quote. Values may be estimates where not explicitly stated.';
      intro.style.cssText='margin:4px 0 14px;color:#617187;line-height:1.5';
      heading.insertAdjacentElement('afterend',intro);
    }

    cleanText(panel);
  }

  let queued=false;
  const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;polish();});};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  tick();
})();
