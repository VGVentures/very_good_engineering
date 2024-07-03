---
title: Architecture
description: Architecture best practices.
---

Layered architecture is used at VGV to build highly scalable, maintainable, and testable apps. The architecture consists of four layers: the data layer, the domain layer, the business logic layer, and the presentation layer. Each layer has a single responsibility and there are clear boundaries between each one. We've discovered that a layered architecture significantly enhances the developer experience. Each layer can be developed independently by different teams without impacting other layers. Testing is simplified since only one layer needs to be mocked. Additionally, a structured approach clarifies component ownership, streamlining development and code reviews.

## Layers

### Data layer

This is the lowest layer of the stack. It is the layer that is closest to the retrieval of data, hence the name. The data layer should be free of any specific domain or business logic. Ideally, packages within the data layer could be plugged into unreleated projects that need to retrieve data from the same sources.

#### Responsibility

The data layer is responsible for retrieving raw data from external sources and making it available to the domain layer. Examples of these external sources include a SQLite database, local storage, Shared Preferences, GPS, battery data, file system, or a RESTful API.

### Domain layer

This compositional layer composes one or more data clients and applies "business rules" to the data. This layer is also known as the "repository" layer because each component in this layer acts as a repository. A separate repository is created for each domain, such as a user repository or a weather repository. Packages in this layer should not import any Flutter dependencies and not be dependent on other repositories.

#### Responsibility

The domain layer is responsible for fetching data from one or more data sources from the data layer, applying domain specific logic to that raw data, and providing it to the business logic layer.

> This layer can be considered the "product" layer. The business/product owner will determine the rules/acceptance criteria for how to combine data from one or more data providers into a unit that brings value to the customer.

### Business logic layer

This layer composes one or more repositories and contains logic for how to surface the business rules via a specific feature or use-case. The business logic layer should have no dependency on the Flutter SDK and should not have direct dependencies on other business logic components.

#### Responsibility

The business logic layer is the layer that implements the bloc library, which will retrieve data from the repository layer and provide a new state to the presentation layer.

> This layer can be considered the "feature" layer. Design and product will determine the rules for how a particular feature will function.

### Presentation layer

The presentation layer is the top layer in stack. It is the UI layer of the app where we use Flutter to "paint pixels" on the screen. No business logic should exist in this layer. The presentation layer should only interact with the business logic layer.

#### Responsibility

The presentation layer is the layer that includes the Flutter UI dependencies. It is responsible for building widgets and managing the widget's lifecycle. This layer requests updates from the business logic layer to provide it with a new state to update the widget with the correct data.

> This layer can be considered the "design" layer. Designers will determine the user interface in order to provide the best possible experience for the customer.

## Project organization

The presentation layer and state management live in the project's `lib` folder. The data and domain layers will live as separate packages within the project's `packages` folder.

Good ✅

```
my_app/
  |- lib/
  |   |- login/
  |   |   |- bloc/
  |   |   |   - login_bloc.dart
  |   |   |   - login_event.dart
  |   |   |   - login_state.dart
  |   |   |- view/
  |   |   |   - login_page.dart
  |   |   |   - view.dart
  |- packages/
  |   |- user_repository/
  |   |   |- lib/
  |   |   |   |- src/
  |   |   |   |   |- models/
  |   |   |   |   |   - models.dart
  |   |   |   |   |   - user.dart
  |   |   |   |   |- user_repository.dart
  |   |   |   - user_repository.dart
  |   |   |- test/
  |   |   |   |- models/
  |   |   |   |   - user_test.dart
  |   |   |   - user_repository_test.dart
  |   |- api_client/
  |   |   |- lib/
  |   |   |   |- src/
  |   |   |   |   - api_client.dart
  |   |   |   - api_client.dart
  |   |   |- test/
  |   |   |   - api_client_test.dart
  |- test/
  |   |- login/
  |   |   |- bloc/
  |   |   |   - login_bloc_test.dart
  |   |   |   - login_event_test.dart
  |   |   |   - login_state_test.dart
  |   |   |- view/
  |   |   |   - login_page_test.test
```

Each layer abstracts the underlying layers' implementation details. Avoid indirect dependencies between layers. For example, the domain layer shouldn't need to know how the data is fetched in the data layer, and the presentation layer shouldn't directly access values from Shared Preferences. In other words, the implementation details should not leak between the layers. Using layered architecture ensures flexibility, reusability, and testability as the codebase grows.

## Dependency graph

![Layered Architecture](../../../public/very_good_architecture.png)

When using layered architecture, data should only flow from the bottom up, and a layer can only access the layer directly beneath it. For example, the `LoginPage` should never directly access the `ApiClient`, or the `ApiClient` should not be dependent on the `UserRepository`. With this approach, each layer has a specific responsibility and can be tested in isolation.

Good ✅

```dart
class LoginPage extends StatelessWidget {
    ...
    LoginButton(
        onPressed: => context.read<LoginBloc>().add(const LoginSubmitted());
    )
    ...
}

class LoginBloc extends Bloc<LoginEvent, LoginState> {
    ...
    Future<void> _onLoginSubmitted(
        LoginSubmitted event,
        Emitter<LoginState> emit,
    ) async {
        try {
            await _userRepository.logIn(state.email, state.password);
            emit(const LoginSuccess());
        } catch (error, stackTrace) {
            addError(error, stackTrace);
            emit(const LoginFailure());
        }
    }
}

class UserRepository {
    const UserRepository(this.apiClient);

    final ApiClient apiClient;

    final String loginUrl = '/login';

    Future<void> logIn(String email, String password) {
        await apiClient.makeRequest(
            url: loginUrl,
            data: {
                'email': email,
                'password': password,
            },
        );
    }
}
```

Bad ❗️

```dart
class LoginPage extends StatelessWidget {
    ...
    LoginButton(
        onPressed: => context.read<LoginBloc>().add(const LoginSubmitted());
    )
    ...
}

class LoginBloc extends Bloc<LoginEvent, LoginState> {
    ...

    final String loginUrl = '/login';

    Future<void> _onLoginSubmitted(
        LoginSubmitted event,
        Emitter<LoginState> emit,
    ) async {
        try {
            await apiClient.makeRequest(
                url: loginUrl,
                data: {
                    'email': state.email,
                    'password': state.password,
                },
        );

        emit(const LoginSuccess());
        } catch (error, stackTrace) {
            addError(error, stackTrace);
            emit(const LoginFailure());
        }
    }
}
```

In this example, the API implementation details are now leaked and made known to the bloc. The API's login url and request information should only be known to the `UserRepository`. Also, the `ApiClient` instance will have to be provided directly to the bloc. If the `ApiClient` ever changes, every bloc that relies on the `ApiClient` will need to be updated and retested.
