const Meal = require('../models/mealModel')

const handleHistory = async (chatId, bot) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Đặt thời gian về đầu ngày

  try {
    const meals = await Meal.find({ chatId, date: { $gte: today } })
    if (meals.length === 0) {
      return bot.sendMessage(chatId, 'Bạn chưa nhập bữa ăn nào hôm nay.')
    }

    const historyMessage = meals.map(meal => (
      `${meal.grams}g ${meal.ingredient}: ${meal.calories.toFixed(2)} kcal`
    )).join('\n')

    bot.sendMessage(chatId, `Lịch sử bữa ăn hôm nay:\n${historyMessage}`)
  } catch (error) {
    console.error('Error fetching history:', error)
    bot.sendMessage(chatId, 'Đã xảy ra lỗi khi lấy lịch sử bữa ăn.')
  }
}

module.exports = handleHistory
