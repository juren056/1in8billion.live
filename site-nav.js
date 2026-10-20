import('/experience-upgrade.js');
import('/task-navigation.js').then(({preserveTaskLinks})=>{preserveTaskLinks();document.addEventListener('site:task-change',()=>preserveTaskLinks());});
