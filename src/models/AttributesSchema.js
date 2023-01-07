const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {Number} = Schema.Types;
const IdRemover = require("../db/plugins/IdRemover");

const BodyPartSchema = Schema({
  id: {type: Number, required: true},
  stat: {type: Number, required: true},
});
BodyPartSchema.plugin(IdRemover);

const AttributesSchema = Schema({
  torso: BodyPartSchema,
  horns: BodyPartSchema,
  arms: BodyPartSchema,
  eyes: BodyPartSchema,
  legs: BodyPartSchema,
  tail: BodyPartSchema,
  speed: Number,
  ability1: Number,
  ability2: Number
});
AttributesSchema.plugin(IdRemover);

module.exports = {
  BodyPartSchema,
  AttributesSchema
};
