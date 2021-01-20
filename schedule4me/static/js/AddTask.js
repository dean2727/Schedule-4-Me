/*
    AddTask.js: Listeners and functions to assist in adding new HTML when the user
    wishes to add more tasks to their to-do list

    The Data Minors:
    - Andrew Whitman
    - Dean Orenstein
    - Gage Aykroyd
    - Mary Ashley Vance
*/

let rightInteractive = false;

// removes tasks
var numOfAddTK = 1;
function removeTask(ID){
    var element = document.getElementById(ID);
    var toBeRemoved = element.closest(".task");
    toBeRemoved.remove();
    // console.log("Removed task: " + numOfAddTK);
    numOfAddTK--;
}

// removes additional time blocks
var numOfAddTB = 1;
function removeTB(ID){
    var element = document.getElementById(ID);
    var toBeRemoved = element.closest(".additional");
    toBeRemoved.remove();
    // console.log("Removed time block: " + numOfAddTB);
    numOfAddTB--;
}

// Take the user back to the schedule they were making for edits
function backToSchedule() {
    window.history.go(-1);
}


// Take to-do list from the Google Sheets API and populate this page with tasks containing info from the list
function populate(input) {
    // autofill tasks from ToDo list
    // sessionStorage.setItem('input', input)

    var dates = input[0] // in the form of month/day
    var tasks = input[1]
    for (var i = 0; i < dates.length; i++){
        var splitD = dates[i].split('/');
        var fixedDate = "2020-";
        if(splitD[0] < 10) {
            fixedDate += "0" + splitD[0] + "-";
        }
        else {
            fixedDate += splitD[0] + "-";
        }
        if(splitD[1] < 10) {
            fixedDate += "0" + splitD[1];
        }
        else {
            fixedDate += splitD[1];
        }

        dates[i] = fixedDate;

        numOfAddTK++;
        console.log("Added task: " + numOfAddTK);
        let row =   "<div class=\"row task\">" +
                        "<div class=\"col-sm task-field\">" + 
                            "<a id=\"remove" + numOfAddTK + "\" class=\"btn btn-danger remove\" onclick=\"removeTask(this.id)\" role=\"button\">x</a>" + 
                        "</div>" +
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"task-names\" class=\"form-control-sm name\" type=\"text\" placeholder=\"e.g. Walk the dog\" value=\"" + tasks[i] + "\">" + 
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"priorities\" class=\"form-control-sm priority\" type=\"number\" placeholder=\"1-5\" min=\"1\" max=\"5\"></input>" +
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"durations\" class=\"form-control-sm duration\" type=\"number\" min=\"1\" placeholder=\"e.g. 45\">" + 
                        "</div>" +
                        "<div class=\"col-sm task-field\">" +
                            "<input name=\"passives\" value=\"off\" type=\"hidden\" >" +
                            "<input name=\"passives\" value=\"on\" class=\"form-control-sm passive\" type=\"checkbox\" >" +
                        "</div>" +
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"dates\" type=\"date\" class=\"date\" placeholder=\"2020-07-22\" min=\"2020-01-01\" max=\"2050-12-31\" value=\"" + dates[i] + "\">" +
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<div class=\"input-group clockpicker\">" +
                                "<input name=\"times\" type=\"time\" class=\"form-control deadline\" value=\"18:00\">" + 
                            "</div>" +
                        "</div>" +
                    "</div>";
        $('#tasks-list').append(row);
    }
}


$(document).ready(function() {
    $('.arrow').hover(function() {
        if(rightInteractive === false) {
            $('.arrow').addClass('auto');
        }
        else {
            $('.arrow').removeClass('auto');
        }
        rightInteractive = true;
    });

    $('#add').click(function() {
        numOfAddTB++;
        console.log("Added time block: " + numOfAddTB);
        let row = "<div class=\"row additional\">" +
                "<div class=\"col-sm-12 col-md-2\">" +
                    "<a id=\"delete" + numOfAddTB + "\" class=\"btn btn-danger\"  role=\"button\" onclick=\"removeTB(this.id)\"><span style=\"color: white;\">x</span></a>" +
                "</div>" +
                "<div class=\"col-sm-12 col-md-10 text-md-right\">" +
                    "<input class=\"form-control-sm addNameTB\" type=\"text\" placeholder=\"e.g. Name of time block\"> :" +
                "</div>" +
                "<div class=\"col-sm-12 text-md-right\">" +
                    "<input class=\"form-control-sm addStartTB\" type=\"time\"> - " +
                    "<input class=\"form-control-sm addEndTB\" type=\"time\">" +
                "</div>" +
                "<div class=\"col-sm-12 col-md-6\">" +
                    "Days: M/T/W/TR/F/SA/SU " +
               " </div>" +
                "<div class=\"col-sm-12 col-md-6 text-md-right\">" +
                    "<input class=\"form-control-sm mon\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm tue\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm wed\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm thu\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm fri\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm sat\" type=\"checkbox\">" +
                    "<input class=\"form-control-sm sun\" type=\"checkbox\">" +
                "</div>" +
            "</div>";
        $('.modal-bodyTB').append(row);
    });

    $('.dropdown-item').click(function() {
        let priority = $(this).html();
    });

    $('#btn-add-task').click(function() {
        numOfAddTK++;
        console.log("Added task: " + numOfAddTK);
        let row =   "<div class=\"row task\">" +
                        "<div class=\"col-sm task-field\">" + 
                            "<a id=\"remove" + numOfAddTK + "\" class=\"btn btn-danger remove\" onclick=\"removeTask(this.id)\" role=\"button\">x</a>" + 
                        "</div>" +
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"task-names\" class=\"form-control-sm name\" type=\"text\" placeholder=\"e.g. Walk the dog\">" + 
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"priorities\" class=\"form-control-sm priority\" type=\"number\" placeholder=\"1-5\" min=\"1\" max=\"5\"></input>" +
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"durations\" class=\"form-control-sm duration\" type=\"number\" min=\"1\" placeholder=\"e.g. 45\">" + 
                        "</div>" +
                        "<div class=\"col-sm task-field\">" +
                            "<input name=\"passives\" value=\"off\" type=\"hidden\" >" +
                            "<input name=\"passives\" value=\"on\" class=\"form-control-sm passive\" type=\"checkbox\" >" +
                        "</div>" +
                        "<div class=\"col-sm task-field\">" + 
                            "<input name=\"dates\" type=\"date\" class=\"date\" placeholder=\"2020-07-22\" min=\"2020-01-01\" max=\"2050-12-31\">" +
                        "</div>" + 
                        "<div class=\"col-sm task-field\">" + 
                            "<div class=\"input-group clockpicker\">" +
                                "<input name=\"times\" type=\"time\" class=\"form-control deadline\" value=\"18:00\">" + 
                            "</div>" +
                        "</div>" +
                    "</div>";
        $('#tasks-list').append(row);
    });
});
