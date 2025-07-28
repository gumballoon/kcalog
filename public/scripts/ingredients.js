const allCategoryButtons = document.querySelectorAll('.category-button');
const form = document.querySelector('form');
const ingredientName = document.querySelector('#name');
const kcalPerUnit = document.querySelector('#kcalPerUnit');
const notUnique = document.querySelector('#not-unique');
const submit = document.querySelector('#submit');

// if the var 'intoView' has been declared...
if (typeof intoView !== 'undefined') {
    const id = '#id_' + intoView;
    const ingredientToFocus = document.querySelector(id);
    if (ingredientToFocus) {
        // scroll into view the new/edited ingredient
        ingredientToFocus.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
}

// scroll into view the clicked category
if (allCategoryButtons && allCategoryButtons.length) {
    for (let button of allCategoryButtons) {
        button.addEventListener('click', function() {
            const categoryToFocus = document.querySelector('#' + this.innerText);
            if (categoryToFocus) {
                categoryToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        })
    }
}

// check if the NAME value is unique in the DB
if (ingredientName) {
    ingredientName.addEventListener('input', function(){
        const value = this.value.toLowerCase().trim();

        // EDIT page (if the var 'ingredient' has been declared...)
        if (typeof ingredient !== 'undefined') { 
            // to remove the saved instance's name from allNames
            const validNames = allNames.filter(n => n !== ingredient.name)
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
}

if (kcalPerUnit) {
    kcalPerUnit.addEventListener('input', function(){
        if (this.checkValidity() && ingredientName.checkValidity() && notUnique.classList.contains('d-none')) {
            submit.removeAttribute('disabled');
        } else {
            submit.setAttribute('disabled', 'true');
        }
    })
}