// Define document elements
const container = document.querySelector('.container');
const resolutionInput = document.getElementsByName('resolution')[0];
const gridlinesBox = document.getElementsByName('gridlines')[0];
const brushStrengthInput = document.getElementsByName('brushStrength')[0];

// Always get an appropriately sized grid and populate with default res on open
let gridResolution = 50;
setGridDimensions()
populateGrid()

/* Store where the mouse is released over the document. Use document over grid
   so that if user releases mouse outside grid it will toggle the bool.*/
let clicked = false, interval = 0;
document.addEventListener('mouseup', (event) => {
  clicked = false;
  clearInterval(interval);
})

// Call function to reset grid dimensions when user finishes resizing window
window.onresize = setGridDimensions;

// Toggle gridlines when checkbox is clicked
gridlinesBox.onclick = toggleBorders;

function toggleBorders() {
  if (gridlinesBox.checked)
  {
    if (+gridResolution + 2 < +container.style.width.substring(0, container.style.width.length -2) / 2)
    {
      document.querySelectorAll('.container div').forEach((div,) => {
        div.classList.add('cell-border');
      })
    }
    else
    {
      gridlinesBox.checked = false;
    }
  }
  else
  {
    document.querySelectorAll('.container div').forEach((div,) => {
      div.classList.remove('cell-border');
    })
  }
}

// Placeholder for letting user choose brush colour
let brushColour = 'black';

// Detect when user's done entering desired brush strength & call to read it
brushStrengthInput.addEventListener('focusout', (event) => {
  setBrushStrength(event.target);
});
brushStrengthInput.addEventListener('keydown', (event) => {
  if (event.isComposing || ![9,13].includes(event.keyCode)) {
    return;
  }
  setBrushStrength(event.target);
})

// Set strength of paintbrush
let brushStrength = 0.2;
function setBrushStrength(brushStrengthInput)
{
  if (brushStrengthInput.value > 0 && brushStrengthInput.value <= 10)
  {
    brushStrength = 1 / (11 - brushStrengthInput.value);
  }
  else
  {
    brushStrengthInput.value = 11 - Math.round(1 / brushStrength);
  }
}

// Detect when user's done entering desired resolution & call to read it
resolutionInput.addEventListener('focusout', (event) => {
  readResolutionFromInput(event.target);
});
resolutionInput.addEventListener('keydown', (event) => {
  if (event.isComposing || ![9,13].includes(event.keyCode)) {
    return;
  }
  readResolutionFromInput(event.target);
})

/* Choose appropriate grid resolution based on input and call to populate grid
   if resolution has changed. */
function readResolutionFromInput(resolutionInput)
{
  if (resolutionInput.value > 0 && resolutionInput.value <= 500)
  {
    if (resolutionInput.value !== gridResolution)
    {
      gridResolution = resolutionInput.value;
      populateGrid();
    }
  }
  else
  {
    resolutionInput.value = gridResolution;
  }
}

/* Delete surplus cells / add extra cells based on requested resolution, adding
   appropriate event listeners and borders if required. */
let colouringTime = 0;
function populateGrid()
{
  container.style.gridTemplateColumns = 'repeat(' + gridResolution + ', 1fr)';
  container.style.gridTemplateRows = 'repeat(' + gridResolution + ', 1fr)';

  let oldRes = Math.round(container.childElementCount ** 0.5)
  
  if (oldRes > gridResolution)
  {
    while (container.childElementCount > gridResolution ** 2)
    {
      container.removeChild(container.lastChild);
    }
  }
  else
  {
    let borders = false;
    if (gridlinesBox.checked)
    {
      if (+gridResolution + 2 < +container.style.width.substring(0, container.style.width.length -2) / 2)
      {
        borders = true;
      }
      else
      {
        gridlinesBox.checked = false;
        toggleBorders;
      }
    }
    
    for (let i = oldRes ** 2; i < gridResolution ** 2; i++)
    {
      let newCell = document.createElement('div');

      let doneRes = Math.floor(i ** 0.5);
      let coOrds = [doneRes + 1, Math.floor((i - doneRes ** 2) / 2) + 1];

      newCell.setAttribute('style',
        'grid-column: ' + coOrds[(i + 1) % 2] + ' / span 1;'
        + 'grid-row: ' + coOrds[i % 2] + ' / span 1;'
      )

      addCellEventListeners(newCell, borders);

      container.appendChild(newCell);
    }
  }
}

function addCellEventListeners(cell, borders)
{
  if (borders)
  {
    cell.classList.add('cell-border')
  }
  
  // If mouse button is already down when cursor enters cell, begin colouring
  cell.addEventListener('mouseover', (event) => {
    if (clicked)
    {
      clearInterval(interval);
      paintAtIntervals(event.target);
    }
  })
  // If user cliks within cell
  cell.addEventListener('mousedown', (event) => {
    clicked = true;
    clearInterval(interval);
    paintAtIntervals(event.target);
  })
}

// Set width and height of grid (but not # of cells), based on window size
function setGridDimensions()
{
  let newDimensions = newGridDimensions()
  container.style.width = newDimensions + 'px';
  container.style.height = newDimensions + 'px';
}

// Get size of window and return appropriate size for grid
function newGridDimensions()
{
  let width = window.innerWidth;
  if (width <= 300)
  {
    return 300;
  }
  else if (width <= 600)
  {
    return width - 16;
  }
  else
  {
    return 584;
  }
}

/* Reset cell if it's not paintbrush colour, then, at appropriate intervals, 
   call function that actually paints cell. */
function paintAtIntervals(cell)
{
  if (cell.style.backgroundColor !== brushColour)
  {
    cell.style.opacity = 0;
    cell.style.backgroundColor = brushColour;
  }
  if (cell.style.opacity != 1)
  {
    paintCell(cell);
    interval = setInterval(paintCell, 200, cell);
  }
}

/* Paint cell (increase opacity). Clear interval to stop repeating if opacity 
   is 1. (Also cleared when a(nother) mousedown or mouseover event fires.) */
function paintCell(cell)
{
  cell.style.opacity = Math.min(+cell.style.opacity + brushStrength, 1);
  if (cell.style.opacity == 1)
  {
    clearInterval(interval);
  }
}