const search = document.querySelector('#search');
const mealInfo = document.querySelector('#meal-info');
const mealData = document.querySelector('#meal-data');
const fullSection = document.querySelector('#full-section');
const fullName = document.querySelector('#full-name');
const fullIngredients = document.querySelector('#full-ingredients');
const fullKcalPerGram = document.querySelector('#full-kcal-per-gram');
const fullImage = document.querySelector('#full-image');
const fullGrams = document.querySelector('#full-grams');
const fullTotalKcal = document.querySelector('#full-total-kcal');

// to remove the ingredient template (which outlinerHTML has already been stored)
mealIngredients.querySelector('.ingredient').remove()

// to populate the mealInfo when a DB meal is selected + pass-in the full Meal object
function populateMealInfo(meal) {
    mealData.value = JSON.stringify(meal);

    if (meal.serving === 'single') {
        for (let i of meal.ingredients) {
            const ing = addNewIngredient();
            const name = ing.querySelector('.name-input');
            name.value = i.name;
            const unit = ing.querySelector('.unit-input');
            unit.value = i.unit;
            const quantity = ing.querySelector('.quantity-input');
            quantity.value = i.quantity;
            const kcal = ing.querySelector('.kcal-input');
            kcal.value = i.quantity;
        };
        autoFillTotalKcal();
        
    } else if (meal.serving === 'full') {
        fullSection.classList.remove('d-none');
        fullName.textContent = meal.name;
        fullImage.src = meal.image;
        for (let i of meal.ingredients) {
            const listItem = document.createElement('li');
            listItem.textContent = i.name;
            fullIngredients.appendChild(listItem);
        }
        fullKcalPerGram.textContent = meal.kcalPerGram;

        mealIngredients.classList.add('d-none');
        serving.value = 'full';
        newIngredient.classList.add('d-none');
        fullGrams.classList.remove('d-none');
        grams.setAttribute('required', 'true');
        totalKcal.classList.add('d-none');
        fullTotalKcal.classList.remove('d-none');
    }

    grams.addEventListener('input', function(){
        if (this.value) {
            fullTotalKcal.value = Math.round(this.value * meal.kcalPerGram);
        }
        isFormValid();
    })

    fullTotalKcal.addEventListener('input', function(){
        if (!this.value) {
            if (grams.value) {
                this.value = Math.round(grams.value * meal.kcalPerGram);
            } else {
                this.value = 0;
            }
        }
        isFormValid();
    })
}

function resetMealInfo() {
    const allIngs = document.querySelectorAll('.ingredient');
    for (let i of allIngs) i.remove();
    mealIngredients.classList.remove('d-none');
    serving.value = 'single';
    newIngredient.classList.remove('d-none');

    fullSection.classList.add('d-none');
    fullGrams.classList.add('d-none');
    grams.value = '';
    grams.removeAttribute('required');
    fullName.textContent = '';
    fullImage.src = '';
    fullIngredients.innerHTML = '';
    fullKcalPerGram.textContent = '';
    
    totalKcal.classList.remove('d-none');
    totalKcal.value = 0;
    fullTotalKcal.classList.add('d-none');
    fullTotalKcal.value = 0;
}

search.addEventListener('input', function() {
    resetMealInfo();
    notes.textContent = '';
    const mealName = search.value.toLowerCase().trim();
    if (!mealName) {
        mealInfo.classList.add('d-none');
    } else if (allMealNames.includes(mealName)) {
        const meal = allMeals.filter(m => m.name === mealName)[0];
        populateMealInfo(meal);
        mealInfo.classList.remove('d-none');
    } else {
        addNewIngredient();
        mealInfo.classList.remove('d-none');
    }

    isFormValid();
})

// (on EDIT view) to populate the mealInfo w/ the mealLog
if(mealLog) {
    resetMealInfo();
    populateMealInfo(mealLog.meal);
    grams.value = mealLog.grams;
    if (mealLog.meal.serving === 'single') {
        totalKcal.value = mealLog.meal.totalKcal;
    } else {
        fullTotalKcal.value = mealLog.fullTotalKcal;
    }
    mealInfo.classList.remove('d-none');
    submit.removeAttribute('disabled');
}