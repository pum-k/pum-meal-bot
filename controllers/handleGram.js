const Meal = require('../models/mealModel')
const nutritionData = require('../utils/nutritionData')
const userState = require('../utils/state') // Import userState

const handleGram = async (chatId, text, bot) => {
  if (!isNaN(text) && userState[chatId]) {
    const grams = parseFloat(text)
    const ingredientName = userState[chatId].ingredient
    const ingredient = nutritionData[ingredientName]

    const { protein, fat, carb, calories } = ingredient.nutritionPer100g
    const totalProtein = (protein * grams) / 100
    const totalFat = (fat * grams) / 100
    const totalCarb = (carb * grams) / 100
    const totalCalories = (calories * grams) / 100

    const meal = new Meal({
      chatId,
      ingredient: ingredientName,
      grams,
      protein: totalProtein,
      fat: totalFat,
      carb: totalCarb,
      calories: totalCalories
    })
    await meal.save()

    bot.sendMessage(chatId, `Khối lượng dinh dưỡng của ${grams}g ${ingredientName}:\n`
      + `- Protein: ${totalProtein.toFixed(2)}g\n`
      + `- Fat: ${totalFat.toFixed(2)}g\n`
      + `- Carb: ${totalCarb.toFixed(2)}g\n`
      + `- Calories: ${totalCalories.toFixed(2)} kcal`)

    delete userState[chatId] // Xóa trạng thái sau khi xử lý xong
  } else {
    bot.sendMessage(chatId, 'Vui lòng nhập một số hợp lệ hoặc nhập nguyên liệu trước.')
  }
}

module.exports = handleGram
