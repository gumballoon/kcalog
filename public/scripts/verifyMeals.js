const mealForm = document.querySelector('#meal-form');

const mealName = document.querySelector('#name');
const notUnique = document.querySelector('#not-unique')
mealName.addEventListener('input', function(){
    if(allMealNames.includes(this.value.toLowerCase().trim())) {
        notUnique.classList.remove('d-none');
    } else {
        notUnique.classList.add('d-none');
    }
})

const single = document.querySelector('#single');
const multi = document.querySelector('#multi');
const totalGrams = document.querySelector('#total-grams');

for (let serving of [single, multi]) {
    serving.addEventListener('change', function(){
        totalGrams.disabled = !multi.checked;
    })
}

const mealIngredients = document.querySelector('#meal-ingredients');
const mealIngredientTemplate = mealIngredients.querySelector('.ingredient').outerHTML;
const newIngredient = document.querySelector('#new-ingredient');
const noIngredient = document.querySelector('#no-ingredient');

function getIngredientCount() {
    const allIngredients = document.querySelectorAll('.ingredient')
    return allIngredients.length;
}

const totalKcal = document.querySelector('#total-kcal');
function autoFillTotalKcal() {
    const allKcalInputs = document.querySelectorAll('.kcal-input');
    let total = 0;
    for (let k of allKcalInputs) {
        total += parseInt(k.value);
    }
    totalKcal.value = total;
}

// to give a unique ID/name to the inputs & labels of an Ingredient Box
function indexBoxElements(box, index) {
    box.setAttribute('data-index', index)
    
    const name = box.querySelector('.name-input');
    const nameLabel = box.querySelector(`.name-label`);
    const unit = box.querySelector('.unit-input');
    const unitLabel = box.querySelector(`.unit-label`);
    const quantity = box.querySelector('.quantity-input');
    const quantityLabel = box.querySelector(`.quantity-label`);
    const kcal = box.querySelector('.kcal-input');
    const kcalLabel = box.querySelector(`.kcal-label`);

    name.id = `ingredient-${index}`;
    name.name = `meal[ingredients][${index}][name]`;
    nameLabel.setAttribute('for', name.id);
    unit.id = `unit-${index}`;
    unit.name = `meal[ingredients][${index}][unit]`;
    unitLabel.setAttribute('for', unit.id);
    quantity.id = `quantity-${index}`;
    quantity.name = `meal[ingredients][${index}][quantity]`;
    quantityLabel.setAttribute('for', quantity.id);
    kcal.id = `kcal-${index}`;
    kcal.name = `meal[ingredients][${index}][kcal]`;
    kcalLabel.setAttribute('for', kcal.id);
}


const defaultIngName = document.querySelector('#name-0');
defaultIngName.addEventListener('change', function() {
    const ingBox = this.parentElement.parentElement.parentElement;
    const ingName = this.value.toLowerCase().trim();
    if (allIngredients[ingName]) {
        ingBox.querySelector('.unit-input').value = allIngredients[ingName].unit;
    }
})  
const defaultIngQuantity = document.querySelector('#quantity-0');
defaultIngQuantity.addEventListener('change', function() {
    const ingBox = this.parentElement.parentElement.parentElement;
    const ingName = ingBox.querySelector('.name-input').value.toLowerCase().trim();
    if (allIngredients[ingName]) {
        const kcal = Math.round(this.value * allIngredients[ingName].kcalPerUnit);
        ingBox.querySelector('.kcal-input').value = kcal;
    }
    autoFillTotalKcal();
})  

// to activate all Remove-Ingredient [X]
function activateRemoveIngredient(){
    const allButtons = document.querySelectorAll('.remove-ingredient');
    for (let button of allButtons){
        button.addEventListener('click', function(){
            button.parentElement.parentElement.remove();

            // to re-index all Ingredient Boxes
            const allIngBoxes = document.querySelectorAll('.ingredient');
            for (let i = 0; i < getIngredientCount(); i++) {
                indexBoxElements(allIngBoxes[i], i);
            }

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
    // to give a unique ID/name to the inputs + labels
    indexBoxElements(newIngredient, index)

    // to auto-fill the fields if the ingredient exists in the DB
    const name = newIngredient.querySelector('.name-input');
    name.addEventListener('change', function() {
        const ingBox = this.parentElement.parentElement.parentElement;
        const ingName = this.value.toLowerCase().trim();
        if (allIngredients[ingName]) {
            ingBox.querySelector('.unit-input').value = allIngredients[ingName].unit;
        }
    })
    const quantity = newIngredient.querySelector('.quantity-input');
    quantity.addEventListener('change', function() {
        const ingBox = this.parentElement.parentElement.parentElement;
        const ingName = ingBox.querySelector('.name-input').value.toLowerCase().trim();
        if (allIngredients[ingName]) {
            const kcal = Math.round(this.value * allIngredients[ingName].kcalPerUnit);
            ingBox.querySelector('.kcal-input').value = kcal;
        }
        autoFillTotalKcal();
})  

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