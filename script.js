const target=new Date("2026-11-07T15:30:00+05:30").getTime();
function tick(){const d=target-Date.now();if(d<=0){document.getElementById("countdown").innerHTML="<p>The day has arrived. ♥</p>";return}
const vals=[Math.floor(d/86400000),Math.floor(d/3600000)%24,Math.floor(d/60000)%60,Math.floor(d/1000)%60];
["days","hours","minutes","seconds"].forEach((id,i)=>document.getElementById(id).textContent=String(vals[i]).padStart(2,"0"))}
tick();setInterval(tick,1000);
