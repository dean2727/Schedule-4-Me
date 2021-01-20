from django.shortcuts import get_object_or_404, render

from .models import *
from .forms import tasks

import pickle
import os.path

import datetime

from allauth.socialaccount.models import SocialToken

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.auth import credentials
from google.oauth2.credentials import Credentials


'''
Langing page view:
Landing page of the application. If user is not logged in, render login.html, which offers
options to sign in/connect or skip it. Otherwise, they are logged in, so direct them to 
the dashboard page by rendering dashboard.html
'''
def landingPage(request):
    return render(request, 'login.html')


'''
Dashboard page view:
*** Not yet implemented
The main menu page for a user that has signed in/connected their Google account. The page
is a hub that shows all of their previously created schedules/templates. Renders
dashboard.html
'''
def dashboardPage(request):
    return render(request, 'dashboard.html')


'''
Data entering page view:
Renders a new data entering page in data_enter.html so that the user can create a new schedule
'''
def dataEnterPage(request):
    # Populate the to-do list modal with the user's to-do list in Google Sheets
    SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
    social_token = SocialToken.objects.get(account__user=request.user)
    creds = Credentials(token=social_token.token,
                        refresh_token=social_token.token_secret,
                        scopes=SCOPES,
                        client_id=social_token.app.client_id,
                        client_secret=social_token.app.secret)
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    return render(request, 'data_enter.html')


'''
Output page view:
Stores the schedule and its tasks to the database, and renders the optimized schedule output
in output.html
'''
def outputPage(request):
    taskNames = request.POST.getlist("task-names")
    priorities = request.POST.getlist("priorities")
    durations = request.POST.getlist("durations")    
    passives = request.POST.getlist("passives")
    dates = request.POST.getlist("dates")
    times = request.POST.getlist("times")

    numTasks = len(taskNames)
    for i in range(numTasks):

        isPassive = False
        if passives[i] == "on":
            isPassive = True

        dateParts = dates[i].split('-')
        timeParts = times[i].split(':')
        # datetime(<year>, <month>, <day>, <hour>, <minute>, <second>, <microsecond>)
        deadline = datetime.datetime(int(dateParts[0]), int(dateParts[1]), int(dateParts[2]), int(timeParts[0]), int(timeParts[1]), 0, 0)

        newTask = RawTask(
            schedule_name = request.POST.get("schedule-name"),
            user = str(request.user),
            task_name = taskNames[i],
            priority = int(priorities[i]),
            duration_in_minutes = int(durations[i]),
            is_passive = isPassive,
            deadline = deadline
            # Address would go here, but is null for now
        )
        newTask.save()

    context = {
        'scheduleName': request.POST.get("schedule-name")
    }

    return render(request, 'output.html', context)


# Helper function for quick conversion of shorthand day name to full day name
def getDayFromAbbreviation(abbr):
    switcher = {
        "md": "Monday",
        "tu": "Tuesday",
        "we": "Wednesday",
        "th": "Thursday",
        "fr": "Friday",
        "sa": "Saturday",
        "su": "Sunday"
    }
    return switcher.get(abbr, "Error: Invalid day abbreviation!")

# Helper function to get the date of the next day name specified
def getDateFromDay(dayName):
    nextDate = datetime.date.today()

    if dayName == "Monday" and nextDate.weekday() != 0:
        # Add the number of days until next Monday
        nextDate = nextDate + datetime.timedelta((0 - nextDate.weekday()) % 7)
    elif dayName == "Tuesday" and nextDate.weekday() != 1:
        # Add the number of days until next Tuesday
        nextDate = nextDate + datetime.timedelta((1 - nextDate.weekday()) % 7)
    elif dayName == "Wednesday" and nextDate.weekday() != 2:
        # Add the number of days until next Wednesday
        nextDate = nextDate + datetime.timedelta((2 - nextDate.weekday()) % 7)
    elif dayName == "Thursday" and nextDate.weekday() != 3:
        # Add the number of days until next Thursday
        nextDate = nextDate + datetime.timedelta((3 - nextDate.weekday()) % 7)
    elif dayName == "Friday" and nextDate.weekday() != 4:
        # Add the number of days until next Friday
        nextDate = nextDate + datetime.timedelta((4 - nextDate.weekday()) % 7)
    elif dayName == "Saturday" and nextDate.weekday() != 5:
        # Add the number of days until next Saturday
        nextDate = nextDate + datetime.timedelta((5 - nextDate.weekday()) % 7)
    else:
        if nextDate.weekday() != 6:
            # Add the number of days until next Sunday
            nextDate = nextDate + datetime.timedelta((6 - nextDate.weekday()) % 7)

    return nextDate

'''
Success page view:
Processes the final schedule and displays a success message, offering the user options to 
make another schedule    *** not yet implemented or go back to the dashboard (if logged in).
Renders success.html
'''
def successPage(request):
    # Separate the task string by the separator, retrieving the separate tasks
    tasks = []
    tasks = request.POST.get("tasksString").split('||')[:-1]

    # Parse all the tasks, store them in arrays, and insert them into database
    taskNames = []
    taskDays = []
    taskStartHours = []
    taskStartMins = []
    taskEndHours = []
    taskEndMins = []
    for i in range(len(tasks)):
        thisTask = tasks[i]

        # Get the end time of the task (last 5 chars), truncate these chars from thisTask
        thisEnd = thisTask[-5:]
        thisTask = thisTask[0:-6]  # Dont need the '-'

        # Get the start time of the task (now the last 5 chars), truncate these chars from thisTask
        thisStart = thisTask[-5:]
        thisTask = thisTask[0:-5]

        # Get the day for the task (first 2 chars), truncate these chars from thisTask
        thisDay = getDayFromAbbreviation(thisTask[0:2])
        taskDays.append(thisDay)
        thisTask = thisTask[2:-1]

        thisDescription = thisTask.strip()
        taskNames.append(thisDescription)

        # If there is a 0 before any hour or minute value, remove it so that datetime.time() works properly
        startTimeHour = thisStart[0:2]
        startTimeMin = thisStart[3:]
        endTimeHour = thisEnd[0:2]
        endTimeMin = thisEnd[3:]

        # If the end time hour is 24 (task ends at midnight, or goes into the next day), make the time 23:59
        endTimeMin = 59 if endTimeHour == 24 else endTimeMin
        endTimeHour = 23 if endTimeHour == 24 else endTimeHour

        taskStartHours.append(startTimeHour)
        taskStartMins.append(startTimeMin)
        taskEndHours.append(endTimeHour)
        taskEndMins.append(endTimeMin)

        # Create optimized task model object and save to database
        newTask = OptimizedTask(
            schedule_name = request.POST.get("schedule-name"),
            user = str(request.user),
            task_name = thisDescription,
            day = thisDay,
            start = datetime.time(
                int(startTimeHour[1] if startTimeHour[0] == '0' else startTimeHour), 
                int(startTimeMin[1] if startTimeMin[0] == '0' else startTimeMin),
                0
            ),
            end = datetime.time(
                int(endTimeHour[1] if endTimeHour[0] == '0' else endTimeHour), 
                int(endTimeMin[1] if endTimeMin[0] == '0' else endTimeMin),
                0
            ),            
        )
        newTask.save()

    social_token = SocialToken.objects.get(account__user=request.user)

    # If user wants to save to a Google Doc
    if request.POST.get("GDoc") == "on":
        SCOPES = 'https://www.googleapis.com/auth/documents'
        creds = Credentials(token=social_token.token,
            refresh_token=social_token.token_secret,
            scopes=SCOPES,
            client_id=social_token.app.client_id,
            client_secret=social_token.app.secret)
    
        service = build('docs', 'v1', credentials=creds)

        # Create Google Doc
        body = {
            'title': request.POST.get("schedule-name")
        }
        doc = service.documents().create(body=body).execute()
        docId = doc.get('documentId')

        # Construct a string for the body of the Google Doc
        today = datetime.date.today()
        nextMonday = today + datetime.timedelta(days=-today.weekday(), weeks=1)
        nextSunday = today + datetime.timedelta(days=-today.weekday() + 7, weeks=1)
        bodyText = "Schedule for the week of " + str(nextMonday) + " to " + str(nextSunday) + "\n\n"
        bodyText += request.POST.get("schedule-string")

        requests = [
            {
                'insertText': {
                    'location': {
                        'index': 1,
                    },
                    'text': bodyText
                }
            },
        ]

        # Write content to the Doc
        result = service.documents().batchUpdate(
            documentId=docId, body={'requests': requests}).execute()
    
    # If user wants to add the schedule tasks to Google Calendar
    if request.POST.get("GCalendar") == "on":
        SCOPES = 'https://www.googleapis.com/auth/calendar'
        creds = Credentials(token=social_token.token,
            refresh_token=social_token.token_secret,
            scopes=SCOPES,
            client_id=social_token.app.client_id,
            client_secret=social_token.app.secret)
        
        service = build('calendar', 'v3', credentials=creds)

        # A batch request can only hold 50 events, so do n // 50 batch executions (where n = number of tasks)
        for i in range(len(tasks) // 50):
            batch = service.new_batch_http_request()

            # This chunk of 50 tasks
            for j in range(i * 50, i * 50 + 50):
                # Create the event for the task
                event = {
                    'summary': taskNames[i],

                    # No location for now (change if we add location feature)
                    # 'location': '800 Howard St., San Francisco, CA 94103',

                    # No description for now
                    # 'description': 'A chance to hear more about Google\'s developer products.',

                    'start': {
                        'dateTime': str(getDateFromDay(taskDays[i])) + 'T' + taskStartHours[i] + ':' + taskStartMins[i] + ":00-06:00",  # -6 hours from UTC for Chicago time (change if timeZone changes)
                        #'dateTime': '2015-05-28T09:00:00-07:00',
                        'timeZone': 'America/Chicago',  # Using Chicago for right now (change if app is widely used)
                    },

                    'end': {
                        'dateTime': str(getDateFromDay(taskDays[i])) + 'T' + taskEndHours[i] + ':' + taskEndMins[i] + ":00-06:00",  # -6 hours from UTC for Chicago time (change if timeZone changes)
                        'timeZone': 'America/Chicago',  # Using Chicago for right now (change if app is widely used)
                    },

                    # Since the tasks for time blocks are each included in the arrays, recurrence is not needed
                    # 'recurrence': [
                    #     'RRULE:FREQ=DAILY;COUNT=2'
                    # ],
                    
                    # Attendees for now are just the user
                    # 'attendees': [
                    #     {'email': 'lpage@example.com'},
                    #     {'email': 'sbrin@example.com'},
                    # ],

                    # Reminders will be this default (from API guide), change if app offers notification reminders
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                        ],
                    },
                }

                batch.add(
                    service.events().insert(
                        body=event,
                        calendarId='primary'
                    ),
                )

            batch.execute()
        
        # Execute the remainder of the tasks in a single batch
        offset = (len(tasks) // 50) * 50
        remainder = len(tasks) % 50
        batch = service.new_batch_http_request()

        for i in range(offset, offset + remainder):
            # Create the event for the task
            event = {
                'summary': taskNames[i],

                # No location for now (change if we add location feature)
                # 'location': '800 Howard St., San Francisco, CA 94103',

                # No description for now
                # 'description': 'A chance to hear more about Google\'s developer products.',

                'start': {
                    'dateTime': str(getDateFromDay(taskDays[i])) + 'T' + taskStartHours[i] + ':' + taskStartMins[i] + ":00-06:00",  # -6 hours from UTC for Chicago time (change if timeZone changes)
                    #'dateTime': '2015-05-28T09:00:00-07:00',
                    'timeZone': 'America/Chicago',  # Using Chicago for right now (change if app is widely used)
                },

                'end': {
                    'dateTime': str(getDateFromDay(taskDays[i])) + 'T' + taskEndHours[i] + ':' + taskEndMins[i] + ":00-06:00",  # -6 hours from UTC for Chicago time (change if timeZone changes)
                    'timeZone': 'America/Chicago',  # Using Chicago for right now (change if app is widely used)
                },

                # Since the tasks for time blocks are each included in the arrays, recurrence is not needed
                # 'recurrence': [
                #     'RRULE:FREQ=DAILY;COUNT=2'
                # ],
                
                # Attendees for now are just the user
                # 'attendees': [
                #     {'email': 'lpage@example.com'},
                #     {'email': 'sbrin@example.com'},
                # ],

                # Reminders will be this default (from API guide), change if app offers notification reminders
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                    ],
                },
            }

            batch.add(
                service.events().insert(
                    body=event,
                    calendarId='primary'
                )
            )

        batch.execute()

    return render(request, 'success.html')


'''
Import page view:
Processes the final schedule and displays a success message, offering the user options to 
make another schedule    *** not yet implemented or go back to the dashboard (if logged in).
Renders success.html
'''
def importPage(request):
    sheetUrl = request.POST.get('url')
    splitUrl = sheetUrl.split('/')
    sheetID = splitUrl[5]

    SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
    social_token = SocialToken.objects.get(account__user=request.user)
    creds = Credentials(token=social_token.token,
        refresh_token=social_token.token_secret,
        scopes=SCOPES,
        client_id=social_token.app.client_id,
        client_secret=social_token.app.secret)

    
    service = build('sheets', 'v4', credentials=creds)

    # Get the to-do list based off the URL the user provided, must be a To do list Google Sheet (for now)
    result = service.spreadsheets().values().get(
        spreadsheetId=sheetID, range='To do!B4:C', majorDimension='COLUMNS').execute()
    cols = result.get('values', [])
    
    # The import page will retrieve the list of lists of date and task name values
    context = {
        'input':cols
    }

    return render(request, 'import.html', context)