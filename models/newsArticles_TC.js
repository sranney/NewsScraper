var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NewsSchema_TC = new Schema({
  // `name` must be unique and of type String
  category: {
    type: String
  },
  headline:{
    type:String
  },
  date:{
    type:String
  },
  age:{
    type:String
  },
  author:{
    type:String
  },
  excerpt:{
    type:String
  },
  story_href:{
    type:String,
    unique:true
  },
  // `notes` is an array that stores ObjectIds
  // The ref property links these ObjectIds to the Note model
  // This allows us to populate the User with any associated Notes
  notes: [
    {
      // Store ObjectIds in the array
      type: Schema.Types.ObjectId,
      // The ObjectIds will refer to the ids in the Note model
      ref: "Note"
    }
  ]
});

// This creates our model from the above schema, using mongoose's model method
var NewsSchema_TC = mongoose.model("News_TC", NewsSchema_TC);

// Export the User model
module.exports = NewsSchema_TC;
