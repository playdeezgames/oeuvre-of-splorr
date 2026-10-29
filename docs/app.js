const KEY='oeuvre-favorites';
const favs=(()=>{try{return new Set(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch(e){return new Set()}})();
const HKEY='oeuvre-hidden';
const hidden=(()=>{try{return new Set(JSON.parse(localStorage.getItem(HKEY)||'[]'))}catch(e){return new Set()}})();
function saveFavs(){try{localStorage.setItem(KEY,JSON.stringify([...favs]));localStorage.setItem(HKEY,JSON.stringify([...hidden]))}catch(e){}}
const state={games:[],tags:new Set(),sort:'newest',q:'',onlyFavs:false,showHidden:false};
const sorters={
  newest:(a,b)=>b.year-a.year||a.title.localeCompare(b.title),
  oldest:(a,b)=>a.year-b.year||a.title.localeCompare(b.title),
  title:(a,b)=>a.title.localeCompare(b.title),
  file:null};
const $=id=>document.getElementById(id);
function render(){
  const ul=$('games');ul.textContent='';
  let list=state.games.filter(g=>[...state.tags].every(t=>g.tags.includes(t))&&g.title.toLowerCase().includes(state.q)&&(!state.onlyFavs||favs.has(g.title))&&(state.showHidden||!hidden.has(g.title)));
  const s=sorters[state.sort];if(s)list=[...list].sort(s);
  $('count').textContent=list.length+' of '+state.games.length+(hidden.size&&!state.showHidden?' ('+hidden.size+' hidden)':'');
  for(const g of list){
    const li=document.createElement('li');
    const pic=document.createElement('div');pic.className='pic';
    if(g.img){const im=document.createElement('img');im.src=g.img;im.alt='A screenshot of '+g.title;im.loading='lazy';im.width=480;im.height=360;pic.append(im)}
    else{pic.classList.add('noimg');pic.textContent=g.title}
    li.append(pic);
    const h=document.createElement('h2');h.textContent=g.title;
    const st=document.createElement('button');st.type='button';st.className='star';
    const on=favs.has(g.title);st.textContent=on?'\u2605':'\u2606';st.setAttribute('aria-pressed',on);
    st.setAttribute('aria-label',(on?'Remove favorite: ':'Favorite: ')+g.title);
    st.onclick=()=>{if(favs.has(g.title))favs.delete(g.title);else{favs.add(g.title);hidden.delete(g.title)}saveFavs();render()};
    h.append(st);li.append(h);
    const isH=hidden.has(g.title);if(isH)li.classList.add('hidden');
    const hb=document.createElement('button');hb.type='button';hb.className='hide';
    hb.textContent=isH?'Unhide':'Hide';hb.title=isH?'Show this one again':'Not for me: hide it from the list';
    hb.onclick=()=>{if(hidden.has(g.title))hidden.delete(g.title);else{hidden.add(g.title);favs.delete(g.title)}saveFavs();render()};
    const y=document.createElement('div');y.className='year';y.textContent=g.year;li.append(y);
    if(g.blurb){const p=document.createElement('p');p.className='blurb';p.textContent=g.blurb;li.append(p)}
    const tg=document.createElement('div');tg.className='tags';
    for(const t of g.tags){const s=document.createElement('button');s.type='button';s.textContent=t;s.onclick=()=>toggle(t);tg.append(s)}
    li.append(tg);
    const b=document.createElement('div');b.className='btns';
    const add=(t,u,c)=>{const a=document.createElement('a');a.href=u;a.textContent=t;if(c)a.className=c;b.append(a)};
    if(g.play)add('Play here',g.play,'play');
    if(g.itch)add('itch.io',g.itch,g.play?'':'play');
    b.append(hb);li.append(b);ul.append(li);
  }
  for(const c of $('chips').children)c.setAttribute('aria-pressed',state.tags.has(c.textContent));
}
function toggle(t){state.tags.has(t)?state.tags.delete(t):state.tags.add(t);render()}
fetch('games.json').then(r=>r.json()).then(d=>{
  state.games=d.games;
  const all=[...new Set(d.games.flatMap(g=>g.tags))].sort();
  for(const t of all){const c=document.createElement('button');c.type='button';c.textContent=t;c.onclick=()=>toggle(t);$('chips').append(c)}
  $('sort').onchange=e=>{state.sort=e.target.value;render()};
  $('q').oninput=e=>{state.q=e.target.value.toLowerCase();render()};
  $('showhidden').onchange=e=>{state.showHidden=e.target.checked;render()};
  $('favs').onchange=e=>{state.onlyFavs=e.target.checked;render()};
  $('clear').onclick=()=>{state.showHidden=false;$('showhidden').checked=false;state.onlyFavs=false;$('favs').checked=false;state.tags.clear();$('q').value='';state.q='';render()};
  $('links').innerHTML='<a href="'+d.itch_profile+'">All on itch.io</a> &middot; <a href="'+d.github+'">GitHub</a>';
  render();
}).catch(()=>{$('games').textContent='Could not load the game list.'});
