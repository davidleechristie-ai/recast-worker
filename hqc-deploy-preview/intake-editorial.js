/* Presentation-only bridge for legacy upload journey. No DOM controls or handlers changed. */
(()=>{
 const id='hqc-intake-editorial-style';
 const css=`
 body:has(#hqc-journey-progress):not([data-hqc-home="clean"]){background:#faf9f5!important;color:#203336!important}
 body:has(#hqc-journey-progress) header{background:#faf9f5!important;border-bottom:1px solid #c2cec5!important;padding-bottom:12px!important}
 body:has(#hqc-journey-progress) header button{background:#204b3d!important;color:#fff!important;border-radius:3px!important;box-shadow:none!important}
 body:has(#hqc-journey-progress) main{background:#faf9f5!important}
 body:has(#hqc-journey-progress) main h1,body:has(#hqc-journey-progress) main h2{font-family:Georgia,'Times New Roman',serif!important;font-weight:700!important;letter-spacing:-.04em!important;color:#203336!important;line-height:1.1!important}
 body:has(#hqc-journey-progress) main .card,body:has(#hqc-journey-progress) main .panel{background:#fff!important;border:1px solid #c2cec5!important;border-radius:3px!important;box-shadow:none!important}
 #hqc-journey-progress{background:transparent!important;border:0!important;box-shadow:none!important;gap:6px!important}
 #hqc-journey-progress [data-step]{color:#536760!important;font-family:Arial,Helvetica,sans-serif!important}
 #hqc-journey-progress [data-step] i{border-radius:2px!important;box-shadow:none!important;background:#e7ede7!important;color:#536760!important;border:1px solid #c2cec5!important}
 #hqc-journey-progress [data-step][aria-current="step"] i,#hqc-journey-progress [data-step].active i{background:#204b3d!important;color:#fff!important;border-color:#204b3d!important}
 #hqc-upload-help{background:#fff!important;border-radius:0!important;box-shadow:none!important}
 #hqc-upload-help [style*="dashed"],body:has(#hqc-journey-progress) [class*="dropzone"],body:has(#hqc-journey-progress) [class*="dropZone"]{border:1px solid #9aafa4!important;border-radius:3px!important;background:#f7f8f4!important;box-shadow:none!important}
 #hqc-choose-file{background:#204b3d!important;color:#fff!important;border:0!important;border-radius:3px!important;box-shadow:none!important;min-height:52px!important}
 body:has(#hqc-journey-progress) main button{border-radius:3px!important;box-shadow:none!important}
 body:has(#hqc-journey-progress) main p{color:#536760}
 body:has(#hqc-journey-progress) #hqc-mobile-sticky-cta{display:none!important}\n body:has(#hqc-journey-progress) [style*="border: 3px dashed"],body:has(#hqc-journey-progress) [style*="border:3px dashed"],body:has(#hqc-journey-progress) [style*="border: 2px dashed"]{border:1px solid #9aafa4!important;border-radius:3px!important;background:#f7f8f4!important}\n body:has(#hqc-journey-progress) button:focus-visible,body:has(#hqc-journey-progress) input:focus-visible{outline:3px solid #b48b44!important;outline-offset:3px!important}
 @media(max-width:759px){
 body:has(#hqc-journey-progress) main{padding-bottom:calc(24px + env(safe-area-inset-bottom))!important}
 body:has(#hqc-journey-progress) main .card,body:has(#hqc-journey-progress) main .panel{padding:18px!important}
 body:has(#hqc-journey-progress) main h1{font-size:clamp(32px,9vw,45px)!important}
 #hqc-journey-progress{padding:12px 0!important}
 }
 `;
 function mount(){if(document.getElementById(id))return;const s=document.createElement('style');s.id=id;s.textContent=css;document.head.appendChild(s);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
