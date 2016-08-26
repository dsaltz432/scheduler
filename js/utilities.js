

// example: converts 6 to 18
function getAsMilitaryTime(rawTime){
	var list = rawTime.split(" ");
	var AMPM = list[1];
	var hour = parseInt(list[0].split(":")[0]);
	var minutes = list[0].split(":")[1];
	if (AMPM == "pm" && hour < 12){
		hour += 12;
	}
	var time = hour + ":" + minutes;
	return time
}

// returns a decimal for the time given
function getTimeAsNumber(time){
	var list = time.split(":");
	var hour = list[0];
	var minute = list[1];
	if (minute == "00"){
		return parseInt(hour);
	} else {
		return parseInt(hour) + parseInt(minute)/60;
	}
}

// returns total minutes until startTime, with Monday as the first day
function getAbsoluteStartTime(startTime,day){
	var dayDictionary = {"M":1,"T":2,"W":3,"R":4,"F":5};
	var minutesPerDay = 24*60;
	var totalMinutes = dayDictionary[day]*minutesPerDay + getTimeAsNumber(startTime)*60;
	return totalMinutes; 
}

// generates an array based on the classes the user selects
// If no classes are selected, the calendar shows 10AM to 6PM
// The array of times will only have early or late times to accomodate selected classes
function getTimesArray(timeBlocks){
	var minTime = 999;
	var maxTime = -999;
	if (timeBlocks.length > 0){
		for (var i = 0; i < timeBlocks.length; i++){
			var start = Math.floor(getTimeAsNumber(timeBlocks[i].sectionElements[0].time.startTime));
			var end = Math.ceil(getTimeAsNumber(timeBlocks[i].sectionElements[0].time.endTime));
			if (start < minTime){
				minTime = start;
			} 
			if (end > maxTime){
				maxTime = end;
			}
		}		
	} else { // set default view of calendar to be 10am-6pm if no classes were selected
		minTime = 10;
		maxTime = 18;
	}
	if (minTime > 12){ // latest start time is 12
		minTime = 12;
	}
	if (maxTime < 12 || (maxTime-minTime) < 6){ // earliest end time is 18
		maxTime += 6;
	}
	// console.log(maxTime);
	var timesArr = [];
	for (var i = minTime; i < (maxTime+2); i++){
		var timeString = String(i) + ":00";
		timesArr.push(timeString);
		// console.log(timeString);
	}
	return timesArr;
}

// this is required to draw and shift the class divs properly 
function sortSectionTimesByStartTime(sectionTimes){
	sectionTimes.sort(function (a, b) {
	  if (a.absoluteStartTime > b.absoluteStartTime) {
	    return 1;
	  }
	  if (a.absoluteStartTime < b.absoluteStartTime) {
	    return -1;
	  }
	  return 0;
	});		
}

// returns the index of the item, or -1 if the item isn't in the array
function getIndexIfInArray(itemId, array){
	for (var i = 0; i < array.length; i++){
		if (array[i].id == itemId){
			return i;
		}
	}
	return -1;
}

// returns the index of the SectionTime, or -1 if the SectionTime doesn't exist yet
function getIndexIfInSectionTimeExists(time, sectionTimes){
	for (var i = 0; i < sectionTimes.length; i++){
		if ((time.day == sectionTimes[i].day)
				&& (time.startTime == sectionTimes[i].startTime)
				&& (time.endTime == sectionTimes[i].endTime)){ 
			return i;
		}
	}
	return -1;
}

// takes a military time string, returns a non military time string
function getNonMilitaryTime(militaryTime){
	var t = militaryTime.split(":");
	var hour = parseInt(t[0]);
	var minutes = t[1];

	if (hour > 12){
		hour -= 12;
	}
	return String(hour) + ":" + minutes;
}
