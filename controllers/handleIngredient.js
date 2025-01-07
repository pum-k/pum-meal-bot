const nutritionData = require('../utils/nutritionData')
const userState = require('../utils/state') // Import userState

const handleIngredient = (chatId, text, bot) => {
  const normalizedText = text.trim().toLowerCase()

  if (nutritionData[normalizedText]) {
    userState[chatId] = { ingredient: normalizedText }
    bot.sendMessage(chatId, `Bạn muốn tính khối lượng bao nhiêu gram ${normalizedText}?`)
  } else {
    const availableIngredients = Object.keys(nutritionData)
    const bestMatch = require('string-similarity').findBestMatch(normalizedText, availableIngredients)
    const suggestedIngredient = bestMatch.bestMatch.target
    const similarityScore = bestMatch.bestMatch.rating

    if (similarityScore > 0.5) {
      bot.sendMessage(chatId, `Có phải ý bạn là "${suggestedIngredient}" không? (trả lời "phải" hoặc "không")`)
      userState[chatId] = { ingredientSuggestion: suggestedIngredient, awaitingConfirmation: true }
    } else {
      bot.sendMessage(chatId, 'Không tìm thấy nguyên liệu phù hợp. Vui lòng nhập lại tên nguyên liệu.')
    }
  }
}

module.exports = { handleIngredient }
