// Base URL of the backend API, replace with your actual AWS API Gateway or server endpoint
const BASE_URL = 'https://sebayt.ch/interaktiv/';  // AWS endpoint
// const BASE_URL = 'http://localhost/interaktiv/';  // localhost endpoint

export { BASE_URL };

/**
 * Asynchronously performs an HTTP request using the Fetch API with the specified method and options.
 * 
 * @param {string} url                    - The URL to which the request is sent. Can be absolute or relative.
 * @param {string} method                 - The HTTP method to be used for the request (e.g., 'GET', 'POST', 'PUT', 'PATCH').
 * @param {Object|null} [data=null]       - Optional. The data to be sent as the request body, used for methods like POST, PUT, and PATCH. If not provided, it defaults to null.
 * @param {Function|null} [callback=null] - Optional. A legacy callback function that is invoked with the response data, if provided. Defaults to null.
 * 
 * @returns {Promise<Object|null>}        - Returns a promise that resolves to the JSON-parsed response if the request is successful, or `null` if there is an error or the response is not OK.
 * 
 * @description
 * The function starts by constructing the `fetchOptions` object, which includes the HTTP method and headers.
 * If the request method is one of 'POST', 'PUT', or 'PATCH' and data is provided, it adds a 'Content-Type' header
 * and serializes the data to JSON, attaching it as the request body.
 * 
 * The function ensures the URL is absolute. If it is a relative URL, it appends it to the `BASE_URL`.
 * 
 * It then performs the fetch using the Fetch API and processes the response:
 * 1. If the response is not OK (status code not in the 2xx range), it logs the error and returns `null`.
 * 2. If the response is OK, it parses the JSON response.
 * 3. If a callback is provided, it is invoked with the parsed JSON response.
 * 4. The parsed JSON response is returned.
 * 
 * If an error occurs during the fetch (network issue, invalid URL, etc.), the function logs the error and returns `null`.
 */
export async function doFetch(url, method, data = null, /* legacy */ callback = null) {
    console.log('====> doFetch', url, method, data);
    const fetchOptions = {
        method: method,
        headers: {}
        //credentials: 'include'  // Include credentials like cookies if needed
    };

    // Only attach the body for methods that typically use a body payload
    if (data !== null && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(data);
    }

    // Ensure URL is absolute, append to BASE_URL if it's relative
    const fetchUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    console.log(`fetching: ${fetchUrl}`);

    try {
        const response = await fetch(fetchUrl, fetchOptions);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error: ${response.status} - ${response.statusText}`, errorText);
            return null;
        }

        const jsonResponse = await response.json();
        if (callback) {
            callback(jsonResponse);
        }
        return jsonResponse;
    } catch (error) {
        console.error('Error during fetch:', error);
        return null;
    }
}

/**
 * Asynchronously fetches a list of names from the server and updates corresponding icons on the UI.
 * 
 * @returns {Promise<void>} - This function does not return any value. It handles updating the UI elements based on the fetched data.
 * 
 * @description
 * This function fetches a list of names from the server using the `doFetch` function with the 'GET' method.
 * 
 * - If the request is successful and the data is returned:
 *    1. It expects the data to be an array of objects, each containing a 'name' property (e.g., [{name: 'John'}, {name: 'Jane'}, ...]).
 *    2. For each name object in the data, it finds the corresponding icon in the DOM with the ID `#icon-{name}` using the `draw.findOne` method.
 *    3. If an icon is found, it updates the icon's text with the corresponding name from the data.
 *    4. Optionally, additional UI updates can be performed for each icon inside the loop.
 * 
 * - If the fetch fails or returns no data, it logs an error message to the console.
 * 
 * In case of any error during the fetch or UI update process, the function catches the error and logs it.
 * 
 * @example
 * // Example usage:
 * fetchNamesAndUpdateIcons();
 * 
 * // Expected behavior:
 * // If namesData = [{name: 'John'}, {name: 'Jane'}], it will find icons with IDs `#icon-John` and `#icon-Jane`
 * // and update their text content to 'John' and 'Jane', respectively.
 */
export async function fetchNamesAndUpdateIcons() {
    console.log('====> fetchNamesAndUpdateIcons');
    try {
        // Use the doFetch function to fetch the names from the server
        const namesData = await doFetch('names', 'GET');

        if (namesData) {
            // Assume that namesData is an array of objects like [{name: 'John'}, {name: 'Jane'}, ...]
            namesData.forEach(nameData => {
                let icon = draw.findOne(`#icon-${nameData.name}`);
                if (icon) {
                    // Update the icon text or any other necessary information
                    icon.text(nameData.name);
                    // Optionally, add more logic to handle the UI update for each icon
                }
            });
        } else {
            console.error('Failed to fetch names');
        }
    } catch (error) {
        console.error('Error during fetching names and updating icons:', error);
    }
}


/**
 * Asynchronously fetches IP socket information from the server and logs the response.
 * 
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the fetched IP socket information 
 * as an object if the request is successful, or `null` if there is an error or the response is not OK.
 * 
 * @description
 * This function uses the `doFetch` function to send a 'GET' request to the server endpoint `'ipsocket'`.
 * 
 * - It fetches the IP socket information from the server.
 * - The response is logged to the console.
 * - The function then returns the response object.
 * 
 * If the fetch fails or the response is not successful, `doFetch` returns `null`, which is propagated by this function.
 * 
 * @example
 * // Example usage:
 * const ipSocketInfo = await getIPSocket();
 * console.log(ipSocketInfo);
 * 
 * // Expected behavior:
 * // The function will log the response received from the server and return it. If the response contains IP socket data,
 * // it will be logged and returned as an object; otherwise, `null` will be returned.
 */
export async function getIPSocket() {
    console.log('====> getIPSocket');
    let response = await doFetch('ipsocket',"GET");
    console.log(response);
    return response;
}


/**
 * Asynchronously fetches and returns the Likert scale percentage for a given ID.
 * 
 * @param {string|number} id - The unique identifier used to fetch the specific Likert scale data from the server.
 * 
 * @returns {Promise<number|null>} - Returns a promise that resolves to the Likert scale percentage if found,
 * or `null` if the data is not available or there is an error.
 * 
 * @description
 * This function sends a 'GET' request to the `likert/{id}` endpoint using the `doFetch` function to retrieve Likert scale data.
 * 
 * - The function logs the request URL being fetched for debugging purposes.
 * - If a valid response containing the `likert` field is received, it returns the Likert percentage.
 * - If the `likert` field is not present in the response, the function logs an error message indicating that no Likert data was found for the given ID and returns `null`.
 * 
 * If an error occurs during the fetch, or if the response does not contain valid Likert data, `null` is returned.
 * 
 * @example
 * // Example usage:
 * const percentage = await likertPercentage(123);
 * console.log(percentage);  // Expected output: Likert scale percentage or null
 * 
 * // Expected behavior:
 * // If the server response is { likert: 85 }, the function returns 85.
 * // If the response does not contain a 'likert' field, the function logs an error and returns null.
 */
export async function likertPercentage(id){
    console.log('====> likertPercentage', id);
    console.log(`get likert/${id}`);
    let response = await doFetch(`likert/${id}`,"GET");
    console.log(response);
    if ('likert' in response)
        return response['likert'];
    else
        console.log(`no likert found for ${id} ${response}`);
        return null;
}


/**
 * Asynchronously fetches and returns the nickname for a given ID.
 * 
 * @param {string|number} id - The unique identifier used to fetch the specific nickname data from the server.
 * 
 * @returns {Promise<string|null>} - Returns a promise that resolves to the nickname if found, 
 * or `null` if the nickname is not available or there is an error.
 * 
 * @description
 * This function sends a 'GET' request to the `nickname/{id}` endpoint using the `doFetch` function to retrieve the nickname associated with the provided ID.
 * 
 * - The function logs the URL being fetched for debugging purposes.
 * - If a valid response containing the `nickname` field is received, it returns the nickname string.
 * - If the `nickname` field is not present in the response, the function logs an error message indicating that no nickname was found for the given ID and returns `null`.
 * 
 * If an error occurs during the fetch, or if the response does not contain valid nickname data, `null` is returned.
 * 
 * @example
 * // Example usage:
 * const nickname = await getNickname(456);
 * console.log(nickname);  // Expected output: Nickname string or null
 * 
 * // Expected behavior:
 * // If the server response is { nickname: "Johnny" }, the function returns "Johnny".
 * // If the response does not contain a 'nickname' field, the function logs an error and returns null.
 */
export async function getNickname(id){
    console.log('====> getNickname', id);
    console.log(`get nickname/${id}`);

    let response = await doFetch(`nickname/${id}`,"GET");
    console.log(response);
    if ('nickname' in response)
        return response['nickname'];
    else
        console.log(`no nickname found for ${id} ${response}`);
        return "-";
}

/**
 * Asynchronously sets a new nickname for a given user ID by sending a POST request to the server.
 * 
 * @param {string} nickname - The new nickname to be assigned to the user.
 * @param {string|number} id - The unique identifier (UUID) of the user for whom the nickname is being set.
 * 
 * @returns {Promise<Object|null>} - Returns a promise that resolves to the server response if the status is 'success', 
 * or `null` if there is an error or if the response does not indicate success.
 * 
 * @description
 * This function sends a 'POST' request to the `nickname` endpoint to set a new nickname for the user.
 * 
 * - The function logs the nickname and user ID for debugging purposes.
 * - It constructs the request payload as an object with two properties: `"user"` for the nickname and `"uuid"` for the user ID.
 * - The `doFetch` function is used to send the request with the `POST` method, including the payload data.
 * - If the response contains a `status` field with the value `'success'`, the function returns the entire response object.
 * - If the response does not contain a `status` field or the status is not `'success'`, an error is logged, and `null` is returned.
 * 
 * In case of an error or an unsuccessful response, `null` is returned.
 * 
 * @example
 * // Example usage:
 * const result = await setNickname('Johnny', 456);
 * console.log(result);  // Expected output: Server response with status 'success' or null
 * 
 * // Expected behavior:
 * // If the server response is { status: "success", message: "Nickname updated" }, the function returns the response.
 * // If the response does not indicate success, the function logs an error and returns null.
 */
export async function setNickname(nickname,id){
    console.log('====> setNickname', id, nickname);
    console.log(`set nickname: ${id} - ${nickname}`);

    let data = {"user":nickname, "uuid":id};
    let response = await doFetch(`nickname`,"POST",data);
    console.log(+response);
    if ('status' in response && response['status'] == 'success')
        return response;
    else
        console.log(`no status found ${response}`);
        return null;
}

/**
 * Asynchronously fetches a list of nicknames from the server.
 * 
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of nicknames if found, 
 * or an empty array if there is no data or an error occurs.
 * 
 * @description
 * This function sends a 'GET' request to the `nicknames` endpoint using the `doFetch` function to retrieve a list of nicknames.
 * 
 * - The function logs the request to the console for debugging purposes.
 * - If the response contains a `nicknames` field, the function returns the list of nicknames (assumed to be an array).
 * - If the `nicknames` field is not found in the response, it logs an error and returns an empty array.
 * 
 * In case of an error or an unexpected response, the function safely returns an empty array to avoid further issues.
 * 
 * @example
 * // Example usage:
 * const nicknames = await getNicknames();
 * console.log(nicknames);  // Expected output: An array of nicknames or an empty array if no data is available
 * 
 * // Expected behavior:
 * // If the server response is { nicknames: ["Johnny", "Jane", "Bob"] }, the function returns the array ["Johnny", "Jane", "Bob"].
 * // If the response does not contain a 'nicknames' field, the function logs an error and returns an empty array.
 */
export async function getNicknames(){
    console.log('====> getNicknames');
    console.log(`get nicknames`);
    let response = await doFetch(`nicknames`,"GET");
    console.log(response);
    if ('nicknames' in response)
        return response['nicknames'];
    else
        console.log(`no nicknames found ${response}`);
        return [];
}