const mealForm = document.querySelector('#meal-form');

const mealName = document.querySelector('#name');
const notUnique = document.querySelector('#not-unique')
mealName.addEventListener('input', function(){
    if(allNames.includes(this.value.toLowerCase().trim())) {
        notUnique.classList.remove('d-none');
    } else {
        notUnique.classList.add('d-none');
    }
})

const single = document.querySelector('#single');
const multi = document.querySelector('#multi');
const totalGrams = document.querySelector('#totalGrams');

for (let serving of [single, multi]) {
    serving.addEventListener('change', function(){
        totalGrams.disabled = !multi.checked;
    })
}

const mealIngredients = document.querySelector('#meal-ingredients');
const mealIngredientTemplate = mealIngredients.querySelector('.ingredient').outerHTML;
const newIngredient = document.querySelector('#new-ingredient');
const noIngredient = document.querySelector('#no-ingredient');

function getIngredientCount(){
    const allIngredients = document.querySelectorAll('.ingredient')
    return allIngredients.length;
}

// to get all remove-ingredient & add an event to remove their parent
function activateRemoveIngredient(){
    const allButtons = document.querySelectorAll('.remove-ingredient');
    for (let button of allButtons){
        button.addEventListener('click', function(){
            button.parentElement.remove();
            // to show the "no ingredient selected" message if there are no ingredients
            if (getIngredientCount() === 0){
                noIngredient.classList.remove('d-none');
            }
        })
    }
}
// to apply it on the starting ingredient box
activateRemoveIngredient();

// to add a new ingredient box (identical to the starting box)
newIngredient.addEventListener('click', function(){
    let newIngredient = document.createElement('div');
    mealIngredients.appendChild(newIngredient);
    newIngredient.outerHTML = mealIngredientTemplate;
    activateRemoveIngredient();

    // to get the complete div w/ all the child elements
    newIngredient = mealIngredients.lastElementChild;
    
    // to get a unique index
    const index = getIngredientCount() - 1;
    newIngredient.setAttribute('data-index', index)

    // to give a unique ID/name to the inputs + labels
    const search = newIngredient.querySelector('.ingredient-input');
    const searchLabel = newIngredient.querySelector(`.ingredient-label`);
    const unit = newIngredient.querySelector('.unit-input');
    const unitLabel = newIngredient.querySelector(`.unit-label`);
    const quantity = newIngredient.querySelector('.quantity-input');
    const quantityLabel = newIngredient.querySelector(`.quantity-label`);
    const kcal = newIngredient.querySelector('.kcal-input');
    const kcalLabel = newIngredient.querySelector(`.kcal-label`);

    search.id = `ingredient-${index}`;
    search.name = `meal[ingredients][${index}][name]`;
    searchLabel.setAttribute('for', search.id);
    unit.id = `unit-${index}`;
    unit.name = `meal[ingredients][${index}][unit]`;
    unitLabel.setAttribute('for', unit.id);
    quantity.id = `quantity-${index}`;
    quantity.name = `meal[ingredients][${index}][quantity]`;
    quantityLabel.setAttribute('for', quantity.id);
    kcal.id = `kcal-${index}`;
    kcal.name = `meal[ingredients][${index}][kcal]`;
    kcalLabel.setAttribute('for', kcal.id);

    // to hide the "no ingredient selected" message (if it was displayed)
    if(!noIngredient.classList.contains('d-none')){
        noIngredient.classList.add('d-none')
    }
})

// to prevent the form submition if there are no ingredients
mealForm.addEventListener('submit', function(e){
    if(getIngredientCount() === 0) {
        e.preventDefault();
    }
})