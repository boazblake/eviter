import fbRef from './fbref'

import BackboneFire from 'bbfire'

BackboneFire.Model.prototype.fetchWithPromise = 
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
var User = BackboneFire.Model.extend({})

var Users = BackboneFire.Firebase.Collection.extend({
	url: fbUrl('/users'),
	model: User
})

/**
 * EVENTS
 */
var Event = BackboneFire.Model.extend({})

var Events = BackboneFire.Firebase.Collection.extend({
	url: fbUrl('/events'),
	model: Event
})

/**
 * Attendance
 */
var Attendance = BackboneFire.Model.extend({})

var Attendances = BackboneFire.Firebase.Collection.extend({
	url: fbUrl('/attendance'),
	model: Attendance,
	initialize: function(childKey, id){
		if(childKey && id){
			this.url = new Firebase(fbUrl('/attendance')).orderByChild(childKey).equalTo(id)
		}
	}
})



/**
 * eventFinder
 */
var EventFinder = BackboneFire.Firebase.Collection.extend({
	initialize:function(eventID){
		this.url = fbRef.child('events').orderByChild('uid').equalTo(eventID)
	},
})

var QueryByEmail = BackboneFire.Firebase.Collection.extend({
    initialize: function(targetEmail) {
        this.url = fbRef.child('users').orderByChild('email').equalTo(targetEmail)
    },
})


export {User, Users, Event, Events, Attendance, Attendances, EventFinder, fbUrl, QueryByEmail}