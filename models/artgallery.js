const mongoose = require('mongoose');

let artgallerySchema = new mongoose.Schema({
		title: String,
		price: String,
		image: String,
		status: {
			index: Number,
			name: String
		},
		artType: {
			index: Number,
			name: String
		},
		description: String,
		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			username: String,
			fullName: String,
			
		},
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment'
			}
		]
	},
	{
		timestamps : {//customize timestamps
			createdAt: 'created',
			updatedAt: 'modified'
		}
});

module.exports = mongoose.model('artgallery', artgallerySchema);