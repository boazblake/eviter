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
//         
//     }).catch(() => {
//         
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import $ from 'jquery'
import _ from 'underscore'

import BackboneFire from 'bbfire'
import {DashPage,SplashPage,CreateEvent,EventPage} from './views'
import {User, Users, Event, Events, EventFinder} from './data'
import fbRef from './fbref'
import {createEvent, createUser, addGuestMaker, LogUserIn, handleEvent} from './actions'

function checkAuth(){
	if (!fbRef.getAuth()) {
		location.hash = 'splash'
		fbRef.unauth()
	}
}

function app() {
    // start app
    // new Router()
    var AppRouter = BackboneFire.Router.extend({
    	initialize: function(){
    	checkAuth()
    	},

    	routes:{
    		'logout':'doLogOut',
    		'createevent':'doCreateEvent',
    		'dash':'showDashPage',
    		'event/:evtID':'viewEvent',
    		'*splash':'showSplashPage',
    	},

		//DOM RENDER
    	doLogOut:function(){
    		fbRef.unauth()
    		location.hash = 'splash'
    	},

    	doCreateEvent:function(){
    		checkAuth()
    		DOM.render(<CreateEvent />, document.querySelector('.container'))
    	},

    	showDashPage: function(){
    		checkAuth()
    		DOM.render(<DashPage />, document.querySelector('.container'))
    	},

    	showSplashPage: function(){
    		if (fbRef.getAuth()) {
    			location.hash = 'dash'
    			return
    		}
    		DOM.render(<SplashPage />, document.querySelector('.container'))
    	},

		viewEvent:function (id){
			checkAuth()
			console.assert(id !== undefined)
    		DOM.render(<EventPage eventID={id} />, document.querySelector('.container'))
		}
	})

	var rtr = new AppRouter()
	BackboneFire.history.start()
}
app()