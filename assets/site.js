(() => {
const data = window.CADLAB_CONTENT || {};
const e = (tag,cls,txt) => {const x=document.createElement(tag); if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;};
const heading = (tag, item) => {
  const node = e(tag);
  if (item.href) {
    const link = e('a', 'record-link', item.title || '');
    link.href = item.href;
    node.append(link);
  } else node.textContent = item.title || '';
  return node;
};
const addCard = (id, items) => {
  const root = document.getElementById(id);
  (items || []).forEach(item => {
    const card = e('article', 'card');
    card.append(heading('h3', item), e('p', '', item.description || ''));
    root.append(card);
  });
};
const addEntry = (id, items) => {
  const root = document.getElementById(id);
  (items || []).forEach(item => {
    const entry = e('article', 'entry');
    entry.append(heading('strong', item), e('span', '', item.date || item.detail || item.description || ''));
    root.append(entry);
  });
};
document.getElementById('aboutText').textContent=data.about||'';
addCard('researchList',data.research);addCard('peopleList',data.people);addCard('projectList',data.projects);addEntry('publicationList',data.publications);addEntry('newsList',data.news);
})();
