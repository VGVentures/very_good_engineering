---
title: 🧩 Widgets
description: Widget best practices.
---

# Page/Views

Each page should be composed of two classes: a `Page`, which is responsible for defining the page's route and gathering all the dependencies needed from the context; and a `View`, where the "real" implementation of the page resides.

This allows easier separation of dependencies from the view itself, which makes it easier to test the views.

```dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final authenticationRepository =
            context.read<AuthenticationRepository>();
        return LoginBloc(
          authenticationRepository: authenticationRepository,
        );
      },
      child: const LoginView(),
    );
  }
}

class LoginView extends StatelessWidget {
  @visibleForTesting
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    // omitted
  }
}
```

With this approach, testing `LoginView` is made easy, since now the `LoginBloc` can be mocked and provided directly on the test.

Note how the constructor of the `LoginView` is marked as `visibleForTesting`. This is necessary so that we can ensure that the view will not be used except via its page. This way, we ensure that developers will not accidentally import and use the view without the injected dependencies provided by the page.

```dart
class _MockLoginBloc extends MockBloc<LoginBloc, LoginState>
  implements LoginBloc {}

void main() {
  group('LoginView', () {
    late LoginBloc loginBloc;

    setUp(() {
      loginBloc = _MockLoginBloc();
    });

    testWidgets('renders correctly', (tester) async {
      await tester.pumpApp(
        BlocProvider<LoginBloc>.value(
          value: loginBloc,
          child: LoginView(),
        ),
      );

      expect(find.byType(LoginView), findsOneWidget);
    });

    testWidgets('when on state A, render X', (tester) async {
      await tester.pumpApp(
        BlocProvider<LoginBloc>.value(
          value: loginBloc,
          child: LoginView(),
        ),
      );

      expect(find.byType(X), findsOneWidget);
    });
  });
}
```
