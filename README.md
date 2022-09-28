# http_Request_AppScript
Appscript http_request with catch error to crawl REST API

With the help of a Queue, the code open a single or a multiple GET or POST http_request. If the code is 200 it put the response in returned array, if not it put the url in the queue and try to run the http_request for other two times, then if it has not success put the url in an error array that concat to result array. 
