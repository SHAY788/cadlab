(() => {
const data = window.CADLAB_CONTENT || {};
const e = (tag,cls,txt) => {const x=document.createElement(tag); if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;};
const addCard=(id,items)=>{const root=document.getElementById(id);(items||[]).forEach(o=>{const c=e('article','card');c.append(e('h3','',o.title||''),e('p','',o.description||''));root.append(c);});};
const addEntry=(id,items)=>{const root=document.getElementById(id);(items||[]).forEach(o=>{const c=e('article','entry');c.append(e('strong','',o.title||''),e('span','',o.date||o.detail||o.description||''));root.append(c);});};
document.getElementById('aboutText').textContent=data.about||'';
addCard('researchList',data.research);addCard('peopleList',data.people);addCard('projectList',data.projects);addEntry('publicationList',data.publications);addEntry('newsList',data.news);
document.getElementById('year').textContent=new Date().getFullYear();
const btn=document.getElementById('menuButton'),nav=document.getElementById('navigation');btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});nav.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false');});
})();
