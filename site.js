const toggle=document.querySelector('.motion-toggle');
if(toggle){toggle.addEventListener('click',()=>{const paused=document.querySelector('.marquee').classList.toggle('paused');toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play wallpaper animation':'Pause wallpaper animation');});}


const versionBadge=document.querySelector('#version-badge');
if(versionBadge){
  fetch('/api/version',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw new Error('Version API unavailable');return response.json();})
    .then(release=>{
      if(typeof release.versionName!=='string'||!release.versionName.trim())return;
      versionBadge.textContent=`v${release.versionName}${release.channel==='beta'?' · Beta':''}`;
    })
    .catch(()=>{});
}
