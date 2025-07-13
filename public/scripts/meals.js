const form = document.querySelector('form');
const submit = document.querySelector('#submit');
const mealName = document.querySelector('#name');
const notUnique = document.querySelector('#not-unique');
const single = document.querySelector('#single');
const full = document.querySelector('#full');
const totalGrams = document.querySelector('#total-grams');
const mealIngredients = document.querySelector('#meal-ingredients');
const mealIngredientTemplate = mealIngredients.querySelector('.ingredient').outerHTML;
const newIngredient = document.querySelector('#new-ingredient');
const noIngredient = document.querySelector('#no-ingredient');
const totalKcal = document.querySelector('#total-kcal');
const defaultIngredients = document.querySelectorAll('.ingredient');
const defaultTags = document.querySelectorAll('.tag');

// to enable/disable the submit button
function isFormValid() {
    submit.setAttribute('disabled', 'true');

    const allRequired = document.querySelectorAll('input[required]');
    const invalidInputs = Array.from(allRequired).filter(i => !i.checkValidity());

    if (invalidInputs.length === 0) {
        submit.removeAttribute('disabled');
    }
}

// to check if the NAME value is unique in the DB //
if (mealName) {
    mealName.addEventListener('input', function(){
        if(allMealNames.includes(this.value.toLowerCase().trim())) {
            notUnique.classList.remove('d-none');
        } else {
            notUnique.classList.add('d-none');
            isFormValid();
        }
    })
}

// to hide/show totalGrams (depending on the SERVING) //
if (totalGrams) {
    // to recover the previously inserted TotalGrams (on EDIT)
    const storedTotalGrams = totalGrams.value || 0;
    for (let serving of [single, full]) {
        serving.addEventListener('input', function(){
            if (!full.checked) {
                totalGrams.disabled = true;
                totalGrams.value = '';
            } else {
                totalGrams.disabled = false;
                totalGrams.value = storedTotalGrams;
            }
        })
    }
}

// INGREDIENTS //
function getIngredientCount() {
    const allIngredients = document.querySelectorAll('.ingredient')
    return allIngredients.length;
}

function autoFillTotalKcal() {
    const allKcalInputs = document.querySelectorAll('.kcal-input');
    let total = 0;
    for (let k of allKcalInputs) {
        if (k.value) {
            total += parseInt(k.value);
        } else {
            total += 0;
        }
    }
    totalKcal.value = total;
    isFormValid();
}
// to calculate the TotalKcal of the default ingredients
autoFillTotalKcal();

// to give a unique ID/name to the inputs & labels of an .ingredient
function indexIngredientElements(ing, index) {
    ing.setAttribute('data-index', index)
    
    const name = ing.querySelector('.name-input');
    const nameLabel = ing.querySelector(`.name-label`);
    const unit = ing.querySelector('.unit-input');
    const unitLabel = ing.querySelector(`.unit-label`);
    const quantity = ing.querySelector('.quantity-input');
    const quantityLabel = ing.querySelector(`.quantity-label`);
    const kcal = ing.querySelector('.kcal-input');
    const kcalLabel = ing.querySelector(`.kcal-label`);

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

// to add functionalities like auto-fill & remove ingredient
function addIngredientEvents(ing) {
    const name = ing.querySelector('.name-input');
    const unit = ing.querySelector('.unit-input');
    const quantity = ing.querySelector('.quantity-input');
    const kcal = ing.querySelector('.kcal-input');

    // to auto-fill the fields UNIT & KCAL if the ingredient exists in the DB
    name.addEventListener('input', function() {
        const ingName = name.value.toLowerCase().trim();
        if (allIngredients[ingName]) {
            unit.value = allIngredients[ingName].unit;
        }
        // reset QUANTITY, KCAL & TOTAL KCAL if the ingredient is changed
        quantity.value = 0;
        kcal.value = 0;
        autoFillTotalKcal();
    })
    quantity.addEventListener('change', function() {
        const ingName = name.value.toLowerCase().trim();
        if (allIngredients[ingName]) {
            kcal.value = Math.round(this.value * allIngredients[ingName].kcalPerUnit);
        }
        if (!this.value) this.value = 0;
        autoFillTotalKcal();
    }) 

    // to auto-fill KCAL if the value is deleted (0) & update TotalKcal w/ every KCAL change
    kcal.addEventListener('change', function() {
        if (!this.value) {
            this.value = 0;
        }
        autoFillTotalKcal();
    })

    // to activate the remove-ingredient [X]
    const button = ing.querySelector('.remove-ingredient');
    button.addEventListener('click', function(){
        ing.remove();
        autoFillTotalKcal();

        // to re-index all Ingredient Boxes
        const allIngs = document.querySelectorAll('.ingredient');
        for (let i = 0; i < getIngredientCount(); i++) {
            indexIngredientElements(allIngs[i], i);
        }

        // to show the "no ingredient selected" message if there are no ingredients + disable the submit button
        if (getIngredientCount() === 0){
            noIngredient.classList.remove('d-none');    
            submit.setAttribute('disabled', 'true');
        }
    })
}
// to apply the functionalites on the default ingredients
for (let ing of defaultIngredients) {
    addIngredientEvents(ing);
}

function addNewIngredient() {
    let ing = document.createElement('div');
    mealIngredients.appendChild(ing);
    ing.outerHTML = mealIngredientTemplate;

    // to get the complete div w/ all the child elements
    ing = mealIngredients.lastElementChild;

    // to reset all input values of the template (for EDIT)
    const allInputs = ing.querySelectorAll('input');
    for (let i of allInputs) {
        if (i.type === 'search') i.value = ''
        else if (i.type === 'number') i.value = '0';
    }
    addIngredientEvents(ing);

    // to get a unique index
    const index = getIngredientCount() - 1;
    // to give a unique ID/name to the inputs + labels
    indexIngredientElements(ing, index)

    // to hide the "no ingredient selected" message (if it was displayed)
    if(!noIngredient.classList.contains('d-none')){
        noIngredient.classList.add('d-none')
    }

    return ing;
}

newIngredient.addEventListener('click', function(){
    addNewIngredient();
    isFormValid();
})

// TAGS //
const tagInput = document.querySelector('#tag-input');
// hidden input to store the inserted tags
const tags = document.querySelector('#tags');
const insertedTags = document.querySelector('#inserted-tags')
let tagsArray = []
if (tags.value) {
    tagsArray = tags.value.split('+++');
    console.log(tagsArray);
}

// to remove the tag when clicked-on
function removeTag(tag) {
    tag.addEventListener('click', function() {
        const tagName = this.querySelector('.tag-name').textContent;
        this.remove();
        tagsArray = tagsArray.filter(t => ( t !== tagName ));
    })
}

// to add the remove feature on the default tags (on EDIT)
for (let tag of defaultTags) {
    removeTag(tag);
}

// to display the inserted tags & store them on tagsArray
tagInput.addEventListener('focusout', function() {
    const tagName = this.value.toLowerCase().trim();
    if (tagName) {
        if (!tagsArray.includes(tagName)) {
            tagsArray.push(tagName);
            console.log(tagsArray);
    
            const newTag = document.createElement('small');
            newTag.classList.add('btn', 'btn-sm', 'btn-light', 'm-3', 'position-relative', 'tag')
            newTag.innerHTML = `<span class="tag-name">${tagName}</span>
            <span class="badge text-bg-light text-muted position-absolute top-0 start-100 translate-middle d-none">X</span>
            `

            removeTag(newTag);

            // to show the added tag & reset the input
            insertedTags.appendChild(newTag);
        }
    }
    this.value = null;
})

// to prevent the form submition (if there are no ingredients) & pass-in the tagsArray
form.addEventListener('submit', function(e){
    if (form.id === 'meal-form' && getIngredientCount() === 0) {
        e.preventDefault();
    } else {
        if (tagsArray) {
             // to convert the array into a string w/ a custom separator
            tags.value = tagsArray.join('+++');
        }
    }
})