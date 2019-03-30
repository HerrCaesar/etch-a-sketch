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

// Let user choose brush colour
let brushColour = 'rgb(0,0,0)';
document.querySelectorAll('.swatch').forEach((swatch) => {
  swatch.addEventListener('click', (event) => {
    let selectedSwatch = document.querySelector('div.swatch.cell-border');
    if (selectedSwatch) selectedSwatch.classList.remove('cell-border');
    event.target.classList.add('cell-border');
    brushColour = event.target.style.backgroundColor;
  })
})

// Reset canvas on button click
let resetButton = document.querySelector('.button');
resetButton.onclick = function() {
  resetButton.classList.remove('outset');
  resetButton.classList.add('inset');
  resetCanvas()

  setTimeout(function() {
    resetButton.classList.remove('inset');
    resetButton.classList.add('outset');
  }, 100);
}

// Clean make all cells in grid white again
function resetCanvas() {
  document.querySelectorAll('.container div').forEach((cell) => {
    cell.style.backgroundColor = 'rgba(255,255,255,1)';
  })
}

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

// Detect when user starts entering brush strength
let brushStrengthFocus = false;
brushStrengthInput.onfocus = () => brushStrengthFocus = true;

// Detect when user's done entering desired brush strength & call to read it
brushStrengthInput.onblur = function() {
  setBrushStrength();
};
brushStrengthInput.addEventListener('keydown', (event) => {
  if (event.isComposing || ![9,13].includes(event.keyCode)) {
    return;
  }
  document.activeElement.blur();
  setBrushStrength();
})

// Set strength of paintbrush
let brushStrength = 0.2;
function setBrushStrength()
{
  brushStrengthFocus = false;
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
    if (brushStrengthFocus)
    {
      setBrushStrength();
    }
    paintAtIntervals(event.target);
  })
}

// Set width and height of grid (but not # of cells), based on window size
function setGridDimensions()
{
  let newDimensions = newGridDimensions()
  container.style.width = newDimensions + 'px';
  container.style.height = newDimensions + 'px';
  document.querySelector('#tools').style.width = newDimensions + 'px';
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
    return width - 20;
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
  let cellColour = cell.style.backgroundColor;
  let regexp = /.*\((\d*(,\s?\d*){2})(,\s?([01](\.[\d]+)?))?\)$/;
  if (!cellColour || regexp.exec(cellColour)[1] != regexp.exec(brushColour)[1])
  {
    cellColour = cell.style.backgroundColor = brushColour.replace(regexp, 'rgba($1,0)');
  }
  if (+regexp.exec(cellColour)[4] != 1)
  {
    paintCell(cell, regexp);
    interval = setInterval(paintCell, 200, cell, regexp);
  }
}

/* Paint cell (increase alpha). Clear interval to stop repeating if opacity 
   is 1. (Also cleared when a(nother) mousedown or mouseover event fires.) */
function paintCell(cell, regexp)
{
  let cellColour = cell.style.backgroundColor;
  let newCellAlpha = Math.min(+regexp.exec(cellColour)[4] + brushStrength, 1);
  cell.style.backgroundColor = cellColour.replace(regexp, 'rgba($1,' + newCellAlpha + ')');
  if (newCellAlpha == 1)
  {
    clearInterval(interval);
  }
}