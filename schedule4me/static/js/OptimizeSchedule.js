/*
    OptimizeSchedule.js: Defines classes and functions for the algorithm of creating an
    optimized schedule for the user based on the tasks they entered

    The Data Minors:
    - Andrew Whitman
    - Dean Orenstein
    - Gage Aykroyd
    - Mary Ashley Vance
*/

// class definitions
class Task {
    constructor(_name, _priority, _duration, _passive, _deadlineDay, _deadlineTime) {
        this.name = _name
        this.priority = _priority;
        this.duration = _duration;
        this.passive = _passive;
        this.deadlineDay = _deadlineDay;
        this.deadlineTime = _deadlineTime;

        this.start = 0;
        this.end = 0;
    }
}

class ToDoList {
    constructor(v) {
        this.tasks = v;
    }
}

class Timeblock {
    constructor(_name, _start, _end, md, tu, wd, th, fr, sa, su) {
        this.name = _name;
        this.start = _start;
        this.end = _end;
        this.passive = false;
        this.md = md;
        this.tu = tu;
        this.wd = wd;
        this.th = th;
        this.fr = fr;
        this.sa = sa;
        this.su = su;
    }
}

class Schedule {
    constructor() {
        this.name = ""
        this.Monday = ["Monday"];
        this.Tuesday = ["Tuesday"];
        this.Wednesday = ["Wednesday"];
        this.Thursday = ["Thursday"];
        this.Friday = ["Friday"];
        this.Saturday = ["Saturday"];
        this.Sunday = ["Sunday"];
        this.week = [this.Monday, this.Tuesday, this.Wednesday, this.Thursday, this.Friday, this.Saturday, this.Sunday];
    }
}


// session storage: stores the JavaScript variables to be accessed across templates and functions
myStorage = window.sessionStorage;


// helper functions
function sortByDeadlineDay(tasks) {
    tasks.sort(function(a, b) {
        // YYYY-MM-DD
        let aYear = a.deadlineDay.substring(0, 4);
        let aMonth = a.deadlineDay.substring(5, 2);
        let aDay = a.deadlineDay.substring(8);

        let bYear = b.deadlineDay.substring(0, 4);
        let bMonth = b.deadlineDay.substring(5, 2);
        let bDay = b.deadlineDay.substring(8);

        if (aMonth == bMonth) {
            return aDay - bDay;
        }
        else if (aYear == bYear) {
            return bMonth - aMonth;
        }
        else {
            return aYear - bYear;
        }
    });
}

// called after sortByDeadlineDay()
function sortByDeadlineTime(tasks) {
    tasks.sort(function(a, b) {
        if (a.deadlineDay == b.deadlineDay) {
            return a.deadlineTime - b.deadlineTime;
        }
        else {
            return 0;
        }
    });
}

// called after sortByDeadline()
function sortByPriority(tasks) {
    tasks.sort(function(a, b) {
        if (a.deadlineTime == b.deadlineTime) {
            return a.priority - b.priority;
        } else {
            return 0;
        }
    });
}

function sortList(tdl) {
    let tasks = tdl.tasks;
    sortByDeadlineDay(tasks);
    sortByDeadlineTime(tasks);
    sortByPriority(tasks);
}

function time2int(time) {
    let timeString = time.toString();
    let hrs = timeString.substr(0, 2);
    let min = timeString.substr(3, 2);
    let numMin = (parseInt(hrs) * 60) + parseInt(min);
    return numMin;
}

function int2time(val) {
    let numHrs = Math.floor(val / 60);
    let numMin = val - (numHrs * 60);

    let time = ""
    let minString = ""
    let hrsString = ""

    if (numMin < 10) {
        minString = "0".concat(numMin.toString());
    }
    else {
        minString = numMin.toString();
    }
    if (numHrs < 10)
    {
        hrsString = "0".concat(numHrs.toString());
    }
    else {
        hrsString = numHrs.toString();
    }

    time = hrsString.concat(":");
    time = time.concat(minString);
    return time;
}

function printTDL(tdl) {
    for (var i = 0; i < tdl.tasks.length; i++) {
        console.log(tdl.tasks[i]);
    }
}

function printSchedule(schedule) {
    for (var i = 0; i < 7; i++) {
        console.log(schedule.week[i]);
    }
}

function schedule2txt(schedule) {
    let scheduleText = "";
    scheduleText = scheduleText.concat(schedule.name, '\n');
    for (var i = 0; i < 7; i++) {
        scheduleText = scheduleText.concat(schedule.week[i][0], '\n');
        for (var j = 1; j < schedule.week[i].length; j++) {
            scheduleText = scheduleText.concat(schedule.week[i][j].name.padEnd(20, " "));
            scheduleText = scheduleText.concat(schedule.week[i][j].start, '-');
            scheduleText = scheduleText.concat(schedule.week[i][j].end, '\n');
        }
        scheduleText = scheduleText.concat('\n');
        //console.log("Schedule text is: " + scheduleText);
    }
    return scheduleText;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


// validate fields
function validate(name, task, priority, duration, date, time){
    for (var i = 0; i < task.length; i++) {
        if (name == "") {
            window.alert("Please make sure you have a name for your schedule!");
            return false;
        }
        else if (task[i].value == "") {
            window.alert("Please make sure you have a name for each task!");
            return false;
        }
        else if (priority[i].value == "") {
            window.alert("Please put a priority between 1 and 5 for each task!");
            return false;
        }
        else if (priority[i].value != 1 && priority[i].value != 2 && priority[i].value != 3 && priority[i].value != 4 && priority[i].value != 5){
            window.alert("Please put a priority between 1 and 5!");
            return false;
        }
        else if (duration[i].value == "") {
            window.alert("Please make sure you have a duration in minutes for each task!");
            return false;
        }
        else if (duration[i].value < 0) {
            window.alert("Please make sure you have a duration in minutes greater than 0!")
            return false;
        }
        else if (date[i].value == "") {
            window.alert("Please make sure you have a deadline date for each task!");
            return false;
        }
        else if (time[i].value == "") {
            window.alert("Please make sure you have a dealine time for each task!");
            return false;
        }
        else {
            console.log("All inputs for task " + i+1 + " have good values!");
        }
    }
    return true;

}


function validateTB(name, start, end, mon, tue, wed, thu, fri, sat, sun){
    if (name.length == 0) { return true; }
    for (var i = 0; i < name.length; i++) {
        if (name[i].value == "") {
            window.alert("Please make sure you have a name for your time block!");
            return false;
        }
        else if (start[i].value == "") {
            window.alert("Please make sure you have a start time for your time block!");
            return false;
        }
        else if (end[i].value == "") {
            window.alert("Please make sure you have a end time for your time block!");
            return false;
        }
        else if (start[i].value >= end[i].value) {
            window.alert("Please make sure that the all start times are before the all end times for the time blocks!");
            return false;
        }
        else if (mon[i].checked == false && tue[i].checked == false && wed[i].checked == false &&
            thu[i].checked == false && fri[i].checked == false && sat[i].checked == false &&
            sun[i].checked == false) {
            window.alert("Please make sure you have atleast one day checked!");
            return false;
        }
        else {
            console.log("All inputs for this time block are good!")
        }
    }
    return true;
}


function validateLogin(featureName) {
    var skip = sessionStorage.getItem('skip');
    var button = document.getElementsByName(featureName)[0];
    if (skip == "true") {
        window.alert("You must sign in to have access to this feature!");
        button.value = 'off';
    }
}


function validateSkip() {
    var skip = sessionStorage.getItem('skip');
    if(skip == "true") {
        window.alert("You must sign in to have access to this feature!");
        return false;
    }
    else {
        $("#import-list-modal").modal();
    }
}


function signIn() {
    sessionStorage.setItem('skip','false');
}


function skipSignIn() {
    sessionStorage.setItem('skip','true');
    window.location.href = "data-enter";
}


// prevents form from submiting if there is a validation error
const element = document.querySelector('form');
element.addEventListener('submit', event => {
    var pass = submit();
    if(!pass){
        event.preventDefault();
    }
});


// Return the HTML for the outputted calendar cell, depending on the task's content and day, as well as the task string
function processTask(content, day) {
    var taskHTML;
    var hiddenTask;
    if (day == "md") {
        hiddenTask = "md";
        taskHTML = "<div class=\"offset-md-2 col-md-1 monday\" style=\"background-color: rgb(171, 177, 171)\">" + content + "</div>";
    }
    else if (day == "tu") {
        hiddenTask = "tu";
        taskHTML = "<div class=\"col-md-1 tuesday\">" + content + "</div>";
    }
    else if (day == "wd") {
        hiddenTask = "wd";
        taskHTML = "<div class=\"col-md-1 wednesday\" style=\"background-color: rgb(171, 177, 171)\">" + content + "</div>";
    }
    else if (day == "th") {
        hiddenTask = "th";
        taskHTML = "<div class=\"col-md-1 thursday\">" + content + "</div>";
    }
    else if (day == "fr") {
        hiddenTask = "fr";
        taskHTML = "<div class=\"col-md-1 friday\" style=\"background-color: rgb(171, 177, 171)\">" + content + "</div>";
    }
    else if (day == "sa") {
        hiddenTask = "sa";
        taskHTML = "<div class=\"col-md-1 saturday\">" + content + "</div>";
    }
    else {
        hiddenTask = "su";
        taskHTML = "<div class=\"col-md-1 sunday\" style=\"background-color: rgb(171, 177, 171)\">" + content + "</div>";
    }
    hiddenTask += content + "||";  // || indicates a new task (used as a separator in success page view)

    return [taskHTML, hiddenTask];
}


// assign to correct time slot in calendar
function timeSlot(md, tu, wd, th, fr, sa, su) {
    var maxLen = md.length;
    if (maxLen < tu.length) { maxLen = tu.length; }
    if (maxLen < wd.length) { maxLen = wd.length; }
    if (maxLen < th.length) { maxLen = th.length; }
    if (maxLen < fr.length) { maxLen = fr.length; }
    if (maxLen < sa.length) { maxLen = sa.length; }
    if (maxLen < su.length) { maxLen = su.length; }

    // create the HTML for the calendar on the output page and add to the hidden div for backend database inserting
    var taskContainer = document.getElementById("hidden-tasks");
    var taskString = "";
    for (var i = 1; i < maxLen; i++){
        var row = "<div class=\"row\">";
        if (i < md.length && (md[i] != "")) {
            var HTMLandTask = processTask(md[i], "md");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-3 mondayF\"></div>";
            row += task;
        }
        if (i < tu.length && (tu[i] != "")) {
            var HTMLandTask = processTask(tu[i], "tu");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 tuesdayF\"></div>";
            row += task;
        }
        if (i < wd.length && (wd[i] != "")) {
            var HTMLandTask = processTask(wd[i], "wd");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 wednesdayF\"></div>";
            row += task;
        }
        if (i < th.length && (th[i] != "")) {
            var HTMLandTask = processTask(th[i], "th");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 thursdayF\"></div>";
            row += task;
        }
        if (i < fr.length && (fr[i] != "")) {
            var HTMLandTask = processTask(fr[i], "fr");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 fridayF\"></div>";
            row += task;
        }
        if (i < sa.length && (sa[i] != "")) {
            var HTMLandTask = processTask(sa[i], "sa");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 saturdayF\"></div>";
            row += task;
        }
        if (i < su.length && (su[i] != "")) {
            var HTMLandTask = processTask(su[i], "su");
            row += HTMLandTask[0];
            taskString += HTMLandTask[1];
        }
        else {
            var task = "<div class=\"offset-md-1 sundayF\"></div>";
            row += task;
        }
        row += "</div>"
        $('#tasks').append(row);   
    }
    
    numTasksInput = document.getElementById("numTasks");
    numTasksInput.setAttribute("value", String(md.length + tu.length + wd.length + th.length + fr.length + sa.length + su.length));

    taskStringInput = document.getElementById("tasksString");
    taskStringInput.setAttribute("value", taskString);
}


// naive implementation, might be slow with many tasks. arg1 = todo list with the tasks. arg2 = the new schedule to populate
function createSchedule(tdl, schedule) {
    const numTasks = tdl.tasks.length;
    var taskPlaced = false;
    var tasksPlaced = 1;    // delete later

    for (var i = 0; i < numTasks; i++) {
        taskPlaced = false;
        tasksPlaced++;
        for (var j = 0; j < 7; j++) {
            if (taskPlaced) {
                taskPlaced = false;
                break;
            }

            // If this is the first task to be placed on this day, simply set the start and end times
            if (schedule.week[j].length == 1) {
                tdl.tasks[i].start = int2time(0);
                tdl.tasks[i].end = int2time(tdl.tasks[i].duration);
                schedule.week[j].splice(1, 0, tdl.tasks[i]);
                taskPlaced = true;
            }

            // Else, if theres 1 task taking up the day
            else if (schedule.week[j].length == 2) {
                // If the placed task is passive, then the start time of this task is the start time of the current one
                if (schedule.week[j][1].passive == true) {
                    tdl.tasks[i].start = schedule.week[j][1].start;
                }
                // Else, the start time is the end time of the placed task
                else {
                    tdl.tasks[i].start = schedule.week[j][1].end;
                }
                tdl.tasks[i].end = int2time(time2int(tdl.tasks[i].start) + tdl.tasks[i].duration);

                schedule.week[j].splice(2, 0, tdl.tasks[i]);
                taskPlaced = true;
            }
            
            // Else, loop through the tasks we have for the day and determine where to put the task
            else {
                // k begins at 1 in order to skip day name placeholder in the array
                for (var k = 1; k < schedule.week[j].length-1; k++) {
                    if (!taskPlaced) {
                        if (tdl.tasks[i].passive == true) { // task to be placed is passive
                            // this implementation will frontload all passive tasks to the same time (e.g. first thing in the morning)
                            // possibly improved with a target average hours per day
                            tdl.tasks[i].start = schedule.week[j][k].end;
                            tdl.tasks[i].end = int2time(time2int(tdl.tasks[i].start) + tdl.tasks[i].duration);
                            schedule.week[j].splice(k+1, 0, tdl.tasks[i]);
                            taskPlaced = true;
                        }
        
                        else if (schedule.week[j][k+1].passive == true) { // ignore placed passive tasks
                            // assign l to be the index of the last consecutive passive task
                            let l = k+1;
                            while (schedule.week[j][l+1].passive == true) l++;
                            if (time2int(schedule.week[j][l+1].start) - time2int(schedule.week[j][k].end) >= tdl.tasks[i].duration) {
                                tdl.tasks[i].start = schedule.week[j][k].end;
                                tdl.tasks[i].end = int2time(time2int(tdl.tasks[i].start) + tdl.tasks[i].duration);
                                // splice at k+2 to preserve order based on start time
                                schedule.week[j].splice(k+2, 0, tdl.tasks[i]);
                                taskPlaced = true;
                            }
                        }
        
                        else {
                            // If we can fit the task in between the current pair of already placed tasks
                            if (time2int(schedule.week[j][k+1].start) - time2int(schedule.week[j][k].end) >= tdl.tasks[i].duration) {
                                tdl.tasks[i].start = schedule.week[j][k].end;
                                tdl.tasks[i].end = int2time(time2int(tdl.tasks[i].start) + tdl.tasks[i].duration);
                                schedule.week[j].splice(k+1, 0, tdl.tasks[i]);
                                taskPlaced = true;
                            }
                            // Otherwise, if we are on the last iteration and we can add the task onto what we already have without moving into the next day
                            else if (k == schedule.week[j].length-2 && time2int(schedule.week[j][k+1].end) + tdl.tasks[i].duration <= 24 * 60) {
                                tdl.tasks[i].start = schedule.week[j][k+1].end;
                                tdl.tasks[i].end = int2time(time2int(tdl.tasks[i].start) + tdl.tasks[i].duration);
                                schedule.week[j].splice(k+2, 0, tdl.tasks[i]);
                                taskPlaced = true;
                            }
                        }
                    }
                }
            }
        }
    }
}


// take in input from webpage
function submit() {
    var sleepStart = document.getElementById("sleepStart").value;
    var sleepEnd = document.getElementById("sleepEnd").value;
    var lunchStart = document.getElementById("lunchStart").value;
    var lunchEnd = document.getElementById("lunchEnd").value;
    var freeStart = document.getElementById("freeStart").value;
    var freeEnd = document.getElementById("freeEnd").value;

    var addName = document.getElementsByClassName("addNameTB");
    var addStart = document.getElementsByClassName("addStartTB");
    var addEnd = document.getElementsByClassName("addEndTB");
    var addMon = document.getElementsByClassName("mon");
    var addTue = document.getElementsByClassName("tue");
    var addWed = document.getElementsByClassName("wed");
    var addThu = document.getElementsByClassName("thu");
    var addFri = document.getElementsByClassName("fri");
    var addSat = document.getElementsByClassName("sat");
    var addSun = document.getElementsByClassName("sun");

    var scheduleName = document.getElementsByName("schedule-name")[0].value;
    var task = document.getElementsByClassName("name");
    var priority = document.getElementsByClassName("priority");
    var duration = document.getElementsByClassName("duration");
    var passive = document.getElementsByClassName("passive");
    var deadlineD = document.getElementsByClassName("date");
    var deadlineT = document.getElementsByClassName("deadline");

    var passVal = validate(scheduleName, task, priority, duration, deadlineD, deadlineT);
    var passValTB = validateTB(addName, addStart, addEnd, addMon, addTue, addWed, addThu, addFri, addSat, addSun);

    if (passVal && passValTB) {
        
        var userSchedule = new Schedule();
        userSchedule.name = scheduleName;

        // timeblocks
        var tbs = [[], [], [], [], [], [], []];
        const lunch = new Timeblock("lunch", lunchStart, lunchEnd, true, true, true, true, true, true, true);
        const freeTime = new Timeblock("free time", freeStart, freeEnd, true, true, true, true, true, true, true);
        tbs.forEach(element => element.push(lunch));
        tbs.forEach(element => element.push(freeTime));

        if (time2int(sleepEnd) - time2int(sleepStart) < 0) { // user goes to sleep before midnight
            // split sleep into morning and night blocks
            const sleepMorning = new Timeblock("sleep", "00:00", sleepEnd);
            const sleepNight = new Timeblock("sleep", sleepStart, "24:00");
            tbs.forEach(element => element.push(sleepMorning));
            tbs.forEach(element => element.push(sleepNight));
        } else {
            // use sleep block as is
            const sleep = new Timeblock("sleep", sleepStart, sleepEnd, true, true, true, true, true, true, true);
            tbs.forEach(element => element.push(sleep));
        }
        
        for (var i = 0; i < addName.length; i++) {
            let tb = new Timeblock(addName[i].value, addStart[i].value, addEnd[i].value, addMon[i].checked, addTue[i].checked, addWed[i].checked, addThu[i].checked, addFri[i].checked, addSat[i].checked, addSun[i].checked);
            if (addMon[i].checked == true) {
                tbs[0].push(tb);
            }
            if (addTue[i].checked == true) {
                tbs[1].push(tb);
            }
            if (addWed[i].checked == true) {
                tbs[2].push(tb);
            }
            if (addThu[i].checked == true) {
                tbs[3].push(tb);
            }
            if (addFri[i].checked == true) {
                tbs[4].push(tb);
            }
            if (addSat[i].checked == true) {
                tbs[5].push(tb);
            }
            if (addSun[i].checked == true) {
                tbs[6].push(tb);
            }
        }
        for (var i = 0; i < tbs.length; i++) {
            tbs[i].sort(function(a, b) {
                return time2int(a.start) - time2int(b.start);
            });
            console.log(tbs[i]);
        }
        for (var i = 0; i < userSchedule.week.length; i++) {
            for (var j = 0; j < tbs[i].length; j++) {
                userSchedule.week[i][j+1] = tbs[i][j];
            }
            console.log(userSchedule.week[i]);
        }
        
        // tasks
        var taskList = [];
        for(i = 0; i < task.length; i++){
            
            // construct ToDoList
            // name, priority, duration, passive, deadlineDay, deadlineTime
            const userTask = new Task(task[i].value, priority[i].value, parseInt(duration[i].value), passive[i].checked, deadlineD[i].value, deadlineT[i].value);
            taskList.push(userTask);
        }

        const userList = new ToDoList(taskList);
        
        // sort given tasks by:
        // 1. deadline
        // 2. priority
        sortList(userList);
        createSchedule(userList, userSchedule);

        let txtData = schedule2txt(userSchedule);
        sessionStorage.setItem('data', txtData);
        return true;
    }
    else {
        return false;
        
    }
}


// take input and output it to the output page
function printOutput(){
    //submit();  // This call is needed if the code associated with the default time blocks is commented out
    var data = sessionStorage.getItem('data');
    
    //document.getElementsByName("schedule-string")[0].value = data;

    var parsed = data.split("\n");
    var monday = "";
    var tuesday = "";
    var wednesday = "";
    var thursday = "";
    var friday = "";
    var saturday = "";
    var sunday = "";

    var day;

    for(var i = 1; i < parsed.length-1; i++){
        if (parsed[i] == "") {
            i++;
        }
        if (parsed[i] == "Monday") {
            day = 0;
            monday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Tuesday") {
            day++;
            tuesday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Wednesday") {
            day++;
            wednesday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Thursday") {
            day++;
            thursday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Friday") {
            day++;
            friday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Saturday") {
            day++;
            saturday += parsed[i] + "\n";
        }
        else if (parsed[i] == "Sunday") {
            day++;
            sunday += parsed[i] + "\n";
        }
        else {
            if (day == 0) {
                monday += parsed[i] + "\n";
            }
            else if (day == 1) {
                tuesday += parsed[i] + "\n";
            }
            else if (day == 2) {
                wednesday += parsed[i] + "\n";
            }
            else if (day == 3) {
                thursday += parsed[i] + "\n";
            }
            else if (day == 4) {
                friday += parsed[i] + "\n";
            }
            else if (day == 5) {
                saturday += parsed[i] + "\n";
            }
            else {
                sunday += parsed[i] + "\n";
            }
        }
    }

    var mondayTasks = monday.split("\n");
    var tuesdayTasks = tuesday.split("\n");
    var wednesdayTasks = wednesday.split("\n");
    var thursdayTasks = thursday.split("\n");
    var fridayTasks = friday.split("\n");
    var saturdayTasks = saturday.split("\n");
    var sundayTasks = sunday.split("\n");

    timeSlot(mondayTasks, tuesdayTasks, wednesdayTasks, thursdayTasks, fridayTasks, saturdayTasks, sundayTasks);
}


function fileDownload() {
    var data = sessionStorage.getItem('data');
    download("Schedule", data);
}


function submitForms() {
    // let toDoc = document.getElementById('GDoc');
    let toTxt = document.getElementsByName('Txt')[0];

    // if (toDoc.checked == true) {postInfo();}
    if (toTxt.checked == true) {fileDownload();}
}


// lets user know that a feature will be coming soon
function comingSoon(){
    window.alert("This feature is coming in an update in the near future!")
}
