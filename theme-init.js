// Presentation preference only. Never reads or changes a life or order.
(()=>{let id='blue';try{const value=localStorage.getItem('1in8b:appearance:v1');if(['blue','journal','editorial','night'].includes(value))id=value;}catch{}document.documentElement.dataset.appearance=id;})();
