window.addEventListener("load",()=>document.body.classList.add("ready"));
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.15});
document.querySelectorAll(".reveal").forEach(e=>observer.observe(e));
setTimeout(()=>document.getElementById("loader").classList.add("hide"),900);