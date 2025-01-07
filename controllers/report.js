const Meal = require('../models/mealModel')

const handleReport = async (chatId, bot) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Đặt thời gian về đầu ngày

  try {
    const meals = await Meal.find({ chatId, date: { $gte: today } })
    if (meals.length === 0) {
      return bot.sendMessage(chatId, 'Bạn chưa nhập bữa ăn nào hôm nay.')
    }

    const total = meals.reduce((acc, meal) => {
      acc.protein += meal.protein
      acc.fat += meal.fat
      acc.carb += meal.carb
      acc.calories += meal.calories
      return acc
    }, { protein: 0, fat: 0, carb: 0, calories: 0 })

    const reportMessage = `
Báo cáo tổng hợp bữa ăn hôm nay:
- Tổng Protein: ${total.protein.toFixed(2)}g
- Tổng Fat: ${total.fat.toFixed(2)}g
- Tổng Carb: ${total.carb.toFixed(2)}g
- Tổng Calories: ${total.calories.toFixed(2)} kcal
`
    bot.sendMessage(chatId, reportMessage)
  } catch (error) {
    console.error('Error generating report:', error)
    bot.sendMessage(chatId, 'Đã xảy ra lỗi khi tạo báo cáo.')
  }
}

module.exports = handleReport
