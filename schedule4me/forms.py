from django import forms

class tasks(forms.Form):
    schedule_name = forms.CharField(label='Schedule name', max_length=100)
    # task_name = forms.CharField(label='task name', max_length=100)
    # priority = forms.IntegerField(label='priority', max_value=5, min_value=0)
    # duration_in_minutes = forms.IntegerField(label='duration in minutes', min_value=1)
    # is_passive = forms.BooleanField(label='passive')
    # deadline = forms.DateTimeField(label='deadline day and time')  # Deadline day and time

# Output page radio buttons form to choose options to save schedule (not sure if we can do this because we need Bootstrap styling)
# class SavingOptionsForm(forms.Form):
#     save_doc = forms.BooleanField(label="Save to Google Doc", required=False)
#     save_email = forms.BooleanField(label="Send schedule in email", required=False)
#     save_file = forms.BooleanField(label="Save to a .txt file", required=False)