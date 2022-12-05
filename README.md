## Find-Homy API Reference
#### Url: __find-homy.herokuapp.com/api__
---
## New Endpoints

### Get a specific comment

    GET /:property_id/comments

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:

    {
        "data": [
            {
                "type": "Comments",
                "id": "1",
                "attributes": {
                    "content": "beautiful house"
                }
            }
        ]
    }


### Create a new comment

    POST /:property_id/comments

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

In the body you must add the following attributes, including the new and old attributes:     

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `content`    | `string`  | *Required*. The content of the comment                           |

#### Body example:

    {
        "content": "Nice property"
    }

#### Response:

    {
        "data": {
            "type": "Comments",
            "id": "4",
            "attributes": {
                "content": "Nice property"
            }
        }
    }


### Delete an existing comment

    DELETE /:property_id/comments/:id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:

    {
        "request": "Accepted"
    }

### Edit an existing comment

    PATCH /:property_id/comments/:id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

In the body you must add the following attributes, including the new and old attributes:     

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `content`    | `string`  | *Required*. The content of the comment                           |

#### Body example:

    {
        "content": "Very nice property"
    }

#### Response:

    {
        "data": {
            "type": "Comments",
            "id": "4",
            "attributes": {
                "content": "Very nice property"
            }
        }
    }


### Get a specific meeting

    GET /meetings/:meeting_id

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
            "type": "meetings",
            "id": "1",
            "attributes": {
                "date": "2021-02-03",
                "hour": "12:00 pm"
            }
        }
    }

### Edit a meeting

    PATCH /meetings/:meeting_id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

In the body you must add the following attributes, including the new and old attributes:     

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `date`    | `string`  | *Required*. The date of meeting, with changes or the current value.                              |
| `hour`       | `string`  | *Required*. The hour of meeting, with changes or the current value. Including am or pm|

#### Body example:

    {
        "date": "2021-02-03",
        "hour": "15:00 pm"
    }

#### Response:

    {
        "data": {
            "type": "meetings",
            "id": "1",
            "attributes": {
                "date": "2021-02-03",
                "hour": "15:00 pm"
            }
        }
    }

### Delete a meeting

    DELETE /meetings/:meeting_id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:

    {
        "message": "Meeting deleted successfully"
    }

### Create a report of user

    POST /users/:user_id/reports

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

In the body you must add the following attributes, including the new and old attributes:     

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `content`    | `string`  | *Required*. The content of the report                           |                   

#### Body example:

    {
        "content": "Este usuario ha estado molestandome 2:("
    }

#### Response:

    {
        "data": {
            "type": "requests",
            "id": "4",
            "attributes": {
                "model": "user",
                "modelId": 3,
                "userId": 23,
                "content": "Este usuario ha estado molestandome 2:("
            }
        }
    }

### Create a report of a comment

    POST /comments/:comment_id/reports

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

In the body you must add the following attributes, including the new and old attributes:     

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `content`    | `string`  | *Required*. The content of the report                           |                   

#### Body example:

    {
        "content": "Este usuario no está diciendo la verdad"
    }
#### Response:

    {
        "data": {
            "type": "reports",
            "id": "1",
            "attributes": {
                "model": "Comment",
                "modelId": 2,
                "userId": 13,
                "content": "Este usuario no está diciendo la verdad"
            }
        }
    }


### Get all the reports

    GET /:admin/reports

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:

    {
        "data": [
            {
                "type": "reports",
                "id": "1",
                "attributes": {
                    "model": "user",
                    "modelId": 2,
                    "userId": 2,
                    "content": "Este usuario ha estado molestandome:("
                }
            },
            {
                "type": "reports",
                "id": "2",
                "attributes": {
                    "model": "commentary",
                    "modelId": 2,
                    "userId": 2,
                    "content": "Este usuario no está diciendo la verdad"
                }
            },
            {
                "type": "reports",
                "id": "3",
                "attributes": {
                    "model": "user",
                    "modelId": 3,
                    "userId": 2,
                    "content": "Este usuario ha estado molestandome 2:("
                }
            }
        ]
    }

### Delete a user (Admin)

    DELETE /admin/users/:user_id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:
    {
        "request": "Accepted"
    }


### Delete a property (Admin)

    DELETE /admin/properties/:property_id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:
    {
        "request": "Accepted"
    }

### Delete a comment (Admin)

    DELETE /admin/properties/:property_id/comments/:comment_id

Headers:

| Parameter | Type     | Description                            |
| :-------- | :------- | :--------------------------------------|
| `Authorization` | `Bearer token` | *Required*. Your access token.              |

***Without body***                   

#### Body example:

    {}

#### Response:
    {
        "request": "Accepted"
    }