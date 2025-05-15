// populate the Daily Log to get the total Meal & Exercise kcal
const getTotalKcal = async (daily) => {
    let totalMealKcal = 0;
    await daily.populate('mealLogs')
    .then(res => {
        for (m of res.mealLogs){
            totalMealKcal += m.kcal;
        }
    })
    daily.totalMealKcal = totalMealKcal;

    let totalExerciseKcal = 0;
    await daily.populate('exerciseLogs')
    .then(res => {
        for (e of res.exerciseLogs){
            totalExerciseKcal += e.kcal;
        }
    })
    daily.totalExerciseKcal = totalExerciseKcal;

    daily.kcalBalance = totalMealKcal - totalExerciseKcal;

    return daily;
}

module.exports = getTotalKcal;