async function r(n=1e3){const o=document.querySelector(".loading-overlay");o&&o.remove();const e=document.createElement("div");return e.className="loading-overlay",e.innerHTML=`
    <div class="loading-spinner">
      <svg viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20"></circle>
      </svg>
    </div>
  `,document.body.appendChild(e),new Promise(i=>{setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e),i()},n)})}export{r as s};
