from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0043_auto_20150725_2140')
    ]

    operations = [
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='node_run',
            field=models.IntegerField()
        ),
        migrations.AlterField(
            model_name='numericanswer',
            name='node_run',
            field=models.IntegerField()
        ),
        migrations.AlterField(
            model_name='textanswer',
            name='node_run',
            field=models.IntegerField()
        ),
        migrations.RenameField(
            model_name='multiplechoiceanswer',
            old_name='node_run',
            new_name='run'
        ),
        migrations.RenameField(
            model_name='numericanswer',
            old_name='node_run',
            new_name='run'
        ),
        migrations.RenameField(
            model_name='textanswer',
            old_name='node_run',
            new_name='run'
        ),
        migrations.RenameModel(
            old_name='NodeRun',
            new_name='Run'
        ),
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='run',
            field=models.ForeignKey(default=0, to='eums.Run')
        ),
        migrations.AlterField(
            model_name='numericanswer',
            name='run',
            field=models.ForeignKey(default=0, to='eums.Run')
        ),
        migrations.AlterField(
            model_name='textanswer',
            name='run',
            field=models.ForeignKey(default=0, to='eums.Run')
        )
    ]