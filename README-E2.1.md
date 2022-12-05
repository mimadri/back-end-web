## Find-Homy API Reference
#### Url: __find-homy.herokuapp.com__
<!---
A considerar: Se debe de crear la base de datos para test. Para esto recomendamos crear un `.env` con:

    DB_NAME=find_homy
    DB_USERNAME=<YourUser>
    DB_PASSWORD=<YourPassword>
    JWT_SECRET=d505bebca5dc9fb649afd18a3dac23d4708b6e9915695590b03238f247848fed

Y luego crear manualmente la base de datos en postgres con el nombre `find_homy_test`
-->
### Create an user

    POST /api/users

In the body you must add the following attributes:

| Parameter     | Type      | Description                                                               |
| :------------ | :-------- | :-------------------------------------------------------------------------|
| `username`    | `string`  | *Required*. The reference to call the user.                              |
| `email`       | `string`  | *Required*. The email of user. Must be unique.                                   |
| `password`    | `string`  | *Required*. The password of user.|  

#### Body example:
    {
        "email": "test@uc.cl",
        "password": "nani123",
        "username": "Testname"
    }

#### Response:
    {
        "data": {
            "type": "users",
            "id": "1",
            "attributes": {
                "id": 1,
                "username": "Testname",
                "password": "nani123",
                "email": "test@uc.cl"
            }
        }
    }

### Login and request a token

    POST /api/auth


| Parameter     | Type      | Description                                                               |
| :------------ | :-------- | :-------------------------------------------------------------------------|
| `email`       | `string`  | *Required*. The email from a registered user.         |
| `password`    | `string`  | *Required*. The password from a registered user.      |  

#### Body example:

    {
        "email": "test@uc.cl",
        "password": "nani123"
    }

#### Response:
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTYyMzcwMTg2NSwiZXhwIjoxNjIzNzAzMDY1fQ.biJA7Y8zCJLtbwNSHYzs7qVr7KV8mQIVeLWBuiti7sE",
        "token_type": "Bearer"
    }


### Obtain information of current user

    GET /api/users/me

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}
#### Response:

    {
        "data": {
            "type": "users",
            "id": "1",
            "attributes": {
                "id": 1,
                "username": "Testname",
                "password": "nani123",
                "email": "test@uc.cl"
            }
        }
    }

### Edit an user

    PATCH /api/users/${id}

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token. 

In the body you must add the following attributes:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `username`    | `string`  | *Required*. The username of user, with changes or the current value.                              |
| `email`       | `string`  | *Required*. The email of user, with changes or the current value.|
| `password`    | `string`  | *Required*. The password of user, with changes or the current value.| 

In the body, you can update any attribute of a property. If an attribute is not specified, this will keep the value.

#### Body example:
    {
        "email": "test@uc.cl",
        "password": "nani123",
        "username": "NewUsername"
    }

#### Response:
    {
        "data": {
            "type": "users",
            "id": "1",
            "attributes": {
                "id": 1,
                "username": "NewUsername",
                "password": "nani123",
                "email": "test@uc.cl"
            }
        }
    }


### Get all properties on sale 

    GET /api/properties


| Parameter | Type     | Description                 |
| :-------- | :------- | :-------------------------- |
| `api_key` | `string` | *Required*. Your API key. |

#### Body exmaple:

    {}

#### Response:

    {
        "data": [
            {
                "type": "properties",
                "id": "5",
                "attributes": {
                    "location": "María Elena 1792, Osorno",
                    "name": "Casa Esquina",
                    "state": "rent",
                    "price": 120000000,
                    "description": "Casa de 3 habitaciones, 2 baños, cocina independiente y living comedor (incluye perro)"
                }
            },
            {
                "type": "properties",
                "id": "4",
                "attributes": {
                    "location": "San Juan 504, Rengo",
                    "name": "123",
                    "state": "on sale",
                    "price": 12,
                    "description": "Una casa muy linda, con bellas vistas y muy amplia"
                }
            }
        ]
    }

### Get a particular property


    GET /api/properties/${id}


| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `api_key` | `string` | *Required*. Your API key.            |
| `id`      | `string` | *Required*. Id of property to fetch. |

#### Body example:

    {}

#### Response: 

    {
        "data": {
            "type": "properties",
            "id": "4",
            "attributes": {
                "location": "San Juan 504, Rengo",
                "name": "Casa San Juan",
                "state": "on sale",
                "price": 12000000,
                "description": "Una casa muy linda, con bellas vistas y muy amplia"
            }
        }
    }

### Create a new property

    POST /api/properties/


| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `api_key` | `string` | *Required*. Your API key.            |

In the body you must add the following attributes:

| Parameter     | Type      | Description                                                               |
| :------------ | :-------- | :-------------------------------------------------------------------------|
| `location`    | `string`  | *Required*. The ubication of the property.                              |
| `name`        | `string`  | *Required*. The name of the property.                                   |
| `state`       | `string`  | *Required*. You must add if the property will be `on sale` or in `rent`.|
| `price`       | `integer` | *Required*. The price of the property.                                  |
| `description` | `string`  | *Required*. The description of the property.                            |

#### Body example:

    {
        "location": "San Joaquin 504, Santiago",
        "name": "Casa San Joaquin",
        "state": "on sale",
        "price": 800000,
        "description": "Una casa muy linda, con bellas vistas y muy amplia"
    }

#### Response: 
    {
        "data": {
            "type": "properties",
            "id": "9",
            "attributes": {
                "location": "San Joaquin 504, Santiago",
                "name": "Casa San Joaquin",
                "state": "on sale",
                "price": 800000,
                "description": "Una casa muy linda, con bellas vistas y muy amplia"
            }
        }
    }

### Patch a property


    PATCH /api/properties/${id}


| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `api_key` | `string` | *Required*. Your API key.            |
| `id`      | `string` | *Required*. Id of property to patch. |

In the body, you can update any attribute of a property. If an attribute is not specified, this will keep the value.

#### Example body:

    {
        "name": "This is a name updated",
        "price": 1234000000,
        "description": "Una casa muy linda, con bellas vistas y muy amplia, ya actualizada"
    }

#### Response:

    {
        "data": {
            "type": "properties",
            "id": "9",
            "attributes": {
                "location": "San Joaquin 504, Santiago",
                "name": "This is a name updated",
                "state": "on sale",
                "price": 1234000000,
                "description": "Una casa muy linda, con bellas vistas y muy amplia, ya actualizada"
            }
        }
    }

### Delete a property


    DELETE /api/properties/${id}


| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `api_key` | `string` | *Required*. Your API key.            |
| `id`      | `string` | *Required*. Id of property to fetch. |
  
#### Example body:

    {}

#### Response:

    {
        "request": "Accepted"
    }

### Create new meeting to visit a property

    POST /api/properties/:property_id/meetings


Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token. 

In the body you must add the following attributes:

| Parameter     | Type      | Description                                                               |
| :------------ | :-------- | :-------------------------------------------------------------------------|
| `date`    | `date`  | Required. The date of your meeting.                              |
| `hour`        | `string`  | Required. The hour of your meeting.                                   |


#### Body example:

    {
        "date": "2021-02-03",
        "hour": "12:00 pm"
    }

#### Response:

    {
        "data": {
            "type": "meetings",
            "id": "7",
            "attributes": {
                "date": "2024-07-12",
                "hour": "03:00 pm"
            }
        }
    }


### Show all the meetings of a property


    GET /api/properties/:property_id/meetings


Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.

***Without body***

#### Body example:
    {}

#### Response:

    {
        "data": [
            {
                "type": "meetings",
                "id": "4",
                "attributes": {
                    "date": "2021-06-12",
                    "hour": "02:00 am"
                }
            }
        ]
    }


### Show all the meetings of the current user


    GET /api/users/me/meetings


Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.

***Without body***

#### Body example:
    {}

#### Example response:

    {
        "data": [
            {
                "type": "meetings",
                "id": "1",
                "attributes": {
                    "date": "2021-02-23",
                    "hour": "12:00"
                }
            },
            {
                "type": "meetings",
                "id": "2",
                "attributes": {
                    "date": "2021-07-03",
                    "hour": "13:00"
                }
            }
        ]
    }
