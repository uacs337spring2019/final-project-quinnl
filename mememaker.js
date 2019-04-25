(function(){
  "use strict";
  let createTextOn = false;
  let textPoints = [];
  let maxTextWidth = 0;

  /**
  * loads any existing meme templates and initializes the onclick functions for various buttons
  */
  function init() {
    loadOptions();
    document.getElementById("choose-template").onclick = changeMeme;
    document.getElementById("create-text").onclick = startCreatingText;
    document.getElementById("done").onclick = stopCreatingText;
    document.getElementById("meme-canvas").onclick = createTextPoint;
    document.getElementById("load-image").onclick = showCreateTextControls;
    document.getElementById("save-template").onclick = hideCreateTextControls;
    document.getElementById("clear-text").onclick = clearTextPoints;
    document.getElementById("show-gallery").onclick = showGallery;
    document.getElementById("show-content").onclick = showContent;
  }

  /**
  * Loads the existing meme options into the drop down list
  */
  function loadOptions() {
    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=names";
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let json = JSON.parse(responseText);
        let selector = document.getElementById("meme-template-selector");

        selector.innerHTML = "";
        for(let i = 0; i < json.names.length; i++) {
          let newOption = document.createElement("option");

          newOption.setAttribute("value", json.names[i]);
          newOption.innerHTML = json.names[i];
          selector.appendChild(newOption);
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Switches from one meme template to another when a new meme is selected on the drop down
  * list
  */
  function changeMeme() {
    let name = document.getElementById("meme-template-selector").value;

    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=url&name=" + name;
    document.getElementById("url").value = "";
    document.getElementById("temp-controls-1").style.display = "none";
    maxTextWidth = 0;
    clearTextOnMeme();
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let image = new Image(500, 500);

        image.onload = drawImage;
        image.src = responseText;
        loadTextPointFields(name);
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Draws a given image in order to make sure it is loaded first before being drawn
  */
  function drawImage() {
    let canvas = document.getElementById("meme-canvas");
    let context = canvas.getContext("2d");

    context.drawImage(this, 0, 0, this.width, this.height);
  }

  /**
  * Loads the fields that allow the user to type text for the various text points that were
  * set for the current meme template.
  *
  * @param {object} name the name of the meme template to load the fields for
  */
  function loadTextPointFields(name) {
    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=textPoints&name=" + name;
    let textPointDiv = document.getElementById("text-point-fields");

    textPointDiv.innerHTML = "";
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let textPoints = JSON.parse(responseText).textPoints;

        for(let i = 0; i < textPoints.length; i++) {
          let container = document.createElement("div");
          let input = document.createElement("input");
          let button = document.createElement("button");

          input.setAttribute("type", "text");
          button.setAttribute("value", textPoints[i].x + "," + textPoints[i].y);
          button.innerHTML = "Set Text " + (i + 1);
          button.onclick = renderText;
          container.appendChild(input);
          container.appendChild(button);
          textPointDiv.appendChild(container);
        }
        let container = document.createElement("div");
        let input = document.createElement("input");
        let button = document.createElement("button");

        input.setAttribute("type", "text");
        button.innerHTML = "Max Text Width";
        button.onclick = setMaxTextWidth;
        container.appendChild(input);
        container.appendChild(button);
        textPointDiv.appendChild(container);
        container = document.createElement("div");
        button = document.createElement("button");
        button.innerHTML = "Clear Text";
        button.onclick = clearTextOnMeme;
        container.appendChild(button);
        textPointDiv.appendChild(container);
        container = document.createElement("div");
        button = document.createElement("button");
        button.innerHTML = "Save Meme";
        button.onclick = saveMeme;
        container.appendChild(button);
        textPointDiv.appendChild(container);
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Saves a meme to the file memes.txt, by saving the text on it as well as the name of the
  * template, to be rebuilt from scratch later in the gallery
  */
  function saveMeme() {
    let name = document.getElementById("meme-template-selector").value;
    let inputs = document.querySelectorAll("#text-point-fields input");
    let text = [];

    for(let i = 0; i < (inputs.length - 1); i++) {
      if(inputs[i].value != "") {
        text.push(inputs[i].value);
      }
    }

    const message = {mode: "meme",
      name: name,
      maxTextWidth: maxTextWidth,
      text: text};
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };

    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "Success!") {
          console.log(responseText);
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Sets the maximum width for a given instance of text on a meme i.e. 200 means the text cannot
  * exceed 200 px or else it will wrap
  */
  function setMaxTextWidth() {
    let maxWidth = parseInt(this.parentNode.childNodes[0].value);

    if(isNaN(maxWidth)) {
      alert("Maximum text width must be a number!");
    } else {
      maxTextWidth = maxWidth;
    }
  }

  /**
  * Clears the current canvas and reloads the meme template without the text
  */
  function clearTextOnMeme() {
    let name = document.getElementById("meme-template-selector").value;
    let canvas = document.getElementById("meme-canvas");
    let context = canvas.getContext("2d");

    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=url&name=" + name;
    context.clearRect(0, 0, canvas.width, canvas.height);
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let image = new Image(500, 500);

        image.onload = drawImage;
        image.src = responseText;
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Clears the text on an in progress template, allowing the user to re choose their text
  * points
  */
  function clearTextOnTemplate() {
    let canvas = document.getElementById("meme-canvas");
    let context = canvas.getContext("2d");
    let url = document.getElementById("url").value;
    let image = new Image(500, 500);

    context.clearRect(0, 0, canvas.width, canvas.height);
    image.onload = drawImage;
    image.src = url;
  }

  /**
  * Creates a point on a template where text will go when creating a meme, displays it on the
  * canvas with some sample text to show the user where it will go
  *
  * @param {object} event The mouse click that caused this function to execute
  */
  function createTextPoint(event) {
    if(createTextOn) {
      let canvas = document.getElementById("meme-canvas");
      let context = canvas.getContext("2d");
      let rect = canvas.getBoundingClientRect();
      const textPoint = {x: event.clientX - rect.left,
        y: event.clientY - rect.top};

      textPoints.push(textPoint);
      context.font = '18px sans-serif';
      context.fillText("Text " + textPoints.length, event.clientX - rect.left,
        event.clientY - rect.top);
    }
  }

  /**
  * Clears all the current text points on an in progress template, allowing the user to choose
  * them over again
  */
  function clearTextPoints() {
    textPoints = [];
    clearTextOnTemplate();
  }

  /**
  * Displays the controls that allow the user to create text points on a template
  */
  function showCreateTextControls() {
    let canvas = document.getElementById("meme-canvas");
    let context = canvas.getContext("2d");

    document.getElementById("text-point-fields").innerHTML = "";
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundImage = "url(\"" + document.getElementById("url").value + "\")";
    document.getElementById("temp-controls-1").style.display = "block";
  }

  /**
  * Hides the controls that allow the user to create text points on a template. Triggered by
  * hitting the save template button, so this function actually writes the tempalte to the file
  * templates.txt
  */
  function hideCreateTextControls() {
    let templateName = document.getElementById("template-name").value;

    if(textPoints.length == 0) {
      alert("Must create at least one text point before saving a template!");
    } else if(templateName.includes(" ") || templateName.includes("|") ||
      templateName.includes(">")) {
      alert("Template name cannot contain ' ', '|', or '>'");
    } else {
      let name = document.getElementById("template-name").value;
      let imgUrl = document.getElementById("url").value;

      document.getElementById("temp-controls-1").style.display = "none";
      const message = {mode: "template",
        name: name,
        url: imgUrl,
        textPoints: textPoints};
      const fetchOptions = {
          method : 'POST',
          headers : {
              'Accept': 'application/json',
              'Content-Type' : 'application/json'
          },
          body : JSON.stringify(message)
      };

      let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT";
      fetch(url, fetchOptions)
        .then(checkStatus)
        .then(function(responseText) {
          if(responseText == "Success!") {
            loadOptions();
          }
        })
        .catch(function(error) {
          console.log(error);
      });
      textPoints = [];
    }
  }

  /**
  * Renders text given a set of parameters, rather than operating on the same canvas but with
  * different values. This is necessary for displaying the gallery since each meme is on a
  * different canvas
  *
  * @param {object} x The x coordinate of the text
  * @param {object} y The y coordinate of the text
  * @param {object} text The text
  * @param {object} canvas The canvas to draw the text on
  * @param {object} maxWidth The max width for the text
  */
  function renderText2(x, y, text, canvas, maxWidth) {
    let context = canvas.getContext("2d");
    let words = text.split(" ");
    let curXOffset = 0;
    let curYOffset = 0;

    context.font = '18px sans-serif';
    if(maxWidth == 0) {
      context.fillText(text, x, y);
    }  else {
      for(let i = 0; i < words.length; i++) {
        let width = 0;

        for(let j = 0; j < words[i].length; j++) {
          width += context.measureText(words[i].charAt(j)).width;
        }
        width += context.measureText(" ").width;

        if(width > maxWidth) {
          let word = words[i] + " ";

          for(let k = 0; k < word.length; k++) {
            let c = word.charAt(k);
            width = context.measureText(c).width;

            if((curXOffset + width) <= maxWidth) {
              context.fillText(c, x + curXOffset, y + curYOffset);
              curXOffset += width;
            } else {
              curXOffset = 0;
              curYOffset += 20;
              context.fillText(c, x + curXOffset, y + curYOffset);
              curXOffset += width;
            }
          }
        } else if((curXOffset + width) <= maxWidth) {
          context.fillText(words[i] + " ", x + curXOffset, y + curYOffset);
          curXOffset += width;
        } else {
          curXOffset = 0;
          curYOffset += 20;
          context.fillText(words[i] + " ", x + curXOffset, y + curYOffset);
          curXOffset += width;
        }
      }
    }
  }

  /**
  * Renders the text currently in an input box for one of the text points. Uses the max text
  * width to determine when to wrap to the next line but keeps words in tact. If the max
  * text width is too short, it will start to wrap individual letters
  */
  function renderText() {
    let context = document.getElementById("meme-canvas").getContext("2d");
    let coords = this.value.split(",");
    let x = parseInt(coords[0]);
    let y = parseInt(coords[1]);
    let text = this.parentNode.childNodes[0].value;
    let words = text.split(" ");
    let curXOffset = 0;
    let curYOffset = 0;

    context.font = '18px sans-serif';
    if(maxTextWidth == 0) {
      context.fillText(text, x, y);
    }  else {
      for(let i = 0; i < words.length; i++) {
        let width = 0;

        for(let j = 0; j < words[i].length; j++) {
          width += context.measureText(words[i].charAt(j)).width;
        }
        width += context.measureText(" ").width;

        if(width > maxTextWidth) {
          let word = words[i] + " ";

          for(let k = 0; k < word.length; k++) {
            let c = word.charAt(k);
            width = context.measureText(c).width;

            if((curXOffset + width) <= maxTextWidth) {
              context.fillText(c, x + curXOffset, y + curYOffset);
              curXOffset += width;
            } else {
              curXOffset = 0;
              curYOffset += 20;
              context.fillText(c, x + curXOffset, y + curYOffset);
              curXOffset += width;
            }
          }
        } else if((curXOffset + width) <= maxTextWidth) {
          context.fillText(words[i] + " ", x + curXOffset, y + curYOffset);
          curXOffset += width;
        } else {
          curXOffset = 0;
          curYOffset += 20;
          context.fillText(words[i] + " ", x + curXOffset, y + curYOffset);
          curXOffset += width;
        }
      }
    }
  }

  /**
  * Enables creating text points by clicking on the canvas
  */
  function startCreatingText() {
    document.getElementById("temp-controls-2").style.display = "block";
    createTextOn = true;
  }

  /**
  * Disables creating text points by clicking on the canvas
  */
  function stopCreatingText() {
    document.getElementById("temp-controls-2").style.display = "none";
    createTextOn = false;
  }

  /**
  * Displays the gallery of saved memes. (Currently not completely working. It won't crash
  * but memes with a max text width greater than 0 will show without the text for some reason.
  * However, memes with a max text width of 0 display properly.)
  */
  function showGallery() {
    document.getElementById("content").style.display = "none";
    document.getElementById("gallery").style.display = "block";
    document.getElementById("gallery-content").innerHTML = "";
    let url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=memes";
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let memes = JSON.parse(responseText).memes;

        for(let i = 0; i < memes.length; i++) {
          let fields = memes[i].split("|");

          url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=textPoints&name=" + fields[0];
          fetch(url)
            .then(checkStatus)
            .then(function(responseText2) {
              let textPoints = JSON.parse(responseText2).textPoints;

              url = "http://meme-maker-quinnlawson.herokuapp.com:process.env.PORT?mode=url&name=" + fields[0];
              fetch(url)
                .then(checkStatus)
                .then(function(responseText3) {
                  let imageUrl = responseText3;
                  let image = new Image(500, 500);
                  let canvas = document.createElement("canvas");

                  canvas.className = "gallery-image";
                  document.getElementById("gallery-content").appendChild(canvas);
                  canvas.setAttribute("width", 500);
                  canvas.setAttribute("height", 500);
                  image.onload = function() {
                    let context = canvas.getContext("2d");

                    context.drawImage(this, 0, 0, this.width, this.height);
                    for(let j = 2; j < fields.length; j++) {
                      renderText2(textPoints[j - 2].x, textPoints[j - 2].y, fields[j],
                        canvas, fields[1]);
                    }
                  };
                  image.src = imageUrl;
                })
                .catch(function(error3) {
                  console.log(error3);
              });
            })
            .catch(function(error2) {
              console.log(error2);
          });
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  /**
  * Shows the content (the meme canvas as well as controls, not the gallery)
  */
  function showContent() {
    document.getElementById("gallery").style.display = "none";
    document.getElementById("content").style.display = "block";
  }

  /**
  * Checks the status of the response from the web service. If The response is normal, it just
  * returns the response text, otherwise it returns the error that occurred.
  *
  * @param {object} response the response text from the web service
  * @return {object} the response text or a rejection depending on if the operation succeeded
  */
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else if (response.status == 404) {
      return Promise.reject(new Error("Sorry, we couldn't find that page"));
    } else {
      return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
  }

  window.onload = init;
})();
