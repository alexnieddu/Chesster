// Library to get the most retweeted move from the community
//
// ------------------------------------------------------------
// SETUP AND INIT

console.log("Twitter Bot starts.");

var Twit = require('twit')
var fs = require("fs");
// In the config file are your personal data for twitter API
var config = require("./config");

var T = new Twit(config)

module.exports = {
	getMove: function () {
		getLastTweetId();
	}
};

//
// ------------------------------------------------------------
// MAIN METHODS

// Gets the last tweet by internal ID
function getLastTweetId() {
  var param = { screen_name: "chessterbot", count: 1};
  T.get("statuses/user_timeline", param, gotIt);

  function gotIt(err, data, response) {
    if(err) {
      console.log(err);
    } else {
      // console.log(data);
      var id = data[0].id_str;
      // console.log(id + "\nGOT IT!");
      console.log(id);

	  // Here we got the actual moves retweeted by the community
      getRetweets(id);
    }
  }
}

function getRetweets(tweetId) {
  var param = {q: "@chessterbot", count: 50};
  T.get("search/tweets", param, gotThem);

  function gotThem(err, data, response) {
  	var arr_comments = new Array();
    if(err) {
      console.log(err);
    } else {
      // console.log(data.statuses);
      for(var i = 0 ; i < data.statuses.length; i++) {
      	if(data.statuses[i].in_reply_to_status_id_str == tweetId) {
      		//console.log(data.statuses[i].text + "\n");
      		arr_comments[i] = data.statuses[i].text;
      	}
      }
      
      if(arr_comments.length != 0) {
        // Counts the retweeted move in json format
		var counts = countArr(filterArr(arr_comments)); // Array
		console.log(counts);
		var max_counts = Math.max.apply(Math, counts.map(function(o) { return o.count; }));
		var obj = counts.find(function(o){ return o.count == max_counts; })
		console.log(obj.pos);
		fs.writeFile("dat", obj.pos, function(err2) {});
      } else {
      	getLastTweetId();
      }
      
    }
  }
}

//
// ------------------------------------------------------------
// SUPPORTING METHODS

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

// [ 'a4', 'Nf4', 'Ka1', 'Ka1', 'Qh8', 'Qh8', 'b6', 'Ka1' ]
function filterArr(arr) {
	var arr_str = arr.join();
	return regex(arr_str);
}

// [ 'a4', 'Nf4', 'Ka1', 'Ka1', 'Qh8', 'Qh8', 'b6', 'Ka1' ]
function regex(str) {
	return str.match(/([KQRBN])?([1-8])?([KQRBN])?([a-h])?([x])?([a-h]){1}([1-8]){1}([+#])?([KQRBN])?|(O-O-O)|(O-O)/g);
}

// [ { pos: 'a4', count: 1 },
//   { pos: 'Nf4', count: 1 },
//   { pos: 'Ka1', count: 3 },
//   { pos: 'Qh8', count: 2 },
//   { pos: 'b6', count: 1 } ]
function countArr(arr) {
	var arr_str = arr.join();
	var count = new Array();
	for(var i = 0; i < arr.length; i++) {
		var found = count.some(function (elem) {
			return elem.pos === arr[i];
		});
		if(!found) {
			count.push({pos: arr[i], count: occurrences(arr_str, arr[i], false)});
		}
	}
	return count;
}

function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}