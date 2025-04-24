import { getIPSocket } from "./services.js";
import { createTeam } from "./team.js";
import { likertField, resultsBoard,showPercentage } from "./draw.js";
import { addSubmitOnReturn } from "./listeners.js";
import { createMustererkennung } from "./mustererkennung.js";
import { SuperGif } from "@wizpanda/super-gif";

// run a function on all div elements with type=fun.name
export function runFunction(fun) {
    console.log(`run ${fun.name}`);
    const elements = document.querySelectorAll(`div[type=${fun.name}]`);

    elements.forEach(element => {
        console.log(`execute ${fun.name} at element: ${element.id}`);
        fun(element);
    });
}

/////////////////////////////////////////////////////////////////////////////////////

// create an EventSource object for the server-sent events
// export const eventSource = new EventSource(`${BASE_URL}/events`);


/////////////////////////////////////////////////////////////////////////////////////

// display the IP and socket number received from the server at the ipSocketElement
export async function showIPSocket(ipSocketElement) {
    const ipSocket = await getIPSocket();
    ipSocketElement.innerHTML = `http://${ipSocket.ip}:${ipSocket.socketNr}/`;
    }

// depending on browser, go full screen
export function goFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        document.documentElement.msRequestFullscreen();
    }
}

// create the team visualisation and append it to the teamElement
export function teamCollection(teamElement) {
    // Create the <div> element with id="svg-team"
    const svgTeamDiv = document.createElement('div');
    svgTeamDiv.id = 'svg-team';

    // Create the <div> element with class="toast-container" and id="toast-container"
    const toastContainerDiv = document.createElement('div');
    toastContainerDiv.className = 'toast-container';
    toastContainerDiv.id = 'toast-container';


    // Alternatively, you can append them to a specific parent element
    teamElement.appendChild(svgTeamDiv);
    teamElement.appendChild(toastContainerDiv);
    createTeam();
}

// create the mustererkennung neural net visualization and append it to the meElement
export function mustererkennung(meElement) {
    // Create the <div> element with id="muster-team"
    const musterTeamDiv = document.createElement('div');
    musterTeamDiv.id = 'muster-team';

    meElement.appendChild(musterTeamDiv);
    createMustererkennung();
}

/////////////////////////////////////////////////////////////////////////////////////

// create a input field, append it to the inputElement and allow submitting the form on return
export function inputField(inputElement) {
    console.log('====> inputField', inputElement);
    // Create the form element
    const form = document.createElement('form');

    // Create the input element
    const inputField = document.createElement('textarea');
    inputField.name = 'input';
    inputField.style.width = '300px';
    inputField.style.height = '60px';

    // Append the input field to the form
    form.appendChild(inputField);

    // Append the form to the body (or any other parent element)
    inputElement.appendChild(form);

    // register the submitOnReturn function to the input field
    addSubmitOnReturn(inputField, inputElement.id);
};

// collect the input field value and send it to the server
export async function inputCollection(collectionElement){
    console.log('====> inputCollection', collectionElement);
    console.log('inputCollection', collectionElement);
    // get data ref attribute
    const qid = collectionElement.getAttribute('data-ref');
    console.log('qid', qid);
    const argConfig = JSON.parse(collectionElement.getAttribute('data-argConfig'));
    console.log('argConfig', argConfig);
    await resultsBoard(collectionElement, argConfig);
}

/////////////////////////////////////////////////////////////////////////////////////

// create a likert scale, append it to the likertElement
export function pollField(pollElement) {
    console.log('====> pollField', pollElement);
    likertField(pollElement);
}

// show the percentage of responses to the likert scale
export async function pollPercentage(percentageElement){
    // create button
    showPercentage(percentageElement);
    
}


/////////////////////////////////////////////////////////////////////////////////////

// make a animated gif clickable // fails

// document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".clickable-gif").forEach((img) => {
//         let isPaused = false;

//         // Create a SuperGif instance and pass required options
//         let superGif = new SuperGif(img, { autoPlay: false });

//     });
// });




// use like this
// <img class="clickable-gif" src="images/animated.gif" data-src="images/animated.gif" data-paused="false" alt="animated gif">
// ![](animation.gif){.clickable-gif data-src="animation.gif" data-paused="false"}