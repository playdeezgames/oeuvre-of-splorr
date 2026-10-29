const state={games:[],tags:new Set(),sort:'newest',q:''};
const sorters={
  newest:(a,b)=>b.year-a.year||a.title.localeCompare(b.title),
  oldest:(a,b)=>a.year-b.year||a.title.localeCompare(b.title),
  title:(a,b)=>a.title.localeCompare(b.title),
  file:null};
const $=id=>document.getElementById(id);
function render(){
  const ul=$('games');ul.textContent='';
  let list=state.games.filter(g=>[...state.tags].every(t=>g.tags.includes(t))&&g.title.toLowerCase().includes(state.q));
  const s=sorters[state.sort];if(s)list=[...list].sort(s);
  $('count').textContent=list.length+' of '+state.games.length;
  for(const g of list){
    const li=document.createElement('li');
    const h=document.createElement('h2');h.textContent=g.title;li.append(h);
    const y=document.createElement('div');y.className='year';y.textContent=g.year;li.append(y);
    if(g.blurb){const p=document.createElement('p');p.className='blurb';p.textContent=g.blurb;li.append(p)}
    const tg=document.createElement('div');tg.className='tags';
    for(const t of g.tags){const s=document.createElement('button');s.type='button';s.textContent=t;s.onclick=()=>toggle(t);tg.append(s)}
    li.append(tg);
    const b=document.createElement('div');b.className='btns';
    const add=(t,u,c)=>{const a=document.createElement('a');a.href=u;a.textContent=t;if(c)a.className=c;b.append(a)};
    if(g.play)add('Play here',g.play,'play');
    if(g.itch)add('itch.io',g.itch,g.play?'':'play');
    li.append(b);ul.append(li);
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
  $('clear').onclick=()=>{state.tags.clear();$('q').value='';state.q='';render()};
  $('links').innerHTML='<a href="'+d.itch_profile+'">All on itch.io</a> &middot; <a href="'+d.github+'">GitHub</a>';
  render();
}).catch(()=>{$('games').textContent='Could not load the game list.'});
