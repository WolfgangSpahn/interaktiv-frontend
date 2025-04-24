import {doFetch} from "./services.js";

export async function addSubmitOnReturn(inputField, formId) {
    console.log('====> addSubmitOnReturn', inputField, formId);
    inputField.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent the form from submitting in the default way
            console.log('Enter pressed to submit the form', inputField, inputField.value, formId);

            // Assuming submitForm takes the input field's value and the form's id
            if (localStorage.getItem('nickname') == '-') {
                alert('Please set your nickname first!');
                return;
            }
            var value = inputField.value;
            let data = {"answer": value, "qid":formId, "user":localStorage.getItem('nickname')};
            doFetch("answer", "POST", data, null) ;
            inputField.value = ''; // Clear the input field
        }
        else if (event.key === 'Enter' && event.shiftKey) {
        }
    });

}