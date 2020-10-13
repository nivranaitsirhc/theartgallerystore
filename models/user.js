const		mongoose 	= require('mongoose'),
			passportLocalMongoose = require('passport-local-mongoose');


module.exports = mongoose.model('User', new mongoose.Schema({
		fullName 	: String,
		firstName 	: String,
		middleName 	: String,
		lastName 	: String,
		dateOfBirth : {
			type 		: Date,
			default 	: Date.now
		},
		email 		: {							//required by password reset
			type 		: String,
			unique 		: true,
			required	: true
		},
		resetPasswordToken 		: String,		//required by password reset
		resetPasswordExpires 	: Date, 		//required by password reset
		avatarUrl 	: String,
		role 		: {
			name 	: {
				type 	: String,
				default : 'member'
			},
			value 	: {
				type 	: Number,
				default : 1000					//default number for member
			},
			isAdmin	: {
				type 	: Boolean,
				default : false
			}
		}
	},{
		timestamps: {
			createdAt: 'created',
			updatedAt: 'modified'
		}
	}).plugin(passportLocalMongoose ,{
		usernameQueryFields: ['username','email'],
	})
);