# Organ - Logging Middleware for the Oak Web Framework

Organ is a logging middleware for the Oak web framework. It is based on the Morgan library for Express in NodeJS.


## Usage

To use Organ, simply add it as middleware in an Oak web application before your routes:

```javascript
import { Application } from "https://deno.land/x/oak/mod.ts";
import { organ } from "../mod.ts";

const app = new Application();

// Adding the Organ middleware. Note that when no values are passed to the 
// organ function, the default format "combined" will be used. For more info
// on this format, see the section on predefined formats below.
app.use(organ());

app.use(async (context, next) => {
    context.response.body = "hello world";
});

await app.listen({ port: 8000 });
```

## Configuration

Organ uses similar configurations to the Morgan library. You can change the format of the logs created with Organ in one of two ways:

* **Format Strings Using Tokens**
* **Predefined Formats**


## Format Strings Using Tokens

You can pass a format string into the `organ()` function to change what logs are displayed. For example, if you want to create a log with the text "log created":

```javascript
organ("log created");
```

You can use token strings within the format string to log details such as the date of log creation, user-agent, response time, and more. All token strings start with a semicolon:

```javascript
organ("log created at this date -> :date");
```

Some token strings, such as :date, take an optional parameter that changes the format of the log. For example, to change the date to RFC 1123 web format:

```javascript
organ("log created at this date -> :date[web]");
```

Below are a list of all tokens, their descriptions, and their options parameters:

**:date[format]**
Current date in UTC. The available formats are:

* **clf** for common log format (`"10/Oct/2000:13:55:36 +0000"`)
* **iso** for ISO 8601 date time format (`2000-10-10T13:55:36.000Z`)
* **web** for RFC 1123 date time format (`Tue, 10 Oct 2000 13:55:36 GMT`)

**:http-version**
The HTTP version of the request.

**:method**
The HTTP method of the request.

**:referrer**
The Referrer header of the request (using the standard mis-spelled **referer** header).

**:remote-addr**
The remote address of the request.

**:remote-user**
The user authenticated as part of Basic auth for the request.

**:request[header]**
The specified header of the request, or if not present a "-".

**:response[header]**
The specified header of the response, or if not present a "-".

**:response-time[digits]**
The time between the request coming into organ and when the response has finished being written out to the connection, in milliseconds. The default digits is 3.

**:status**
The status code of the response.

**:url**
The URL of the request.

**:user-agent**
The user-agent header of the response.


### Predefined Formats

Organ allows for the same predefined formats as Morgan. You can chose a format in `organ()` function: 

```javascript
organ("common");
```

Below are all of the predefined formats available:

**combined**
Standard Apache combined log output.

`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`

**common**
Standard Apache common log output.

`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]`

**dev**
Some basic information for development purposes. Note that unlike morgan, organ uses an optional debug parameter that can set color coding on any of the formats, or allows the use of the `debug` format for easy debugging (see below).

`:method :url :status :response-time ms - :res[content-length]`

**short**
The short format from morgan.

`:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms`

**tiny**
The minimal output.

`:method :url :status :res[content-length] - :response-time ms`

**debug**
Displays and color codes a lot of information from the request. Note that the type of request is in bold, the status codes of the response are color coded (200's are in green, 300's are in cyan, 400's are in yellow, and 500's are in red), the response time is in pink, the url is in gray, and all info is formatted into a more readable format.

```
METHOD:         :method
URL:            :url
STATUS:         :status
DATE:           :date
RESPONSE_TIME:  :response-time ms
CONTENT_LENGTH: :response[content-length]
HTTP_VERSION:   :http-version
REMOTE_ADDR:    :remote-addr
REMOTE_USER:    :remote-user
REFERER:        :referer
USER_AGENT:     :user-agent
```


### Adding Custom Logging Features

Organ also supports the ability to add custom logging features. You can mix organ and custom logging features by using the Organ.log() function, which will give you the ability to take advantage of tokens as well as including custom information:

```javascript
import { Application } from "https://deno.land/x/oak/mod.ts";
import { Organ } from "../mod.ts";

const app = new Application();

// Creating custom logging features using Organ
app.use(async (context, next) => {
    await next();
    Organ.log(`My custom logging info ->${context.request.myAdditionalRequestInfo}, Tiny format info -> :method :url :status :res[content-length] - :response-time ms`, context.request.serverRequest, context.response);
});

app.use(async (context, next) => {
    context.response.body = "hello world";
});

await app.listen({ port: 8000 });
```


### Colored Debug Printing

Organ also supports adding color to printing for debugging purposes. See the `debug` format to see what coloring is applied to the tokens. To add colored printing, add `true` as the final parameter to either the `organ()` function or the `Organ.log()` function:

```javascript
organ("common", true)
```

## License

MIT License

Copyright (c) 2020 Anthony Mancini

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
