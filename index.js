require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const connectDB = require('./config/db')
const { handleIngredient, handleGram, handleHistory, handleReport, handleMeals, handleRemove } = require('./controllers')
const scheduleDailyReport = require('./utils/scheduler')
const nutritionData = require('./utils/nutritionData')
const userState = require('./utils/state')
const { removeVietnameseAccents } = require('./utils/stringHelper')
const stringSimilarity = require('string-similarity')

// Kết nối MongoDB
connectDB()

// Tạo bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Xin chào! Hãy nhập nguyên liệu bạn muốn tính.')
})

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
Hướng dẫn sử dụng bot dinh dưỡng:
1. Nhập tên nguyên liệu (ví dụ: "trứng", "ức gà", "gạo").
   - Nếu nguyên liệu có đơn vị riêng như "trứng", bot sẽ hiển thị thông tin cho 1 quả và 1 gram.
   - Nếu nguyên liệu chỉ tính theo gram như "ức gà", bot sẽ hiển thị thông tin cho 1 gram.
2. Nếu bạn nhập sai tên nguyên liệu, bot sẽ gợi ý tên gần đúng nhất.
   - Trả lời "phải" nếu đúng, hoặc "không" để nhập lại.
3. Bot sẽ hỏi bạn khối lượng (gram) của nguyên liệu đó.
4. Nhập số gram và bot sẽ trả về thông tin dinh dưỡng bao gồm:
   - Protein
   - Fat
   - Carb
   - Calories

Các lệnh khác:
- /start: Bắt đầu lại bot
- /help: Hiển thị hướng dẫn
- /meals: Hiển thị danh sách tất cả nguyên liệu có sẵn
- /history: Xem lịch sử bữa ăn hôm nay
- /report: Xem báo cáo tổng hợp bữa ăn hôm nay
- /remove: Xóa toàn bộ bữa ăn hôm nay
- /remove <tên nguyên liệu>: Xóa bữa ăn cụ thể theo nguyên liệu (ví dụ: "/remove trứng")
`
  bot.sendMessage(msg.chat.id, helpMessage)
})

bot.onText(/\/meals/, (msg) => {
  handleMeals(msg.chat.id, bot)
})

bot.onText(/\/remove( (.+))?/, (msg, match) => {
  const ingredient = match[2] ? match[2].toLowerCase() : null
  handleRemove(msg.chat.id, bot, ingredient)
})


bot.onText(/\/history/, (msg) => {
  handleHistory(msg.chat.id, bot)
})

bot.onText(/\/report/, (msg) => {
  handleReport(msg.chat.id, bot)
})


bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const text = msg.text.trim().toLowerCase()

  // Loại bỏ dấu tiếng Việt khỏi chuỗi đầu vào
  const normalizedText = removeVietnameseAccents(text)

  if (userState[chatId] && userState[chatId].awaitingConfirmation) {
    if (text === 'phải') {
      const ingredient = userState[chatId].ingredientSuggestion
      delete userState[chatId].awaitingConfirmation
      bot.sendMessage(chatId, `Bạn muốn tính khối lượng bao nhiêu gram ${ingredient}?`)
      userState[chatId] = { ingredient }
    } else if (text === 'không') {
      delete userState[chatId]
      bot.sendMessage(chatId, 'Vui lòng nhập lại tên nguyên liệu.')
    } else {
      bot.sendMessage(chatId, 'Vui lòng trả lời "phải" hoặc "không".')
    }
    return
  }

  if (nutritionData[normalizedText]) {
    handleIngredient(chatId, normalizedText, bot)
    return
  }

  if (!isNaN(text)) {
    handleGram(chatId, text, bot)
    return
  }

  const availableIngredients = Object.keys(nutritionData).map(removeVietnameseAccents)
  const bestMatch = stringSimilarity.findBestMatch(normalizedText, availableIngredients)
  const suggestedIngredient = bestMatch.bestMatch.target
  const similarityScore = bestMatch.bestMatch.rating

  if (similarityScore > 0.3) {
    const originalIngredient = Object.keys(nutritionData).find(
      (key) => removeVietnameseAccents(key) === suggestedIngredient
    )
    bot.sendMessage(chatId, `Có phải ý bạn là "${originalIngredient}" không? (trả lời "phải" hoặc "không")`)
    userState[chatId] = { ingredientSuggestion: originalIngredient, awaitingConfirmation: true }
  } else {
    bot.sendMessage(chatId, 'Không tìm thấy nguyên liệu phù hợp. Vui lòng nhập lại tên nguyên liệu.')
  }
})


bot.on('polling_error', (error) => {
  console.log(error)
})

// Lên lịch gửi báo cáo lúc 10 giờ tối mỗi ngày
scheduleDailyReport(bot)
