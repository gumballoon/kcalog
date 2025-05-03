const mealForm = document.querySelector('#meal-form');
const mealIngredients = document.querySelector('#meal-ingredients');
const mealAddIngredient = document.querySelector('#add-ingredient');
const mealIngredientTemplate = mealIngredients.querySelector('.ingredient').outerHTML;
const mealNoIngredient = document.querySelector('#no-ingredient');

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
                mealNoIngredient.classList.remove('d-none');
            }
        })
    }
}
// to apply it on the starting ingredient box
activateRemoveIngredient();

// to add a new ingredient box (identical to the starting box)
mealAddIngredient.addEventListener('click', function(){
    let newIngredient = document.createElement('div');
    mealIngredients.appendChild(newIngredient);
    newIngredient.outerHTML = mealIngredientTemplate;
    activateRemoveIngredient();

    // to get the complete div w/ all the child elements
    newIngredient = mealIngredients.lastElementChild;
    
    // to get a unique index
    const index = getIngredientCount() - 1;
    newIngredient.setAttribute('data-index', index)

    // to give a unique ID/name to the inputs (+ labels)
    const search = newIngredient.querySelector('input[type="search"]');
    const searchLabel = newIngredient.querySelector(`label[for=${search.id}]`);
    const grams = newIngredient.querySelector('input[type="number"]');
    const gramsLabel = newIngredient.querySelector(`label[for=${grams.id}]`);

    search.id = `ingredient-${index}`;
    search.name = `meal[ingredients][${index}][name]`;
    searchLabel.setAttribute('for', search.id);
    grams.id = `grams-${index}`;
    grams.name = `meal[ingredients][${index}][grams]`;
    gramsLabel.setAttribute('for', grams.id);

    // to hide the "no ingredient selected" message (if it was displayed)
    if(!mealNoIngredient.classList.contains('d-none')){
        mealNoIngredient.classList.add('d-none')
    }
})

// to prevent the form submition if there are no ingredients
mealForm.addEventListener('submit', function(e){
    if(getIngredientCount() === 0) {
        e.preventDefault();
    }
})