const toggle=document.querySelector('.motion-toggle');
if(toggle){toggle.addEventListener('click',()=>{const paused=document.querySelector('.marquee').classList.toggle('paused');toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play wallpaper animation':'Pause wallpaper animation');});}
