import fbRef from './fbref'

import BackboneFire from 'bbfire'




BackboneFire.Firebase.Model.prototype.fetchWithPromise = 
BackboneFire.Firebase.Collection.prototype.fetchWithPromise = 
	function() {
	    this.fetch()
	    var self = this
	    var p = new Promise(function(res,rej){
	        self.once('sync',function() {
	            res()
	        })
	        self.once('err',function() {
	            rej()
	        })
	    })
	    return p
	}


const fbUrl = (path="") => `https://eviter.firebaseio.com${path}`


/**
USERS
**/
var User = BackboneFire.Firebase.Model.extend({
	url: '',
	initialize: function(uid) {
		this.url = fbRef.child('users').child(uid)
	}

})

var Users = BackboneFire.Firebase.Collection.extend({
	url: fbRef.child('users'),

})

/**
 * EVENTS
 */
var Event = BackboneFire.Firebase.Model.extend({
	autoSync: false,

	url: "" ,

	initialize: function(evtId){
		this.url = fbRef.child('events').child(evtId)
		// console.log(`for event  ${evtId}`, this.url)

	}
})

var Events = BackboneFire.Firebase.Collection.extend({
	autoSync: false,
	url: fbUrl('/events/'),
	// model: Event
})

/**
 * Attendance
 */
var Attendance = BackboneFire.Firebase.Model.extend({

})

var Attendances = BackboneFire.Firebase.Collection.extend({
	url: fbRef.child('attendance'),
})

var QueriedAttendance = BackboneFire.Firebase.Collection.extend({
	initialize: function(childKey,id) {
		this.url = fbRef.child('attendance').orderByChild(childKey).equalTo(id)
	}
})

/**
 * eventFinder
 */
var EventFinder = BackboneFire.Firebase.Collection.extend({
	initialize:function(attendanceId){
		this.url = fbRef.child('attendance').orderByChild('email').equalTo(attendanceId)
	},
})

var QueryByEmail = BackboneFire.Firebase.Collection.extend({
    initialize: function(targetEmail) {
        this.url = fbRef.child('users').orderByChild('email').equalTo(targetEmail)
    },
})

/**
FOODS
**/

var FoodToBring = BackboneFire.Firebase.Model.extend({})
var FoodsToBring = BackboneFire.Firebase.Collection.extend({
		url:fbRef.child('foodsToBring')
})

var FoodList = BackboneFire.Firebase.Collection.extend({
	url:'',
	initialize: function(event_id) {
	    this.url = fbRef.child('foodsToBring').orderByChild(event_id).equalTo(event_id)
	}
})

 

export {User, Users, Event, Events, Attendance, Attendances, EventFinder, fbUrl, QueryByEmail, QueriedAttendance, FoodsToBring, FoodToBring, FoodList}