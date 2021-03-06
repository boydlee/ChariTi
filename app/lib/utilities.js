/**
 * Checks to see if an item in the cache is stale or fresh
 */
exports.isStale = function(_url, _time) {
	var db = Ti.Database.open("ChariTi");
	var time = new Date().getTime();
	var cacheTime = _time ? _time : 5;
	var freshTime = time - (cacheTime * 60 * 1000);
	var lastUpdate = 0;
	
	var data = db.execute("SELECT time FROM updates WHERE url = " + exports.escapeString(_url) + " ORDER BY time DESC LIMIT 1;");
	
	while(data.isValidRow()) {
		lastUpdate = data.fieldByName("time");

		data.next();
	}
	
	data.close();
	db.close();
	
	if(lastUpdate > freshTime) {
		return false;
	} else {
		return true;
	}
};

/**
 * Escapes a string for SQL insertion
 */
exports.escapeString = function(_string) {
	if(typeof _string !== "string") {
		return "\"" + _string + "\"";
	}
	
	return "\"" + _string.replace(/"/g, "'") + "\"";
};

/**
 * Removes HTML entities, replaces breaks/paragraphs with newline, strips HTML, trims
 */
exports.cleanString = function(_string) {
	if(typeof _string !== "string") {
		return _string;
	}
	
	_string = _string.replace(/&amp;*/ig, "&");
	_string = exports.htmlDecode(_string);
	_string = _string.replace(/\s*<br[^>]*>\s*/ig, "\n");
	_string = _string.replace(/\s*<\/p>*\s*/ig, "\n\n");
	_string = _string.replace(/<[^>]*>/g, "");
	_string = _string.replace(/\s*\n{3,}\s*/g, "\n\n");
	_string = _string.replace(/[^\S\n]{2,}/g, " ");
	_string = _string.replace(/\n[^\S\n]*/g, "\n");
	_string = _string.replace(/^\s+|\s+$/g, "");
	
	return _string;
};

/**
 * Combination of clean and escape string
 */
exports.cleanEscapeString = function(_string) {
	_string = exports.cleanString(_string);
	
	return exports.escapeString(_string);
};

/**
 * Cleans up nasty XML
 */
exports.xmlNormalize = function(_string) {
	_string = _string.replace(/&nbsp;*/ig, " ");
	_string = _string.replace(/&(?!amp;)\s*/g, "&amp;");
	_string = _string.replace(/^\s+|\s+$/g, "");
	_string = _string.replace(/<title>(?!<!\[CDATA\[)/ig, "<title><![CDATA[");
	_string = _string.replace(/<description>(?!<!\[CDATA\[)/ig, "<description><![CDATA[");
	_string = _string.replace(/(\]\]>)?<\/title>/ig, "]]></title>");
	_string = _string.replace(/(\]\]>)?<\/description>/ig, "]]></description>");
	
	return _string;
};

/**
 * Decodes HTML entities
 */
exports.htmlDecode = function(_string) {
	var tmp_str = _string.toString();
	var hash_map = exports.htmlTranslationTable();
	var results = tmp_str.match(/&#\d*;/ig);
	
	if(results) {
		for(var i = 0, x = results.length; i < x; i++) {
			var code = parseInt(results[i].replace("&#", "").replace(";", ""), 10);
			
			hash_map[results[i]] = code;
		}
	}
	
	for(var entity in hash_map) {
		var symbol = String.fromCharCode(hash_map[entity]);
		
		tmp_str = tmp_str.split(entity).join(symbol);
	}
	
	return tmp_str;
};

exports.htmlTranslationTable = function() {
	var entities = {
		"&#x2013;": "8211",
		"&#x2014;": "8212",
		"&#x2018;": "8216",
		"&#x2019;": "8217",
		"&amp;": "38",
		"&bdquo;": "8222",
		"&bull;": "8226",
		"&circ;": "710",
		"&dagger;": "8224",
		"&Dagger;": "8225",
		"&fnof;": "402",
		"&hellip;": "8230",
		"&ldquo;": "8220",
		"&lsaquo;": "8249",
		"&lsquo;": "8216",
		"&mdash;": "8212",
		"&ndash;": "8211",
		"&OElig;": "338",
		"&oelig;": "339",
		"&permil;": "8240",
		"&rdquo;": "8221",
		"&rsaquo;": "8250",
		"&rsquo;": "8217",
		"&sbquo;": "8218",
		"&scaron;": "353",
		"&Scaron;": "352",
		"&tilde;": "152",
		"&trade;": "8482",
		"&Yuml;": "376",
		"&Igrave;": "204",
		"&igrave;": "236",
		"&Iota;": "921",
		"&iota;": "953",
		"&Iuml;": "207",
		"&iuml;": "239",
		"&larr;": "8592",
		"&lArr;": "8656",
		"&Aacute;": "193",
		"&aacute;": "225",
		"&Acirc;": "194",
		"&acirc;": "226",
		"&acute;": "180",
		"&AElig;": "198",
		"&aelig;": "230",
		"&Agrave;": "192",
		"&agrave;": "224",
		"&alefsym;": "8501",
		"&Alpha;": "913",
		"&alpha;": "945",
		"&and;": "8743",
		"&ang;": "8736",
		"&Aring;": "197",
		"&aring;": "229",
		"&asymp;": "8776",
		"&Atilde;": "195",
		"&atilde;": "227",
		"&Auml;": "196",
		"&auml;": "228",
		"&Beta;": "914",
		"&beta;": "946",
		"&brvbar;": "166",
		"&cap;": "8745",
		"&Ccedil;": "199",
		"&ccedil;": "231",
		"&cedil;": "184",
		"&cent;": "162",
		"&Chi;": "935",
		"&chi;": "967",
		"&clubs;": "9827",
		"&cong;": "8773",
		"&copy;": "169",
		"&crarr;": "8629",
		"&cup;": "8746",
		"&curren;": "164",
		"&darr;": "8595",
		"&dArr;": "8659",
		"&deg;": "176",
		"&Delta;": "916",
		"&delta;": "948",
		"&diams;": "9830",
		"&divide;": "247",
		"&Eacute;": "201",
		"&eacute;": "233",
		"&Ecirc;": "202",
		"&ecirc;": "234",
		"&Egrave;": "200",
		"&egrave;": "232",
		"&empty;": "8709",
		"&emsp;": "8195",
		"&ensp;": "8194",
		"&Epsilon;": "917",
		"&epsilon;": "949",
		"&equiv;": "8801",
		"&Eta;": "919",
		"&eta;": "951",
		"&ETH;": "208",
		"&eth;": "240",
		"&Euml;": "203",
		"&euml;": "235",
		"&euro;": "8364",
		"&exist;": "8707",
		"&forall;": "8704",
		"&frac12;": "189",
		"&frac14;": "188",
		"&frac34;": "190",
		"&frasl;": "8260",
		"&Gamma;": "915",
		"&gamma;": "947",
		"&ge;": "8805",
		"&harr;": "8596",
		"&hArr;": "8660",
		"&hearts;": "9829",
		"&Iacute;": "205",
		"&iacute;": "237",
		"&Icirc;": "206",
		"&icirc;": "238",
		"&iexcl;": "161",
		"&image;": "8465",
		"&infin;": "8734",
		"&int;": "8747",
		"&iquest;": "191",
		"&isin;": "8712",
		"&Kappa;": "922",
		"&kappa;": "954",
		"&Lambda;": "923",
		"&lambda;": "955",
		"&lang;": "9001",
		"&laquo;": "171",
		"&lceil;": "8968",
		"&le;": "8804",
		"&lfloor;": "8970",
		"&lowast;": "8727",
		"&loz;": "9674",
		"&lrm;": "8206",
		"&macr;": "175",
		"&micro;": "181",
		"&middot;": "183",
		"&minus;": "8722",
		"&Mu;": "924",
		"&mu;": "956",
		"&nabla;": "8711",
		"&nbsp;": "160",
		"&ne;": "8800",
		"&ni;": "8715",
		"&not;": "172",
		"&notin;": "8713",
		"&nsub;": "8836",
		"&Ntilde;": "209",
		"&ntilde;": "241",
		"&Nu;": "925",
		"&nu;": "957",
		"&Oacute;": "211",
		"&oacute;": "243",
		"&Ocirc;": "212",
		"&ocirc;": "244",
		"&Ograve;": "210",
		"&ograve;": "242",
		"&oline;": "8254",
		"&Omega;": "937",
		"&omega;": "969",
		"&Omicron;": "927",
		"&omicron;": "959",
		"&oplus;": "8853",
		"&or;": "8744",
		"&ordf;": "170",
		"&ordm;": "186",
		"&Oslash;": "216",
		"&oslash;": "248",
		"&Otilde;": "213",
		"&otilde;": "245",
		"&otimes;": "8855",
		"&Ouml;": "214",
		"&ouml;": "246",
		"&para;": "182",
		"&part;": "8706",
		"&perp;": "8869",
		"&Phi;": "934",
		"&phi;": "966",
		"&Pi;": "928",
		"&pi;": "960",
		"&piv;": "982",
		"&plusmn;": "177",
		"&pound;": "163",
		"&prime;": "8242",
		"&Prime;": "8243",
		"&prod;": "8719",
		"&prop;": "8733",
		"&Psi;": "936",
		"&psi;": "968",
		"&radic;": "8730",
		"&rang;": "9002",
		"&raquo;": "187",
		"&rarr;": "8594",
		"&rArr;": "8658",
		"&rceil;": "8969",
		"&real;": "8476",
		"&reg;": "174",
		"&rfloor;": "8971",
		"&Rho;": "929",
		"&rho;": "961",
		"&rlm;": "8207",
		"&sdot;": "8901",
		"&sect;": "167",
		"&shy;": "173",
		"&Sigma;": "931",
		"&sigma;": "963",
		"&sigmaf;": "962",
		"&sim;": "8764",
		"&spades;": "9824",
		"&sub;": "8834",
		"&sube;": "8838",
		"&sum;": "8721",
		"&sup;": "8835",
		"&sup1;": "185",
		"&sup2;": "178",
		"&sup3;": "179",
		"&supe;": "8839",
		"&szlig;": "223",
		"&Tau;": "932",
		"&tau;": "964",
		"&there4;": "8756",
		"&Theta;": "920",
		"&theta;": "952",
		"&thetasym;": "977",
		"&thinsp;": "8201",
		"&THORN;": "222",
		"&thorn;": "254",
		"&tilde;": "732",
		"&times;": "215",
		"&Uacute;": "218",
		"&uacute;": "250",
		"&uarr;": "8593",
		"&uArr;": "8657",
		"&Ucirc;": "219",
		"&ucirc;": "251",
		"&Ugrave;": "217",
		"&ugrave;": "249",
		"&uml;": "168",
		"&upsih;": "978",
		"&Upsilon;": "933",
		"&upsilon;": "965",
		"&Uuml;": "220",
		"&uuml;": "252",
		"&weierp;": "8472",
		"&#xA;": "10",
		"&#xD;": "13",
		"&Xi;": "926",
		"&xi;": "958",
		"&Yacute;": "221",
		"&yacute;": "253",
		"&yen;": "165",
		"&yuml;": "255",
		"&Zeta;": "918",
		"&zeta;": "950",
		"&zwj;": "8205",
		"&zwnj;": "8204",
		"&quot;": "34",
		"&lt;": "60",
		"&gt;": "62"
	};

	return entities;
};

/**
 * Adds thousands separators to a number
 */
exports.formatNumber = function(_number) {
	_number = _number + "";
	
	x = _number.split(".");
	x1 = x[0];
	x2 = x.length > 1 ? "." + x[1] : "";
	
	var expression = /(\d+)(\d{3})/;
	
	while (expression.test(x1)) {
		x1 = x1.replace(expression, "$1" + "," + "$2");
	}
	
	return x1 + x2;
};

/**
 * Converts a date to absolute time (e.g. "May 2, 2011 12:00PM")
 */
exports.toDateAbsolute = function(_date) {
	var date = new Date();
	date.setTime(_date);
	var dateHour = date.getHours() > 11 ? date.getHours() - 12 : date.getHours();
	dateHour = dateHour == 0 ? 12 : dateHour;
	var dateMinutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	var datePeriod = date.getHours() > 12 ? "PM" : "AM";
	var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	
	return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + dateHour + ":" + dateMinutes + datePeriod;
};

/**
 * Converts a date to relative time (e.g. "Yesterday 12:01PM")
 */
exports.toDateRelative = function(_date) {
	var date = new Date();
	date.setTime(_date);
	var now = new Date();
	var days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
	var dateMonth = date.getMonth();
	var dateDate = date.getDate();
	var dateDay = days[date.getDay()];
	var dateYear = date.getFullYear();
	var dateHour = date.getHours() > 11 ? date.getHours() - 12 : date.getHours();
	dateHour = dateHour == 0 ? 12 : dateHour;
	var dateMinutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	var datePeriod = date.getHours() > 12 ? "PM" : "AM";
	var nowMonth = now.getMonth();
	var nowDate = now.getDate();
	var nowYear = now.getFullYear();
	
	if(dateYear == nowYear && dateMonth == nowMonth) {
		if(dateDate == nowDate) {
			return "Today " + dateHour + ":" + dateMinutes + datePeriod;
		} else if(dateDate >= nowDate - 1) {
			return "Yesterday " + dateHour + ":" + dateMinutes + datePeriod;
		} else if(dateDate >= nowDate - 6) {
			return dateDay + " " + dateHour + ":" + dateMinutes + datePeriod;
		} else {
			return exports.toDateAbsolute(_date);
		}
	} else {
		return exports.toDateAbsolute(_date);
	}
};