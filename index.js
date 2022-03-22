const grid = document.querySelector(".main-container");

const { unwrapGrid, forceGridAnimation } = animateCSSGrid.wrapGrid(grid, {duration: 1000});

const search = document.querySelector(".search-box-container");

search.addEventListener("click", (event)=>{
    console.log(event.target.classList);
    if(event.target.classList.contains("search-button")){
        console.log(search)
        search.toggleAttribute("data-initial");
    }
    forceGridAnimation();
});