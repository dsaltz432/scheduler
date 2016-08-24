var Course = function(sections,id){
	this.id = id;
	this.sections = sections;
}
var Section = function(elements,id,buttonId){
	this.buttonId = buttonId;
	this.id = id;
	this.selected = false;
	this.eliminated = false;
	this.elements = elements;
}
var SectionElement = function(time,id){
	this.id = id;
	this.time = time;
	this.position = 999;
}
var SectionTime = function(day,startTime,endTime){
	this.id = day+"_"+startTime+"_"+endTime;
	this.startTime = startTime;
	this.endTime = endTime;
	this.day = day;
	this.absoluteStartTime = getAbsoluteStartTime(startTime,day);
	this.count = 1;
}
var TimeBlock = function(sectionElements,id){
	this.width = 1/sectionElements.length;
	this.sectionElements = [];
	this.id = id;
	for (var i = 0; i < sectionElements.length; i++) {
		var position = i;
		this.sectionElements.push(sectionElements[i]);
	}
}