/******************************************************
	Draw Initial Scheduler when a matching URL loads
*******************************************************/

function addSchedulerButton(){
	$("<button>")
		.attr("id","display")
		.attr("type","button")
		.addClass("btn btn-primary")
		.html("Scheduler")
		.css("position","fixed")
		.css("top","0")
		.css("left","0")
		.prependTo("body");
}

function addResetButton(){
	$("<button>")
		.attr("id","reset")
		.attr("type","button")
		.addClass("btn btn-primary")
		.html("Reset Schedule")
		.css("display","none")
		.css("position","fixed")
		.css("top","0")
		.css("left","100px")
		.prependTo("body");
}

function addSectionButtons(){
	var id = 0;
	$(".ddtitle").each(function(){
		$("<button>")
			.attr("style","background-image: none !important") // to override Temple's styles
			.attr("id","sectionButton" + id++)
			.attr("type","button")
			.addClass("sectionButton btn btn-primary")
			.css("margin-left","5%")
			.appendTo(this);
	});
	styleInitialListingButtons();
}

function styleInitialListingButtons(){
	// first set all buttons to "Add"
	styleAddButtons(".sectionButton");

	// then override specific buttons to "Selected" 
	var sections = localStorage.getItem("Sections");
	if (sections != null) { 
		sections = JSON.parse(sections);
		for (var i = 0; i < sections.length; i++) {
			var id = sections[i].buttonId;
			styleSelectedButton(id);
		}			
	}
}

function createSchedulerDiv(){
	$("<div>")
		.addClass("scheduler_container container-fluid")
		.css("background-color","cyan")
		.css("position","fixed")
		.css("display","none")
		.prependTo("body");
}

function drawSideBar(){
	$("<div>")
		.addClass("sideBar")
		.appendTo(".plaintable tbody");

	$("<h3>")
		.addClass("sideBarHeader")
		.html("Sections:")
		.prependTo(".sideBar");

	$("<ul>")
		.addClass("sideBarList")
		.appendTo(".sideBar");

	updateSideBar();
}

function updateSideBar(){
	$(".sideBarList").empty();
	// var colors = localStorage.getItem("Colors");
	var sections = localStorage.getItem("Sections");
	if (sections != null){
		sections = JSON.parse(sections);
		// colors = JSON.parse(colors);
		for (var i = 0; i < sections.length; i++){
			// var color = colors[sections[i].id];
			if (sections[i].selected){ 
				color = "DarkGreen";
				$("<li>")
					.addClass("sideBarListItem")
					.attr("id",sections[i].id+"LI")
					.css("color",color)
					.html(sections[i].id)
					.appendTo(".sideBarList");
			} else if (sections[i].eliminated){
				color = "red";
				$("<li>")
					.addClass("sideBarListItem")
					.attr("id",sections[i].id+"LI")
					.css("color",color)
					.css("text-decoration", "line-through")
					.html(sections[i].id)
					.appendTo(".sideBarList");
			} else{
				color = "white";
				$("<li>")
					.addClass("sideBarListItem")
					.attr("id",sections[i].id+"LI")
					.css("color",color)
					.html(sections[i].id)
					.appendTo(".sideBarList");
			}

		}
	}
}


/******************************************************
	Recalculate TimeBlocks and create new schedule when user clicks "Scheduler"
*******************************************************/

function clickReset(){
	resetClasses();
	recalculateClasses();
	updateSideBar();
}

function resetClasses(){
	var sections = localStorage.getItem("Sections");
	if (sections != null){
		sections = JSON.parse(sections);
		for (var i = 0; i < sections.length; i++){
			sections[i].eliminated = false;
			sections[i].selected = false;
		}
		localStorage.setItem("Sections",JSON.stringify(sections));
	}
}

function clickScheduler(){
	resetClasses();
	updateSideBar();
	if ($(".scheduler_container").css("display") == "none"){
		redrawCalendar();
		$(".scheduler_container").css("display","block");
		$("#reset").css("display","block");
		$(".sectionButton").hide();
	} else{
		$(".scheduler_container").css("display","none");
		$("#reset").css("display","none");
		$(".sectionButton").show();
	}

}

function drawTimes(timeBlocks){
	var timesArr = getTimesArray(timeBlocks);
	var shifts = {};
	var yFactor = 4.5;

	var times_column = $("<div>")
		.attr("id","times_column")
		.addClass("column");

	$("<div>")
		.attr("id","0")
		.addClass("time")
		.html("&nbsp;")
		.appendTo(times_column);

	for (var i = 0; i < timesArr.length; i++) {
		var shiftY = yFactor*i;
		shifts[timesArr[i]] = shiftY; // add to shifts to be used to place events vertically

		var id = timesArr[i].split(":")[0]
		$("<div>")
			.attr("id",(i+8))
			.addClass("time")
			.html(getNonMilitaryTime(timesArr[i]))
			.css("transform","translateY("+shiftY+"vh)")
			.appendTo(times_column);
	}
	times_column.appendTo(".scheduler_container");
	localStorage.setItem("Shifts",JSON.stringify(shifts));
}

function drawColumns(){
	var days = ["M","T","W","R","F"];
	for (var i = 0; i < days.length; i++){
		$("<div>")
			.attr("id",days[i]+"_column")
			.addClass("column")
			.appendTo(".scheduler_container");
	}
}

function drawTimeHeaders(){
	var days = ["M","T","W","R","F"];
	for (var i = 0; i < days.length; i++){
		$("<div>")
			.addClass("day_element")
			.html(days[i])
			.appendTo("#"+days[i]+"_column");
	}
}

function drawWeek(timeBlocks){ 
	for (var i = 0; i < timeBlocks.length; i++){
		var width = timeBlocks[i].width;
		var sectionElements = timeBlocks[i].sectionElements;
		for (var j = 0; j < sectionElements.length; j++){
			var time = sectionElements[j].time;
			var day = time.day;
			var sectionId = sectionElements[j].id.split("_").slice(0,3).join("_");
			$("<button>")
				.addClass("element")
				.addClass(sectionId)
				.attr("id",sectionElements[j].id)
				.html(sectionId)
				.appendTo("#"+day+"_column");
		}
	}
}

function styleSections(){
	var colorsArr = ["blue","red","green","yellow","orange","purple","pink",
				"lime","teal","aqua","burlywood","chartreuse","coral",
				"crimson","greenyellow"];
	var colors = {};
	var sections = JSON.parse(localStorage.getItem("Sections"));
	if (sections != null){
		for (var i = 0; i < sections.length; i++){
			var sectionId = sections[i].id;
			var color = colorsArr[i];
			$("."+sectionId).css("background-color",color);
			$("."+sectionId).css("border-radius","7px");
			$("."+sectionId).css("color","white");
			colors[sectionId] = color;

			if (sections[i].selected){
				$("."+sectionId).css("border-width","7px");
			}
		}
	}
	localStorage.setItem("Colors",JSON.stringify(colors));
}

function adjustElements(timeBlocks){
	var shifts = JSON.parse(localStorage.getItem("Shifts"));
	for (var i = 0; i < timeBlocks.length; i++){
		var width = timeBlocks[i].width;
		var timeBlockId = timeBlocks[i].id;
		var sectionElements = timeBlocks[i].sectionElements;
		for (var j = 0; j < sectionElements.length; j++){
			var id = sectionElements[j].id;
			var time = sectionElements[j].time;
			var startTime = String(time.startTime);
			var endTime = String(time.endTime);
			var day = time.day;
			var length = getLengthOfElement(startTime,endTime);
			var shiftY = getShiftY(timeBlocks,time,timeBlockId,shifts);
			$("#"+id).css("transform","translateY("+shiftY+"vh)");
			$("#"+id).css("height",length+"%");
			$("#"+id).css("width",100*width+"%");
		}
	}
}

function getLengthOfElement(startTime,endTime){
	// 1 hour is 9% height
	var start = getTimeAsNumber(startTime);
	var end = getTimeAsNumber(endTime);
	var length = end-start;
	return 9*length;
}

function getShiftY(timeBlocks,thisTime,thisTimeBlockId,shifts){
	var lengthBelowElement = getMaxLengthOfDivsBelowElement(timeBlocks,thisTime,thisTimeBlockId);
	var lengthBelowFactor = .94;
	var parts = thisTime.startTime.split(":");
	var evenHour = parts[0] + ":00";
	var minutesInt = parseInt(parts[1])/60;
	var minutesFactor = 2.8;
	var base = shifts[evenHour] + minutesInt*minutesFactor;
	var stretchFactor = 1.83;
	var cushionFromTop = 2;
	var total = base*stretchFactor + cushionFromTop - lengthBelowElement*lengthBelowFactor;
	return total;
}

function getMaxLengthOfDivsBelowElement(timeBlocks,thisTime,thisTimeBlockId){
	var total = 0;
	for (var i = 0; i < timeBlocks.length; i++){
		var sectionElements = timeBlocks[i].sectionElements;
		var timeBlockId = timeBlocks[i].id;
		if (sectionElements[0].time.day == thisTime.day && timeBlockId != thisTimeBlockId){
			var max = 0;
			for (var j = 0; j < sectionElements.length; j++){
				var elem = sectionElements[j];
				var len = getLengthOfElement(elem.time.startTime,elem.time.endTime);
				var end = getTimeAsNumber(elem.time.startTime);
				var thisStart = getTimeAsNumber(thisTime.startTime);

				if (thisStart >= end && len > max){
					max = len;
				}
			}
			total += max;
		}
	}
	return total;
}

// uses Sections and SectionTimes localStorage to determine what classes are selected
// creates and returns an array of TimeBlocks that will be displayed on the calendar
function getTimeBlocks(){
	var timeBlocks = [];
	var sections = localStorage.getItem("Sections");
	var sectionTimes = localStorage.getItem("SectionTimes");

	if (sectionTimes != null){
		sectionTimes = JSON.parse(sectionTimes);
		sections = JSON.parse(sections);
		removeEliminatedSectionTimes(sectionTimes,sections);
		sortSectionTimesByStartTime(sectionTimes);

		// adds all TimeBlocks to array
		for (var i = 0; i < sectionTimes.length; i++){
			var elementList = getSectionElementsInSectionTime(sections,sectionTimes[i]);
			var timeBlock = new TimeBlock(elementList,i); 
			timeBlocks.push(timeBlock);			
		}
	} 
	removeEliminatedSections(timeBlocks,sections);
	removeDuplicateTimeBlocks(timeBlocks);
	resetWidths(timeBlocks);
	return timeBlocks;
}

// removes SectionTimes that only exist in eleminated Sections
function removeEliminatedSectionTimes(sectionTimes, sections){
	for (var i = 0; i < sections.length; i++){
		if (sections[i].eliminated){
			for (j = 0; j < sections[i].elements.length; j++){
				var e = sections[i].elements[j];
				var index = getIndexIfInSectionTimeExists(e.time,sectionTimes);

				if (sectionTimes[index].count > 0){
					sectionTimes[index].count--;
					if (sectionTimes[index].count == 0){
						sectionTimes.splice(index,1);
					}
				} 
			}		
		}

	}
}

function resetWidths(timeBlocks){
	for (var i = 0; i < timeBlocks.length; i++){
		var length = timeBlocks[i].sectionElements.length;
		timeBlocks[i].width = 1/length;
	}
}

// iterates through each timeBlock, checking to make sure no TimeBlock is a subset of any other TimeBlock
function removeDuplicateTimeBlocks(timeBlocks){
	for (var i = 0; i < timeBlocks.length; i++){
		for (var j = 0; j < timeBlocks.length; j++){
			if (j != i){ // don't test own TimeBlock
				removeBlockIfSubset(timeBlocks,timeBlocks[i],timeBlocks[j]);
			}
		}
	}
}

// tests whether the testingBlock contains all elements in the currentBlock, but with
//			less than or equal to the amount of elements
function removeBlockIfSubset(timeBlocks, currentBlock, testingBlock){
	var currentLength = currentBlock.sectionElements.length;
	var exists = true;
	for (var j = 0; j < currentBlock.sectionElements.length; j++){
		if (getIndexIfInArray(currentBlock.sectionElements[j].id,testingBlock.sectionElements) < 0){ // testElement not in current TimeBlock's elements
			exists = false;
			break;
		} 
	}
	if (exists) { // all of the currentBlock elements are in that timeBlock's elements
		if (currentBlock.sectionElements.length <= testingBlock.sectionElements.length){ // remove all timeBlocks with less or equal amount of elements
			var index = getIndexIfInArray(currentBlock.id,timeBlocks);
			timeBlocks.splice(index,1);
		} 
	}
} 	

// remove eliminated Sections from elements of TimeBlocks, and then remove empty TimeBlocks
// must iterate in reverse so splicing doesn't skip any elements
function removeEliminatedSections(timeBlocks,sections){
	for (var i = timeBlocks.length-1; i >= 0; i--){
		var elements = timeBlocks[i].sectionElements;

		for (var j = elements.length-1; j >= 0; j--){
			var sectionId = elements[j].id.split("_").slice(0,3).join("_");
 			var sectionIndex = getIndexIfInArray(sectionId,sections);

 			if (sections[sectionIndex].eliminated){
 				elements.splice(j,1);
 			} 
		}

		if (elements.length == 0) { // remove empty TimeBlocks
			timeBlocks.splice(i,1);
		} 
	}
}

// Given a SectionTime, this function returns a list of all SectionElements that 
// 		are the same or conflicting time as the passed in SectionTime
function getSectionElementsInSectionTime(sections,time){
	var start = getTimeAsNumber(time.startTime);
	var end = getTimeAsNumber(time.endTime);
	var day = time.day;
	var list = [];
	for (var i = 0; i < sections.length; i++) {
		for (var j = 0; j < sections[i].elements.length; j++){
			var t = sections[i].elements[j].time;
			var elementStart = getTimeAsNumber(t.startTime);
			var elementEnd = getTimeAsNumber(t.endTime);

			if (day == t.day && // must be the same day 
					// AND one of the following conflict conditions must be true
					   ((elementStart >= start && elementStart < end)
					|| (elementEnd <= end && elementEnd > start)
					|| (elementStart <= start && elementEnd >= end))){ 
				list.push(sections[i].elements[j]);
			}
		}
	}
	return list; 
}

/******************************************************
				Click Handling
*******************************************************/

// this function is necessary because we are dynamically creating buttons
// we have to create click handlers after the buttons have been created
function addEventListeners() {
    $("body #reset").on("click", function() {
    	clickReset();
    });
    $("body #display").on("click", function() {
    	clickScheduler();
    });
   	$("body .sectionButton").on("click", function() {
    	clickSectionButton(this.id); 
    });
    $("body").on("click", "button.element", function(){
    	clickElement(this.id); 
	});
}

function clickSectionButton(id){
	var sectionId = getSectionIdOfSectionButton(id);
	var body = $("#"+id).parent().parent().next().find("table").children().eq(1).children().eq(1);
	
	// checks to see if you are adding or removing an element
	if ($("#"+id).html() == "Add"){
		addItemsToStorage(sectionId,body,id);
		styleSelectedButton(id);
	} else if ($("#"+id).html() == "Selected"){
		removeItemsFromStorage(sectionId,body);
		styleAddButtons("#"+id);
	}
	updateSideBar();
}

function getSectionIdOfSectionButton(id){
	var header = $("#"+id).prev().html();
	var headerList = header.split("-");
	
	if (headerList[0].trim() == "Seminar"){ // remove "Seminar" from headerList
		headerList.splice(0,1);
	}

	var courseSubject = headerList[2].split(" ")[1];
	var courseId = headerList[2].split(" ")[2];
	var sectionNumber = headerList[3].trim();	
	var sectionId = courseSubject + "_" + courseId + "_" + sectionNumber;
	return sectionId;
}

function clickElement(id){
	var sections = JSON.parse(localStorage.getItem("Sections"));
	var sectionId = id.split("_").slice(0,3).join("_");
	var index = getIndexIfInArray(sectionId,sections);

	if (index >= 0){
		if (sections[index].selected == true) { // is elemented being selected or unselected
			addBackConflictingSections(sections,sections[index]);
			// removeSectionFromSideBar(sections[index].id);
			sections[index].selected = false;
		} else {
			removeConflictingSections(sections,sections[index]);
			// addSectionToSideBar(sections[index].id);
			sections[index].selected = true;
		}	
	}
	localStorage.setItem("Sections",JSON.stringify(sections));
	recalculateClasses();
	updateSideBar();
}

// only sets sections eliminated to false if it does not conflict from a separate section that is "selected"
function addBackConflictingSections(sections, clickedSection){
	var indexOfClickedSection = getIndexIfInArray(clickedSection.id,sections);
	sections[indexOfClickedSection].selected = false; // first sets the clicked section to not selected

	for (var i = 0; i < clickedSection.elements.length; i++){
		var time = clickedSection.elements[i].time;
		var conflictingElements = getSectionElementsInSectionTime(sections,time);
		for (var x = 0; x < conflictingElements.length; x++){
			var conflictSectionId = conflictingElements[x].id.split("_").slice(0,3).join("_");
			if (conflictSectionId != clickedSection.id){
				var diffConflict = false;
				var conflictsOfConflicts = getSectionElementsInSectionTime(sections,conflictingElements[x].time);
				for (var y = 0; y < conflictsOfConflicts.length; y++){
					var sId = conflictsOfConflicts[y].id.split("_").slice(0,3).join("_");
					var sectionIndex = getIndexIfInArray(sId,sections);
					if (sectionIndex >= 0 && sections[sectionIndex].selected){
						diffConflict = true;
						break;						
					}
				}	
			}
			if (!diffConflict) {
				var cIndex = getIndexIfInArray(conflictSectionId,sections);
				sections[cIndex].eliminated = false;
			}
			
		}	
	}
}

// goes through each SectionElement of the selected Section
// finds the SectionTime of each element, removing conflicting times
function removeConflictingSections(sections, clickedSection){
	for (var i = 0; i < clickedSection.elements.length; i++){
		var time = clickedSection.elements[i].time;
		// console.log("TESTING: " + )
		var conflictingElements = getSectionElementsInSectionTime(sections,time);
		// console.log(conflictingElements.length);
		for (var x = 0; x < conflictingElements.length; x++){
			var sectionId = conflictingElements[x].id.split("_").slice(0,3).join("_");
			// console.log(sectionId);
			for (z = 0; z < sections.length; z++){
				if (sectionId == sections[z].id && sectionId != clickedSection.id){
					sections[z].eliminated = true;
				}		
			}

		}	
	}
}

// this gets called whenever the user selects a class, or hits "reset"
// it recalculates and redraws the TimeBlocks, but leaves the headers and times column the same
function recalculateClasses(){
	var timeBlocks = getTimeBlocks();
	$("#M_column").empty();
	$("#T_column").empty();
	$("#W_column").empty();
	$("#R_column").empty();
	$("#F_column").empty();
	drawTimeHeaders();
	drawWeek(timeBlocks);
	styleSections();
	adjustElements(timeBlocks);
}

// recalculates and redraws the TimeBlocks and the times column 
// gets called when the calendar is opened and closed
function redrawCalendar(){
	$(".scheduler_container").empty();
	var timeBlocks = getTimeBlocks();
	drawTimes(timeBlocks);
	drawColumns();
	drawTimeHeaders();
	drawWeek(timeBlocks);
	styleSections();
	adjustElements(timeBlocks);
}


/******************************************************
		Adds and removes objects from localStorage
*******************************************************/

function addItemsToStorage(sectionId,body,buttonId){
	var list = body.children();
	var days = list.eq(2).html();
	var rawTime = list.eq(1).text();
	var sectionTimeObjects = getSectionTimeObjects(rawTime,days);
	addTimeObjectsToStorage(sectionTimeObjects);
	var sectionElements =  getSectionElementsObjects(sectionTimeObjects,sectionId);
	var sectionObject = getSectionObject(sectionElements,sectionId,buttonId);
	addSectionObjectToStorage(sectionObject);
	var courseId = sectionId.split("_").slice(0,2).join("_");
	addToOrCreateNewCourseObject(sectionObject,courseId);
}

function removeItemsFromStorage(sectionId,body){
	var list = body.children();
	var days = list.eq(2).html();
	var rawTime = list.eq(1).text();
	var sectionTimeObjects = getSectionTimeObjects(rawTime,days);
	modifyOrRemoveTimeObjectsFromStorage(sectionTimeObjects);
	removeSectionObjectFromStorage(sectionId);
	modifyOrRemoveCourseObjectFromStorage(sectionId);
}

function modifyOrRemoveCourseObjectFromStorage(sectionId){
	var courses = JSON.parse(localStorage.getItem("Courses"));
	var courseId = sectionId.split("_").slice(0,2).join("_");
	var courseIndex = getIndexIfInArray(courseId,courses);
	if (courseIndex >= 0){
		var sections = courses[courseIndex].sections;
		var sectionIndex = getIndexIfInArray(sectionId,sections);

		if (sectionIndex >= 0){
			sections.splice(sectionIndex,1);
			if (sections.length == 0){ // only Section in that Course, so remove the Course
				courses.splice(courseIndex,1);
			}			
		}
	}
	localStorage.setItem("Courses",JSON.stringify(courses));
}

function removeSectionObjectFromStorage(sectionId){
	var sections = JSON.parse(localStorage.getItem("Sections"));
	var index = getIndexIfInArray(sectionId, sections);
	
	if (index >= 0){ // found Section
		sections.splice(index,1);
	}
	localStorage.setItem("Sections",JSON.stringify(sections));
}

function modifyOrRemoveTimeObjectsFromStorage(sectionTimeObjects){
	var sectionTimes = JSON.parse(localStorage.getItem("SectionTimes"));
	for (var i = 0; i < sectionTimeObjects.length; i++){ // for each new SectionTime
		var index = getIndexIfInSectionTimeExists(sectionTimeObjects[i],sectionTimes);
		if (index >= 0){ 
			if (sectionTimes[index].count == 1){ // only one with that SectionTime
				sectionTimes.splice(index,1);
			} else {
				sectionTimes[index].count--;
			}	
		}
	}
	localStorage.setItem("SectionTimes",JSON.stringify(sectionTimes));
}

function addSectionObjectToStorage(sectionObject){
	var sections = localStorage.getItem("Sections");
	if (sections != null){
		sections = JSON.parse(sections);
	} else { // sections is empty
		sections = [];
	}
	sections.push(sectionObject);
	localStorage.setItem("Sections",JSON.stringify(sections));
}


function addTimeObjectsToStorage(sectionTimeObjects){
	var sectionTimes = localStorage.getItem("SectionTimes");
	if (sectionTimes != null){
		sectionTimes = JSON.parse(sectionTimes);
		for (var i = 0; i < sectionTimeObjects.length; i++){ // for each new SectionTime
			var index = getIndexIfInSectionTimeExists(sectionTimeObjects[i],sectionTimes);
			if (index >= 0){ 
				sectionTimes[index].count++;
			} else {
				sectionTimes.push(sectionTimeObjects[i]);
			}
		}
	} else { // SectionTimes is empty
		sectionTimes = [];

		for (var i = 0; i < sectionTimeObjects.length; i++){ // for each new SectionTime
			sectionTimes.push(sectionTimeObjects[i]);
		}
	}
	localStorage.setItem("SectionTimes",JSON.stringify(sectionTimes));
}

function addToOrCreateNewCourseObject(sectionObject,courseId){
	var courses = localStorage.getItem("Courses");
	if (courses != null){
		courses = JSON.parse(courses);
		var index = getIndexIfInArray(courseId,courses);

		if (index >= 0){
			courses[index].sections.push(sectionObject);
		} else {
			var newCourseObject = new Course([sectionObject],courseId);
			courses.push(newCourseObject);
		}	
	} else { // SectionTimes is empty
		courses = [];
		var newCourseObject = new Course([sectionObject],courseId);
		courses.push(newCourseObject);
	}
	localStorage.setItem("Courses",JSON.stringify(courses));
}

function getSectionObject(sectionElements,sectionId,buttonId){
	var newSectionObject = new Section(sectionElements,sectionId,buttonId);
	return newSectionObject;
}

function getSectionElementsObjects(timeObjects,sectionId){
	var sectionElements= [];
	for (var i = 0; i < timeObjects.length; i++){
		var id = sectionId + "_" + i;
		var newSectionElement = new SectionElement(timeObjects[i],id);
		sectionElements.push(newSectionElement);
	}
	return sectionElements;
}

function getSectionTimeObjects(rawTime,days){
	if (rawTime == "TBA"){
		alert("The time for this listing is TBA");
		return 0; // use this value as error code
	} else {
		var split = rawTime.split("-");
		var startTime = getAsMilitaryTime(split[0].trim());
		var endTime = getAsMilitaryTime(split[1].trim());

		var timeObjects = [];
		var daysArr = days.split("");
		for (var i = 0; i < daysArr.length; i++){
			var newSectionTime = new SectionTime(daysArr[i],startTime,endTime);
			timeObjects.push(newSectionTime);
		}
		return timeObjects;
	}
}

/******************************************************
				CSS Functions
*******************************************************/

function styleAddButtons(selector){
	$(selector)
		.html("Add")
		.css("background-color","red");
}

function styleSelectedButton(id){
	$("#"+id)
		.html("Selected")
		.css("background-color","green");
}

init();
	function init() {
		console.log("loaded content_script");

		// var frame = $(document).find("frame[name='content'] html")[0];
		// console.log(frame);

		// var main = $(".main", top.frames["nav"]);
		// console.log("main: " + main);

		// var x = $(".datadisplaytable tbody", top.frames["content"]).children();
		// console.log(x);

		createSchedulerDiv();
		drawSideBar();
		addResetButton();
		addSchedulerButton();
		addSectionButtons();
		addEventListeners();
	}

