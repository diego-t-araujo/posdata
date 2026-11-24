{
const D=JSON.parse(document.getElementById('data').textContent);
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const lab=d=>MES[+d.slice(5)-1]+'-'+d.slice(2,4);
const nf=(v,dec=0)=>v==null?'–':v.toLocaleString('es-AR',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const NS='http://www.w3.org/2000/svg';
function nice(lo,hi,n){const st=(hi-lo)/n,p=10**Math.floor(Math.log10(st)),m=[1,2,2.5,5,10].find(k=>k*p>=st)*p;const out=[];for(let v=Math.ceil(lo/m)*m;v<=hi+1e-9;v+=m)out.push(+v.toFixed(6));return out}
function chart(id,o){
  const box=document.getElementById(id),s=box.querySelector('svg'),tip=box.querySelector('.tip');
  let st={};const vis=()=>o.series.filter(se=>!se.off);
  const draw=()=>{
    const W=s.clientWidth,H=s.clientHeight;if(!W)return;
    const narrow=W<520,ends=!narrow&&o.ends!==false;
    const m={l:narrow?44:58,r:ends?(o.endW||150):12,t:12,b:28};
    const iEnd=o.to?o.to():o.dates.length-1;const idx=o.dates.map((d,i)=>i).filter(i=>i>=o.from()&&i<=iEnd&&o.keep(i));
    const vals=vis().flatMap(se=>idx.map(i=>se.v[i]).filter(v=>v!=null));
    let lo=Math.min(...vals,o.ref??Infinity),hi=Math.max(...vals,o.ref??-Infinity);const pad=(hi-lo)*.08;lo-=pad;hi+=pad;
    let ty=nice(lo,hi,narrow?4:5);if(ty.length<4)ty=nice(lo,hi,narrow?5:8);lo=Math.min(lo,ty[0]);hi=Math.max(hi,ty[ty.length-1]);
    const i0=o.from(),i1=Math.max(iEnd,i0+1);
    const X=i=>m.l+(i-i0)/(i1-i0)*(W-m.l-m.r),Y=v=>m.t+(hi-v)/(hi-lo)*(H-m.t-m.b);
    let g='';
    ty.forEach(v=>{g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${css('--rule')}"/><text x="${m.l-8}" y="${Y(v)+4}" text-anchor="end" font-size="12" fill="${css('--mute')}">${o.fy(v)}</text>`});
    if(o.shade&&lo<o.shade.at){const t=Math.min(o.shade.at,hi);g+=`<rect x="${m.l}" y="${Y(t)}" width="${W-m.l-m.r}" height="${Y(lo)-Y(t)}" fill="${css('--neg')}" fill-opacity=".1"/><text x="${W-m.r-8}" y="${Y(lo)-8}" text-anchor="end" font-size="12" fill="${css('--neg')}">${o.shade.label}</text>`}
    if(o.ref!=null)g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="${css('--ink2')}" stroke-dasharray="3 3"/>`;
    const span=(i1-i0)/12,stepY=span>6?(narrow?3:2):1;
    const short=span<=2.5,mstep=span<=1.2?(narrow?3:2):(narrow?6:3);
    o.dates.forEach((d,i)=>{if(i<i0||i>i1)return;const mo=+d.slice(5),y=+d.slice(0,4);let t;
      if(short){if((mo-1)%mstep)return;t=mo==1?String(y):lab(d)}else{if(mo!==1||y%stepY)return;t=String(y)}
      g+=`<line x1="${X(i)}" x2="${X(i)}" y1="${H-m.b}" y2="${H-m.b+4}" stroke="${css('--mute')}"/><text x="${X(i)}" y="${H-8}" text-anchor="middle" font-size="12" fill="${css('--mute')}">${t}</text>`});
    const endsY=[];
    vis().forEach(se=>{const pts=idx.filter(i=>se.v[i]!=null).map(i=>[X(i),Y(se.v[i])]);if(!pts.length)return;
      const dstr='M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L');
      g+=`<path ${se.dash?`stroke-dasharray="${se.dash}"`:'class="line" pathLength="1000" style="--len:1000"'} d="${dstr}" fill="none" stroke="${css(se.c)}" stroke-width="${se.w||2}" stroke-linejoin="round" stroke-linecap="round"/>`;
      const last=pts[pts.length-1];endsY.push({y:last[1],x:last[0],se,v:se.v[idx[idx.length-1]],i:idx[idx.length-1]})});
    if(ends){endsY.sort((a,b)=>a.y-b.y);for(let k=1;k<endsY.length;k++)if(endsY[k].y-endsY[k-1].y<17)endsY[k].y=endsY[k-1].y+17;
      endsY.forEach(e=>{g+=`<circle cx="${e.x}" cy="${Y(e.v)}" r="4" fill="${css(e.se.c)}" stroke="${css('--bg')}" stroke-width="2"/><text x="${e.x+10}" y="${e.y+4}" font-size="13" fill="${css('--ink')}"><tspan font-weight="600">${o.fv(e.v)}</tspan> <tspan fill="${css('--ink2')}">${e.se.s||e.se.n}</tspan>${e.se.ia&&e.se.ia[e.i]!=null?`<tspan fill="${css('--ink2')}"> · </tspan><tspan font-weight="600" fill="${css(e.se.ia[e.i]<0?'--neg':'--ink')}">${e.se.ia[e.i]>0?'+':''}${nf(e.se.ia[e.i],1)}% i.a.</tspan>`:''}</text>`})}
    g+=`<g id="${id}h"></g><rect x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}" fill="transparent"/>`;
    s.innerHTML=g;st={X,Y,idx,m,H,W};
  };
  const move=ev=>{const r=s.getBoundingClientRect(),x=ev.clientX-r.left;const {X,Y,idx,m,H,W}=st;if(!idx)return;
    let best=idx[0];idx.forEach(i=>{if(Math.abs(X(i)-x)<Math.abs(X(best)-x))best=i});
    if(x<m.l-10||x>W-m.r+10){hide();return}
    const h=s.querySelector('#'+o.idh);let g=`<line x1="${X(best)}" x2="${X(best)}" y1="${m.t}" y2="${H-m.b}" stroke="${css('--ink2')}"/>`;
    vis().forEach(se=>{const v=se.v[best];if(v!=null)g+=`<circle cx="${X(best)}" cy="${Y(v)}" r="4.5" fill="${css(se.c)}" stroke="${css('--bg')}" stroke-width="2"/>`});
    h.innerHTML=g;
    tip.innerHTML=`<b>${lab(o.dates[best])}</b>`+vis().map(se=>`<div><span style="background:${css(se.c)}"></span>${se.n}: ${o.fv(se.v[best])}</div>`).join('')+(o.extra?o.extra(best):'');
    tip.style.display='block';const tw=tip.offsetWidth;let left=X(best)+14;if(left+tw>W)left=X(best)-tw-14;tip.style.left=Math.max(0,left)+'px';tip.style.top=m.t+'px'};
  const hide=()=>{tip.style.display='none';const h=s.querySelector('#'+o.idh);if(h)h.innerHTML=''};
  o.idh=id+'h';s.addEventListener('pointermove',move);s.addEventListener('pointerleave',hide);
  const ro=new ResizeObserver(draw);ro.observe(s);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  return draw;
}
const cls=v=>v<0?' class="neg"':'';
const sw=se=>se.dash?`background:repeating-linear-gradient(90deg,var(${se.c}) 0 ${se.dash.split(' ')[0]}px,transparent 0 ${(+se.dash.split(' ')[0])+(+se.dash.split(' ')[1])}px)`:`background:var(${se.c})`;
const legend=(id,ser)=>document.getElementById(id).innerHTML=ser.map(se=>`<span><i style="${sw(se)}"></i>${se.n}</span>`).join('');
const E=D.emp,R=D.rem;
/* segmentador reutilizable */
function slicer(host,dates,min,onChange){
  const el=document.getElementById(host),N=dates.length-1,span=N-min;
  const pres=[[12,'12 meses'],[36,'3 años'],[60,'5 años'],[0,'Todo']].filter(p=>p[0]===0||p[0]<span);
  el.className='slicer';
  el.innerHTML=`<div class="top"><div class="rng"><span></span> a <span></span></div><div class="seg sm" role="group" aria-label="Períodos rápidos">${pres.map(p=>`<button data-m="${p[0]}">${p[1]}</button>`).join('')}</div></div>
  <div class="dual"><div class="trk"><div class="fl"></div></div><input type="range" aria-label="Inicio del período"><input type="range" aria-label="Fin del período"></div>`;
  const [A,B]=el.querySelectorAll('input'),fill=el.querySelector('.fl'),[lA,lB]=el.querySelectorAll('.rng span'),bt=[...el.querySelectorAll('button')];
  [A,B].forEach(x=>{x.min=min;x.max=N;x.step=1});A.value=Math.max(min,N-35);B.value=N;
  const upd=src=>{let a=+A.value,b=+B.value;if(b-a<6){if(src===A)a=Math.max(min,b-6);else b=Math.min(N,a+6);A.value=a;B.value=b}
    const p=v=>(v-min)/span*100;fill.style.left=p(a)+'%';fill.style.width=(p(b)-p(a))+'%';
    lA.textContent=lab(dates[a]);lB.textContent=lab(dates[b]);A.setAttribute('aria-valuetext',lab(dates[a]));B.setAttribute('aria-valuetext',lab(dates[b]));
    const cur=b===N?(a===min?0:N-a+1):-1;bt.forEach(x=>x.setAttribute('aria-pressed',+x.dataset.m===cur));onChange(a,b)};
  A.oninput=()=>upd(A);B.oninput=()=>upd(B);
  bt.forEach(x=>x.onclick=()=>{const m=+x.dataset.m;B.value=N;A.value=m?Math.max(min,N-m+1):min;upd()});
  return upd;
}
/* ilustración de cabecera */
{const sv=document.querySelector('.hero svg');
 const pts=R.d.map((d,i)=>({d,i,v:R.med[i],p:R.prom[i]})).filter(o=>!isSacH(o.i)&&o.d>='2017-08');
 function isSacH(i){return /-(06|12)$/.test(R.d[i])}
 const draw=()=>{const W=sv.clientWidth,H=sv.clientHeight;if(!W)return;const narrow=W<420;
   const m={l:4,r:narrow?70:96,t:28,b:22};const all=pts.flatMap(o=>[o.v,o.p]);
   const lo=Math.min(...all)*0.9,hi=Math.max(...all)*1.04;
   const X=k=>m.l+k/(pts.length-1)*(W-m.l-m.r),Y=v=>m.t+(hi-v)/(hi-lo)*(H-m.t-m.b);
   const path=key=>'M'+pts.map((o,k)=>X(k).toFixed(1)+','+Y(o[key]).toFixed(1)).join('L');
   let g='';
   [0.25,0.5,0.75].forEach(f=>{const y=m.t+f*(H-m.t-m.b);g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}" stroke="#2A5A68" stroke-dasharray="2 5"/>`});
   g+=`<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F66C89" stop-opacity=".28"/><stop offset="1" stop-color="#F66C89" stop-opacity="0"/></linearGradient></defs>`;
   g+=`<path d="${path('p')}" fill="none" stroke="#C9D3DC" stroke-opacity=".45" stroke-width="1.5"/>`;
   g+=`<path d="${path('v')}L${X(pts.length-1)},${H-m.b}L${X(0)},${H-m.b}Z" fill="url(#hg)"/>`;
   g+=`<path d="${path('v')}" fill="none" stroke="#F66C89" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
   const f=pts[0],l=pts[pts.length-1],ch=(l.v/f.v-1)*100;
   g+=`<circle cx="${X(0)}" cy="${Y(f.v)}" r="4" fill="#013440" stroke="#F66C89" stroke-width="2"/>`;
   g+=`<circle cx="${X(pts.length-1)}" cy="${Y(l.v)}" r="6" fill="#F66C89"/>`;
   g+=`<text x="${X(pts.length-1)+12}" y="${Y(l.v)+2}" font-family="IBM Plex Mono,monospace" font-size="${narrow?20:26}" fill="#F66C89">${(ch>0?'+':'')+nf(ch,0).replace('-','−')}%</text>`;
   g+=`<text x="${X(pts.length-1)+12}" y="${Y(l.v)+20}" font-family="IBM Plex Mono,monospace" font-size="11" fill="#C9D3DC">desde ${lab(f.d)}</text>`;
   g+=`<text x="${X(pts.length-1)+12}" y="${Y(l.p)+4}" font-family="IBM Plex Mono,monospace" font-size="11" fill="#9FB0C0">promedio</text>`;
   g+=`<text x="${m.l}" y="${H-4}" font-family="IBM Plex Mono,monospace" font-size="11" fill="#9FB0C0">${f.d.slice(0,4)}</text><text x="${W-m.r}" y="${H-4}" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="11" fill="#9FB0C0">${l.d.slice(0,4)}</text>`;
   sv.innerHTML=g};
 new ResizeObserver(draw).observe(sv);}
/* empleo */
const serE=[{n:'Total registrado',s:'Total',c:'--ink',v:E.total.map(v=>+(v/E.total[E.d.indexOf('2023-11')]*100).toFixed(2)),w:2.75},{n:'Asalariados privados',s:'Privados',c:'--s1',v:E.priv_i},{n:'Asalariados públicos',s:'Públicos',c:'--s2',v:E.pub_i,off:true,dash:'7 4'},{n:'Casas particulares',s:'Casas part.',c:'--s3',v:E.casas_i,off:true,dash:'2 4',w:2.5},{n:'Monotributo',s:'Monotributo',c:'--s4',v:E.mono_i},{n:'Autónomos',s:'Autónomos',c:'--s5',v:E.auto_i,off:true,dash:'10 4'}];
const keyE=['total','priv','pub','casas','mono','auto'];
let eA=0,eB=E.d.length-1;
const drawE=chart('figE',{dates:E.d,series:serE,from:()=>eA,to:()=>eB,keep:()=>true,ref:100,fy:v=>nf(v,Number.isInteger(v)?0:1),fv:v=>nf(v,1),endW:140,
  extra:i=>`<div style="color:var(--ink2);margin-top:4px">Puestos: ${serE.filter(se=>!se.off).map((se,k)=>`${se.s} ${nf(E[keyE[serE.indexOf(se)]][i],0)} mil`).join(' · ')}</div>`});
{const box=document.getElementById('legE');
 const paint=()=>{box.innerHTML=serE.map((se,k)=>`<button class="chip" data-k="${k}" aria-pressed="${!se.off}"><i style="${sw(se)}"></i>${se.n}</button>`).join('')+`<span class="chipsep"></span><button class="chip ghost" data-all="1">Todas</button><button class="chip ghost" data-all="0">Solo total</button>`};
 paint();
 box.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;
   if(b.dataset.all!=null)serE.forEach(se=>se.off=b.dataset.all==='0'&&se!==serE[0]);
   else{const se=serE[+b.dataset.k];se.off=!se.off}
   paint();drawE()};}
slicer('slE',E.d,0,(a,b)=>{eA=a;eB=b;drawE()})();
/* flujos EIL */
{const EIL={rama:[['Total',0.0,-0.8],['Industria manufacturera',-0.1,-1.5],['Construcción',0.3,-1.3],['Comercio, restaurantes y hoteles',0.1,0.2],['Transporte, almacenamiento y comunicaciones',0.1,-2.0],['Servicios financieros y a las empresas',-0.2,-1.7],['Servicios comunales, sociales y personales',0.3,0.3]],
  tam:[['Total',0.0,-0.8],['10 a 49 trabajadores',0.1,-1.2],['50 a 199 trabajadores',0.2,0.0],['200 y más trabajadores',-0.1,-1.2]],
  agl:[['Total aglomerados',0.0,-0.8],['Gran Buenos Aires',-0.1,-0.9],['Aglomerados del interior',0.4,-0.5],['Gran La Plata',1.7,2.5],['Gran Mendoza',0.4,0.5],['Gran Rosario',0.3,0.1],['Gran Mar del Plata',0.4,0.0],['Gran Córdoba',0.2,-1.4],['Gran Santa Fe',-0.3,-1.4],['Gran Jujuy',0.1,-1.8],['Gran Tucumán',0.1,-1.9],['Gran Bahía Blanca',0.2,-2.5],['Gran Paraná',0.3,-3.6]]};
 let corte='rama',per=2;const box=document.getElementById('figF'),sub=document.getElementById('subF');
 const draw=()=>{let rows=EIL[corte].slice();const nfix=corte==='agl'?3:1;const head=rows.splice(0,nfix);rows.sort((a,b)=>b[per]-a[per]);rows=[...head,...rows];
   const M=Math.max(...rows.map(r=>Math.abs(r[per])),0.5)*1.35;
   sub.textContent=(per===2?'Septiembre de 2026 contra septiembre de 2025':'Septiembre de 2026 contra agosto de 2026')+(corte==='rama'?', por rama de actividad.':corte==='tam'?', por tamaño de empresa.':', por aglomerado.');
   box.innerHTML=rows.map((r,k)=>{const v=r[per],w=Math.abs(v)/M*50,l=v<0?50-w:50,c=v<0?'--pk':'--s2';
     const lbl=(v>0?'+':v<0?'−':'')+nf(Math.abs(v),1)+'%';
     return `<div class="nm${k<nfix?' tot':''}"${k===nfix-1&&nfix>1?' style="padding-bottom:8px"':''}>${r[0]}</div><div class="tr"><div class="z"></div>${v!==0?`<div class="br" style="left:${l}%;width:${Math.max(w,.4)}%;background:var(${c})"></div>`:''}<div class="vl" style="${v<0?`right:${100-l}%;margin-right:6px`:`left:${l+w}%;margin-left:6px`}">${lbl}</div></div>`}).join('')};
 const seg=(id,opts,def,set)=>{const el=document.getElementById(id);el.innerHTML=opts.map((o,i)=>`<button data-i="${i}" aria-pressed="${i===def}">${o[0]}</button>`).join('');
   el.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;[...el.children].forEach(x=>x.setAttribute('aria-pressed',x===b));set(opts[+b.dataset.i][1]);draw()}};
 seg('fCorte',[['Por rama','rama'],['Por tamaño','tam'],['Por aglomerado','agl']],0,v=>corte=v);
 seg('fPer',[['Último año',2],['Último mes',1]],0,v=>per=v);
 draw();}
/* salarios */
const yoy=a=>a.map((v,i)=>i<12||v==null||a[i-12]==null?null:+((v/a[i-12]-1)*100).toFixed(1));
const smvm_ia=yoy(R.smvm);
const i23r=R.d.indexOf('2023-11');
let modo='pesos',conSM=false,sac=false,rA=0,rB=R.d.length-1;const isSac=i=>/-(06|12)$/.test(R.d[i]);
const money=v=>'$'+nf(v/1000,0)+' mil';
const base=[{n:'Promedio',c:'--s2',v:R.prom,ia:R.prom_ia},{n:'Mediana',c:'--s1',v:R.med,ia:R.med_ia}],sm={n:'Salario mínimo',s:'SMVM',c:'--s4',v:R.smvm,ia:smvm_ia};
const idxv=a=>a.map(v=>+(v/a[i23r]*100).toFixed(1));
const serR=[];
const oR={dates:R.d,series:serR,from:()=>rA,to:()=>rB,keep:i=>sac||!isSac(i),endW:250,
  extra:i=>`<div style="color:var(--ink2);margin-top:4px">Var. real i.a.: mediana ${nf(R.med_ia[i],1)}% · promedio ${nf(R.prom_ia[i],1)}%${conSM?` · SMVM ${nf(smvm_ia[i],1)}%`:''}</div><div style="color:var(--ink2)">Nominal: mediana $${nf(R.med_n[i])} · promedio $${nf(R.prom_n[i])}${conSM?` · SMVM $${nf(R.smvm_n[i])} (${nf(R.smvm_n[i]/R.med_n[i]*100,0)}% de la mediana)`:''}</div>`};
const setR=()=>{serR.length=0;(conSM?[...base,sm]:base).forEach(se=>serR.push({...se,v:modo=='pesos'?se.v:idxv(se.v)}));
  if(modo=='pesos'){oR.fy=v=>'$'+nf(v/1e6,1)+'M';oR.fv=money;oR.ref=null}else{oR.fy=v=>nf(v,0);oR.fv=v=>nf(v,1);oR.ref=100}
  legend('legR',serR);
  document.getElementById('subR').textContent=modo=='pesos'?'Remuneración bruta mensual de asalariados registrados del sector privado, en pesos de agosto de 2026 (deflactada por IPC-INDEC). Serie sin junio ni diciembre, los meses con aguinaldo. Al final de cada línea, la variación real contra el mismo mes del año anterior.':'Remuneración bruta real, índice noviembre de 2023 = 100 (deflactada por IPC-INDEC). Serie sin junio ni diciembre, los meses con aguinaldo. Al final de cada línea, la variación real contra el mismo mes del año anterior.'};
setR();
const drawR=chart('figR',oR);
const bP=document.getElementById('rPesos'),bI=document.getElementById('rIdx'),smOn=document.getElementById('smOn');
bP.onclick=()=>{modo='pesos';bP.setAttribute('aria-pressed','true');bI.setAttribute('aria-pressed','false');setR();drawR()};
bI.onclick=()=>{modo='idx';bI.setAttribute('aria-pressed','true');bP.setAttribute('aria-pressed','false');setR();drawR()};
smOn.onclick=()=>{conSM=!conSM;smOn.setAttribute('aria-pressed',conSM);smOn.textContent=conSM?'Quitar salario mínimo':'Agregar salario mínimo';setR();drawR()};
slicer('slR',R.d,0,(a,b)=>{rA=a;rB=b;drawR()})();
/* cobertura de canastas */
{const HOG=[{ae:1,n:'1 adulto',d:'Un adulto equivalente: varón de 30 a 45 años.'},{ae:2.46,n:'3 personas',d:'Hogar de 3 integrantes: mujer de 35 años, su hijo de 18 y su madre de 61 (2,46 adultos equivalentes).'},{ae:3.09,n:'4 personas',d:'Hogar de 4 integrantes: varón de 35 años, mujer de 31, un hijo de 6 y una hija de 8 (3,09 adultos equivalentes).'},{ae:3.25,n:'5 personas',d:'Hogar de 5 integrantes: pareja de 30 años con tres hijos de 5, 3 y 1 año (3,25 adultos equivalentes).'}];
 let can='cbt',hog=HOG[2],neto=true,sal='med',cA=0,cB=R.d.length-1;const NETO=0.83;
 const cov=k=>R[k+'_n'].map((v,i)=>R[can][i]==null||isNaN(R[can][i])?null:(v*(neto?NETO:1))/(R[can][i]*hog.ae)*100);
 const pc=v=>nf(v,0)+'%';
 const box=document.getElementById('figC'),sv=box.querySelector('svg'),tip=box.querySelector('.tip');let st={};
 const draw=()=>{const W=sv.clientWidth,H=sv.clientHeight;if(!W)return;const narrow=W<520;
   const v=cov(sal);const idx=[];for(let i=cA;i<=cB;i++)if(!isSac(i)&&v[i]!=null)idx.push(i);if(!idx.length)return;
   const m={l:narrow?40:52,r:narrow?10:16,t:22,b:28};
   const hi=Math.max(115,...idx.map(i=>v[i]))*1.06;
   let ty=nice(0,hi,narrow?4:5);const top=Math.max(hi,ty[ty.length-1]);
   const bw=(W-m.l-m.r)/idx.length,Y=x=>m.t+(top-x)/top*(H-m.t-m.b),X=k=>m.l+k*bw;
   let g='';
   ty.forEach(t=>{g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="${css('--rule')}"/><text x="${m.l-8}" y="${Y(t)+4}" text-anchor="end" font-size="12" fill="${css('--mute')}">${t}%</text>`});
   const span=idx.length/10,step=span>6?(narrow?3:2):1;
   idx.forEach((i,k)=>{const val=v[i],y=Y(val),w=Math.max(1,bw*(idx.length>60?.7:.62));
     g+=`<rect class="cb" data-k="${k}" x="${X(k)+(bw-w)/2}" y="${y}" width="${w}" height="${Y(0)-y}" rx="${Math.min(2,w/3)}" fill="${css(val>=100?'--s2':'--pk')}"/>`;
     const d=R.d[i],mo=+d.slice(5),yy=+d.slice(0,4);
     if(idx.length<=14){if((k%(narrow?3:2))===0)g+=`<text x="${X(k)+bw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="${css('--mute')}">${lab(d)}</text>`}
     else if(mo===1&&yy%step===0)g+=`<line x1="${X(k)+bw/2}" x2="${X(k)+bw/2}" y1="${Y(0)}" y2="${Y(0)+4}" stroke="${css('--mute')}"/><text x="${X(k)+bw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="${css('--mute')}">${yy}</text>`});
   g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(0)}" y2="${Y(0)}" stroke="${css('--ink2')}"/>`;
   g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${Y(100)}" y2="${Y(100)}" stroke="${css('--ink')}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${m.l+6}" y="${Y(100)-7}" font-size="12" fill="${css('--ink')}" stroke="${css('--bg')}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">100% = la canasta completa</text>`;
   const L=idx[idx.length-1],kL=idx.length-1;
   g+=`<text x="${Math.min(X(kL)+bw/2,W-m.r-2)}" y="${Y(v[L])-8}" text-anchor="end" font-size="13" font-weight="600" fill="${css('--ink')}">${pc(v[L])}</text>`;
   g+=`<g id="cHl"></g><rect x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}" fill="transparent"/>`;
   sv.innerHTML=g;st={idx,v,bw,m,X,Y,W,H}};
 sv.addEventListener('pointermove',ev=>{const {idx,v,bw,m,X,Y,W}=st;if(!idx)return;const r=sv.getBoundingClientRect(),x=ev.clientX-r.left;
   const k=Math.max(0,Math.min(idx.length-1,Math.floor((x-m.l)/bw))),i=idx[k];
   sv.querySelector('#cHl').innerHTML=`<rect x="${X(k)}" y="${m.t}" width="${bw}" height="${Y(0)-m.t}" fill="${css('--ink')}" fill-opacity=".06"/>`;
   const fac=neto?NETO:1;
   tip.innerHTML=`<b>${lab(R.d[i])}</b><div>Cubre el ${pc(v[i])} de la canasta</div><div style="color:var(--ink2);margin-top:4px">Canasta del hogar: $${nf(R[can][i]*hog.ae)}</div><div style="color:var(--ink2)">Sueldo ${sal==='med'?'mediano':'promedio'} ${neto?'neto estimado':'bruto'}: $${nf(R[sal+'_n'][i]*fac)}</div>`;
   tip.style.display='block';const tw=tip.offsetWidth;let left=X(k)+bw+10;if(left+tw>W)left=X(k)-tw-10;tip.style.left=Math.max(0,left)+'px';tip.style.top=m.t+'px'});
 sv.addEventListener('pointerleave',()=>{tip.style.display='none';const h=sv.querySelector('#cHl');if(h)h.innerHTML=''});
 new ResizeObserver(draw).observe(sv);
 matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
 new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const kC=document.getElementById('kC'),dC=document.getElementById('hogDesc');
 const upd=()=>{dC.textContent=hog.d;
   const vm=cov('med'),vp=cov('prom');let L=R.d.length-1;while(isSac(L)||vm[L]==null)L--;
   const P=R.d.indexOf((+R.d[L].slice(0,4)-1)+R.d[L].slice(4));
   const cn=can==='cbt'?'canasta básica total':'canasta básica alimentaria',nb=neto?'neto':'bruto';
   const nc=v=>nf(v/100,2)+'<span class="u"> canastas</span>';
   kC.innerHTML=[[`Sueldo mediano ${nb}: cuántas ${can==='cbt'?'canastas básicas totales':'canastas básicas alimentarias'} alcanza a comprar`,nc(vm[L]),`en ${lab(R.d[L])}&nbsp;· ${nf(vm[P]/100,2)} un año antes`],
     [`Sueldo promedio ${nb}: cuántas ${can==='cbt'?'canastas básicas totales':'canastas básicas alimentarias'} alcanza a comprar`,nc(vp[L]),`en ${lab(R.d[L])}&nbsp;· ${nf(vp[P]/100,2)} un año antes`],
     [`${can==='cbt'?'Canasta básica total':'Canasta básica alimentaria'} del hogar (${hog.n})`,'$'+nf(R[can][L]*hog.ae),`en ${lab(R.d[L])}`]]
     .map((k,i)=>`<div class="kpi${i==0?' hot':''}"><h3>${k[0]}</h3><div class="v">${k[1]}</div><div class="c">${k[2]}</div></div>`).join('');
   draw()};
 const seg=(id,opts,def,set)=>{const el=document.getElementById(id);el.innerHTML=opts.map((o,i)=>`<button data-i="${i}" aria-pressed="${i===def}">${o.n}</button>`).join('');
   el.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;[...el.children].forEach(x=>x.setAttribute('aria-pressed',x===b));set(opts[+b.dataset.i]);upd()}};
 seg('cSal',[{n:'Sueldo mediano',v:'med'},{n:'Sueldo promedio',v:'prom'}],0,o=>sal=o.v);
 seg('cCan',[{n:'Canasta total (pobreza)',v:'cbt'},{n:'Canasta alimentaria (indigencia)',v:'cba'}],0,o=>can=o.v);
 seg('cHog',HOG,2,o=>hog=o);
 seg('cNet',[{n:'Neto estimado',v:true},{n:'Bruto',v:false}],0,o=>neto=o.v);
 slicer('slC',R.d,0,(a,b)=>{cA=a;cB=b;upd()})();}
/* variación interanual */
const serV=[{n:'Promedio',c:'--s2',v:R.prom_ia},{n:'Mediana',c:'--s1',v:R.med_ia}];
legend('legV',serV);
let vA=12,vB=R.d.length-1;
const drawV=chart('figV',{dates:R.d,series:serV,from:()=>vA,to:()=>vB,keep:()=>true,ref:0,shade:{at:0,label:'Pérdida real interanual'},fy:v=>(v>0?'+':'')+nf(v,Number.isInteger(v)?0:1)+'%',fv:v=>(v>0?'+':'')+nf(v,1)+'%',endW:130});
slicer('slV',R.d,12,(a,b)=>{vA=a;vB=b;drawV()})();
/* brecha */
const br=R.ratio.map(v=>+((v-1)*100).toFixed(1));
const mm=br.map((v,i)=>i<11?null:+(br.slice(i-11,i+1).reduce((a,b)=>a+b,0)/12).toFixed(1));
const yrs=[...new Set(R.d.map(d=>d.slice(0,4)))].filter(y=>y>='2017');
const ea=yrs.map(y=>{const v=R.d.map((d,k)=>d.slice(0,4)===y&&+d.slice(5)<=8?br[k]:null).filter(v=>v!=null);return {y,v:v.reduce((a,b)=>a+b,0)/v.length,n:v.length}}).filter(r=>r.n===8);
{const box=document.getElementById('figB'),sb=document.getElementById('subYB');
 const rows=ea;const mx=Math.max(...rows.map(r=>r.v))*1.12;
 sb.textContent='2017 a 2026. Se comparan siempre los mismos ocho meses porque 2026 tiene datos hasta agosto y porque la brecha cambia según la época del año.';
 box.innerHTML=rows.map((r,k)=>`<div class="yc${k===rows.length-1?' last':''}" title="${r.y}: ${nf(r.v,1)}%"><div class="yv">${nf(r.v,1)}<span class="pc">%</span></div><div class="ybar" style="height:${r.v/mx*100}%"></div><div class="yy"><span class="pc">${r.y.slice(0,2)}</span>${r.y.slice(2)}</div></div>`).join('');}
{const L=R.d.length-1,P=R.d.indexOf((+R.d[L].slice(0,4)-1)+R.d[L].slice(4)),N23=R.d.indexOf('2023-11');
 const pp=(a,b)=>{const d=a-b;return (d>0?'+':'')+nf(d,1)+' pp'};
 const e26=ea[ea.length-1],e23=ea.find(r=>r.y==='2023');
 document.getElementById('kB').innerHTML=[
  ['Brecha en '+lab(R.d[L]),nf(br[L],1)+'%',pp(br[L],br[N23])+' desde nov‑2023&nbsp;· '+pp(br[L],br[P])+' en un año'],
  ['Promedio enero-agosto '+e26.y,nf(e26.v,1)+'%',pp(e26.v,e23.v)+' contra ene‑ago 2023&nbsp;· el más alto desde 2017'],
  ['Brecha en nov-23',nf(br[N23],1)+'%','punto de partida de la comparación'],
 ].map((k,i)=>`<div class="kpi${i==0?' hot':''}"><h3>${k[0]}</h3><div class="v">${k[1]}</div><div class="c">${k[2]}</div></div>`).join('');
 const perAll=[['2023-11',R.d[L],'Desde noviembre de 2023'],[R.d[P],R.d[L],'Último año'],['2023-08','2023-11','Agosto a noviembre de 2023'],['2019-08','2023-08','Pandemia y alta inflación'],['2017-08','2019-08','Crisis 2018-2019']];
 let showOld=false;
 const vr=(k,a,b)=>(R[k][R.d.indexOf(b)]/R[k][R.d.indexOf(a)]-1)*100;
 const drawPer=()=>{const per=showOld?perAll:perAll.slice(0,2);
 const rows=per.map(([a,b,t])=>({a,b,t,m:vr('med',a,b),p:vr('prom',a,b),s:br[R.d.indexOf(a)],e:br[R.d.indexOf(b)]}));
 const M=Math.max(...rows.flatMap(r=>[Math.abs(r.m),Math.abs(r.p)]))*1.45;
 const bLo=Math.floor(Math.min(...rows.flatMap(r=>[r.s,r.e]))-2),bHi=Math.ceil(Math.max(...rows.flatMap(r=>[r.s,r.e]))+2);
 const pct=v=>(v>0?'+':'')+nf(v,1)+'%';
 const bar=(v,c)=>{const w=Math.abs(v)/M*50,l=v<0?50-w:50;return `<div class="bar ${c}" style="left:${l}%;width:${w}%"></div><div class="lb ${c}" style="${v<0?`right:${100-l}%;margin-right:5px`:`left:${l+w}%;margin-left:5px`}">${pct(v)}</div>`};
 const X=v=>(v-bLo)/(bHi-bLo)*100;
 document.getElementById('perB').innerHTML='<div class="hd h0"></div><div class="hd">Variación real del salario</div><div class="hd">Brecha promedio/mediana y su cambio</div>'+rows.map(r=>`<div class="t"><b>${r.t}</b><span>${lab(r.a)} a ${lab(r.b)}</span></div>
 <div><div class="dv"><div class="z"></div>${bar(r.m,'m')}${bar(r.p,'p')}</div></div>
 <div class="dbw"><div class="db"><div class="ln" style="left:${X(Math.min(r.s,r.e))}%;width:${Math.abs(X(r.e)-X(r.s))}%"></div><div class="dt s" style="left:${X(r.s)}%"></div><div class="dt e" style="left:${X(r.e)}%"></div>
 <div class="lb" style="left:${X(r.s)}%;top:0;color:var(--ink2)">${nf(r.s,1)}</div><div class="lb e" style="left:${X(r.e)}%;top:30px">${nf(r.e,1)}%</div></div><div class="dd">${r.e-r.s>0?'+':''}${nf(r.e-r.s,1)} pp</div></div>`).join('');};
 drawPer();
 const ob=document.getElementById('perOld');ob.onclick=()=>{showOld=!showOld;ob.setAttribute('aria-pressed',showOld);ob.textContent=showOld?'Ocultar períodos anteriores':'Ver períodos anteriores';drawPer()};
}
}