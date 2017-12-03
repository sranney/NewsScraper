var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NewsSchema_HN = new Schema({
  // `name` must be unique and of type String
  storyline: {
    type: String
  },
  storyline_href:{
    type:String,
    unique:true
  },
  site:{
    type:String
  },
  score:{
    type:String
  },
  user:{
    type:String
  },
  date:{
    type:Date,
    default:Date.now
  },
  numComments:{
    type:String
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
var News_HN = mongoose.model("News_HN", NewsSchema_HN);

// Export the User model
module.exports = News_HN;
