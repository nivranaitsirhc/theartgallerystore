const mongoose = require('mongoose');

module.exports = mongoose.model('Comment', new mongoose.Schema({
		title 	: String,
		text 	: String,
		art 	: {
			id 	: {
					type 	: mongoose.Schema.Types.ObjectId,
					ref 	: "Artgallery"
			},
			title 		: String
		},
		author 	: {
			id 	: {
					type 	: mongoose.Schema.Types.ObjectId,
					ref 	: "User"
			},
			username 	: String,
			fullName 	: String
		}
	},{
		timestamps : {//customize timestamps
			createdAt 	: 'created',
			updatedAt 	: 'modified'
		}
	})
);