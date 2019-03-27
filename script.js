const container = document.querySelector('.container');
const resInput = document.getElementsByName('resolution');

let gridResolution = 50;

populateGrid()

setGridDimensions()

window.onresize = setGridDimensions;

resInput.forEach((resInput) => {
  resInput.addEventListener('focusout', readResolutionFromInput);
  resInput.addEventListener('keydown', (event) => {
    if (event.isComposing || ![9,13].includes(event.keyCode)) {
      return;
    }
    readResolutionFromInput(event);
  })
})

function readResolutionFromInput(event)
{
  let newGridResolution = Math.min(event.target.value, 100) || gridResolution;
  if (newGridResolution !== gridResolution)
  {
    gridResolution = newGridResolution;
    populateGrid();
  }
}

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
    
    newItem.id = 'cell' + i;

    newItem.addEventListener('mouseover', (event) => {
      event.target.classList.add('black');
    })

    container.appendChild(newItem);
  }
}

function setGridDimensions()
{
  let newDimensions = newGridDimensions()
  container.style.width = newDimensions + 'px';
  container.style.height = newDimensions + 'px';
}

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