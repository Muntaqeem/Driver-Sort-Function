# Driver-Sort-Function

# Install

`npm i
`npm run watch

# Apis

To set driver's preferred location
`POST method
`/set_preferred_location
```
{
    "id": "<unique id>",
    "location": "<lat>,<lon>"
}
```

To Select a driver
`GET method
`/select_ride?lat=<lat>&lon=<lon>