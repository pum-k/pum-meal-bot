const nutritionData = require('../utils/nutritionData')

const handleMeals = (chatId, bot) => {
  const mealsList = Object.entries(nutritionData)
    .map(([name, data]) => {
      if (data.type === 'weight') {
        return `- ${name} (tính theo gram)`
      } else if (data.type === 'unit') {
        return `- ${name} (~${data.unitWeight}g mỗi ${name})`
      }
    })
    .join('\n')

  const message = `Danh sách nguyên liệu có sẵn:\n${mealsList}\n\nBạn có thể nhập tên nguyên liệu để xem thông tin chi tiết.`

  bot.sendMessage(chatId, message)
}

module.exports = handleMeals
