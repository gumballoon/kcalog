const form = document.querySelector('form');
const allInputs = document.querySelectorAll('input');
const submit = document.querySelector('#submit');

for (let i of allInputs) {
    i.addEventListener('input', function(){ 
        if (form.checkValidity()) {
            submit.removeAttribute('disabled');
        } else {
            submit.setAttribute('disabled', 'true');
        }
    })
}