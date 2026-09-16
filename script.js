const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
setTimeout(()=>document.body.classList.add('loaded'),800);
