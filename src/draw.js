// src/draw.js
// Functions to draw SVG elements and HTML elements


import { doFetch, likertPercentage } from "./services";
import { validateData } from "./schema";

// button to toggle visibility of the svg element

export function getSVG(element, argConfig) {
    const defaults = { width: 1050, height: 600 };
    const config = { ...defaults, ...argConfig };
    return SVG().size('100%', '100%').addTo(element).size(config.width, config.height);

}

///////////////////////////////////////////// HTML DRAWING FUNCTIONS ///////////////////////////////////////

export function createHTMLButton(text, id, argConfig) {
    const defaults = {class: 'button', callback: () => console.log('Button clicked') };
    const config = { ...defaults, ...argConfig };
    const button = document.createElement('button');
    button.setAttribute('id', id);
    button.setAttribute('class', config.class);
    button.textContent = text;
    button.addEventListener('click', config.callback);
    return button;
}

///////////////////////////////////////////// SVG DRAWING FUNCTIONS ///////////////////////////////////////


export function origin(draw, x, y, argConfig) {
    // radius = 5, fillColor = 'red'
    const defaults = {radius: 5, fillColor: 'red'};
    const config = { ...defaults, ...argConfig };
    // Add a circle to the SVG drawing at the specified position
    draw.circle(config.radius * 2)  // The diameter is twice the radius
        .fill(config.fillColor)     // Set the fill color
        .center(x, y);       // Position the center of the circle at (x, y)
}

export function createSVGText(text, x, y, argConfig)  {
    const defaults = { anchor: 'left', size: 18, color: 'black' };
    const config = { ...defaults, ...argConfig };
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('fill', config.color);
    textElement.setAttribute('font-family', 'Arial');
    textElement.setAttribute('font-size', config.size);
    textElement.setAttribute('text-anchor', config.anchor);  // Centers text horizontally
    textElement.setAttribute('dominant-baseline', 'text-before-edge');  // Aligns text top to y coordinate
    if (config.hidden) {
        textElement.setAttribute('visibility', 'hidden');  // Hides the element if hidden is true
    }
    textElement.textContent = text;
    return textElement;
}

export function rectWithText(draw, x, y, width, height, textFn, argConfig) {
    console.log('====> rectWithText', draw, x, y, width, height, textFn, argConfig);
    // Default configuration rx="2px", ry="2px",  textStroke ="white", fill = "gray", stroke = "black", strokeWidth = 1
    const defaults = { rx: 5, ry: 5, fontSize: 14, textStroke: 'white', rectFill: 'black', rectStroke: 'black', rectStrokeWidth: 1, 
                       callback: () => {console.log(`rectWithText "${textFn()}" clicked`)},
                       args: [] 
                     };
    const config = { ...defaults, ...argConfig };
    // Create a group and transform it to the specified x and y coordinates
    let group = draw.group().translate(x, y);

    // Add a rectangle to the group
    group.rect(width, height)
         .radius(config.rx, config.ry)           // Set the rounded corners
         .fill(config.rectFill)               // Set the fill color
         .addClass('clickable')
         .stroke({ width: config.rectStrokeWidth, color: config.rectStroke });  // Set the stroke width and color

    // Add text to the group, centered in the middle of the rectangle
    let text = group.text(textFn())
         .font({ anchor: 'middle', fill: config.textStroke, size: config.fontSize })  // Center the text horizontally and set the text color
         .addClass('clickable')
         .center(width / 2, height / 2);            // Move the text to the center of the rectangle

    // If a callback function is provided, add it to the group
    if (config.callback) {
        group.click(() => config.callback(text,...config.args));
    }
}


// Function to measure text width without rendering it visibly
// Does not know as we need to make it async to assure the text is rendered bofore measuring it
function measureTextWidth(draw,text, fontFamily, fontSize) {
    console.log('measureTextWidth:', text, fontFamily, fontSize);
    // Create text element off-screen
    const textElement = draw.text(text).move(-1000, -1000).font({ family: fontFamily, size: fontSize });

    // Get the bounding box of the text, specifically the width
    const textWidth = textElement.bbox().width;

    // Remove the text element after measurement
    textElement.remove();
    console.log('- textWidth:', textWidth);

    return textWidth;
}

function estimateTextWidth(draw, text, fontFamily, fontSize) {
    console.log('====> estimateTextWidth', text, fontFamily, fontSize);
    // Average width of a character relative to the font size
    const averageCharWidthFactor = 0.5; // Adjust this factor as needed

    // Estimate the text width
    const estimatedWidth = text.length * fontSize * averageCharWidthFactor;

    console.log('estimateTextWidth:', text, fontSize, estimatedWidth);
    return estimatedWidth;
}

///////////////////////////////////////////// BOARD FUNCTIONS ///////////////////////////////////////

export function postIt(draw, text, x, y, maxWidth=100, lineHeight=18, maxHeight=50) {
    console.log('====> postIt', draw, text, x, y, maxWidth, lineHeight, maxHeight);
    console.log('postIt:', text, x, y, maxWidth, lineHeight, maxHeight);
    const words = text.split(" ");
    console.log('- words:', words);

    let lineNumber = 0;
    let leftMargin = lineHeight/2;
    let topMargin = lineHeight/8;
    let size = lineHeight;
    let lineX = x + leftMargin;
    let lineY = y + topMargin;
    maxWidth = maxWidth - leftMargin;

    // holds the lines of text and x, y coordinates
    let lines = [];
    let line = '';
    let height = topMargin*3;
    words.forEach(function(word) {
        console.log('- - word:', word);
        const testLine = line + word + ' ';
        // get the width of the text without rendering it
        const testWidth = estimateTextWidth(draw, testLine, 'Arial', size);
        console.log("- - - ",testWidth, testLine, line, height, maxWidth);
        // If the line is too long, wrap the text
        if (testWidth > maxWidth) {
            lines.push({text: line});
            line = word + ' ';
            height += lineHeight*1.1;
        } else {
            line = testLine;
        }
        // draw.text(line).move(x+leftMargin, y + (lineNumber * lineHeight)).font({ family: 'Arial', size: size });
    });
    lines.push({text: line});
    height += lineHeight;
    // Create a group for the post-it note
    const group = draw.group();
    if (height < maxHeight) {
        height = maxHeight;
    }
    group.rect(120, height).attr({ fill: '#f9f79c', stroke: '#333', 'stroke-width': 2 }).move(x, y);
    // console.log({lines});
    lines.forEach(function(line) {
        const textElement = createSVGText(line.text, lineX, lineY, {anchor: 'left', size: 14, color: 'black'});
        group.node.appendChild(textElement);
        lineY = lineY + lineHeight;
        // group.text(line.text).move(line.x, line.y).font({ family: 'Arial', size: size }).attr('dominant-baseline', 'text-before-edge');
    });
    // show hand cursor on hover
    group.addClass('clickable');
    // Make the group draggable
    group.draggable();
}


export function createBoardD3(draw, texts, boardWidth, boardHeight) {
    console.log('====> createBoardD3', draw, texts, boardWidth, boardHeight);
    // assert texts is an array and not empty of an array of arrays
    if (!Array.isArray(texts) || texts.length === 0 || Array.isArray(texts[0])) {
        console.error('Invalid input type for createBoardD3:', texts);
        return;
    }
    // log type of texts

    const nodes = texts.map(text => ({
        x: Math.random() * boardWidth*0.8,
        y: Math.random() * boardHeight*0.9,
        text: text
    }));

    console.log('nodes:', nodes);



    const simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX(d => d.x).strength(0.5))
        .force('y', d3.forceY(d => d.y).strength(0.5))
        .force('collide', d3.forceCollide(60)) // Adjust collision radius based on post-it size
        .stop();

    for (let i = 0; i < 120; ++i) simulation.tick(); // Run simulation to space out elements

    nodes.forEach(node => {
        console.log('Creating post-it:', node.text, node.x, node.y);
        postIt(draw, node.text, node.x, node.y, 110, 18);
    });

    draw.rect(boardWidth, boardHeight).fill('none').stroke({ color: '#333', width: 2 });
}


function createToggleVisibilityButton(target, argConfig) {
    console.log('====> createToggleVisibilityButton', target, argConfig);
    const defaults = {class: 'clickable', text:":::", callback: () => console.log('Button clicked') };
    const config = { ...defaults, ...argConfig };
    const button = document.createElement('button');
    button.setAttribute('class', config.class);
    button.textContent = config.text;
    button.addEventListener('click', () => {
        console.log('Button clicked:', target);
        if (!(target instanceof Element)) {
            console.log('Target is not a valid DOM element:', target);
            return;
        }
        if (target.style.display === 'none') {
            target.style.display = 'block';
        } else {
            target.style.display = 'none';
        }
    });
    return button;
}


/**
 * Asynchronously creates and manages a results board for displaying answers from the server in an SVG element.
 * 
 * @param {HTMLElement} element - The HTML element to which the results board will be attached. This is where the button and the SVG will be placed.
 * @param {Object} argConfig - An optional configuration object to customize the board's behavior and appearance.
 * @param {number} [argConfig.width=1050] - The width of the SVG drawing area.
 * @param {number} [argConfig.height=550] - The height of the SVG drawing area.
 * @param {string} [argConfig.fieldname='answers'] - The name of the field in the server response containing the answers data.
 * @param {boolean} [argConfig.hidden=false] - Whether the SVG drawing should be hidden by default.
 * 
 * @returns {Promise<void>} - This function does not return any value. It dynamically updates the DOM with the results board and listens for server-sent events to update the data.
 * 
 * @description
 * This function creates a dynamic results board, using SVG.js, to visualize data fetched from the server. It works as follows:
 * 
 * 1. **Initial Setup**:
 *    - The function accepts an HTML `element` to which a button and an SVG element are appended.
 *    - It merges default configuration values with the `argConfig` provided.
 * 
 * 2. **SVG Drawing**:
 *    - A div container (`svgDiv`) and a toggle visibility button are created and appended to the provided `element`.
 *    - The visibility of the SVG is controlled based on the `hidden` property in the config.
 * 
 * 3. **Fetching Data**:
 *    - The function fetches the answers data from the server by making a `GET` request to the `answer/{qid}` endpoint, where `qid` is obtained from the `data-ref` attribute of the `element`.
 *    - If no data is available or if a warning is received from the server, it displays a default "No data available" message.
 *    - If data is available, it creates a board using `createBoardD3`, which renders the answers in the SVG.
 * 
 * 4. **Handling Server-Sent Events**:
 *    - The function listens for server-sent events (SSE) to update the board dynamically. When an event with the ID `A-{qid}` is received, the board is cleared and redrawn with the new data.
 * 
 * @example
 * // Example usage:
 * const container = document.getElementById('results-container');
 * const config = { width: 800, height: 400, hidden: false };
 * await resultsBoard(container, config);
 * 
 * // Expected behavior:
 * // The function attaches a toggle button and an SVG board to the 'results-container' element.
 * // It fetches answers from the server and updates the board dynamically based on server-sent events.
 */

export async function resultsBoard(element, argConfig){
    console.log('====> resultsBoard', element, argConfig);
    const defaults = { width: 1050, height: 850, fieldname: 'answers',hidden: false};
    const config = { ...defaults, ...argConfig };
    // create an svg drawing by placing above icons in a grid using svg.js
    // check if id starts with #, otherwise add #
    const qid = element.getAttribute('data-ref');

    // create a div element to hold the svg element and the button
    const svgDiv = document.createElement('div');
    // create a button to toggle visibility of the svg element
    const button_visibility = createToggleVisibilityButton(svgDiv, {class: 'button'});
    // attach the them to the element
    element.appendChild(button_visibility);
    element.appendChild(svgDiv);
    // create a new svg drawing
    const draw = getSVG(svgDiv, config);


    // hide draw element if config.idden is true else show it
    if (config.hidden) {
        svgDiv.style.display = 'none';
    } else {
        svgDiv.style.display = 'block';
    }

    // fetch data from the server
    try {
        // console.log(`answers/${qid}`);
        
        const data = await doFetch(`answer/${qid}`, 'GET')
        console.log(`curl -X GET http://localhost:5050/answer/${qid} gives us ${data.answers}`);
        console.log(data);
        let texts = [];
        if ("warning" in data) {
            texts = ['No data available']; 
        } else {
            console.log('Data:', data);
            console.log('Fieldname:', config.fieldname);
            texts = data.answers; // [config.fieldname];
        }
        createBoardD3(draw, texts, config.width, config.height, 120, 18);
    } catch (error) {
        console.error('Warning:', error);
    }
    // update the board via server-sent events
    console.log(`eventSource: A-${qid}`);
    eventSource.addEventListener(`A-${qid}`, function(event) {
        console.log('Event received:', event, event.data);
        // render json data
        const data = JSON.parse(event.data);
        draw.clear();
        createBoardD3(draw, data.answers, config.width, config.height, 120, 18);
    });
}

///////////////////////////////////////////// likert scale ///////////////////////////////////////

export function likertScale(draw, id) {
    console.log('====> likertScale', draw, id);
    const radius = 10;
    const spacing = 150;
    const labels = [
        "Stimme voll zu",
        "Stimme eher zu", 
        "Neutral", 
        "Stimme eher nicht zu", 
        "Stimme gar nicht zu"
    ];

    let x = 0;
    // Create rectangles and text labels for each point in the Likert scale
    for (let i = 0; i < 5; i++) {
        x = (i+1) * spacing;
        // Draw rectangle
        const c = draw.circle(radius * 2)
            .center(x, 30)
            .fill('white')
            .stroke({ width: 1, color: '#000' })
            // show hand on hover
            .addClass('clickable')
            .addClass('radio-box')
            // set id: needs to be the same than the one in the database
            .attr({ id: `${id}-${i}` }); 

        // Add label below each rectangle
        const textElement = createSVGText(labels[i], x, 45,{ anchor: 'middle', size: 14, color: 'black' });
        draw.node.appendChild(textElement);
      
    }

    // Interaction with rectangles (optional)
    draw.find('.radio-box').click(function() {
        // console.log('Clicked on radio box');
        draw.find('.radio-box').fill('white'); // Reset all
        this.fill({ color: '#c0c0c0' });       // Highlight selected
        // post data to the server
        let value = this.attr('id').split('-')[1];
        let nickname = localStorage.getItem('nickname');
        // if nickname is not set, set it to 'anonymous'
        if (nickname === '-') {
            alert('Bitte wählen Sie einen Nicknamen');
        }

        let data = {user:localStorage.getItem('nickname'), likert: id, value: value};

        console.log("likert uses data:", data);
        // let isValid = validateData(likertSchema, data);
        doFetch('likert', 
                'POST', 
                data, 
                (response) => {console.log(response);}
        );
        });
};


export function likertField(element,argConfig) {
    console.log('====> likertField', element, argConfig);
    const draw = getSVG(element,{height:100});
    likertScale(draw,element.id);
}

export function showPercentage(element, live=true) {
    console.log('====> showPercentage', element, live);
    // create div element to hold the result
    const resultDiv = document.createElement('div');
    const updateResult = async () => {
        // get data for ref attribute
        let percentage = await likertPercentage(element.getAttribute('data-ref'));
        // console.log(percentage);
        // set the text content of the element
        resultDiv.textContent = `${percentage}%`;
    }
    if(live) {
        // show the result live
        element.appendChild(resultDiv);
        eventSource.addEventListener(
            `A-${element.getAttribute('data-ref')}`, 
            function(event) {
                // console.log('Event received:', event, event.data);
                const data = JSON.parse(event.data);
                resultDiv.textContent = `${data.percentage}%`;
            }); 


    } else {
        // show the result via a button click
        const resultButton = createHTMLButton( "Ergebnis", 
                                                `button-${element.getAttribute('data-ref')}`, 
                                                {
                                                    class: 'button', 
                                                    callback: updateResult
                                                })
        element.appendChild(resultButton);
        element.appendChild(resultDiv);
    }
}

// show a toast message, by appending a div to the toast-container (see interaktive.js) temporarily
export function showToast(message, isError = false) {
    console.log('====> showToast', message, isError);
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-message toast-show';
    toast.textContent = message;
    if (isError) {
        toast.style.backgroundColor = 'red';
    }
    container.appendChild(toast);
    setTimeout(() => {
        toast.className = toast.className.replace('toast-show', '');
        setTimeout(() => container.removeChild(toast), 500);
    }, 3000);
}