const form = document.querySelector('form');
const ingredientName = document.querySelector('#name');
const kcalPerUnit = document.querySelector('#kcalPerUnit');
const notUnique = document.querySelector('#not-unique')
const submit = document.querySelector('#submit');

ingredientName.addEventListener('input', function(){
    const value = this.value.toLowerCase().trim();

    // EDIT page (if the var foundIngredient has been declared...)
    if (typeof foundIngredient !== 'undefined') { 
        // to remove the saved instance's name from allNames
        const validNames = allNames.filter(n => n !== foundIngredient.name)
        if(validNames.includes(value)) {
            notUnique.classList.remove('d-none');
            submit.setAttribute('disabled', 'true');
        } else {
            notUnique.classList.add('d-none');
            if (this.checkValidity() && kcalPerUnit.checkValidity()) {
                submit.removeAttribute('disabled');
            } else {
                submit.setAttribute('disabled', 'true');
            }
        }

    // NEW page
    }  else {
        if(allNames.includes(value)) {
            notUnique.classList.remove('d-none');
            submit.setAttribute('disabled', 'true');
        } else {
            notUnique.classList.add('d-none');
            if (this.checkValidity() && kcalPerUnit.checkValidity()) {
                submit.removeAttribute('disabled');
            } else {
                submit.setAttribute('disabled', 'true');
            }
        }
    }
})

kcalPerUnit.addEventListener('input', function(){
    if (this.checkValidity() && ingredientName.checkValidity()) {
        submit.removeAttribute('disabled');
    } else {
        submit.setAttribute('disabled', 'true');
    }
})