---
title: Architecture
description: Architecture best practices.
---

Layered architecure is used at VGV to build highly scalable, maintainable, and testable apps. The architecture consists of four layers: the data layer, the domain layer, the business logic layer, and the presentation layer. Each layer has a single responsibility and there are clear boundaries between each one.

## Layers

### Data layer

This is the lowest layer. It is responsible for retrieving raw data from external sources, like an SQLite database, local storage, Shared Preferences, GPS, battery, or from a RESTful API, and exposing it to the domain layer. The data layer should be free of any specific domain or business logic. Ideally, packages in this layer could be published to pub.dev and plugged in and used in other unrelated projects.

> This layer can be considered the "engineering" layer because it focuses on how to process and transform data in a performant way.

### Domain layer

This compositional layer composes one or more data clients and applies "business rules" to the data. This layer can also be called the "repository" layer because each component in this layer is a repository, and one repository is created for each domain (e.g. user_repository, weather_repository, etc.). Packages in this repository layer should not depend on other repositories.

> This layer can be considered the "product" layer. The business/product owner will determine the rules/acceptance criteria for how to combine data from one or more data providers into a unit that brings value to the customer.

### Business logic layer

This layer composes one or more repositories and contains logic for how to surface the business rules via a specific feature or use-case. This is the layer that implements the bloc library, which will retrieve data from the repository layer and update the app's state. The business logic layer should have no dependency on the Flutter SDK and should not have direct dependencies on other business logic components.

> This layer can be considered the "feature" layer. Design and product will determine the rules for how a particular feature will function.

### Presentation layer

This is the UI layer of the app where we use Flutter to "paint pixels" on the screen. No business logic should exist in this layer. The presentation layer should only interact with the business logic layer.

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

Each layer abstracts the underlying layers' implementation details. It is important to not have indirect dependencies between layers. For example, the domain layer shouldn't need to know how the data is fetched in the data layer, and the presentation layer shouldn't directly access values from Shared Preferences. In other words, the implementation details should not leak between the layers. Using layered architecture ensures flexibility, reusability, and testability as the codebase grows.

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
