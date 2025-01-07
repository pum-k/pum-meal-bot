const schedule = require('node-schedule')
const Meal = require('../models/mealModel')

const scheduleDailyReport = (bot) => {
  schedule.scheduleJob('0 22 * * *', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const meals = await Meal.find({ date: { $gte: today } })
    const report = {}

    meals.forEach(meal => {
      if (!report[meal.chatId]) report[meal.chatId] = []
      report[meal.chatId].push(
        `${meal.grams}g ${meal.ingredient}: ${meal.calories.toFixed(2)} kcal`
      )
    })

    for (const chatId in report) {
      const message = `Báo cáo dinh dưỡng hôm nay:\n` + report[chatId].join('\n')
      bot.sendMessage(chatId, message)
    }
  })
}

module.exports = scheduleDailyReport
