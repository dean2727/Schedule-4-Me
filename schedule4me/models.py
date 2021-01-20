from django.db import models

class RawTask(models.Model):
    task_id = models.IntegerField(primary_key=True)

    schedule_name = models.CharField(max_length=200)
    
    user = models.CharField(max_length=200)

    task_name = models.CharField(max_length=200)
    priority = models.IntegerField()
    duration_in_minutes = models.IntegerField()
    is_passive = models.BooleanField(null=True)
    # Deadline day and time
    deadline = models.DateTimeField()

    # Address currently not implemented
    address = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.task_name


class OptimizedTask(models.Model):
    task_id = models.IntegerField(primary_key=True)

    schedule_name = models.CharField(max_length=200)

    user = models.CharField(max_length=200)
    
    task_name = models.CharField(max_length=200)
    day = models.CharField(max_length=10)
    start = models.TimeField()
    end = models.TimeField()

    # Address currently not implemented
    address = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.task_name



