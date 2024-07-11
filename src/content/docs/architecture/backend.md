---
title: Backend Architecture
description: Best practices for building backend APIs. 
---

Loose coupling, separation of concerns and layered architecture should not only be applied to frontend development. These principles can also be applied during backend development. For example, concepts such as route navigation, data access, data processing and data models can be separated and tested in isolation.

:::note
There is large offering of languages and frameworks to write backends in. It is important to choose tools and follow patterns that serve business needs and maximize developer efficiency. VGV built [Dart Frog](https://dartfrog.vgv.dev/) for this purpose. Dart Frog provides a number of advantages to developers writing Flutter apps:

  *  Writing Dart code in both backend and frontend limits developer context switching and allows model reuse throughout the project
  * Dart Frog's minimalistic design allows for flexibility and customization to suit individual app needs
  * [Providers](https://dartfrog.vgv.dev/docs/basics/dependency-injection) and [middleware](https://dartfrog.vgv.dev/docs/basics/middleware) allow for easy dependency injection
  * File-based [routing](https://dartfrog.vgv.dev/docs/basics/routes) makes endpoint creation simple
  * All backend code is [easily testable](https://dartfrog.vgv.dev/docs/basics/testing)
  * Access to features such as Dart dev tools and hot reload speed development time

:::

### Project structure

Putting the backend in the same repository as the frontend allows developers to easily import data models from the backend. Within the backend directory, developers should consider separating the following elements into dedicated directories:

* Middleware providers
* Routes
* Data access
* Data models
* Tests

While providers, routes, and tests, can live in the root backend project, consider putting data models and data access into their own dedicated package(s). Ideally, these layers should be able to exist independently from the rest of the app. 


Bad ❗️
my_app/
  |- api/
  |  |- lib/
  |  |  |- src/
  |  |  |  |- routes/
  |  |- test/

Good ✅

```
my_app/
  |- api/
  |  |- lib/
  |  |  |- src/
  |  |  |  |- middleware/
  |  |- packages/
  |  |  |- models/
  |  |  |  |- lib/
  |  |  |  |  |- src/
  |  |  |  |  |  |- endpoint_models/
  |  |  |  |  |  |- shared_models/
  |  |  |  |- test/
  |  |  |  |  |- src/
  |  |  |  |  |  |- endpoint_models/
  |  |  |  |  |  |- shared_models/
  |  |  |- data_source/  
  |  |  |  |- lib/
  |  |  |  |  |- src/
  |  |  |  |- test/
  |  |  |  |  |- src/
  |  |- routes/
  |  |  |- api/
  |  |  |  |- v1/
  |  |  |  |  |- todos/
  |  |  |- test/
  |  |  |  |- src/
  |  |  |  |  |- middleware/  
  |  |  |  |- routes/
  |  |  |  |  |- api/
  |  |  |  |  |  |- v1/
  |  |  |  |  |  |  |- todos/
```

### Models

A `models` package should clearly define the necessary data models that the backend will be sharing with the frontend. Defining endpoint models makes the data necessary to communicate between frontend and backend more explicit. It also creates a data structure that can communicate additional metadata about content received, such as the total count of items and pagination information.

```
final class GetTodosResponse {
  const GetTodosResponse({
    int count = 0,
    int pageNumber = 0,
    List<Todos> todos = const [],
  })

  final int count;
  final int pageNumber;
  final List<Todos> todos;
}
```
:::
It is also advisable to automate JSON serialization inside the models package. This can be achieved with the [json_serializable](https://pub.dev/packages/json_serializable) package, though experimental [macros](https://dart.dev/language/macros) in Dart offer a potentially cleaner way of doing this in the future. 
:::

### Data Access

A data source package should allow developers to fetch data from different sources. Similar to the data layer on the frontend, this package should abstract the work of fetching data and providing it to the API routes. This allows for easy development by mocking data in an in-memory source when necessary, or also creating different data sources for different environments. 

The best way to achieve this is by making an abstract data source with the necessary CRUD methods, and implementing this data source as needed based on where the data is coming from.

```
abstract class TodosDataSource {
  Future<Todo> create({
    required String name,
  });

  Future<List<Todo>> getAll();

  Future<Todo?> get(String id);

  Future<Todo> update(String id, Todo todo);

  Future<void> delete(String id);
}
```

### Routes

Routes should follow common [best practices for REST API design](https://swagger.io/resources/articles/best-practices-in-api-design/).

#### Endpoints Should Have Descriptive Paths

Endpoints should be named for the collection of objects that they provide access to. Use plural nouns to specify the collection, not the individual entity. 

Bad ❗️

```
my_api/v1/todo
```

Good ✅

```
my_api/v1/todos
```

Nested paths then provide specific data about an individual object within the collection. 

Bad ❗️

```
my_api/v1/todos?id=1
```

Good ✅

```
my_api/v1/todos/1
```

When setting up a collection of objects that is nested under another collection, the endpoint path should reflect the relationship. 

Bad ❗️

```
my_api/v1/todos/users/
```

Good ✅

```
my_api/v1/users/123/todos
```


#### Use Query Parameters to Filter Properties of GET results

Query parameters serve as the standard way of filtering the results of a GET request. 

Bad ❗️

```
my_api/v1/todos/completed
```

Good ✅

```
my_api/v1/todos?completed=false
```

#### Map the Request Body of POST, PUT, and PATCH Requests

On requests to the server to create or update items, endpoints should take a stringified JSON body and decode it into a map so that the appropriate entity in the data source is changed. Since this is a common process for all create/update requests, consider adding a utility to map the request body.

```
extension RequestBodyDecoder on Request {
  Future<Map<String, dynamic>> map() async =>
      Map<String, dynamic>.from(jsonDecode(await body()) as Map);
}
```

The request body can then be converted into the correct data model like in the endpoint code.

```  
final body = CreateTodoRequest.fromJson(await context.request.map());
```

#### Use PATCH to Send Update Requests

For update requests, PATCH is more advisable than PUT because [PATCH requests the server to update an existing entity, while PUT requests the entity to be replaced](https://stackoverflow.com/questions/21660791/what-is-the-main-difference-between-patch-and-put-request?answertab=oldest#tab-top).

Bad ❗️

```
PUT my_api/v1/todos/1
```

Good ✅

```
PATCH my_api/v1/todos/1
```

#### DELETE should only require an identifier

DELETE requests should require nothing more than an identifier of the object to be deleted. There is no need to send the entire object.

Bad ❗️

```
DELETE my_api/v1/todos // don't send Todo in request body
```

Good ✅
```
DELETE my_api/v1/todos/1 //Data source should only require the ID
```

#### Return Appropriate Status Codes

Routes should also return proper status codes to the frontend based on the results of their operations. When an error occurs, sending a useful status and response to the client makes it clear what happened and allows the client to handle errors more smoothly. 

Bad ❗️
```
final todo = context.read<TodosDataSource>().get(id);

if (todo == null) {
  return Response(statusCode: HttpStatus.ok, body: 'No todo exists with the given $id');
}
```

In this example, we are returning a message to the client, but with a misleading successful status code. 

Good ✅

```
final todo = context.read<TodosDataSource>().get(id);

if (todo == null) {
  return Response(statusCode: HttpStatus.notFound, body: 'No todo exists with the given $id');
}
```

By contrast, this example offers both a relevant message and the correct status code.

Bad ❗️
```
final requestBody = CreateTodoRequest.fromJson(jsonDecode(await context.request.body() as Map));
```

In this example, we are assuming that the request body will be properly mapped. A failure to parse the body from the request will return a vague 500 error. 

Good ✅

```
late final requestBody;
try {
  requestBody = CreateTodoRequest.fromJson(jsonDecode(await context.request.body() as Map));
} catch (e) {
  return Response(statusCode: HttpStatus.badRequest, body: 'Invalid request: $e');
}

```

This example, however, catches failed JSON mapping from the request body, and notifies the client of the Bad Request. 