export function preserveTaskLinks(root=document,href=location.href){
 const source=new URL(href);for(const link of root.querySelectorAll('.language-menu a[lang]')){
  const target=new URL(link.href,source);target.search='';target.hash='';
  for(const key of ['a','b','country']){const value=source.searchParams.get(key);if(/^[A-Z]{3}$/.test(value||''))target.searchParams.set(key,value);}
  const mode=source.searchParams.get('mode');if(['births','population'].includes(mode))target.searchParams.set('mode',mode);
  link.href=target.pathname+target.search;
 }
}
