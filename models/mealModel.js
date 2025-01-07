const mongoose = require('mongoose')

const mealSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  ingredient: { type: String, required: true },
  grams: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carb: { type: Number, required: true },
  calories: { type: Number, required: true }
})

module.exports = mongoose.model('Meal', mealSchema)
