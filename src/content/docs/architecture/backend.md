---
title: Backend Architecture
description: Best practices for building backend APIs. 
---

At VGV, the loose coupling and separation of concerns followed in frontend layered architecture are also applied to constructing backends for Flutter apps. The backend should separate route navigation from data access/processing, and offer data models that the frontend can consume. As in the frontend, different parts of the architecture should be able to be developed independently, and each section of the backend should be tested in isolation. 

Because the frontend has a devoted layer to retrieve data from any source, backends can be written in whatever language/framework they need to be. As with frontend development, in backend it is important to choose tools and follow patterns that serve business needs and maximize developer efficiency. VGV built [Dart Frog](https://dartfrog.vgv.dev/) for this purpose. Dart Frog provides a number of advantages to developers writing Flutter apps:

  *  Writing Dart code in both backend and frontend limits context switching and allows model reuse throughout the project
  * Dart Frog's minimalistic design allows for flexibility and customization to suit individual app needs
  * [Providers](https://dartfrog.vgv.dev/docs/basics/dependency-injection) and [middleware](https://dartfrog.vgv.dev/docs/basics/middleware) allow for easy dependency injection
  * Convention-based [routing](https://dartfrog.vgv.dev/docs/basics/routes) makes endpoint creation simple
  * All backend code is [easily testable](https://dartfrog.vgv.dev/docs/basics/testing) using mocktail
  * Access to features such as Dart dev tools, and hot reload speed development time

Here are some additional best practices to follow when building a backend for a Flutter app. 

### Project structure

Putting the backend in the same repository as the frontend allows developers to easily import data models from the backend. All backend code should live in its own clearly marked directory within the project. Providers for dependency injection live in the `lib/middleware` directory. Endpoints live in the `routes/api` directory (or, if you version your api, in `routes/api/v1`) and tests in the `test` directory. Additional resources such as  authentication logic, model definition and data sources should go in `packages`.  

Good ✅

```
my_app/
  |- api/
  |  |- lib/
  |  |  |- src/
  |  |  |  |- middleware/
  |  |  |  |  |- auth_provider.dart
  |  |  |  |  |- todos_data_source_provider.dart
  |  |- packages/
  |  |  |- auth_repository/
  |  |  |  |- lib/
  |  |  |  |  |- src/
  |  |  |  |  |  |- auth_repository.dart
  |  |  |  |  |- auth_repository.dart
  |  |  |  |- test/
  |  |  |  |  |- src/
  |  |  |  |  |  |- auth_repository_test.dart
  |  |  |- todo_models/
  |  |  |  |- lib/
  |  |  |  |  |- src/
  |  |  |  |  |  |- endpoint_models/
  |  |  |  |  |  |  |- create_todo_request.dart
  |  |  |  |  |  |  |- create_todo_response.dart
  |  |  |  |  |  |  |- delete_todo_response.dart
  |  |  |  |  |  |  |- get_todo_response.dart
  |  |  |  |  |  |  |- get_todos_response.dart
  |  |  |  |  |  |  |- update_todo_request.dart
  |  |  |  |  |  |  |- update_todo_response.dart 
  |  |  |  |  |  |  |- endpoint_models.dart
  |  |  |  |  |  |- shared_models/
  |  |  |  |  |  |  |  |- todo.dart
  |  |  |  |  |  |  |  |- shared_models.dart
  |  |  |  |  |- todo_models.dart
  |  |  |  |- test/
  |  |  |  |  |- src/
  |  |  |  |  |  |- endpoint_models/
  |  |  |  |  |  |  |- create_todo_request_test.dart
  |  |  |  |  |  |  |- create_todo_response_test.dart
  |  |  |  |  |  |  |- delete_todo_response_test.dart
  |  |  |  |  |  |  |- get_todo_response_test.dart
  |  |  |  |  |  |  |- get_todos_response_test.dart
  |  |  |  |  |  |  |- update_todo_request_test.dart
  |  |  |  |  |  |  |- update_todo_response_test.dart 
  |  |  |  |  |  |- shared_models/
  |  |  |  |  |  |  |  |- todo_test.dart
  |  |  |- todos_data_source/  
  |  |  |  |- lib/
  |  |  |  |  |- src/
  |  |  |  |  |  |- in_memory_todos_data_source.dart
  |  |  |  |  |  |- firestore_todos_data_source.dart
  |  |  |  |  |  |- todos_data_source.dart
  |  |  |  |  |- todos_data_source.dart
  |  |  |  |- test/
  |  |  |  |  |- src/
  |  |  |  |  |  |- in_memory_todos_data_source_test.dart
  |  |  |  |  |  |- firestore_todos_data_source_test.dart
  |  |- routes/
  |  |  |- api/
  |  |  |  |- v1/
  |  |  |  |  |- todos/
  |  |  |  |  |  |- index.dart
  |  |  |  |  |  |- [id].dart
  |  |  |- test/
  |  |  |  |- src/
  |  |  |  |  |- middleware/  
  |  |  |  |  |  |- auth_provider_test.dart
  |  |  |  |  |  |- todos_data_source_provider_test.dart
  |  |  |  |- routes/
  |  |  |  |  |- api/
  |  |  |  |  |  |- v1/
  |  |  |  |  |  |  |- todos/
  |  |  |  |  |  |  |  |- index_test.dart
  |  |  |  |  |  |  |  |- [id]_test.dart
```

### Models

A models package should clearly define the necessary data models that the backend will be sharing with the frontend. Defining endpoint models makes the data necessary to communicate between frontend and backend more explicit. It also creates a data structure that can communicate additional metadata about content received, such as the total count of items and pagination information.

```
class GetTodosResponse {
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

It is also advisable to automate JSON serialization inside the models package. This can be achieved with the [json_serializable](https://pub.dev/packages/json_serializable) package, though experimental [macros](https://dart.dev/language/macros) in Dart offer a potentially cleaner way of doing this in the future. 

### Data Access

A data source package should allow developers to fetch data from different sources. This allows for easy development by mocking data in an in-memory source when necessary, or also creating different data sources for different environments. 

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

Routes should follow common [best practices for REST API design](https://swagger.io/resources/articles/best-practices-in-api-design/). Endpoints should be named for the objects that they provide access to. For GET requests, query parameters can be used to filter the results. Nested paths then provide specific data about an individual object. For POST and PATCH, the data to send to the backend will be attached in a request body. Note that for update requests, PATCH is more advisable than PUT because [PATCH requests the server to update an existing entity, while PUT requests the entity to be replaced](https://stackoverflow.com/questions/21660791/what-is-the-main-difference-between-patch-and-put-request?answertab=oldest#tab-top). DELETE should only require an entity id.    

```
GET my_api/v1/todos/ // access to a collection of todos
GET my_api/v1/todos?completed=false // access to the todos that are not completed
GET my_api/v1/todos/1 // access to the todo with ID of 1
POST my_api/v1/todos/ // creates a new todo from the request body
PATCH my_api/v1/todos/1 // updates the todo with ID of 1 based on the request body
DELETE my_api/v1/todos/1 // deletes the todo with ID of 1
```

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