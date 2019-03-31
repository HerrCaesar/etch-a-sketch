// Define document elements
const container = document.querySelector(".container");
const resolutionInput = document.getElementsByName("resolution")[0];
const gridlinesBox = document.getElementsByName("gridlines")[0];
const brushStrengthInput = document.getElementsByName("brushStrength")[0];
let resetButton = document.querySelector("input[name=resetCanvas]");
let modeButton = document.querySelector("input[name=mode]");

// Set defaults
let gridResolution = 50;
let clicked = false;
let interval = 0;
const modeArr = ["P", "Paint","E", "Etch-A-Sketch"];
let mode = "P";
let brushStrengthFocus = false;
let brushStrength = 1;
let colouringTime = 0;

// Always get an appropriately sized grid and populate with default res on open
setGridDimensions();
populateGrid();

/* Store where the mouse is released over the document. Use document over grid
   so that if user releases mouse outside grid it will toggle the bool.*/
document.onmouseup = function(event) {
  clicked = false;
  clearInterval(interval);
};

// Call function to reset grid dimensions when user finishes resizing window
window.onresize = setGridDimensions;

// Let user choose brush colour
let brushColour = "rgb(0,0,0)";
document.querySelectorAll(".swatch").forEach(function(swatch) {
  swatch.onclick = function(event) {
    let selectedSwatch = document.querySelector("div.swatch.swatch-outline");
    if (selectedSwatch)
    {
      selectedSwatch.classList.remove("swatch-outline");
    }
    else
    {
      document.querySelector("#rainbow").classList.remove("swatch-outline");
    }
    event.target.classList.add("swatch-outline");
    brushColour = event.target.style.backgroundColor;
  };
});

// Or let user choose rainbow-brush
document.querySelector("#rainbow").onclick = function(event) {
  let selectedSwatch = document.querySelector("div.swatch.swatch-outline");
  if (selectedSwatch)
  {
    selectedSwatch.classList.remove("swatch-outline");
  }
  event.target.classList.add("swatch-outline");
  brushColour = "rainbow";
};

// Reset canvas on button click
resetButton.onclick = function() {
  resetButton.classList.remove("outset");
  resetButton.classList.add("inset");
  resetCanvas();

  setTimeout(function() {
    resetButton.classList.remove("inset");
    resetButton.classList.add("outset");
  }, 100);
};

// Display "Change Mode" on mode button when user hovers over it
modeButton.onmouseover = function() {
  modeButton.value = "Change Mode";
};
modeButton.onmouseout = function() {
  modeButton.value = modeArr[modeArr.indexOf(mode) + 1];
};

// Toggle mode: P = MS Paint; E = Etch-A-Sketch
modeButton.onclick = function() {
  modeButton.classList.remove("outset");
  modeButton.classList.add("inset");
  mode = modeArr[(modeArr.indexOf(mode) + 2) % 4];
  modeButton.value = modeArr[modeArr.indexOf(mode) + 1];

  setTimeout(function() {
    modeButton.classList.remove("inset");
    modeButton.classList.add("outset");
  }, 100);
};

// Toggle gridlines when checkbox is clicked
gridlinesBox.onclick = toggleBorders;
function toggleBorders() {
  if (gridlinesBox.checked)
  {
    let contWidth = container.style.width;
    if (+gridResolution + 2 < +contWidth.substring(0, contWidth.length -2) / 2)
    {
      document.querySelectorAll(".container div").forEach(function(div) {
        div.classList.add("cell-border");
      });
    }
    else
    {
      gridlinesBox.checked = false;
    }
  }
  else
  {
    document.querySelectorAll(".container div").forEach(function(div) {
      div.classList.remove("cell-border");
    });
  }
}

// Detect when user starts entering brush strength
brushStrengthInput.onfocus = function() {
  brushStrengthFocus = true;
};

// Detect when user's done entering desired brush strength & call to read it
brushStrengthInput.onblur = function() {
  if (brushStrengthFocus)
  {
    setBrushStrength();
  }
};
brushStrengthInput.onkeydown = function(event) {
  if (event.isComposing || event.keyCode != 9 && event.keyCode != 13) {
    return;
  }
  document.activeElement.blur();
  setBrushStrength();
};

// Make all cells in grid white again
function resetCanvas() {
  document.querySelectorAll(".container div").forEach(function(cell) {
    cell.style.backgroundColor = "rgba(255,255,255,1)";
  });
}

// Set strength of paintbrush
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
resolutionInput.onblur = function(event) {
  readResolutionFromInput(event.target);
};
resolutionInput.onkeydown = function(event) {
  if (event.isComposing || event.keyCode != 9 && event.keyCode != 13) {
    return;
  }
  readResolutionFromInput(event.target);
};

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
function populateGrid()
{
  container.style.gridTemplateColumns = "repeat(" + gridResolution + ", 1fr)";
  container.style.gridTemplateRows = "repeat(" + gridResolution + ", 1fr)";

  let oldRes = Math.round(container.childElementCount ** 0.5);

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
      let contWidth = container.style.width;
      if (+gridResolution + 2 <
          +contWidth.substring(0, contWidth.length -2) / 2)
      {
        borders = true;
      }
      else
      {
        gridlinesBox.checked = false;
        toggleBorders;
      }
    }

    let i = oldRes ** 2;
    while (i < gridResolution ** 2)
    {
      let newCell = document.createElement("div");

      let doneRes = Math.floor(i ** 0.5);
      let coOrds = [doneRes + 1, Math.floor((i - doneRes ** 2) / 2) + 1];

      newCell.setAttribute("style",
        "grid-column: " + coOrds[(i + 1) % 2] + " / span 1;"
        + "grid-row: " + coOrds[i % 2] + " / span 1;"
      );

      addCellEventListeners(newCell, borders);

      container.appendChild(newCell);

      i++;
    }
  }
}

function addCellEventListeners(cell, borders)
{
  if (borders)
  {
    cell.classList.add("cell-border");
  }

  // If mouse button is already down when cursor enters cell, begin colouring
  cell.onmouseover = function(event) {
    if (clicked || mode == "E")
    {
      clearInterval(interval);
      paintAtIntervals(event.target);
    }
  };
  // If user clicks within cell
  cell.onmousedown = function(event) {
    if (mode == "P")
    {
      clicked = true;
      clearInterval(interval);
      if (brushStrengthFocus)
      {
        setBrushStrength();
      }
      paintAtIntervals(event.target);
    }
  };
}

// Set width and height of grid (but not # of cells), based on window size
function setGridDimensions()
{
  let newDimensions = newGridDimensions();
  container.style.width = newDimensions + "px";
  container.style.height = newDimensions + "px";
  document.querySelector("#options").style.width = newDimensions + "px";
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
  if (brushColour == "rainbow")
  {
    paintCell(cell);
    interval = setInterval(paintCell, 200, cell);
  }
  else
  {
    let cellColour = cell.style.backgroundColor;
    let regexp = /.*\((\d*(,\s?\d*){2})(,\s?([01](\.[\d]+)?))?\)$/;
    if (!cellColour ||
        regexp.exec(cellColour)[1] != regexp.exec(brushColour)[1])
    {
      cell.style.backgroundColor = brushColour.replace(regexp, "rgba($1,0)");
      cellColour = cell.style.backgroundColor;
    }
    if (+regexp.exec(cellColour)[4] != 1)
    {
      paintCell(cell, regexp);
      interval = setInterval(paintCell, 200, cell, regexp);
    }
  }
}

/* Paint cell (increase alpha). Clear interval to stop repeating if opacity
   is 1. (Also cleared when a(nother) mousedown or mouseover event fires.) */
function paintCell(cell, regexp)
{
  if (brushColour == "rainbow")
  {
    cell.style.backgroundColor = "rgb(" + pickRandRGB() + ", " +
                                 pickRandRGB() + ", " + pickRandRGB() + ")";
  }
  else
  {
    let cellColour = cell.style.backgroundColor;
    let newCellAlpha = Math.min(+regexp.exec(cellColour)[4] +
                       brushStrength, 1);
    cell.style.backgroundColor = cellColour.replace(regexp, "rgba($1," +
                                 newCellAlpha + ")");
    if (newCellAlpha == 1)
    {
      clearInterval(interval);
    }
  }
}

// Pick random number between 0 and 255 for RGB value
function pickRandRGB()
{
  return Math.floor(Math.random() * 256);
}