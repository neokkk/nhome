to="seven3126@gmail.com"
subject="nhome - Warning Report"
body="The humidity and temperature are outside the specified range, please check.\n $(date) humidity is $1%, temperature is $2°C."

echo -e "Subject: $subject\n\n$body" | sendmail $to