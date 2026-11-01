(() => {
const data = window.CADLAB_CONTENT || {};
const e = (tag,cls,txt) => {const x=document.createElement(tag); if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;};
const addCard=(id,items)=>{const root=document.getElementById(id);(items||[]).forEach(o=>{const c=e('article','card');c.append(e('h3','',o.title||''),e('p','',o.description||''));root.append(c);});};
const addEntry=(id,items)=>{const root=document.getElementById(id);(items||[]).forEach(o=>{const c=e('article','entry');c.append(e('strong','',o.title||''),e('span','',o.date||o.detail||o.description||''));root.append(c);});};
document.getElementById('aboutText').textContent=data.about||'';
addCard('researchList',data.research);addCard('peopleList',data.people);addCard('projectList',data.projects);addEntry('publicationList',data.publications);addEntry('newsList',data.news);
document.getElementById('year').textContent=new Date().getFullYear();
const btn = document.getElementById('menuButton');
const nav = document.getElementById('navigation');
const mobile = window.matchMedia('(max-width: 900px)');
const groups = [...nav.querySelectorAll('.nav-group')];
const setGroup = (group, open) => {
  group.classList.toggle('expanded', open);
  group.querySelector('.submenu-toggle').setAttribute('aria-expanded', String(open));
};
const closeGroups = () => groups.forEach(group => setGroup(group, false));
const setMenu = open => {
  nav.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
  if (!open) closeGroups();
};
btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
groups.forEach(group => {
  const toggle = group.querySelector('.submenu-toggle');
  const openGroup = () => {
    groups.forEach(other => setGroup(other, other === group));
  };
  toggle.addEventListener('click', () => {
    if (group.classList.contains('expanded')) setGroup(group, false);
    else openGroup();
  });
  group.addEventListener('pointerenter', event => {
    if (!mobile.matches && event.pointerType === 'mouse') openGroup();
  });
  group.addEventListener('pointerleave', () => {
    if (!mobile.matches && !group.contains(document.activeElement)) setGroup(group, false);
  });
  group.addEventListener('focusout', event => {
    if (!group.contains(event.relatedTarget)) setGroup(group, false);
  });
  group.addEventListener('keydown', event => {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
        (event.target === toggle || event.target === group.querySelector('a'))) {
      event.preventDefault();
      openGroup();
      const links = group.querySelectorAll('.dropdown a');
      links[event.key === 'ArrowDown' ? 0 : links.length - 1].focus();
    }
  });
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    if (mobile.matches) btn.focus();
    setMenu(false);
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const group = event.target.closest('.nav-group.expanded');
  if (group) {
    group.querySelector('.submenu-toggle').focus();
    setGroup(group, false);
    event.preventDefault();
  } else if (nav.classList.contains('open')) {
    btn.focus();
    setMenu(false);
    event.preventDefault();
  } else closeGroups();
});
document.addEventListener('click', event => {
  if (!nav.contains(event.target) && !btn.contains(event.target)) setMenu(false);
});
mobile.addEventListener('change', () => {
  const focusWasInNav = nav.contains(document.activeElement);
  setMenu(false);
  if (focusWasInNav) {
    if (mobile.matches) btn.focus();
    else nav.querySelector('a').focus();
  } else if (!mobile.matches && document.activeElement === btn) nav.querySelector('a').focus();
});
})();
