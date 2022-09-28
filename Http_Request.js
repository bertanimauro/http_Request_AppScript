/*  ESEMPIO DI UTILIZZO
 funzione di test2 per classe http_request
function test2(range){
    var apiKey = "AIzaSyDvV2jfl6ePYpL9sxqyO3qsMU6xkHhUAV0";
    var url = "https://kgsearch.googleapis.com/v1/entities:search?query=";
    var params = "&languages=it&types=Person&key="+apiKey+"&limit=1";
    var h = new Http_request();
  var ar = new Array();
  var result = new Array();
  for(i=0;i<range.length;i++){
      ar.push(url+encodeURI(range[i]+params));
  }
  result=h.getMultiple(ar);
  for(i=0;i<result.length;i++){
     if(result[i].itemListElement[0]!=null &&
        !(result[i].itemListElement[0].result.detailedDescription === undefined) )
                       result[i] = [result[i].itemListElement[0].result.description,
                                     result[i].itemListElement[0].result.detailedDescription.url,
                                     result[i].itemListElement[0].result.detailedDescription.articleBody]
  }
  return result;
}
*/

/*
   Object da passare alla coda di Http_request
   per tenere traccia dei tentativi per cui non va una get
   Dopo il terzo (quando count =2) mette l'url della get 
   nell'Array error.
   La variabile payload va usata solose si usa post se no metterla a null
*/
function Key_request(obj,payload){
  this.obj = obj;
  this.count=0;
  this.payload=payload;
}

Key_request.prototype.getObject = function(){
    return this.obj;
}
Key_request.prototype.getCount = function(){
    return this.count;
}
Key_request.prototype.getPayload = function(){
    return this.payload;
}
Key_request.prototype.incrementCount = function(){
     this.count++;
}

function Http_request(){
     this.request = new Queue();
     this.err = new Array();
}
/*
    function of object Http_request
    Chiamata get http. parametri messi nell'url
*/
Http_request.prototype.getUrl = function(node){
  var params = null;
  var options =
      {
        "method"  : "GET",
        "followRedirects" : true,
        "muteHttpExceptions": true
      };
  
  var result = UrlFetchApp.fetch(node.getKeyNode().getObject(), options);
  
  if (result.getResponseCode() == 200) {
    params = JSON.parse(result.getContentText());
    
  }else{
     node.getKeyNode().incrementCount();
     this.request.put(node);
  }
  
  return params;
}

/*
  function of object Http_request
  Funzione chiamate http via post
  payload variabili della chiamata http
  var payload =
      {
        "name" : "labnol",
        "blog" : "ctrlq",
        "type" : "post",
      };
   mettere payload nell'object del node
*/
Http_request.prototype.postUrl = function(node){
  var params = null;
  var options =
      {
        "method"  : "POST",
        "payload" : node.getKeyNode().getPayload(),
        "followRedirects" : true,
        "muteHttpExceptions": true
      };

  var result = UrlFetchApp.fetch(node.getKeyNode().getObject(), options);

  if (result.getResponseCode() == 200) {

    params = JSON.parse(result.getContentText());

    

  }else{
    
     node.getKeyNode().incrementCount();
     this.request.put(node);
    
  }
  return params;
}

Http_request.prototype.getErr =  function(){
   return this.err;
}

/*
   function of object Http_Request
   carica degli url che trova nell'array 
   monodimensionale range e chiama get
*/
Http_request.prototype.getMultiple= function(range){
  var ar= new Array();
  var key=null;
  var response=null;
  for(i=0;i<range.length;i++){
    this.request.put(new MyNode(new Key_request(range[i],null)));
  }
  while(!this.request.isEmpty()){
    node=this.request.get();
    
    if(node.getKeyNode().getCount()<3){
      if((response=this.getUrl(node))!=null) ar.push(response);
    }else{
      this.err.push(node.getKeyNode().getObject());
    }
    
  }
  return ar;
}



/*
   Class MyNode usata in Queue
*/
function MyNode(k){
    this.next=null;
    this.keynode=k;    
}
/*  function of class MyNode return keynode */
MyNode.prototype.getKeyNode = function(){
    return this.keynode;
}

/*
   Class Queue
*/
function Queue(){
   this.head=null;
   this.tail=null;
}
/* function of object Queue that put a MyNode n in queue */
Queue.prototype.put =function(n){
    var t=null;
  
    t=this.tail; this.tail=n; this.tail.next=null;
	if(this.head==null) this.head=this.tail; else t.next=this.tail;
}
/* function of object Queue that get a Mynode by the queue*/
Queue.prototype.get= function(){
    var k=null;
    var t=null;
  
    k = this.head;
	t= this.head.next;
	this.head = t;

	return k;
}
/* function of object Queue return if is empty the queue*/
Queue.prototype.isEmpty= function(){
    return this.head==null; 
}
/* function of object Queue return number of MyNode in queue*/
Queue.prototype.count= function(){
    var i = 0;
    var t = this.head;
  
    while(t.next!=null){
			i++;
			t=t.next;
	}

    return (i!=0)? ++i : i;
}
