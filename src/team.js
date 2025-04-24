
import { getNickname, getNicknames, getIPSocket,BASE_URL, setNickname } from './services.js';
import { showToast } from './draw.js';
import { v4 as uuidv4 } from 'uuid';

let version = '1.0.0';
// Description: This file contains the list of team members.
const icons = [ { name: "Ameise", path: "animal-ant-domestic-svgrepo-com.svg"},
                { name: "Fisch", path: "animal-aquarium-domestic-svgrepo-com.svg"},
                { name: "Thunfisch", path: "animal-aquarium-domestic2-svgrepo-com.svg"},
                { name: "Kücken", path: "animal-babyduck-domestic-svgrepo-com.svg"},
                { name: "Fledermaus", path: "animal-bat-domestic-3-svgrepo-com.svg"},
                { name: "Vogel", path: "animal-bird-domestic-2-svgrepo-com.svg"},
                { name: "Papagei", path: "animal-bird-domestic-4-svgrepo-com.svg"},
                { name: "Eisvogel", path: "animal-bird-domestic-svgrepo-com.svg"},
                { name: "Schmetterling", path: "animal-bug-butterfly-svgrepo-com.svg"},
                { name: "Libelle", path: "animal-bug-domestic-2-svgrepo-com.svg"},
                { name: "Fliege", path: "animal-bug-domestic-4-svgrepo-com.svg"},
                { name: "Biene", path: "animal-bug-domestic-6-svgrepo-com.svg"},
                { name: "Käfer", path: "animal-bug-domestic-svgrepo-com.svg"},
                { name: "Bulle", path: "animal-bull-domestic-svgrepo-com.svg"},
                { name: "Katze", path: "animal-cat-domestic-2-svgrepo-com.svg"},
                { name: "Kater", path: "animal-cat-domestic-svgrepo-com.svg"},
                { name: "Kuh", path: "animal-cow-domestic-svgrepo-com.svg"},
                { name: "Krabbe", path: "animal-crab-domestic-svgrepo-com.svg"},
                { name: "Krokodil", path: "animal-crocodile-domestic-svgrepo-com.svg"},
                { name: "Hund", path: "animal-dog-domestic-3-svgrepo-com.svg"},
                { name: "Bernhardiner", path: "animal-dog-domestic-svgrepo-com.svg"},
                { name: "Taube", path: "animal-domestic-dove-svgrepo-com.svg"},
                { name: "Gibbon", path: "animal-domestic-face-2-svgrepo-com.svg"},
                { name: "Bär", path: "animal-domestic-face-3-svgrepo-com.svg"},
                { name: "Schimpanse", path: "animal-domestic-face-4-svgrepo-com.svg"},
                { name: "Frosch", path: "animal-domestic-frog-svgrepo-com.svg"},
                { name: "Giraffe", path: "animal-domestic-giraffe-svgrepo-com.svg"},
                { name: "Igel", path: "animal-domestic-hedgehog-svgrepo-com.svg"},
                { name: "Koala", path: "animal-domestic-koala-svgrepo-com.svg"},
                { name: "Löwe", path: "animal-domestic-lion-svgrepo-com.svg"},
                { name: "Maus", path: "animal-domestic-mouse-svgrepo-com.svg"},
                { name: "Octopus", path: "animal-domestic-octopus-2-svgrepo-com.svg"},
                { name: "Qualle", path: "animal-domestic-octopus-3-svgrepo-com.svg"},
                { name: "Tintenfisch", path: "animal-domestic-octopus-svgrepo-com.svg"},
                { name: "Gorilla", path: "animal-domestic-orangoutang-svgrepo-com.svg"},
                { name: "Orangutan", path: "animal-domestic-orangoutang2-svgrepo-com.svg"},
                { name: "Eule", path: "animal-domestic-owl-svgrepo-com.svg"},
                { name: "Panda", path: "animal-domestic-panda-svgrepo-com.svg"},
                { name: "Nasshorn", path: "animal-domestic-pet-12-svgrepo-com.svg"},
                { name: "Orca", path: "animal-domestic-pet-13-svgrepo-com.svg"},
                { name: "Schildkröte", path: "animal-domestic-pet-15-svgrepo-com.svg"},
                { name: "Hai", path: "animal-domestic-pet-17-svgrepo-com.svg"},
                { name: "Wal", path: "animal-domestic-pet-2-svgrepo-com.svg"},
                { name: "Esel", path: "animal-domestic-pet-3-svgrepo-com.svg"},
                { name: "Schlange", path: "animal-domestic-pet-5-svgrepo-com.svg"},
                { name: "Biber", path: "animal-domestic-pet-6-svgrepo-com.svg"},
                { name: "Schnecke", path: "animal-domestic-pet-7-svgrepo-com.svg"},
                { name: "Schwein", path: "animal-domestic-pet-svgrepo-com.svg"}
]

function isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
}

function isValidName(name) {
    // check if name is in above icons list
    return icons.some(icon => icon.name === name);
}


// Define the callback function
async function handleIconClick(icon, board) {
    console.log(`clicked on ${icon.name}`);
    let response = await setNickname(icon.name, localStorage.getItem('uuid'));
    if (response !== null) {
        console.log(`nickname set for ${localStorage.getItem('uuid')}: ${icon.name}`);
        localStorage.setItem('nickname',icon.name);
        // update the opacity of the icon
        updateIconOpacity(icon.name);
        // update the text board
        board.text(`Hallo\n${icon.name}`);
        // update the footer text
        changeFooter(icon.name);
        // Optionally make all icons unclickable
        setAllIconsUnclickable();
    } else {
        showToast('Error setting nickname', true);
    }
}

/**
 * Asynchronously creates a team SVG drawing by placing icons in a grid and updating UI elements.
 * 
 * @returns {Promise<void>} - This function does not return any value. It updates the SVG and localStorage, and interacts with server data.
 * 
 * @description
 * This function initializes an SVG drawing using the `svg.js` library to create a grid layout of icons. It performs the following key tasks:
 * 
 * 1. **SVG Drawing Setup**:
 *    - Creates an SVG canvas and sets its size to 1200x620 pixels.
 *    - Defines initial x and y coordinates and the width and height for each icon.
 * 
 * 2. **Fetching Server Data**:
 *    - Fetches the IP socket data by calling `getIPSocket()` and stores a UUID in `localStorage`.
 *    - Checks if a nickname exists on the server for the UUID by calling `getNickname()`. If found, it stores the nickname in `localStorage`.
 *    - Fetches all nicknames from the server by calling `getNicknames()`. If the request fails, an empty list is returned.
 * 
 * 3. **UI Elements**:
 *    - Creates a text board displaying a greeting and the nickname (if available) using bold, black text.
 *    - Updates the footer with the current nickname or a "NOT YET LOGGED IN" message.
 *    - Draws a rectangle and other informational texts (UUID, IP and socket number, version) on the canvas.
 * 
 * 4. **Icon Grid Generation**:
 *    - Iterates over the `icons` array to create a grid of icons, positioning each icon at (x, y) and increasing `x` and `y` to place icons in rows.
 *    - If the icon's name is not registered in the `nicknames` array, it is made clickable, allowing interaction via the `handleIconClick` function.
 *    - If the icon's name is in the `nicknames`, the icon remains unclickable and is displayed with reduced opacity.
 * 
 * 5. **Dynamic Updates**:
 *    - Calls `fetchNamesAndUpdateIcons()` to dynamically update the icons on the grid with the fetched names from the server.
 * 
 * @example
 * // Example usage:
 * await createTeam();
 * 
 * // Expected behavior:
 * // The function creates an SVG grid of icons, updates the UI with nickname and socket info, and enables interaction with unregistered icons.
 */
export async function createTeam(){
    // create a svg drawing by placing above icons in a grid using svg.js
    const draw = SVG().size('100%', '100%').addTo('#svg-team').size(1200, 620);
    let x = 0;
    let y = 0;
    let width = 95;
    let height = 95;
    let iconCount = 0;
    let ip_socket = await getIPSocket();
    
    // check wether we have a valid uuid in localStorage, if not create one
    let uuid = localStorage.getItem('uuid');
    if (!uuid || !isValidUUID(uuid)) {
        uuid = uuidv4();
        localStorage.setItem('uuid', uuid);
    }
    // check if server has already a nickname for this uuid; getNickname returns to null if not
    let nickname = await getNickname(localStorage.getItem('uuid'));
    localStorage.setItem('nickname',nickname);

    // get all nicknames from the server, if possible otherwise return an empty list
    let nicknames = await getNicknames();
    console.log(`nicknames: ${nicknames}`);

    // create a text board in bold
    let board = draw.text(`Hallo\n${localStorage.getItem('nickname') || ''}`)
                .move(900, 300)
                .font({ size: 48, weight: 'bold' })
                .fill('black')
    
    // create a footer text
    if (localStorage.getItem('nickname') === '-') {
        changeFooter("NOT YET LOGGED IN");
    } else {
        changeFooter(`${localStorage.getItem('nickname')}`);
    }


    // create a rectangle and text for the uuid, ip and socket number
    draw.rect(770, 585).fill('white').stroke({ width: 1, color: 'black' });
    draw.text(localStorage.getItem('uuid')).move(850, 30).font({ size: 16 })
    draw.text(`${ip_socket.ip}:${ip_socket.socketNr}`).move(850, 50).font({ size: 16 })
    draw.text("v 0.1.0").move(850, 70).font({ size: 16 })

    // iterate over the icons and create a grid of icons
    let icon = icons[iconCount];
    for (iconCount = 0; iconCount < icons.length; iconCount++) {
        let icon = icons[iconCount];
        let group = draw.group().translate(x, y).addClass('icon-group');
        group.image(`images/icons/${icon.path}`, width, height)
            .size(width, height).opacity(0.3)
            .id(`icon-${icon.name}`);

        console.log("DEBUG",localStorage.getItem('nickname'));
        console.log("DEBUG",localStorage.getItem('nickname') === '-');
        // if icon name not already registered (in nicknames) make it clickable
        if (!nicknames.includes(icon.name)) {
                group.addClass('clickable');
                group.click(() => handleIconClick(icon, board));
        } 
        // if icon.name is nickname, set opacity to 1, set board text, and footer text
        if (localStorage.getItem('nickname') === icon.name) {
            group.opacity(1);
            board.text(`Hallo\n${icon.name}`);
            changeFooter(icon.name);
        }
        // add text below the icon
        group.text(icon.name)
            .font({ size: 12 })
            // background color for the text
            .fill('white')
            .stroke('gray')
            .center(width/2, height );
        x += width;
        if (x >= 750) {
            x = 0;
            y += height;
        }
    };
    // fetch the names from the server and update the icons
    fetchNamesAndUpdateIcons()
};

// ------------------------------ handle events ----------------------------

window.eventSource = new EventSource(`${BASE_URL}events`); //why is necessary as I have defined it in main.js
let pingCount = 0;

eventSource.addEventListener('PING', function(event) {
    console.log('Ping received:', event);
    pingCount++;
    // textcontent'/' when pingcount is even and '\' when pingcount is odd

    // document.getElementById('pingshow').textContent = `${pingCount % 2 === 0 ? '/' : '\\'}`;
});

eventSource.addEventListener('NICKNAME', function(event) {
    console.log('Nickname received:', event);
    const data = JSON.parse(event.data);
    console.log('New nickname:', data.nicknames);
    data.nicknames.forEach(name => updateIconOpacity(name))
});

eventSource.onopen = function() {
    console.log('Connection opened.');
};

eventSource.onerror = function(event) {
    console.log('EventSource encountered an error:', event);
};
// ------------------------------ functions -----------------------------


/**
 * Asynchronously fetches nicknames from the server and updates the icon opacity based on the fetched data.
 * 
 * @returns {Promise<void>} - This function does not return any value. It updates the icons' opacity based on the server data.
 * 
 * @description
 * This function retrieves a list of nicknames from the server using the `getNicknames` function, 
 * and updates the opacity of icons based on whether their name is present in the fetched list.
 * 
 * - It first calls `getNicknames()` to fetch the current list of nicknames from the server.
 * - It then iterates through the global `icons` array to check if each icon's `name` is in the fetched `nicknames` array.
 * - If the icon's name is found in the list of nicknames, it updates the opacity of the corresponding icon by calling the `updateIconOpacity(icon.name)` function, setting its opacity to 1.
 * 
 * This function ensures that the UI dynamically reflects changes based on the server data, making certain icons visually distinct based on their registration status (names that exist on the server).
 * 
 * @example
 * // Example usage:
 * await fetchNamesAndUpdateIcons();
 * 
 * // Expected behavior:
 * // The function fetches the list of nicknames and updates the opacity of icons that have matching names in the server data.
 */
async function fetchNamesAndUpdateIcons() {
        let nicknames = await getNicknames();
        // Update the icons based on the fetched names
        icons.forEach(icon => {
            if (nicknames.includes(icon.name)) {
                // If the name is in the list, set the opacity to 1
                updateIconOpacity(icon.name);
            }
        });
}


// Function to update the opacity of the icon
function updateIconOpacity(name) {
    const icon = document.getElementById(`icon-${name}`);
    if (icon) {
        icon.style.opacity = 1;
        // remove the clickable class
        icon.classList.remove('clickable');
        // get parent group and remove the click event
        // const group = icon.parentElement;
        // group.off('click');
    } else {
        console.error('Icon not found for:', name);
    }
}

// Function to set all icons unclickable
function setAllIconsUnclickable() {
    const icons = document.getElementsByClassName('icon-group');
    for (let icon of icons) {
        icon.classList.remove('clickable');
        // Remove click for svg.js group
        let iconSvg = SVG.adopt(icon);
        iconSvg.click(null);
    }
}


// change the footer text by getting the first footer element and updating the paragraph text
function changeFooter(footerText) {
    // Get the first element with the class 'footer'
    var footerElements = document.getElementsByClassName('footer');
    
    if (footerElements.length === 0) {
        console.error('No footer element found');
        return; // Exit the function if no footer element is found
    }
    
    // Assuming the footer is a simple div or similar element
    var footer = footerElements[0]; // Get the first (or only) 'footer' element
    
    // Get the paragraph element within the footer, assuming there's at least one
    var paragraph = footer.getElementsByTagName('p')[0];
    
    if (!paragraph) {
        // If no paragraph exists, create one and append it to the footer
        paragraph = document.createElement('p');
        footer.appendChild(paragraph);
    }
    
    // Change the text content of the paragraph element
    paragraph.textContent = footerText;
}
