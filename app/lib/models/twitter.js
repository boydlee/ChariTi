var HTTP = require("http");
var UTIL = require("utilities");

var init = function() {
	Ti.API.debug("TWITTER.init");
	
	var db = Ti.Database.open("Charitti");
	
	db.execute("CREATE TABLE IF NOT EXISTS twitter (id INTEGER PRIMARY KEY, text TEXT, date TEXT);");
	
	db.close();
};

exports.fetch = function(_params) {
	Ti.API.debug("TWITTER.fetch");
	Ti.API.info(JSON.stringify(_params));
	
	if(UTIL.isStale(_params.url, _params.cache)) {
		HTTP.request({
			timeout: 10000,
			type: "GET",
			format: "JSON",
			url: _params.url,
			passthrough: _params.callback,
			success: exports.handleData,
			failure: function(_error) {
				var alert = Ti.UI.createAlertDialog({
					title: "Connection Error",
					message: "The request has timed out.",
					ok: "Retry"
				});
				
				alert.addEventListener("click", function(_data) {
					exports.fetch(_params);
				});
				
				alert.show();
			}
		});
	} else {
		_params.callback();
	}
};

exports.handleData = function(_data, _url, _callback) {
	Ti.API.debug("TWITTER.handleData");
	
	if(_data.length > 0) {
		var db = Ti.Database.open("Charitti");
		
		db.execute("DELETE FROM twitter;");
		db.execute("BEGIN TRANSACTION;");
		
		for(var i = 0, x = _data.length; i < x; i++) {
			var tweet	= _data[i];
			
			var id		= UTIL.escapeString(tweet.id_str);
			var text	= UTIL.cleanEscapeString(tweet.text);
			var date	= UTIL.escapeString(new Date(tweet.created_at).getTime() + "");
			
			db.execute("INSERT OR ABORT INTO twitter (id, text, date) VALUES (" + id + ", " + text + ", " + date + ");");
		}
		
		db.execute("INSERT OR REPLACE INTO updates (url, time) VALUES(" + UTIL.escapeString(_url) + ", " + new Date().getTime() + ");");
		db.execute("END TRANSACTION;");
		db.close();
	}
	
	if(_callback) {
		_callback();
	}
};

exports.getTweets = function() {
	Ti.API.debug("TWITTER.getVideos");
	
	var db		= Ti.Database.open("Charitti");
	var data	= db.execute("SELECT * FROM twitter ORDER BY date DESC;");
	var temp	= [];

	while(data.isValidRow()) {
		temp.push({
			id: data.fieldByName("id"),
			text: data.fieldByName("text"),
			date: data.fieldByName("date")
		});

		data.next();
	}

	data.close();
	db.close();

	return temp;
};

init();