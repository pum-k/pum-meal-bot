const handleRemove = async (chatId, bot, ingredient = null) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const query = { chatId, date: { $gte: today } }
    if (ingredient) query.ingredient = ingredient

    const result = await Meal.deleteMany(query)

    if (result.deletedCount === 0) {
      return bot.sendMessage(chatId, 'Không có bữa ăn nào để xóa.')
    }

    bot.sendMessage(chatId, `Đã xóa ${result.deletedCount} bữa ăn${ingredient ? ` với nguyên liệu ${ingredient}` : ''}.`)
  } catch (error) {
    console.error('Error removing meals:', error)
    bot.sendMessage(chatId, 'Đã xảy ra lỗi khi xóa bữa ăn.')
  }
}

module.exports = handleRemove
