# Before doing anything wait for database to come online
if [ "$DB_ENGINE" = "django.db.backends.postgresql_psycopg2" ]
then
    echo "Waiting DB..."

    while ! nc -z $DB_HOST $DB_PORT;
    do
      sleep 0.1
    done

    echo "Ready!"
fi

python $APP_HOME/manage.py collectstatic --noinput --clear
python $APP_HOME/manage.py migrate

# Execute given input command
exec "$@"