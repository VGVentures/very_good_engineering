---
title: 🧩 Widgets
description: Widget best practices.
---

Widgets are the reusable building blocks of your app's user interface. It is important to design them to be readable, maintainable, performant, and testable. By following these principles, you can ensure a smooth development process and a high-quality user experience.

## Page/Views

Each page should be composed of two classes: a `Page`, which is responsible for defining the page's route and gathering all the dependencies needed from the context; and a `View`, where the "real" implementation of the UI resides.

Distinguishing between a `Page` and its `View` allows the `Page` to provide dependencies to the `View`, enabling the view's dependencies to be mocked when testing.

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

We can easily write tests for the `LoginView` by mocking the `LoginBloc` and providing it directly to the view.

:::note
The constructor of the `LoginView` is marked as `visibleForTesting`. This is necessary so that we can ensure that the view will not be used except via its page. This way, developers will not accidentally import and use the view without the injected dependencies provided by the page.
:::

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