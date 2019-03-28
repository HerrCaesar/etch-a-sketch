// Define document elements
const container = document.querySelector('.container');
const resolutionInputs = document.getElementsByName('resolution');
const gridlinesBoxes = document.getElementsByName('gridlines');

// Always get a appropriately sized grid and populate with default res on open. 
let gridResolution = 50;
setGridDimensions()
populateGrid()

/* Store where the mouse is down over the document. Use document over grid 
   so that if user releases mouse outside grid it will toggle the bool.*/
let clicked = false;
document.addEventListener('mousedown', (event) => {
  clicked = true;
})
document.addEventListener('mouseup', (event) => {
  clicked = false;
})

// Calls to reset grid dimensions when user finishes resizing the window
window.onresize = setGridDimensions;

// Toggle gridlines when checkbox is clicked
gridlinesBoxes.forEach((gridlinesBox) => {
  gridlinesBox.addEventListener('click', () => {
    document.querySelectorAll('.container div').forEach((div) => {
      div.classList.toggle('cell-border');
    })
  })
})

// Detect when user's finished entering desired resolution and call to read it
resolutionInputs.forEach((resolutionInput) => {
  resolutionInput.addEventListener('focusout', readResolutionFromInput);
  resolutionInput.addEventListener('keydown', (event) => {
    if (event.isComposing || ![9,13].includes(event.keyCode)) {
      return;
    }
    readResolutionFromInput(event);
  })
})

/* Choose appropriate grid resolution based on input and call to populate grid
   if resolution has changed. */
function readResolutionFromInput(event)
{
  let newGridResolution = Math.min(event.target.value, 100) || gridResolution;
  if (newGridResolution !== gridResolution)
  {
    gridResolution = newGridResolution;
    populateGrid();
  }
}

/* Delete existing cells in grid and repopulate based on requested 
   resolution, adding appropriate event listeners. */
function populateGrid()
{
  container.style.gridTemplateColumns = 'repeat(' + gridResolution + ', 1fr)';
  container.style.gridTemplateRows = 'repeat(' + gridResolution + ', 1fr)';

  while (container.lastChild)
  {
    container.removeChild(container.lastChild);
  }

  for (let i = 0; i < gridResolution ** 2; i++)
  {
    newItem = document.createElement('div');
    newItem.setAttribute('style',
      'grid-column: ' + (Math.floor(i / gridResolution) + 1) + ' / span 1;'
      + 'grid-row: ' + (i % gridResolution + 1) + ' / span 1;'
    )

    // 'Mousemove' not '-over' '-enter' to enable steady opacity increase
    newItem.addEventListener('mousemove', (event) => {
      if (clicked)
      {
        throttled(200, colourCell(event));
      }
    })

    container.appendChild(newItem);
  }
}

// Set width and height (but not #cells) of grid, based on window size
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

// Change colour of the cell clicked on/over
function colourCell(event)
{
  event.target.classList.add('black');
}

// Throttle the frequency of events firing. Used for mousemove event.
function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}