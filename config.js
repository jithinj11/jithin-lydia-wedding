window.weddingConfig={
  couple:{groom:"Jithin",bride:"Lydia"},
  wedding:{date:"2026-11-07",time:"15:30",displayDate:"7 November 2026"},
  ceremony:{title:"Holy Matrimony",date:"7 November 2026",time:"3:30 PM",venue:"St. Thomas Jacobite Syrian Church",location:"North Paravur",mapsUrl:"https://www.google.com/maps/search/?api=1&query=St+Thomas+Jacobite+Syrian+Church+North+Paravur"},
  reception:{title:"Celebration of Love",date:"7 November 2026",time:"6:30 PM onwards",venue:"Sunny Convention Centre",location:"North Paravur",mapsUrl:"https://www.google.com/maps/search/?api=1&query=Sunny+Convention+Centre+North+Paravur"},
  music:{enabled:true,source:"assets/music/wedding.mp3",volume:.22},
  animation:{speed:1},

  // Edit this section to control every page without touching script.js.
  // duration = how long each page stays before moving to the next page (milliseconds).
  // shift = moves the page content horizontally/vertically (CSS pixels).
  // Set auto:false on a page if you want it to wait for NEXT/swipe.
  sceneSettings:{
    opening:{duration:0, shift:{x:0,y:0}, auto:false},
    scripture:{duration:5200, shift:{x:0,y:0}, auto:true},
    hero:{duration:7600, shift:{x:0,y:0}, auto:true},
    ceremony:{duration:7600, shift:{x:0,y:0}, auto:true},
    reception:{duration:7600, shift:{x:0,y:0}, auto:true},
    countdown:{duration:6000, shift:{x:0,y:0}, auto:true},
    closing:{duration:9000, shift:{x:0,y:0}, auto:true}
  }
};