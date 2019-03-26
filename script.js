const container = document.querySelector('.container');

const length = 4;
container.style.gridTemplateColumns = 'repeat(' + length + ', 1fr)';
container.style.gridTemplateRows = 'repeat(' + length + ', 1fr)';

for (let i = 0; i < length ** 2; i++)
{
  newItem = document.createElement('div');
  newItem.setAttribute('style',
    'grid-column: ' + (Math.floor(i / length) + 1) + ' / span 1;'
    + 'grid-row: ' + (i % length + 1) + ' / span 1;'
  )
  newItem.classList.add('cell');
  newItem.id = 'cell' + i;
  container.appendChild(newItem)
}

const delay = 100;

setGridDims()

window.onresize = setGridDims;

function setGridDims()
{
  let newDims = newGridDims()
  container.style.width = newDims + 'px';
  container.style.height = newDims + 'px';
}

function newGridDims()
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



// const setGridDims = () => {
//   let newDims = newGridDims()
//   container.style.width = newDims;
//   container.style.height = newDims;
// };


// (() => {
//   resizeTaskId = null;

//   window.addEventListener('resize', () => {
//     if (resizeTaskId !== null) {
//       clearTimeout(resizeTaskId);
//     }

//     resizeTaskId = setTimeout(() => {
//       resizeTaskId = null;
//       setGridDims();
//     }, delay);
//   });
// })();