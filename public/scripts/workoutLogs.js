const form = document.querySelector('form');
const submit = document.querySelector('#submit');

const date = document.querySelector('#date');
const workout = document.querySelector('#name');

console.log(date.value)

function isFormValid() {
    submit.setAttribute('disabled', 'true');
    if (date.checkValidity() && workout.checkValidity()) {
        submit.removeAttribute('disabled');
    }
}

for (let input of [date, workout]) {
    input.addEventListener('change', function() {
        isFormValid();
    })
}