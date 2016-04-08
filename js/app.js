// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import $ from 'jquery'
import _ from 'underscore'
import Firebase from 'firebase'
import BackboneFire from 'bbfire'
import {DashPage,SplashPage,CreateEvent,EventPage} from './views'
////
////
// invitations: {
// 	adjklsjkdfsa: {
// 		event_id: 'F98787',
// 		confirmed: false
// 	},

// FireBase Refs Models and Collections
var fbRef = new Firebase('https://eviter.firebaseio.com/')

var UserModel = BackboneFire.Firebase.Model.extend({
	initialize:function(uid){
		this.url = `https://eviter.firebaseio.com/users/${uid}`
	}
})

var UserSearch = BackboneFire.Firebase.Collection.extend({
	initialize:function(targetEmail){
		this.url = fbRef.child('users').orderByChild('email').equalTo(targetEmail)
		return 
	},
	autoSync: false
})

var GuestSearch = BackboneFire.Firebase.Collection.extend({
	initialize:function(targetID){
		this.url = fbRef.child('users').orderByChild('events').equalTo(targetID)
		return 
	}
})

var EventInvite = BackboneFire.Firebase.Collection.extend({
	initialize:function(uid){
		this.url = `https://eviter.firebaseio.com/users/${uid}/invites`
	}
})


function app() {
    // start app
    // new Router()
    var AppRouter = BackboneFire.Router.extend({
    	initialize: function(){
    		console.log('app is routing')
    		this.fbRef = new Firebase('https://eviter.firebaseio.com/')

    		if (!this.fbRef.getAuth()) {
    			location.hash = 'splash'
    		} 

    		this.on('route', function(){
    			if (!this.fbRef.getAuth()){
    				location.hash = 'splash'
    			}
    		})
    	},

    	routes:{
    		'logout':'doLogOut',
    		'createvent':'doCreateEvent',
    		'dash':'showDashPage',
    		'event':'viewEvent',
    		'*splash':'showSplashPage',
    	},

		//DOM RENDER
    	doLogOut:function(){
    		console.log('fbref:>>>> ', this.fbRef)
    		this.fbRef.unauth()
    		location.hash = 'splash'
    		console.log('fbref:>>>> ', this.fbRef)
    	},

    	doCreateEvent:function(){
    		DOM.render(<CreateEvent eventCreator={this._eventCreator} fbRef={fbRef}/>, document.querySelector('.container'))
    	},


    	showDashPage: function(){
    		var uid = fbRef.getAuth().uid
    		console.log('uid', uid)
			var eventColl = new EventInvite(uid)
			console.log('eventColl>>>>',eventColl)
    		DOM.render(<DashPage eventColl={eventColl} viewEvent={this.viewEvent.bind(this)}/>, document.querySelector('.container'))
    	},

    	showSplashPage: function(){
    		DOM.render(<SplashPage createUser={ this._createUser.bind( this ) } logUserIn={ this._LogUserIn.bind( this ) } />, document.querySelector('.container'))
    	},

		// Helper Functions
		_createUser: function(userObj){
			console.log('userObj',userObj)
			var self = this
			this.fbRef.createUser({
				email:userObj.email,
				password:userObj.passWord},
				function(err, authData){
				console.log('authData',authData)
				if (err) console.log('err',err)
				else {
					var userMod = new UserModel(authData.uid)
					userMod.set({
						firstName: userObj.firstName,
						lastName: userObj.lastName,
						email:userObj.email,
						id:authData.uid,
					})
					self._LogUserIn(userObj)
				}
			})
		},

		_eventCreator: function(eventObj) {
			var newGuest = new UserSearch(eventObj.guestName)
			console.log(eventObj.guestName)
			console.log(newGuest)
			newGuest.fetch()
			newGuest.on('sync', function(){

				var guestID = newGuest.models[0].get('id')
				var eventInviteColl = new EventInvite(guestID)
				eventInviteColl.create({
					content: eventObj,
					sender_email: fbRef.getAuth().password.email,
					sender_id: fbRef.getAuth().uid,
					sender_name:fbRef.getAuth().password.email
				})
				// storing events sent	
				eventInviteColl.on('sync', function(){
					var inviteModels = eventInviteColl.models.filter(function(m){ return m.get('id') })
					var mostRecentInvite = inviteModels[ inviteModels.length - 1 ]
					
					var receivedEventColl = new EventInvite(fbRef.getAuth().uid)
					console.log("evetn to save on invitee", mostRecentInvite.toJSON() )
					receivedEventColl.create(mostRecentInvite.toJSON() )
					// this.forceUpdate()
				})
				
			})
			location.hash='dash'
		},

		_LogUserIn: function(userObj){
			console.log('userObj',userObj)
			var self = this
			this.fbRef.authWithPassword({
				email:userObj.email,
				password:userObj.passWord
			}, function(err, authData){
				if (err) console.log(err)
				else {
					location.hash = 'dash'
				}
			})
		},

		viewEvent:function (eventID){
			console.log('<<<<<eventID>>>>',eventID.get('content'))
			var eventContent = eventID.get('content')
    		DOM.render(<EventPage eventContent={eventContent}/>, document.querySelector('.container'))
    		location.hash='event'
		}
	})

	var rtr = new AppRouter()
	BackboneFire.history.start()
}
app()
