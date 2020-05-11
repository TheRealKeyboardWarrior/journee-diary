var calendarData = [];
var activeBadge = "";
var calendarMonth;
var calendarYear;
require('bootstrap-add-clear');
var showdown = require('showdown');

//TODO: check to see if chosen folder exists when opening

//TODO: only save files on file change if the file has been modified. (Make a variable for file has been modified on first keystroke?)

//TODO: Add help icon '?' beside the settings cog, explaining shortcuts etc. (And autosave)

// solution to get properly formatted dates thanks to @Serhioromano. https://gist.github.com/Serhioromano/5170203
Date.prototype.getMonthFormatted = function() {
	var month = this.getMonth() + 1;
	return month < 10 ? '0' + month : month;
}
Date.prototype.getDateFormatted = function() {
	var date = this.getDate();
	return date < 10 ? '0' + date : date;
}

// set fontsize to start
storage.has('fontSizePreference', function(error, hasKey) {
  if (error) throw error;
  if (hasKey) {
		storage.get('fontSizePreference', function(error, data) {
		  if (error) throw error;
			document.getElementById("textArea").style.fontSize = data.fontSizePreference + 'px';
	    document.getElementById("option" + data.fontSizePreference + "Label").className += " active";
	    // little fix to undo bootstrap js from setting the first button active
	    document.getElementById("option12Label").className += "btn btn-default";
		});
  }
	else {
		storage.set('fontSizePreference', { fontSizePreference: "14" }, function(error) {
			if (error) throw error;
		});
    document.getElementById("option" + 14 + "Label").className += " active";
    document.getElementById("option12Label").className += "btn btn-default";
	}
});

storage.has('fontTypePreference', function(error, hasKey) {
  if (error) throw error;
  if (hasKey) {
		storage.get('fontTypePreference', function(error, data) {
		  if (error) throw error;
      document.getElementById("textArea").style.fontFamily = data.fontTypePreference;
      document.getElementById("markdownPreview").style.fontFamily = data.fontTypePreference;
	    document.getElementById("fontType").value = data.fontTypePreference;
		});
  }
	else {
		storage.set('fontTypePreference', { fontTypePreference: "Consolas,monaco,monospace" }, function(error) {
			if (error) throw error;
		});
    document.getElementById("fontType").value = "Consolas,monaco,monospace";
	}
});

storage.has('capitalizePreference', function(error, hasKey) {
  if (error) throw error;
  if (hasKey) {
		storage.get('capitalizePreference', function(error, data) {
		  if (error) throw error;
	    document.getElementById("autoCapitalize").value = data.capitalizePreference;
		});
  }
	else {
		storage.set('capitalizePreference', { capitalizePreference: "off" }, function(error) {
			if (error) throw error;
		});
    document.getElementById("autoCapitalize").value = "off";
	}
});

// set current date and open/select the entry for today
var todayRaw = new Date();
var today = (todayRaw.getFullYear() + '-' + todayRaw.getMonthFormatted() + '-' + todayRaw.getDateFormatted());
var currentFileOpen = today + ".txt";

// check for journal path
// then after finding the journal path it goes to load things
// if there is no journal path the user will be prompted to set one

storage.has('journalPath', function(error, hasKey) {
  if (error) throw error;

  if (hasKey) {
		storage.get('journalPath', function(error, data) {
		  if (error) $('#introModal').modal('show');

		  journalDirectory = data.journalPath;

		  if (journalDirectory == "") {
		      $('#introModal').modal('show');
		  }

			// load the calendar for the first time
			var entryList = getEntryList();
			for (i = 0; i < entryList.length; i++) {
			   calendarData.push({"date": entryList[i], "badge": false, "title": "entry"});
			}
			$(document).ready(function () {
			  $("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
			});
			calendarYear = todayRaw.getFullYear();
			calendarMonth = todayRaw.getMonthFormatted();

			fs.readFile(path.join(journalDirectory, currentFileOpen), (err, fd) => {
			  if (err) {
					;
			  }
			  else {
			    document.getElementById("textArea").value = fd;
			  }
			});

			restingStatusText();
			// All ready to go -- the rest are functions that can be called
		});
  }
	else {
		$("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
		$('#introModal').modal('show');
	}
});

// TODO: make entryList global so that the search function doesn't have to spend time getting it again?

function refreshCalendar() {
  calendarData = [];
  var entryList = getEntryList();
  for (i = 0; i < entryList.length; i++) {
     calendarData.push({"date": entryList[i], "badge": false, "title": "entry"});
  }
  $("#my-calendar").empty()
  var workingMonth = currentFileOpen[5] + currentFileOpen[6];
	var workingYear = currentFileOpen[0] + currentFileOpen[1] + currentFileOpen[2] + currentFileOpen[3];
  $("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, month: workingMonth, year: workingYear, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
  putCurrentBadgeOn();
}

function putCurrentBadgeOn() {
  var plainFile = currentFileOpen.split('.')[0];
	// remove previous badge if one exists
  if (activeBadge !== "" && (activeBadge.split('-')[1] == calendarMonth)) {
		var numberToInsert = activeBadge.split('-')[2];
		if (numberToInsert < 10) {
			numberToInsert = numberToInsert[1];
		}
  	var rp = document.getElementById("my-calendar_" + activeBadge + "_day");
    // todo: this is trowing error cannot read property 'firstchild' of null
		while (rp.firstChild) {
        rp.removeChild(rp.firstChild);
    }
    if (activeBadge !== today) {
      rp.insertAdjacentHTML("afterBegin", numberToInsert);
    }
    else {
      rp.insertAdjacentHTML("afterBegin", "<span class='badge badge-today'>" + numberToInsert + "</span>");
    }
  }
  var rb = document.getElementById("my-calendar_" + plainFile + "_day");
  while (rb.firstChild) {
       rb.removeChild(rb.firstChild);
   }
	 var numberToInsert = plainFile.split('-')[2];
	 if (numberToInsert < 10) {
		 numberToInsert = numberToInsert[1];
	 }
   rb.insertAdjacentHTML("afterBegin", "<span class='badge badge-event'>" + numberToInsert + "</span>");
   activeBadge = plainFile;
}

function giveMeDate(id) {
    var date = $("#" + id).data("date");
    var hasEvent = $("#" + id).data("hasEvent");
    var previousFileOpen = currentFileOpen;
    currentFileOpen = date + '.txt';
    if (document.getElementById("textArea").value !== "") {
      saveEntry(previousFileOpen, document.getElementById("textArea").value);
    }
		// TODO: do something more efficient than trying to delete a file on every change.
    else if (document.getElementById("textArea").value == "" && previousFileOpen !== currentFileOpen)  {
      deleteEntry(previousFileOpen);
    }
    if (hasEvent && currentFileOpen !== previousFileOpen) {
      document.getElementById("textArea").value = readEntry(currentFileOpen);
    }
    else if (currentFileOpen !== previousFileOpen) {
      document.getElementById("textArea").value = "";
    }
    restingStatusText();
    putCurrentBadgeOn();
}

function fromSearchDate(arg) {
    var date = arg;
    var previousFileOpen = currentFileOpen;
    currentFileOpen = date + '.txt';
    if (document.getElementById("textArea").value !== "") {
      saveEntry(previousFileOpen, document.getElementById("textArea").value);
    }
		// TODO: do something more efficient than trying to delete a file on every change.
    else if (document.getElementById("textArea").value == "" && previousFileOpen !== currentFileOpen)  {
      deleteEntry(previousFileOpen);
    }
		if (previousFileOpen !== currentFileOpen) {
			document.getElementById("textArea").value = readEntry(currentFileOpen);
    	restingStatusText();
	  }
		// TODO: This is an unnecessaril inneficient workaround because the putCurrentBadgeOn() function was throwing an error when called from here
    refreshCalendar();
		$('#searchModal').modal('hide')
}



function save() {
    if (document.getElementById("textArea").value !== "") {
      saveEntry(currentFileOpen, document.getElementById("textArea").value);
    }
    else {
      deleteEntry(currentFileOpen);
    }
}

var markdownPreviewMode = false;
var converter = new showdown.Converter()
function toggleMarkdown() {
  markdownPreviewMode = !markdownPreviewMode;
  if (markdownPreviewMode) {
    updateMarkdown();
    //$('#textArea').addClass("hide")
    $('#textBox').removeClass("col-md-12 col-lg-12")
    $('#textBox').addClass("col-md-6 col-lg-6")
    $('#markdownPreview').removeClass("hide")
  } else {
    $('#markdownPreview').addClass("hide")
    $('#textBox').addClass("col-md-12 col-lg-12")
    $('#textBox').removeClass("col-md-6 col-lg-6")
    //$('#textArea').removeClass("hide")
  }
}

function updateMarkdown() {
  let v = document.getElementById("textArea").value + "";
  v = v.replace(/{jf}/g, "file://" + journalDirectory);
  const textToHtml = converter.makeHtml(v);
  $('#markdownPreview').html(textToHtml);
}

function setCapitalize(mode) {
  document.getElementById("textArea").style.textTransform = mode;
	storage.set('capitalizePreference', { capitalizePreference: mode }, function(error) {
		if (error) throw error;
	});
}

function updateCapitalize() {
  if (document.getElementById("autoCapitalize").value === "sentences") {
    let t = document.getElementById("textArea");
    var sel = getInputSelection(t);
    let v = t.value;
    v = v.charAt(0).toUpperCase() + v.slice(1)
    let capitalize_dots = (s) => ". " +  s.charAt(2).toUpperCase()
    v = v.replace(/(\. [a-z])/g, capitalize_dots);
    let capitalize_newlines = (s) => "\n" +  s.charAt(1).toUpperCase()
    v = v.replace(/(\n[a-z])/g, capitalize_newlines);
    document.getElementById("textArea").value = v;
    setInputSelection(t, sel.start, sel.end);
  }
}

function updateAll() {
  updateCapitalize();
  updateMarkdown();
}

function setFont(size) {
  document.getElementById("textArea").style.fontSize = size + 'px';
	storage.set('fontSizePreference', { fontSizePreference: size }, function(error) {
		if (error) throw error;
	});
}

function setFontType(fontType) {
  document.getElementById("textArea").style.fontFamily = fontType;
  document.getElementById("markdownPreview").style.fontFamily = fontType;
	storage.set('fontTypePreference', { fontTypePreference: fontType }, function(error) {
		if (error) throw error;
	});
}

$('#settingsModal').on('show.bs.modal', function (event) {
  document.getElementById("journal-directory").innerHTML = journalDirectory;
})

$('#helpModal').on('show.bs.modal', function (event) {
  document.getElementById("journal-directory2").innerHTML = journalDirectory;
})

// Automatic save before closing
window.onbeforeunload = function(){
   save();
}

function myNavFunction(id) {
    var to = $("#" + id).data("to");
		calendarYear = to.year;
		calendarMonth = to.month;
}

// bootstrap-add-clear http://gesquive.github.io/bootstrap-add-clear/
$(function(){
  $("#searchArea").addClear();
});
