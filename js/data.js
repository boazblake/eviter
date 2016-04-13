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
HOST
**/

var Host = BackboneFire.Firebase.Model.extend({
	url:'',
	initialize:function(host_id){
		this.url = fbRef.child('users').child(host_id)
	}
})


/**
USERS
**/
var User = BackboneFire.Firebase.Model.extend({
	url: fbUrl('/users'),
})

var Users = BackboneFire.Firebase.Collection.extend({
	model: User
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
	// defaults: {
	// 	date:'',
	// 	location:'',
	// 	title:'',
	// 	doBringThis:'',
	// 	doNotBringThis:''
	// }
})

var Attendances = BackboneFire.Firebase.Collection.extend({
	url: fbUrl('/attendance'),
	model: Attendance
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
		this.url = fbRef.child('attendanceId').orderByChild(attendanceId).equalTo(attendanceId)
	},
})

var QueryByEmail = BackboneFire.Firebase.Collection.extend({
    initialize: function(targetEmail) {
        this.url = fbRef.child('users').orderByChild('email').equalTo(targetEmail)
    },
})


export {Host, User, Users, Event, Events, Attendance, Attendances, EventFinder, fbUrl, QueryByEmail, QueriedAttendance}