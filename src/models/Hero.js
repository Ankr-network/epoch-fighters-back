const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {ObjectId} = Schema.Types;
const RecordMapper = require("../db/plugins/RecordMapper");
const {AttributesSchema} = require('./AttributesSchema');

const HeroSchema = Schema({
  tokenId: {type: String, required: false},
  userId: {type: ObjectId, required: true},
  name: {type: String, required: true},
  attributes: {type: AttributesSchema, required: true}
});
HeroSchema.plugin(RecordMapper);

const HeroModel = mongoose.model('heroes', HeroSchema);

module.exports = HeroModel;
