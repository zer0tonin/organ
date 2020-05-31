import { moment } from "./deps/deno_moment/moment.ts";
import { auth } from "./deps/basic-auth/index.js";
import * as colors from "./deps/std/fmt/colors.ts";

export class Logger {

    public _request: any;
    public _response: any;
    private _debug: any;

    constructor(request: any, response: any, debug?: any) {
        this._request = request;
        this._response = response;
        this._debug = debug;
    }

    date(format: string) : string {
        const currentDate = moment().utc();
        let formattedDate;

        switch (format) {
            case "clf":
                formattedDate = currentDate.format("DD/MMM/YYYY:HH:mm:ss Z");
                break;

            case "iso":
                formattedDate = currentDate.toISOString();
                break;

            case "web":
                formattedDate = currentDate.toDate().toUTCString();
                break;
        }
        
        if (formattedDate) {
            return formattedDate;
        } else {
            throw new Error("Date format not found, use either [clr, iso, web]")
        }
    }

    httpVersion() : string {
        let httpVersionString = this._request.proto.split("HTTP/")[1];
        
        return httpVersionString;
    }

    method() : string {
        let methodString = this._request.method;

        if (this._debug) {
            methodString = colors.bold(methodString);
        }
        
        return methodString;
    }

    referrer() : string {
        let referrerString = this._request.headers.get("Referer") || "-";
        
        if (this._debug) {
            referrerString = colors.italic(referrerString);
        }
        
        return referrerString;
    }

    remoteAddress() : string {
        let remoteAddressString = this._request.conn.remoteAddr.hostname;
        return remoteAddressString;
    }

    remoteUser() : string {
        const credentials: any = auth(this._request);
        return credentials ? credentials.name : "-";
    }

    request(header: string) : string {
        let requestHeaderString = this._request.headers.get(header) || "-";
        return requestHeaderString;
    }

    response(header : string) : string {
        let responseHeaderString = this._response.headers.get(header) || "-";
        return responseHeaderString;
    }

    responseTime(digits: any) : string {
        digits = digits || 3;
        
        let responseTimeString = Number.parseFloat(this._response.headers.get("X-Response-Time")).toFixed(digits);
        
        if (this._debug) {
            responseTimeString = colors.magenta(responseTimeString);
        }
        
        return responseTimeString;
    }

    status() : string {
        let statusString = this._response.status || "-";
        
        statusString = new String(statusString);
        
        if (this._debug) {
            switch (statusString[0]) {
                case "2":
                    statusString = colors.green(statusString);
                    break;

                case "3":
                    statusString = colors.cyan(statusString);
                    break;

                case "4":
                    statusString = colors.yellow(statusString);
                    break;

                case "5":
                    statusString = colors.red(statusString);
                    break;
            }
        }
        
        return statusString
    }

    url() : string {
        let urlString = this._request.url;

        if (this._debug) {
            urlString = colors.gray(urlString);
        }
        
        return urlString;
    }

    userAgent() : string {
        let userAgent = this._request.headers.get("User-Agent");
        return userAgent;
    }
}


export class Organ {

    static string(tokenString: string, request: any, response: any, debug?: any) : string {

        if (tokenString === "debug") {
            debug = true;
        }

        const PREDEFINED_FORMATS: any = {
            combined: `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response[content-length] ":referrer" ":user-agent"`,
            common: `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response[content-length]`,
            dev: `:method :url :status :response-time ms - :response[content-length]`,
            short: `:remote-addr :remote-user :method :url HTTP/:http-version :status :response[content-length] - :response-time ms`,
            tiny: `:method :url :status :response[content-length] - :response-time ms`,
            debug: `METHOD:         :method\nURL:            :url\nSTATUS:         :status\nDATE:           :date[web]\nRESPONSE_TIME:  :response-time ms\nCONTENT_LENGTH: :response[content-length]\nHTTP_VERSION:   :http-version\nREMOTE_ADDR:    :remote-addr\nREMOTE_USER:    :remote-user\nREFERER:        :referrer\nUSER_AGENT:     :user-agent\n`
        };

        if (Object.keys(PREDEFINED_FORMATS).includes(tokenString)) {
            tokenString = PREDEFINED_FORMATS[tokenString];
        }

        const logger = new Logger(request, response, debug);

        let tokenSet = new Set(tokenString.match(/[:][a-z\-]*(\[[a-zA-Z0-9\-]*\]){0,1}/gm));
        let tokenMap = new Map();
        for (let token of tokenSet) {
            if (token.includes("[")) {
                tokenMap.set(token, [token.split("[")[0], token.split("[")[1].split("]")[0]]);
            } else {
                tokenMap.set(token, [token ,null]);
            }
        }

        for (let token of new Map(tokenMap)) {
            switch (token[1][0]) {
                case ":date":
                    tokenMap.set(token[0], logger.date(token[1][1]));
                    break;
                    
                case ":http-version":
                    tokenMap.set(token[0], logger.httpVersion());
                    break;

                case ":method":
                    tokenMap.set(token[0], logger.method());
                    break;

                case ":referrer":
                    tokenMap.set(token[0], logger.referrer());
                    break;

                case ":remote-addr":
                    tokenMap.set(token[0], logger.remoteAddress());
                    break;
                    
                case ":remote-user":
                    tokenMap.set(token[0], logger.remoteUser());
                    break;

                case ":request":
                    tokenMap.set(token[0], logger.request(token[1][1]));
                    break;

                case ":response":
                    tokenMap.set(token[0], logger.response(token[1][1]));
                    break;

                case ":response-time":
                    tokenMap.set(token[0], logger.responseTime(token[1][1]));
                    break;

                case ":status":
                    tokenMap.set(token[0], logger.status());
                    break;

                case ":url":
                    tokenMap.set(token[0], logger.url());
                    break;

                case ":user-agent":
                    tokenMap.set(token[0], logger.userAgent());
                    break;
            }
        }
        
        tokenMap.delete(":");

        for (let token of tokenMap) {
            tokenString = tokenString.split(token[0]).join(token[1]);
        }

        return tokenString;
    }

    static log(tokenString: string, request: any, response: any, debug?: any) : void {
        console.log(Organ.string(tokenString, request, response, debug));
    }
}


export function organ (format?: any, debug?: any) {
    format = format || "combined";
    return async (context: any, next: any) => {
        const startTime = Date.now();
        await next();
        const millisecondsElapsed = Date.now() - startTime;
        context.response.headers.set('X-Response-Time', millisecondsElapsed);
        Organ.log(format, context.request.serverRequest, context.response, debug);
    }
}